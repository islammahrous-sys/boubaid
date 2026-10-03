# System audit, 3 Oct 2026

Scope: `origin/main` at 623e967, audited in a clean checkout. This covers everything since the 2 Oct audit (3348be8): two CMS commits touching 124 files and about 3,100 lines. It also includes a full re-check of production Supabase (`ywsvittlswbbyqhahorh`), the live site at www.boubaid.com, and the browser console.

## Summary

There are no critical or high-severity issues. Yesterday's fixes are all intact. `tsc`, `eslint .` and `npm audit` are all clean. All 32 probed routes respond correctly.

The main open items are performance (region mismatch), a CSP that would break the family tree if enforced, a split source of truth for the bank details, and migration-history drift.

## Medium

| # | Finding | Evidence | Fix |
|---|---|---|---|
| M1 | **Every server render crosses the Atlantic.** Vercel functions run in `iad1` (US East) and Supabase is in `eu-west-1` (Ireland). `/library` makes three sequential queries plus the root settings query, giving a TTFB of 2.2–3.2s (home is about 0.9s). | `x-vercel-id: fra1::iad1`, `get_project.region` | Add `"regions": ["dub1"]` to `vercel.json`. One region is allowed on Hobby. |
| M2 | **The CSP report-only header has two gaps.** Enforcing it as-is would break the interactive family tree. `frame-src` lacks `'self'` (it frames `/interactive-tree.html`) and `script-src` lacks `https://cdnjs.cloudflare.com` (d3). | Live console on `/`, `/library`, `/contact` | Add both sources, then watch for a week before switching to enforcing. |
| M3 | **The bank details have two sources of truth.** `/contribute` hard-codes the Bank Albilad account and IBAN (`src/routes/contribute.tsx:34`). The treasury console edits `treasury_config.bank_account`, which nothing on the public site reads, and its defaults name Alinma Bank. The comment at `src/content/site.ts:82` still points to `getMemberBankAccount`, which commit 3073e60 removed. Showing the IBAN publicly looks deliberate (it's a donation page), but a treasurer editing it in the console would see no effect. | grep | Pick one source: render `/contribute` from `treasury_config`, or remove the console fields. Fix the Alinma default and the stale comment. |
| M4 | **Migration history has drifted.** 23 local files have no matching version in production. `20261001180000_enterprise_notification_system` was applied out-of-band: its tables exist, but there's no record of it. `supabase db push` would try to replay old files. | `list_migrations` vs `supabase/migrations/` | Run `supabase migration repair --status applied <version>` for the already-applied files, or rename them to the recorded versions. |
| M5 | **Wider access for editors (intentional, needs confirming).** dca2075 moved about 50 console functions from `requireAdminAuth` to `requireEditorAuth`. That covers inquiries, registrations, CMS, media, navigation and private-document signed URLs. The treasury functions moved to `requireTreasuryAuth`. All of these match the existing RLS helpers (`can_edit_content`, `can_view_inquiries`, `can_treasury`) and use the RLS client, so the database grants nothing new. In practice, though, 7 more accounts (4 `editor`, 3 `content_manager`) can now see nominators' phone numbers and emails and open council-request attachments. | diff 3348be8..623e967, `pg_proc` | Confirm this is wanted. |
| M6 | **Too many privileged accounts.** 12 users hold 20 staff-role grants: 5 treasurers, 3 super_admins, 4 admins. All of them sign in regularly. | `user_roles` × `auth.users` | Trim to the minimum. Treasurer and super_admin especially. |

## Low

- **Nomination attachments can't be opened from the console.** `getRequestAttachmentSignedUrl` only signs `documents-private`, but nominations upload to `nomination-docs`. The nomination UI is currently dead code, so this is latent.
- **Root loader payload.** It ships every public setting (about 10 KB, including `treasury_config` and `homepage_sections_config`) in every page's SSR payload. It's fine at this size.
- **Advisors:** `get_email_statistics` is callable by `authenticated` (it self-guards on the admin role, so this is informational). `rate_limits` has RLS with no policies, which is intended (service-role only).
- **Unused indexes** (46) and **multiple permissive policies** (45) are unchanged and acceptable at this data size.

## Still open from 2 Oct (manual)

- Rotate the service-role key from git history. I can't verify from here whether that's been done.
- Set `CRON_SECRET` in Vercel. `/api/public/process-email-queue` still returns 503.
- Turn on leaked-password protection. The advisor still warns about it.

## Verified good

- No regressions from 2 Oct: the auth-email redirect allowlist and Turnstile guard, `sendWelcomeEmail` auth, service-role form writes, DB rate limiter, and the removed hardcoded key are all intact.
- No open anon INSERT policies. The only `dangerouslySetInnerHTML` uses are the static theme, language and GA init scripts.
- The SEO-override feature writes go through `upsertSiteSetting`, which is admin-only. The values render as meta-tag content, not HTML.
- Email: 25 sent, 1 failure (1 Oct, before the domain was verified). The queue is empty.
- All 12 accounts are confirmed. No staff account is stale or has never signed in.
- The live site: all public routes return 200, `/nonexistent` returns 404, and there are no runtime JS errors (only CSP report-only notices).

## Working tree

The local checkout is on `chore/audit-followups`, a branch with no commits of its own, with 129 uncommitted files from a concurrent process. None of it is on `main`. Either commit it or discard it before switching branches.

## Remediation status (3 Oct 2026)

Fixed:
- **M1:** `vercel.json` sets `"regions": ["dub1"]`.
- **M2:** the CSP allows `'self'` frames and `cdnjs.cloudflare.com` scripts. It is still report-only.
- **M3:** `/contribute` renders from `treasury_config.bank_account`, falling back field by field to `src/content/fund-bank.ts`. Prod row corrected to Bank Albilad (migration `20261003161348`). The console defaults are fixed and it has a new customer/CR number field.
- **M4:** the migration history is aligned. 13 files renamed, 23 exported from prod, and 10 marked applied in prod. Both sides list the same 85 versions (hash-verified).
- **Low (nomination attachments):** the signed-URL function now handles `nomination-docs`.

Not changed (need an owner's decision):
- **M5/M6:** role trimming. The accounts that most need it are two privileged test accounts in production:
  - `e2e-test-admin@albouabidfamily.com` holds all six staff roles. It was created and last used on 26 Sep, with no audit actions.
  - `temp-guide-admin@boubaid-guide.test` (admin) was created and signed in on 3 Oct.
  - Neither is referenced in the repo. Revoke their roles or delete them once nothing depends on them.
