# System audit, 2 Oct 2026

Scope: repo at `main` (23f3bf8), production Supabase `ywsvittlswbbyqhahorh` (read-only queries and advisors), server functions, the new email system (1 Oct), RLS, dependencies, build health.
Not done: live exploitation, browser E2E, load tests. The findings below come from code and database inspection only.

## Critical and high

| # | Finding | Evidence | Fix |
|---|---|---|---|
| H1 | **Password-reset link can be redirected to an attacker's site.** `requestPasswordReset` is unauthenticated and trusts a caller-supplied `redirectTo`. It builds `${redirectTo}?token_hash=…&type=recovery` and emails that link from the official sender. An attacker requests a reset for a victim with `redirectTo=https://evil.tld`. The victim gets a genuine-looking family email, and the click hands a valid recovery token to the attacker, which means account takeover. | `src/lib/email/auth-email.functions.ts:73-94` | Ignore `redirectTo`, or allowlist it to the site origin. Build the URL from `VITE_SITE_URL` only. |
| H2 | **Same `redirectTo` flaw in `signUpWithBrandedVerification`**: the signup confirmation token is sent to an arbitrary host. | same file, `:159-185` | Same fix. |
| H3 | **Turnstile is bypassable on the auth emails.** The check is `if (data.turnstileToken) {…}`, so omitting the token skips it. Together with no rate limit, anyone can email-bomb arbitrary addresses with official-branded reset or verification mail. They can also pre-create unconfirmed accounts with chosen passwords. `verifyTurnstileToken` itself fails closed on a missing token. The callers just never reach it. | `auth-email.functions.ts:62,148` | Always call `verifyTurnstileToken` (it already no-ops when Turnstile is unconfigured). Add `isRateLimited` per IP and per email. |
| H4 | **`sendWelcomeEmail` is an open email relay.** It has no auth middleware. It accepts any `email` and `fullName` and queues an official welcome email. The `userId` path reads `profiles.email` through the service-role client. That lets anyone send branded mail to any address (phishing from the family domain) and can enumerate emails via the userId path. | `auth-email.functions.ts:344-393` | Add `requireSupabaseAuth` (or admin auth) and drop caller-supplied recipients. Derive the recipient from the session. |
| H5 | **A service-role JWT is hardcoded in a tracked file.** It is `role: service_role`, valid until 2102, in `scripts/sync-email-templates.ts:7`. It was added in commit 703d64a. The repo is private (confirmed), so exposure is limited to collaborators, Lovable, Vercel and any clone. A service-role key bypasses all RLS. | the file, `git log` | Remove the fallback and read `process.env` only. Rotate the key. Supabase's legacy-key rotation kills the old anon JWT as well, so plan it. Purge history only if the repo ever goes public. Lovable's AGENTS.md forbids rewriting pushed history. |
| H6 | `npm audit --omit=dev`: **1 high**, `js-yaml` 4.0.0–4.3.1 (CPU DoS, GHSA-2883-xcg3-v3hh). It is a transitive dependency. | npm audit | `npm audit fix`. Low practical risk, since no untrusted YAML is parsed. |

## Medium

- **M1. Direct anon inserts bypass all form protection.** `contact_messages`, `inquiries`, `newsletter_subscribers`, `event_registrations` and `initiative_registrations` all have `INSERT … WITH CHECK (true)` for `anon`. Anyone holding the public anon key can POST to PostgREST directly and skip Turnstile, honeypot and rate limit. The forms already go through server functions, so the fix is to revoke anon INSERT on these tables. Server functions use the admin client or an authenticated client for the writes. If any of them use the anon client, switch that path first.
- **M2. The rate limiter does not work on Vercel.** It uses per-process in-memory counters (`public-forms-rate-limit.server.ts`). Serverless instances do not share state, and counters reset on every cold start. Use a DB-backed counter, Upstash or Vercel KV, or an edge/WAF rule.
- **M3. The nomination and business-listing forms have no Turnstile.** This is called out in comments at `forms.functions.ts:170,261`. The nomination form also lets unauthenticated users upload to storage through the service-role client (`:192-206`). Add Turnstile or an upload size and type cap, and verify the cap exists.
- **M4. `get_email_statistics()` is executable by `anon` and `authenticated`** (security-definer, Supabase advisor WARN). The function self-guards on the admin role, so the data is not exposed. Still, run `REVOKE EXECUTE ON FUNCTION public.get_email_statistics() FROM PUBLIC, anon;`. The `GRANT` in the migration doesn't remove the default PUBLIC grant.
- **M5. The Resend API key can live in the DB.** `getRuntimeEmailConfig` reads `resend_api_key` from `get_email_runtime_config()`. I confirmed no security-definer function in `public` is callable by anon or authenticated other than the one above. So this RPC is not reachable by clients. Still, prefer the env var only. Secrets in tables get dumped in backups and migrations.
- **M6. The email queue has no worker.** `processQueuedNotificationEmails` is exported and has no caller anywhere in `src`. All 23 sent emails went out inline. Any email left `queued` or `processing` after a crash or a 429 is never retried. Add a cron route (Vercel Cron to `/api/…`, or Supabase pg_cron plus an edge function) or remove the dead code.
- **M7. No Content-Security-Policy header.** `src/start.ts` sets nosniff, X-Frame-Options, Referrer-Policy and Permissions-Policy but no CSP or HSTS. Vercel adds HSTS by default, but check. Inline theme, lang and GA scripts mean you need a nonce or hash CSP. Start with Report-Only.
- **M8. Resend fallback sender.** When the domain is unverified, mail silently falls back to `onboarding@resend.dev` (`email-sender.server.ts`). That can only deliver to the Resend account owner, so it is harmless, but it masks a failure. Log it as an alert.
- **M9. `x-forwarded-for` is trusted as-is** for rate-limit keys (first entry). It is safe on Vercel, which overwrites it, and spoofable anywhere else.

## Low / hygiene

- **Lint:** `eslint src` reports 1115 errors. 1097 are prettier CRLF/indent and auto-fixable. The rest are `prefer-const` and `no-useless-escape`. Add `.gitattributes` (`* text=auto eol=lf`) and run `eslint --fix`. `npm run lint` currently can't pass in CI.
- **Typecheck:** `tsc --noEmit` is clean.
- **Security advisor:** `auth_leaked_password_protection` is still off (open since 2026-08-29). It is a dashboard toggle.
- **Performance advisor:** 94 `auth_rls_initplan`, 48 `multiple_permissive_policies`, 45 unused indexes, 1 unindexed FK (`email_logs.notification_id`). The RLS count grew from 84 to 94 since August, so the new email tables added more. Wrap `auth.uid()` as `(select auth.uid())` in a single migration when convenient. Irrelevant at 21 members.
- **Role sprawl:** 4 admin, 3 super_admin, 5 treasurer, 4 editor, 3 content_manager, 10 member. Review who holds super_admin and treasurer. Treasurer is money-adjacent.
- **Branch clutter:** `lovable-backup-main-*` branches, `qa-audit-fixes`, a stale `claude/gifted-lederberg-33e0a2` worktree. `fix/auth-recovery-redirect` is still unmerged. Check whether it should land.
- **Scripts:** `scripts/*.ts` contain debug and test tooling, including `test-login-debug.ts`. Audit them for credentials the way H5 was found, then move them to a gitignored folder.
- **Anon key in source:** `scripts/generate-sitemap.mjs` and `auth-middleware.ts` embed the anon JWT. It is public by design, so no action is needed, but it ties the code to one project.

## Verified good

- RLS enabled on all 46 public tables. Storage: private buckets (`receipts`, `documents-private`, `content`, `nomination-docs`) are not public.
- No bank details in the public `site_settings.treasury_config` (IBAN and account number empty; member-gated fetch exists).
- All admin server functions sit behind `requireAdminAuth` or `requireSupabaseAuth`. The only unauthenticated functions using the admin client are the public read/submit ones listed above, and `getMemberVerification` (rate-limited, requires a unique prefix match).
- `dangerouslySetInnerHTML` appears only for the theme/lang/GA init scripts and the shadcn chart style. No user-controlled HTML sinks.
- Email templates escape interpolated values (`escapeXml`).
- Last-admin and super_admin escalation guards from the August audit are still in place.

## Suggested order

1. H1–H4 in one PR (auth-email hardening). This is about 30 lines.
2. H5: remove the key from the script, rotate it, update Vercel and Lovable env.
3. M1, M4 and the leaked-password toggle in one SQL migration plus a dashboard click.
4. M2 and M6, which both need an infrastructure decision (KV or cron).
5. CRLF/lint cleanup, then CSP Report-Only.
