# Production Readiness Gap Report — Al Boabid Family Legacy (Heritage Hub)

> ## ⚠ SUPERSEDED — read this notice before trusting anything below
>
> This report was generated on 2026-08-22 by a 12-agent audit. Its **database-layer
> findings were built by reading stale local files under `supabase/migrations/`
> instead of the live Supabase project**, and turned out to be substantially wrong —
> tables, RLS policies, columns, and enum values it called "missing" or "mismatched"
> mostly already existed correctly in the live database. A large remediation effort
> landed on `main` the same day (see git log from roughly 2026-08-22 15:00 onward),
> fixing the real issues this report did correctly identify (mostly app-code bugs,
> not DB-schema claims) plus several genuine DB-layer issues found by direct live
> verification, not by trusting this file.
>
> **If you are an agent or engineer picking this repo up: do not treat any claim
> below about a missing table/column/RLS policy/enum value as true without
> independently querying the live Supabase project first.** This exact mistake
> was repeated twice after this report was written — twice.
>
> ### What is now fixed (do not re-flag these)
>
> RLS holes on `profiles`/`contributions`/`family_members` PII exposure and the
> `content_sections` visibility gap; missing CHECK/UNIQUE constraints; FK covering
> indexes + RLS init-plan optimization; duplicate indexes; `super_admin`
> self-escalation; `businesses` public-insert RLS gap; in-app notifications on new
> contact/inquiry submissions; the news family/fund merge bug; PostgREST filter
> injection in global search; Arabic-only global search; Library's
> collection-taxonomy mismatch + real video/YouTube playback; Navigation Manager
> wired to the live Header/Footer/MobileNav; Page Builder's CTA block + Statistics
> field mismatch + 2 of 4 orphaned Homepage Manager sections (`family_stats`,
> `tree_highlight` — `upcoming_events`/`heritage_gallery` remain intentionally
> unimplemented, marked "not live yet" in the admin UI); Inquiries panel reading
> real `contact_messages`; Achievers category field; password-reset flow +
> reactive session-expiry redirect; i18n pre-hydration flash (there IS a
> `langInitScript` mirroring the theme one — verify by reading the actual script
> wiring in `__root.tsx`, not just grepping for the static `<html>` fallback
> attributes); Contribute page bank-details gated behind auth; env-gated Turnstile
> CAPTCHA on auth/contact/contribute/events; CMS mutations + treasury endpoints
> switched from generic auth to `requireEditorAuth`/`requireTreasuryAuth`;
> false-positive contribution-review response; server-side upload
> type/size validation; nav-item URL scheme validation + SVG upload blocking;
> family-tree `?focus=` deep link; translated (bilingual) Supabase Auth error
> messages; achievers/initiatives pagination + a real generated sitemap; env-gated
> GA4 analytics + crash-monitoring scaffolding (`docs/OPERATIONS.md`); dead code
> removed (`admin.functions.ts`, `ConsoleShell.tsx`/`ConsoleUI.tsx`,
> `translations.ts`); legacy `audit_log` writers consolidated onto `audit_logs`;
> `content_manager`/`family_manager` roles wired into the app-layer middleware to
> match what their DB-level RLS already granted; `wrangler.toml` + `vercel.json`
> added since the Cloudflare-vs-Vercel deploy target was ambiguous; a public
> `/events` listing + RSVP page (previously admin-only CRUD with no public
> surface); Initiatives "Completed" status no longer collapses into "Planned" in
> either the admin table or the public page.
>
> ### Still genuinely open (verified live, not from this file)
>
> - Page Builder: `BlockRegistry` still advertises more block types than the
>   public renderer implements (a handful beyond CTA/statistics/hero/quote were
>   deliberately left unimplemented as low-value placeholders, not bugs).
> - `RolesPermissionMatrix.tsx` doesn't display `content_manager`/`family_manager`
>   at all yet, even though those roles now function correctly underneath —
>   a UI-completeness gap, not a security gap.
> - No automated backup _schedule_ exists — `docs/OPERATIONS.md` documents the
>   manual/dashboard procedure, which still requires the user to actually run or
>   schedule it.
> - GA4/Sentry/Turnstile integrations are wired but inert until real keys are set
>   in the deployment environment (`VITE_GA_MEASUREMENT_ID`, `VITE_SENTRY_DSN`,
>   Turnstile site/secret keys).
> - Admin command palette indexes only a subset of modules; CMS page save is
>   non-atomic; revision history has no restore UI; canonical domain mismatch
>   between `robots.txt`/`sitemap.xml` and the actual live host; beta dependency
>   pins (`nitro`, `vite`) with no vulnerability scanning — all P2/P3, unchanged.
>
> Everything else below this notice is the _original_ 2026-08-22 report, kept
> as-written for historical reference. Read it as "what an audit believed at the
> time," not as current state.

## 1. Executive Summary

This audit consolidates the findings of twelve independent domain reviews of the Al Boabid Family Legacy (آل بوعبيد) web application — an Arabic-first, RTL, Supabase-backed heritage and foundation site with a large custom admin console — ahead of commercial launch. Every finding below was verified against actual source files, SQL migrations, and generated types rather than inferred from UI appearance alone.

The audit surfaced a consistent, repeating pattern across all twelve domains: **the final "baseline" migration (`supabase/migrations/20260822000000_core_schema_baseline.sql`) introduced widespread regressions** — blanket `USING (true)` read policies on `profiles` and `content_sections`, a redundant `WITH CHECK (true)` insert policy on `contributions`, broken `CREATE INDEX` statements referencing non-existent columns, and 13+ tables with RLS enabled but zero write policies — that were independently rediscovered by the Database, Server-side logic, Authentication, Family-data, and Cross-cutting Admin domains. This is not twelve unrelated bugs; it is one poorly reviewed migration whose blast radius touches nearly every part of the application.

Layered on top of this is a second recurring pattern: **the CMS/admin console and the public site frequently do not agree on a shared data contract.** The Navigation Manager persists to tables the header/footer never read (`src/components/console/navigation/NavigationManager.tsx` vs `src/components/site/Header.tsx`). The Library admin writes `collection: "photographs"/"recordings"` while the public merge function only recognizes `"publications"/"media"` (`src/content/cms-adapt.ts`). The Page Builder's own block registry advertises 19 content-block types while the public renderer implements 6 and the editor implements 5. The `family_members` admin form writes columns (`branch_id`, `date_of_birth`, `status`) that do not exist on the live table (`branch_slug`, `birth_year_hijri`, no status column at all). In each case, an admin can save content, see a success toast, and have nothing change on the live site — a systemic "phantom CMS" problem, not isolated bugs.

A third theme is **incomplete or entirely missing account-security plumbing**: no password-reset UI despite a reset-email trigger existing, no CAPTCHA anywhere, no session-expiry handling on protected routes, and a `super_admin` role that is fully broken server-side while a plain `admin` can silently grant itself `super_admin`.

Finally, several explicit product-brief requirements are simply not built: pagination on News/Library, a public Events surface (despite a full admin RSVP/attendee-export backend), analytics integration, automated backups, external error monitoring, and a working video/YouTube library feature.

Across the 134 raw findings supplied, roughly **17 distinct Critical/P0 issues** (after deduplicating the same root causes reported from multiple angles) block launch outright, concentrated in RLS/data-exposure, broken admin writes, and non-functional flagship features (Library video, Navigation Manager, family member CRUD).

## 2. Overall Production Readiness Assessment

**Verdict: NOT production-ready. Launch must be blocked pending at least the P0 remediation below.**

Rationale: This is a site handling real PII (phone numbers, lineage notes), real financial pledges (contributions/treasury), and a public identity/authentication surface, and in its current state:

- Any unauthenticated caller with only the published anon key can read the entire `profiles` table (phone numbers, lineage notes) via `supabase.from('profiles').select('*')`, and can insert fabricated `contributions` rows under any other user's `user_id` — both directly exploitable today, not theoretical.
- A large fraction of the custom admin console cannot persist data at all against the schema actually shipped in the migrations (14+ tables queried by `admin-hub.functions.ts` do not exist; 13 more have RLS enabled with no write policy), meaning core CMS workflows (family tree editing, site settings, navigation, media library, notifications) are non-functional facades.
- Several features that look complete in the UI produce no output on the public site at all (Library video playback, CMS Navigation Manager, most Page Builder block types, 4 of 10 homepage sections).
- There is no password-reset completion flow, no CAPTCHA, no crash/error monitoring reaching production, no analytics, and no documented backup strategy — all explicit brief requirements.

Positives that materially reduce (but do not eliminate) risk: the original phase-1/phase-2 schema and RLS design (before the baseline migration regression) was sound; server-function input validation via zod is applied consistently; the public-facing bilingual/RTL implementation and per-route SEO metadata are broadly well executed; and several admin CRUD screens (Articles, Family CSV import scaffolding, dashboard KPIs) are genuinely wired to live data.

## 3. Application Architecture Assessment

The stack (React 19, TanStack Start/Router, Vite, Tailwind v4, shadcn/ui, Supabase, bun, Cloudflare/Vercel via nitro) is modern and coherent on paper, but the audit found the architecture has drifted into an inconsistent, partially duplicated state:

- **Migration history cannot be trusted as the schema source of truth.** `src/hooks/useAuth.tsx` contains a code comment admitting the live `app_role` enum "is broader than the checked-in migrations show... verified via the database, not just the migration files." The baseline migration's own header claims "All 41 tables" while it contains only 25 `CREATE TABLE` statements. Two `CREATE INDEX` statements in the same file reference columns (`family_members.branch_id`, `articles.deleted_at`) that do not exist anywhere in the file, meaning the migration cannot even apply cleanly to a fresh database (`supabase db reset` would fail at that statement).
- **Duplicate, competing backend implementations exist for the same features.** News/initiatives/achievers CRUD exists in both `src/lib/cms.functions.ts` (weaker, `requireSupabaseAuth` only) and `src/lib/admin-hub.functions.ts` (`requireAdminAuth`). Contribution review exists in both `contributions.functions.ts` and `admin-hub.functions.ts`. Membership review exists in both `admin.functions.ts` and `admin-hub.functions.ts`. Contact/inquiry submissions land in `contact_messages`, but the admin's "Inquiries" screen reads a different, permanently-empty `inquiries`/`inquiry_notes` pair. Two audit-log tables (`audit_log` singular, `audit_logs` plural) are written to by different code paths with no unification.
- **Three separate, independently-implemented authorization models coexist** for `/admin` (single `isAdmin` boolean), `/content` (`canEdit` ad hoc), and `/treasury` (`canReview` ad hoc) — none of which implements the full 8-role model the UI (`RolesPermissionMatrix.tsx`) advertises to administrators.
- **Two full admin console shells exist in the codebase** — the live one (`AdminConsoleLayout.tsx` + `admin.tsx`) and a completely unreferenced 800+ line parallel implementation (`ConsoleShell.tsx`/`ConsoleUI.tsx`) that no route imports.
- **The family-tree visualization is architecturally disconnected from the CMS**: the headline `/family-tree` diagram is a static `public/interactive-tree.html` file loading Tailwind's CDN build, D3, and Font Awesome from `cdnjs` — none of which reference Supabase — while the database-backed member list renders separately below it.
- **Deployment target is ambiguous**: `vite.config.ts`'s nitro preset defaults to Cloudflare, docs describe Vercel as the live host, no `wrangler.toml` or `vercel.json` is committed, and the build pins an explicit `nitro` beta prerelease (`3.0.260603-beta`).

## 4. Complete Feature/Module Audit

### 4.1 Public-facing site UI/UX, navigation, and cross-page consistency

Core navigation, theming, and most CMS-backed listing pages are solid, but several flagship features (Library video, the interactive family tree, bank-detail disclosure) are either non-functional or actively contradict their own stated policy.

| Area                                                                                | Status                           | Severity | Priority |
| ----------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| Library — video playback always shows placeholder toast, never plays real content   | Present in UI but not functional | High     | P1       |
| Contribute page — public bank/IBAN dialog contradicts adjacent "not published" copy | Implemented but inconsistent     | High     | P1       |
| Family tree — interactive diagram is a static, non-CMS iframe using external CDNs   | Implemented but inconsistent     | High     | P1       |
| News/Library/Achievers/Initiatives — no pagination, hardcoded 200/300-row caps      | Missing entirely                 | Medium   | P2       |
| Foundation/Governance page — fully hardcoded, no CMS wiring                         | Partially implemented            | Medium   | P2       |
| Global search — family member `focus` deep link never consumed by `/family-tree`    | Present in UI but not functional | Medium   | P2       |
| Directory — empty `website` field still renders a dead link                         | Functional but incomplete        | Low      | P3       |
| Sitemap — static, missing all dynamic detail pages, uniform `lastmod`               | Implemented but weak/fragile     | Low      | P3       |

### 4.2 Internationalization, RTL/LTR layout, and Arabic-first requirements

The bilingual data model and most rendering are genuinely well built (see PASS list), but several high-visibility gaps undermine the "Arabic-first, optional English" promise for exactly the audience the toggle serves.

| Area                                                                                               | Status                       | Severity | Priority |
| -------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | -------- |
| Language persistence — no pre-hydration sync, RTL/Arabic flashes on every reload for English users | Implemented but inconsistent | High     | P1       |
| Global search — backend only queries `*_ar` columns, English queries return zero results           | Implemented but inconsistent | High     | P1       |
| Per-route SEO metadata — hardcoded Arabic-only, never varies with language, no hreflang            | Missing entirely             | Medium   | P2       |
| Untranslated Supabase Auth error messages shown raw in Arabic mode                                 | Implemented but inconsistent | Medium   | P2       |
| Unused/duplicated translation dictionary (`src/i18n/translations.ts` dead code)                    | Implemented but inconsistent | Low      | P3       |
| Announcement ticker — RTL-only chevron direction, English aria-labels in Arabic mode               | Implemented but inconsistent | Low      | P3       |
| Arabic (Eastern) numeral formatting applied in only one call site sitewide                         | Implemented but inconsistent | Low      | P3       |
| Language switcher — no `lang` attributes, no group accessible name                                 | Implemented but weak/fragile | Low      | P3       |

### 4.3 Authentication, session lifecycle, and account management

The JWT verification core (`requireSupabaseAuth`) is sound, but self-service account lifecycle (recovery, deletion) and abuse protection are largely unbuilt.

| Area                                                                              | Status                       | Severity | Priority |
| --------------------------------------------------------------------------------- | ---------------------------- | -------- | -------- |
| Profile privacy RLS — `Public Read Profiles USING (true)` exposes all member PII  | Implemented but weak/fragile | Critical | P0       |
| Password reset — no pre-login entry point and no "set new password" form anywhere | Missing entirely             | Critical | P0       |
| Session expiry — no reactive redirect-to-auth once inside `_authenticated/*`      | Missing entirely             | Medium   | P2       |
| Signup/sign-in — no CAPTCHA/bot mitigation anywhere                               | Missing entirely             | Medium   | P2       |
| Public `/verify` endpoint — non-unique 6-hex prefix match, no rate limiting       | Implemented but weak/fragile | Medium   | P2       |
| Session tokens stored in `localStorage` (XSS blast-radius risk)                   | Implemented but weak/fragile | Low      | P3       |
| No self-service account deletion or personal-data export                          | Missing entirely             | Low      | P3       |
| Signup form — no password strength feedback, no confirm-password field            | Partially implemented        | Low      | P3       |
| React Query cache not cleared on sign-out (cross-account data flash risk)         | Implemented but weak/fragile | Low      | P3       |
| Auth/session config (password policy, JWT lifetime, captcha) untracked in repo    | Missing entirely             | Low      | P3       |

### 4.4 Application-level authorization (roles, permission checks, route guards) in the admin console

The role model is broken in both directions: a plain `admin` can escalate to `super_admin`, while a legitimate `super_admin`-only account is rejected by the server.

| Area                                                                                                                                                               | Status                           | Severity | Priority |
| ------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------- | -------- | -------- |
| Privilege escalation — any `admin` can grant itself/others `super_admin`                                                                                           | Implemented but inconsistent     | Critical | P0       |
| Permissions Matrix UI is cosmetic/hardcoded, contradicts real enforcement                                                                                          | Present in UI but not functional | High     | P1       |
| `super_admin`-only accounts pass client gates but fail every server call                                                                                           | Implemented but weak/fragile     | High     | P1       |
| Per-tab/domain RBAC scaffolding exists in config but is never applied                                                                                              | Missing entirely                 | High     | P1       |
| `content_manager`/`family_manager` roles assignable but check nothing                                                                                              | Present in UI but not functional | Medium   | P2       |
| `upsertCmsRow`/`setCmsPublished`/`deleteCmsRow`/`reviewContribution` rely on RLS alone; unused `requireEditorAuth`/`requireTreasuryAuth` sit dead in the same file | Implemented but inconsistent     | High     | P1       |
| `/content` and `/treasury` overview functions return full unfiltered datasets before client-side role filtering                                                    | Implemented but weak/fragile     | Medium   | P2       |
| Orphaned duplicate admin module (`admin.functions.ts`) with weaker/no role checks                                                                                  | Missing entirely                 | Medium   | P2       |
| Three fragmented, independently-implemented authorization models across `/admin`, `/content`, `/treasury`                                                          | Implemented but inconsistent     | Medium   | P2       |

### 4.5 Database Architecture (Supabase Postgres — schema, RLS, constraints, migrations)

This is the single largest source of Critical findings. The baseline migration is internally broken and, where it does apply, silently defeats privacy and financial-integrity protections built in earlier migrations.

| Area                                                                                                                        | Status                           | Severity | Priority |
| --------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| Baseline migration references non-existent columns in `CREATE INDEX` — cannot apply to a fresh DB                           | Implemented but weak/fragile     | Critical | P0       |
| ~14 tables queried by admin-hub.functions.ts never created by any migration                                                 | Present in UI but not functional | Critical | P0       |
| 13 properly-defined tables have RLS enabled with no write policies at all                                                   | Present in UI but not functional | Critical | P0       |
| Redundant `WITH CHECK (true)` INSERT policy on `contributions` bypasses ownership                                           | Implemented but weak/fragile     | High     | P1       |
| `Public Read Profiles USING (true)` defeats directory privacy opt-in                                                        | Implemented but inconsistent     | Critical | P0       |
| `initiatives`/`content_sections` public SELECT policies missing publish gate                                                | Implemented but inconsistent     | High     | P1       |
| Demo/seed data (fake membership requests, contributions, hardcoded admin email) baked into versioned migrations             | Implemented but weak/fragile     | High     | P1       |
| Duplicate disconnected inquiry systems (`contact_messages` vs `inquiries`/`inquiry_notes`)                                  | Present in UI but not functional | Medium   | P2       |
| Duplicate audit tables (`audit_log` vs `audit_logs`) written inconsistently                                                 | Implemented but inconsistent     | Medium   | P2       |
| `updated_at` triggers missing on all baseline-era tables                                                                    | Implemented but inconsistent     | Low      | P3       |
| Inconsistent soft-delete vs hard-delete strategy across content tables                                                      | Implemented but inconsistent     | Medium   | P2       |
| Directory visibility silently depends on manual admin role grant                                                            | Partially implemented            | Medium   | P2       |
| Missing CHECK constraints (contribution amount, self-referencing relationships, event date ranges, duplicate registrations) | Missing entirely                 | Medium   | P2       |
| Missing indexes on frequently-joined FK columns                                                                             | Missing entirely                 | Low      | P3       |
| Storage buckets referenced by code/policies never created via migration                                                     | Missing entirely                 | Medium   | P2       |
| Migration header claims "41 tables," file contains 25                                                                       | Implemented but weak/fragile     | Low      | P3       |

### 4.6 Server-side logic — TanStack Start server functions and API-shaped logic

Input validation is consistently applied, but several server functions trust RLS as the sole security boundary — a boundary this same audit shows is currently broken in multiple places.

| Area                                                                                                                                   | Status                       | Severity | Priority |
| -------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | -------- |
| `profiles` RLS — same root cause as 4.5, confirmed from the server-function angle                                                      | Implemented but weak/fragile | Critical | P0       |
| `contributions` RLS — same root cause as 4.5, confirmed from the server-function angle                                                 | Implemented but weak/fragile | Critical | P0       |
| Sensitive functions use generic `requireSupabaseAuth` instead of existing `requireTreasuryAuth`/`requireEditorAuth`/`requireAdminAuth` | Implemented but weak/fragile | High     | P0       |
| `reviewContribution` returns `ok:true` and writes a false audit entry even when the underlying update affects 0 rows                   | Implemented but weak/fragile | High     | P1       |
| Duplicate admin backends with divergent security posture                                                                               | Implemented but inconsistent | High     | P1       |
| PostgREST filter-string injection in `getPublicGlobalSearch` (`cms.functions.ts`)                                                      | Implemented but weak/fragile | Medium   | P2       |
| No CAPTCHA/rate limiting on any public mutation server function                                                                        | Partially implemented        | Medium   | P2       |
| App-code role list allows roles the live DB CHECK constraint may reject                                                                | Implemented but inconsistent | Medium   | P2       |
| Inconsistent error-handling contract — raw Postgres errors leak in `admin-hub.functions.ts`                                            | Implemented but inconsistent | Low      | P3       |
| Global search results return unsigned private storage paths (broken thumbnails)                                                        | Functional but incomplete    | Low      | P3       |
| `setMessageStatus` and similar handlers return success without checking rows affected                                                  | Implemented but weak/fragile | Low      | P3       |

### 4.7 Custom CMS/admin tooling — page builder, homepage manager, navigation manager

This is the domain with the clearest "phantom CMS" pattern: content is saved successfully by the admin but frequently never reaches the public site.

| Area                                                                                                                    | Status                           | Severity | Priority |
| ----------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| `content_pages.visibility` (Family/Admin-only) never enforced by loader or RLS                                          | Implemented but weak/fragile     | Critical | P0       |
| `content_sections` public RLS is unconditional `USING (true)`                                                           | Implemented but weak/fragile     | Critical | P0       |
| Navigation Manager persists to DB but Header/Footer never read it — zero effect on live site                            | Present in UI but not functional | Critical | P0       |
| Navigation Manager has no UI to create a new menu (`onSaveMenu` unused)                                                 | Partially implemented            | Medium   | P2       |
| `navigation_menus`/`navigation_items`/`content_revisions` and actual `content_pages` columns absent from all migrations | Implemented but inconsistent     | High     | P1       |
| Page Builder editor implements only 5 of 19 registered block types                                                      | Partially implemented            | High     | P1       |
| Public renderer implements only 6 of 19 block types (CTA block dead on live site)                                       | Present in UI but not functional | High     | P1       |
| Live Preview tab covers only 3 of 5 editable block types                                                                | Partially implemented            | Medium   | P2       |
| Statistics block: admin writes `stats`, renderer reads `data.items` — always empty                                      | Implemented but weak/fragile     | Medium   | P2       |
| Homepage Manager: 4 of 10 configurable sections have no render case at all                                              | Present in UI but not functional | Medium   | P2       |
| CMS page save (delete+insert of sections) is non-atomic                                                                 | Implemented but weak/fragile     | Medium   | P2       |
| Revision history recorded but no UI to view/restore a past version                                                      | Partially implemented            | Low      | P3       |
| Rich Text block over-promises formatting it does not implement (plain textarea)                                         | Implemented but inconsistent     | Low      | P3       |
| Navigation item URL field accepts `javascript:` URLs, no validation                                                     | Missing entirely                 | Low      | P3       |
| "Scheduled" page status modeled in DB but unreachable from UI                                                           | Missing entirely                 | Low      | P3       |
| SVG uploads accepted without sanitization                                                                               | Implemented but weak/fragile     | Low      | P3       |

### 4.8 Family-data modules (family tree, branches, directory, DNA studies)

The flagship family-tree/genealogy feature is compromised at every layer: RLS blocks the relationship tables entirely, the member-edit form writes columns the live table doesn't have, and the public page still defaults to fictional seed data.

| Area                                                                                                                                | Status                           | Severity | Priority |
| ----------------------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| Profile privacy RLS — same root cause as 4.5/4.6, confirmed a third time from this angle                                            | Implemented but weak/fragile     | Critical | P0       |
| `family_relationships`/`places`/`family_history_entries` have RLS enabled with zero policies — default-deny blocks the admin itself | Missing entirely                 | Critical | P0       |
| Family member CRUD writes columns/enums that do not exist on the live `family_members` table                                        | Present in UI but not functional | Critical | P0       |
| Zod enums permit values the DB CHECK constraints reject (relationship type, visibility, status)                                     | Implemented but inconsistent     | High     | P0       |
| DNA Studies save writes a nonexistent `category` column; `site_settings` has no write RLS policy                                    | Present in UI but not functional | High     | P1       |
| Family tree viewer groups by flat generation only; spouse map silently drops multiple marriages                                     | Partially implemented            | Medium   | P1       |
| Public `/family-tree` still dominated by ~30 hardcoded fictional entries; live-row field mapping wrong                              | Partially implemented            | Medium   | P1       |
| CSV import: naive comma-split parser, no duplicate detection, silent placeholder substitution                                       | Implemented but weak/fragile     | Medium   | P2       |
| Live schema documented as diverged from committed migrations (roles, and by extension other structures)                             | Implemented but weak/fragile     | High     | P0       |
| Directory access gate grants access on ANY `user_roles` row, not specifically verified membership                                   | Implemented but inconsistent     | Low      | P3       |
| `show_in_directory` default flipped from `false` to `true` between migrations                                                       | Implemented but inconsistent     | Medium   | P2       |

### 4.9 Recurring-content modules (News, Achievers, Initiatives, Library, Events, Announcements)

Multiple content types are invisible on the public site due to taxonomy/field mismatches between the admin write path and the public read path — a pattern that repeats across nearly every module in this domain.

| Area                                                                                                                  | Status                           | Severity | Priority |
| --------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| Library photographs/recordings — collection-value taxonomy mismatch drops all photo/video content                     | Implemented but inconsistent     | Critical | P0       |
| Library recordings — no video player or YouTube embed exists at all                                                   | Present in UI but not functional | Critical | P0       |
| News — Articles path cannot produce "Family" news; publishing an article silently hides the separate family-news feed | Implemented but inconsistent     | Critical | P0       |
| Initiatives — "Completed" status collapses to "Planned/Upcoming" everywhere it's displayed                            | Partially implemented            | High     | P1       |
| Initiatives — permissive `USING (true)` RLS risks exposing unpublished/draft financial figures                        | Implemented but weak/fragile     | High     | P1       |
| Achievers — no category field in admin form; new entries invisible under any field filter                             | Missing entirely                 | High     | P1       |
| Events — full admin CRUD/RSVP/export exists with zero public route to discover or register                            | Present in UI but not functional | Medium   | P2       |
| News/Achievers/Initiatives/Library — no pagination anywhere, hardcoded 200/300 caps                                   | Missing entirely                 | Medium   | P2       |
| News — no category taxonomy or date archive beyond Family/Fund                                                        | Partially implemented            | Medium   | P2       |
| Homepage builder default CTAs point at the admin-only `/content` route                                                | Present in UI but not functional | Medium   | P2       |
| News — hardcoded, increasingly wrong Hijri year (1447) for all article-based items                                    | Implemented but weak/fragile     | Low      | P3       |
| Articles — "In Review" status selectable in UI but rejected by DB CHECK constraint                                    | Implemented but weak/fragile     | Medium   | P2       |
| Duplicate, divergent `CREATE TABLE` definitions for the same recurring-content tables                                 | Implemented but weak/fragile     | Medium   | P2       |

### 4.10 Public forms, donations/treasury, inquiry management, and file/media handling

The public-facing form UX is well built, but the same RLS/table-mismatch pattern seen elsewhere means several backend paths (Inquiries, business listings, media uploads) are broken or unreachable.

| Area                                                                                                                | Status                           | Severity | Priority |
| ------------------------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| Contribution RLS integrity — same redundant INSERT policy as 4.5/4.6                                                | Implemented but weak/fragile     | Critical | P0       |
| Inquiries admin panel reads a table the public Contact form never writes to                                         | Present in UI but not functional | Critical | P0       |
| Business directory public submission writes columns absent from the live `businesses` table; no INSERT policy       | Implemented but inconsistent     | High     | P1       |
| Contact/nomination/listing forms rely on honeypot only — no CAPTCHA, no rate limiting                               | Partially implemented            | Medium   | P1       |
| No outbound notification (email/in-app) on new contact/inquiry/contribution submissions                             | Missing entirely                 | High     | P1       |
| Contribution verify/reject actions logged to a legacy audit table invisible in the Audit Logs viewer                | Implemented but inconsistent     | High     | P1       |
| Media upload buckets (`site-media`, `family-photos`, `galleries`, etc.) have no storage RLS policy in any migration | Present in UI but not functional | High     | P0       |
| File upload type/size limits enforced only client-side, no server/storage backstop                                  | Implemented but weak/fragile     | Medium   | P2       |
| Contribution review overwrites prior reviewer's note/identity, no history                                           | Implemented but weak/fragile     | Low      | P3       |

### 4.11 Cross-cutting admin console operational capability (dashboard, audit trail, global search, site settings)

The audit/accountability layer — arguably the most important governance feature for a fund handling money — is functionally broken end-to-end, and several dashboard elements assert claims the codebase itself disproves.

| Area                                                                                                | Status                           | Severity | Priority |
| --------------------------------------------------------------------------------------------------- | -------------------------------- | -------- | -------- |
| `audit_logs` has RLS enabled with zero policies — inserts/reads both denied by default              | Present in UI but not functional | Critical | P0       |
| Duplicate/parallel audit systems (`audit_log` vs `audit_logs`) never reconciled                     | Implemented but inconsistent     | High     | P1       |
| Site Settings saved values never consumed under the keys the public site reads (contact info, SEO)  | Present in UI but not functional | High     | P1       |
| RLS write policies missing for family/article/event/site-settings tables (same root cause as 4.5)   | Implemented but weak/fragile     | Critical | P0       |
| Global command palette indexes only 5 of ~15 admin data modules                                     | Partially implemented            | Medium   | P2       |
| Audit logging applied inconsistently across admin-hub.functions.ts handlers                         | Partially implemented            | Medium   | P2       |
| Audit log writes are fire-and-forget; failures are silently swallowed                               | Implemented but weak/fragile     | Medium   | P2       |
| Audit Logs viewer never shows which admin performed an action                                       | Functional but incomplete        | Medium   | P2       |
| Audit log hard-capped at 200 rows, no pagination                                                    | Missing entirely                 | Low      | P3       |
| Fully unused, unreferenced duplicate admin console shell (`ConsoleShell.tsx`/`ConsoleUI.tsx`)       | Missing entirely                 | Low      | P3       |
| Dashboard treasury target (500,000 SAR) hardcoded, no admin control                                 | Implemented but weak/fragile     | Low      | P3       |
| Dashboard "Database Health"/"RLS + RBAC Active" badges are static, not real checks                  | Present in UI but not functional | Low      | P3       |
| Site Settings screen claims "every write operation is audited" — contradicted by audit_logs RLS gap | Implemented but inconsistent     | Low      | P3       |

### 4.12 Cross-cutting operational readiness (error handling, observability, SEO, environment/deployment, dependencies, backups)

Several explicit, non-negotiable brief requirements for a commercial launch are simply absent.

| Area                                                                                                                   | Status                       | Severity | Priority |
| ---------------------------------------------------------------------------------------------------------------------- | ---------------------------- | -------- | -------- |
| No external crash/error monitoring (Sentry-class) reaches production; Lovable hooks are editor-only                    | Missing entirely             | High     | P1       |
| No analytics integration (GA4 or equivalent) anywhere in the code                                                      | Missing entirely             | Medium   | P2       |
| Sitemap static/incomplete, no dynamic regeneration from CMS content                                                    | Partially implemented        | Medium   | P2       |
| Canonical/OG domain (`vercel.app`) disagrees with hardcoded `robots.txt`/`sitemap.xml` domain (`albouabidfamily.com`)  | Implemented but inconsistent | Medium   | P1       |
| Anon Supabase client falls back to hardcoded production URL/key if env vars are missing (fails open)                   | Implemented but weak/fragile | Medium   | P2       |
| No automated backup/restore mechanism for DB or Storage, despite being an explicit brief and internal-plan requirement | Missing entirely             | High     | P1       |
| Deployment target ambiguous (Cloudflare-defaulting nitro vs documented Vercel host), no committed deploy config        | Implemented but weak/fragile | Medium   | P2       |
| No email delivery provider configured; notifications are in-app only                                                   | Missing entirely             | Medium   | P2       |
| Core dependencies pinned to beta/very-new majors (`nitro` beta, `vite ^8`) with no audit tooling                       | Implemented but weak/fragile | Low      | P3       |
| `.env` correctly gitignored; no secret/service-role key leakage found                                                  | **PASS**                     | —        | —        |

## 5. User Journey & Workflow Audit

**Journey A — Visitor discovers the site, reads content, and tries to contact/contribute.**

1. Homepage loads with correct RTL/Arabic-first rendering, working navigation, and SEO metadata (`src/routes/index.tsx`, `src/routes/__root.tsx`) — this stage works well.
2. Visitor browses News: works for whichever news source (Articles or `news_posts`) currently "wins," but if any Article has ever been published, the entire Family-news feed silently disappears (`getPublishedNews`, `src/lib/cms.functions.ts` lines 140-190) — a real break for a family member looking for family-specific news.
3. Visitor opens Library expecting videos/photos: any item tagged "Photographs" or "Recordings" in the admin never appears at all (collection-taxonomy mismatch, `src/content/cms-adapt.ts`), and even a "Documents" video that does surface can never be played — clicking Play always shows a static "still uploading" toast (`src/routes/library.tsx`). **Journey breaks here for the explicitly required "YouTube videos, categorized" feature.**
4. Visitor opens the interactive family tree expecting to see real relatives: the diagram itself is a static, pre-authored artwork (`public/interactive-tree.html`) disconnected from the database; a family member added via the admin console never appears in the visual tree, only in a secondary list below it. **Journey breaks here for the site's headline feature.**
5. Visitor decides to contribute: the "View Official Bank Details" dialog is unauthenticated and shows a full IBAN/account number to any visitor, directly contradicting the page's own printed policy (`src/routes/contribute.tsx`) — a trust and possibly fraud-prevention failure at the exact moment of financial engagement.
6. Visitor submits the Contact form: submission succeeds and is stored in `contact_messages`, but no admin is ever notified (no email/in-app alert wired), and the "Inquiries" screen an admin might check reads an entirely different, permanently-empty table. **Journey breaks here — the message is sent into a void from the staff's perspective.**
7. A forgetful visitor who registered earlier tries to reset their password: there is no "Forgot password?" link on `/auth`, and even a user who reaches the authenticated Account page's "Send Reset Link" button lands, after clicking the emailed link, on a page with no field to actually set a new password (no `supabase.auth.updateUser` call exists anywhere in the codebase). **Journey breaks here — account recovery is impossible without contacting the secretariat manually.**

**Journey B — Admin logs in, publishes content, and manages family/members.**

1. Admin signs in and reaches `/admin`; the shell renders correctly and role gating on the client works as expected for `admin`/`super_admin`.
2. Admin edits a navigation menu item and saves: a success toast appears, the row persists to `navigation_items`, but the public Header/Footer/mobile nav never read that table (`src/content/navigation.ts` is what's actually rendered) — **the change has zero visible effect**, with no warning to the admin.
3. Admin builds a page with the Page Builder, adding a "Call to Action" block: the block is fully editable and even looks correct if the admin checks certain preview states, but neither the Live Preview tab nor the public `/p/$slug` renderer implements a `cta` case — **the button the admin configured never appears anywhere**.
4. Admin tries to add or edit a Family Member: the form writes `branch_id`, `date_of_birth`, `status`, and other fields that do not exist on the live `family_members` table (which has `branch_slug`, `birth_year_hijri/gregorian`, no `status` column at all) — **the save is expected to fail with a Postgres column-does-not-exist error**, blocking the console's most central data-entry workflow.
5. Admin tries to link two family members as spouses/parent-child via the Family Relationships manager: `family_relationships` has RLS enabled with zero policies defined anywhere, so the insert is rejected by Postgres's default-deny behavior even for a legitimate admin — **relationship data entry is completely blocked**.
6. Admin verifies a pending financial contribution in Treasury: the update succeeds or is silently rejected without any row-count check (`reviewContribution`, `src/lib/contributions.functions.ts`), and either way an audit entry is written — but to the legacy `audit_log` table, invisible in the console's own Audit Logs viewer, which only reads `audit_logs`. **The action either doesn't happen or isn't auditable, and the admin cannot tell which.**
7. Admin later opens System Audit Logs to review "who did what": the view is likely empty regardless of activity, because `audit_logs` has RLS enabled with no SELECT policy for any role — **the accountability feature the console's own copy promises ("every write operation is audited") does not function.**

## 6. UI/UX Audit

**Strengths (confirmed PASS across multiple domains):** navigation is centrally sourced and dead-link-free (`src/content/navigation.ts`); empty/loading/error states are consistently implemented on News, Library, Achievers, Directory, and Family Tree; theme (light/dark) has a proper pre-hydration script preventing flash-of-wrong-theme (`__root.tsx`); the bilingual `BiText`/`t()` pattern and RTL-specific typography (`html[dir="rtl"]` selectors in `src/styles.css`) are applied broadly and correctly, including forcing `dir="ltr"` on embedded phone numbers/emails/license codes inside RTL text; chevron/arrow mirroring via `rtl:rotate-180` is used correctly in most navigational contexts; per-route SEO `head()` metadata is present on essentially every route.

**Weaknesses:**

- **Language switching is not truly instant/SSR-safe**: the `<html>` shell is hardcoded `lang="ar" dir="rtl"`, and language preference is only applied post-hydration via `useEffect` — unlike theme, which solved this identical problem with a synchronous inline script. English-mode users see a visible RTL-to-LTR flip on every reload (`src/routes/__root.tsx`, `src/i18n/LanguageProvider.tsx`).
- **Global search is functionally Arabic-only**: both the backend query and the modal's rendering ignore `*_en` columns entirely, so English-mode users searching in English get zero results even when matching English-language records exist (`src/lib/cms.functions.ts`, `GlobalSearchModal.tsx`).
- **Untranslated system errors break the bilingual illusion at the worst moment**: raw English Supabase Auth error strings ("Invalid login credentials") are shown ahead of the app's own translated fallback on `/auth`, even though every other string on that page is carefully bilingual.
- **Minor but real accessibility/consistency gaps**: the language switcher has no `lang` attributes or group label for screen readers; the Announcement ticker's prev/next chevrons don't flip for LTR mode and carry hardcoded English aria-labels even though the sibling dismiss button is correctly localized.
- **A dead/duplicated translation dictionary** (`src/i18n/translations.ts`) sits unused and out of sync with the actually-used `src/content/navigation.ts`, a maintenance hazard for future contributors.
- **Feature-level UX honesty failures**: the Contribute page's bank-details dialog contradicts its own printed policy; the Library's Play button always shows a placeholder regardless of whether real content exists; several Page Builder blocks (Video, Gallery, Timeline, Member Spotlight, etc.) can be added from the palette with zero editable fields, giving admins a false impression of capability.

## 7. Backend/API Audit

**Strengths:** The authentication core is genuinely solid — `requireSupabaseAuth` performs real server-side JWT verification via `getClaims()`/`getUser()` rather than trusting client claims, and `requireAdminAuth`/`requireEditorAuth`/`requireTreasuryAuth` correctly re-query `user_roles` server-side. Every server function reviewed validates input with zod before touching the database. The service-role Supabase client correctly fails closed when `SUPABASE_SERVICE_ROLE_KEY` is absent, and privileged writes (e.g., `assignUserRole`) are properly routed through it only after an RLS-scoped caller check. Signed URLs (120s TTL) are used correctly for private receipt files. `subscribeToNewsletter` and `uploadContentMedia` show good defensive patterns not applied elsewhere.

**Critical weaknesses:**

- **RLS is the sole security boundary in most places it matters, and that boundary is currently broken.** The baseline migration's `Public Read Profiles USING (true)` and the redundant `contributions` `WITH CHECK (true)` INSERT policy mean the anon key alone can read all member PII and forge contribution records attributed to other users — confirmed independently from the Database, Server-side logic, Family-data, and Cross-cutting Admin angles, which is strong corroborating evidence rather than four separate bugs.
- **13+ tables have RLS enabled with zero write policies**, meaning the admin console's own writes (family members, branches, articles, events, site settings, audit logs) are rejected by Postgres even for legitimate admins — while ~14 other tables referenced in code (`media_assets`, `navigation_menus`, `permissions`, `notifications`, etc.) do not exist in any migration at all.
- **Two mutation-security gaps compound each other**: `upsertCmsRow`/`setCmsPublished`/`deleteCmsRow`/`reviewContribution` use only generic `requireSupabaseAuth` with no in-handler role check, while the stricter `requireEditorAuth`/`requireTreasuryAuth` middleware exists unused in the same codebase (`src/integrations/supabase/auth-middleware.ts`) — a defense-in-depth failure that becomes a real vulnerability the moment the underlying RLS (already shown to be broken in places) fails.
- **Success responses do not reflect actual write outcomes**: `reviewContribution` and `setMessageStatus` return `{ok:true}` and write a (false) audit-log row even when zero database rows were actually affected, masking authorization failures as successes.
- **A PostgREST filter-injection pattern** exists in `getPublicGlobalSearch` (`cms.functions.ts`), interpolating unescaped user input into `.or()` filter strings — a pattern the codebase demonstrably knows to avoid elsewhere (`account.functions.ts`'s `getMemberVerification` comment explains why it avoids exactly this).
- **Storage buckets referenced throughout the console** (`site-media`, `family-photos`, `galleries`, `documents-public/private`, `avatars`) have no `storage.objects` RLS policy in any migration — only `media` and `receipts` do — meaning most image/PDF uploads across the CMS are either broken by the numbers or rely entirely on undocumented, unreproducible out-of-band dashboard configuration.
- **No CAPTCHA or rate limiting exists on any public-facing mutation** (contact, contribution, business listing, achiever nomination, signup/signin) — the only defense is a client-side honeypot field, trivially bypassed by any scripted client.
- **Duplicate, divergent backend implementations** for the same business logic (news/initiatives/achievers CRUD, contribution review, membership review) increase the odds that a security fix applied to one path is silently absent from the other — which is exactly how several of the missing-role-check findings above occurred.

## 8. Database & Data Integrity Audit

The database layer is the single weakest part of this application. The migration history in `supabase/migrations/*.sql` cannot currently be trusted as an accurate record of the live schema, and several of the RLS policies that are supposed to protect member and financial data have been silently neutralized by a later "baseline" migration. This section groups findings by root cause rather than by originating audit domain, since the same defects were independently rediscovered by multiple reviewers (auth, server-logic, CMS, family-data, and forms/treasury audits all converged on the same broken migration file).

### 8.1 Critical data-exposure and integrity defects (P0)

| Area                                                  | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                            | Files                                                                                                                                             | Severity |
| ----------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------- | -------- |
| `profiles` table publicly readable                    | `20260822000000_core_schema_baseline.sql:466-467` adds `"Public Read Profiles" ... USING (true)`, OR'd with the earlier owner/admin/directory-scoped policies. Any anon/authenticated caller can read every member's full name, phone, lineage notes, and avatar regardless of `show_in_directory`. Confirmed independently by the authentication, server-logic, and family-data audits.                                                                           | `supabase/migrations/20260822000000_core_schema_baseline.sql`, `20260814145130_...sql`, `20260806014907_...sql`, `src/lib/directory.functions.ts` | Critical |
| `contributions` INSERT policy duplicated permissively | Baseline migration adds a second INSERT policy `WITH CHECK (true)` alongside the original `user_id = auth.uid()` policy. Any authenticated user can forge a contribution record (including `status='verified'`) attributed to another member.                                                                                                                                                                                                                      | `supabase/migrations/20260822000000_core_schema_baseline.sql:515-516`, `20260814144843_...sql:186`                                                | Critical |
| `content_pages.visibility` never enforced             | Neither the public loader (`getPublicContentPageBySlug`, `src/lib/cms.functions.ts:512-536`) nor RLS (`...baseline.sql` line 497, `USING (status='published')`) checks the `visibility` field the Page Builder exposes as "Family Only"/"Admin Only." Any published page is servable to anonymous visitors regardless of its stated visibility.                                                                                                                    | `src/lib/cms.functions.ts`, `src/components/console/cms/PageBuilderDialog.tsx`, `supabase/migrations/20260822000000_core_schema_baseline.sql`     | Critical |
| `content_sections` fully public                       | `"Public Read Content Sections" ... USING (true)` (line 500) with no join back to the parent page's status/visibility — draft page content is readable via direct PostgREST query.                                                                                                                                                                                                                                                                                 | `supabase/migrations/20260822000000_core_schema_baseline.sql`                                                                                     | Critical |
| Migration references non-existent columns             | `CREATE INDEX idx_family_members_branch_id ON family_members(branch_id)` (line 427) — table has `branch_slug`, not `branch_id`. `CREATE INDEX idx_articles_status_published ... WHERE deleted_at IS NULL` (line 429) — `articles` has no `deleted_at` column. A fresh `supabase db reset` aborts on this file.                                                                                                                                                     | `supabase/migrations/20260822000000_core_schema_baseline.sql:427,429`                                                                             | Critical |
| Family-data write path has no RLS policies at all     | `family_relationships`, `places`, `family_history_entries` have RLS enabled with zero CREATE POLICY statements anywhere in the migration history — default-deny blocks every read and write, including from the admin console.                                                                                                                                                                                                                                     | `supabase/migrations/20260822000000_core_schema_baseline.sql:444-446`, `src/lib/admin-hub.functions.ts:108-119,213-242`                           | Critical |
| 13 admin-managed tables have no write RLS policy      | `family_members`, `articles`, `events`, `event_registrations`, `announcements`, `businesses`, `content_pages`, `content_sections`, `site_settings`, `audit_logs`, and others have public-SELECT-only policies; every admin create/edit/delete handler routes through the RLS-scoped client (`context.supabase`), not the service-role client, and would be rejected by Postgres.                                                                                   | `supabase/migrations/20260822000000_core_schema_baseline.sql:439-519`, `src/lib/admin-hub.functions.ts:130-164,189-212,722-754,715-720`           | Critical |
| `audit_logs` unreadable and unwritable                | RLS enabled, zero policies. Every one of the ~30 `audit_logs.insert()` calls in `admin-hub.functions.ts` (RLS-scoped client) should fail; `getAuditLogsData`'s SELECT should return empty. The console's entire accountability/audit-trail feature is a no-op.                                                                                                                                                                                                     | `supabase/migrations/20260822000000_core_schema_baseline.sql`, `src/lib/admin-hub.functions.ts`                                                   | Critical |
| Family member CRUD targets nonexistent columns        | Admin schemas/forms use `branch_id`, `date_of_birth`, `biography_ar/en`, `display_name_ar/en`, `status` — the live `family_members` table (baseline lines 72-103) has `branch_slug`, `birth_year_hijri/gregorian`, `bio_ar/en`, `occupation_ar/en`, and **no `status` column**. Bulk "publish" actions write to a column that doesn't exist.                                                                                                                       | `src/lib/admin-hub.schemas.ts:10-41`, `src/components/console/family/FamilyMembersTable.tsx:43-67`, `src/lib/admin-hub.functions.ts:1238-1294`    | Critical |
| Admin-console tables queried but never created        | ~14 table names (`media_assets`, `content_revisions`, `article_categories/tags`, `permissions`, `role_permissions`, `inquiry_notes`, `navigation_menus/items`, `notifications`, `galleries/gallery_media`, `documents`) are referenced via `.from(...)` in `admin-hub.functions.ts` but appear in no migration. Media Library, tag/category pickers, granular permissions, navigation builder, notifications, galleries, and document manager are dead on arrival. | `src/lib/admin-hub.functions.ts` (75-1404), `supabase/migrations/*`                                                                               | Critical |

### 8.2 Schema drift and migration hygiene

- **Duplicate, incompatible CREATE TABLE definitions** for `initiatives`, `achievers`, `library_items`, `news_posts`, `branches` exist in both `20260814144843_...sql` (the shape the app code actually uses: `summary_ar`, `cover_path`, status `'ongoing'`) and the baseline migration (`excerpt_ar`, `image_path`, `target_amount`, status CHECK `IN ('active','planned','completed')`). Because the baseline uses `IF NOT EXISTS`, it is currently a no-op against the live DB, but a fresh environment built from these files would produce a schema incompatible with the app.
- **Zod enums permit values the DB CHECK constraints reject**: `relationshipTypeSchema` allows `parent/child/spouse` vs. DB's `father/mother/spouse/son/daughter`; `visibilityLevelSchema` allows `family_only`/`admin_only` vs. DB's `family`/`private`; `recordStatusSchema` allows `in_review`/`scheduled` vs. articles' CHECK of `draft/published/archived`. Form-valid input reliably fails at the database layer. (`src/lib/admin-hub.schemas.ts:3-6`, `20260822000000_core_schema_baseline.sql:96,110,140,157`)
- **`user_roles.role` CHECK constraint doesn't include roles the app assigns**: `super_admin`, `content_manager`, `family_manager`, `viewer` are assignable via `admin-hub.functions.ts`, but the baseline CHECK only allows `admin/editor/treasurer/member/guest` — the code's own comment (`useAuth.tsx:5-16`) admits these roles "were added directly against the live project," confirming the migration history has drifted from production and cannot be replayed to reproduce it.
- **`businesses` table columns don't match either the public submission handler or the generated types**: `forms.functions.ts`'s `submitBusinessListing` writes `slug/city_ar/contact/owner_branch_ar`, none of which exist in the baseline's `businesses` definition, yet `types.ts` (presumably generated from the live DB) shows they exist — further confirming live-vs-migration drift, and no INSERT policy is granted on the table at all.
- **Two divergent inquiry/contact systems**: the working public Contact form writes to `contact_messages`; the more elaborate assign/note/status admin workflow reads from `inquiries`/`inquiry_notes`, which nothing ever writes to and which (`inquiry_notes`) doesn't exist in any migration.
- **Two divergent audit tables**: singular `audit_log` (migration 1) is written by `cms.functions.ts`, `contributions.functions.ts`, `admin.functions.ts`; plural `audit_logs` (baseline) is written by `admin-hub.functions.ts` and is the only one the Audit Logs viewer reads. No single view of "what changed" exists, and the one being read has no SELECT policy.
- **Seed/demo data committed directly into schema migrations**: `20260814150753_...sql` hardcodes a specific `auth.users` UUID; `20260814150940_...sql` inserts fabricated membership requests, contact messages, and contributions (one marked `'verified'`) with fictional Arabic names; `20260820121814_...sql` hardcodes a specific admin email. These rows may still be live in production and should be purged before launch.
- **`show_in_directory` default flipped** from `false` (migration 1, privacy-safe/opt-in) to `true` (baseline, opt-out) — currently a no-op against the live table but would ship an unsafe default if the schema is ever replayed from scratch.
- **Migration header comment inaccuracy**: baseline migration claims "All 41 tables" but contains 25 `CREATE TABLE` statements (26 unique tables total) — a low-rigor signal consistent with the concrete bugs above.

### 8.3 Missing constraints, indexes, and storage provisioning

- No `CHECK (amount > 0)` on `contributions.amount`; no `CHECK (person_id <> related_person_id)` on `family_relationships` at the DB level (only app-level, bypassable); no `CHECK (end_time > start_time)` on `events`; no `UNIQUE(event_id, user_id)` on `event_registrations`.
- No index on `family_relationships.related_person_id`, `content_sections.page_id`, `event_registrations.event_id`, `businesses.branch_slug`, or a correctly-named `family_members.branch_slug` index.
- Storage buckets (`family-photos`, `site-media`, `galleries`, `documents-public/private`, `avatars`) referenced throughout the admin console's upload components have no corresponding `storage.objects` RLS policy and no migration that creates the bucket at all — only `media` and `receipts` are covered. Rebuilding the project from these migrations would break nearly every image/PDF upload feature.
- `updated_at` triggers exist for every pre-baseline table but none of the 14 baseline-era tables (`family_members`, `articles`, `events`, etc.) — correctness now depends entirely on every write path remembering to set the timestamp manually.
- Inconsistent soft-delete strategy: `family_members` has a real `deleted_at`; `articles`/`content_pages` are queried and updated with `deleted_at` in application code even though the column doesn't exist on those tables (a direct consequence of 8.1's broken migration); other content tables (`news_posts`, `initiatives`, etc.) support only hard delete.

### PASS — Database Architecture

- Role-check helper functions (`has_role`, `can_edit_content`, `can_treasury`, `is_member`) are correctly implemented as `STABLE SECURITY DEFINER` functions in a private schema with `EXECUTE` revoked from `PUBLIC`/anon — avoids RLS self-recursion, follows Supabase's recommended pattern.
- Original phase-1/phase-2 tables (`profiles`, `user_roles`, `membership_requests`, `contact_messages`, `newsletter_subscribers`, `audit_log`, `news_posts`, `initiatives`, `achievers`, `library_items`, `branches`, `contributions`) have well-scoped RLS and working `updated_at` triggers.
- Privileged writes to `user_roles` are correctly routed through the service-role client with explicit rationale comments, consistently applied everywhere role grants happen.
- Sensible `ON DELETE` cascade behavior throughout (auth.users → profiles/user_roles; family_members → family_relationships; content_pages → content_sections; events → event_registrations).
- `contact_messages`/`newsletter_subscribers` correctly implement write-only-for-public / read-only-for-admin RLS.
- `receipts` bucket policy correctly scopes reads to owner or treasurer role.
- Thoughtful uniqueness constraints: case-insensitive `newsletter_subscribers.email`, partial unique index limiting one pending `membership_requests` row per user.
- `news_posts`/`initiatives`/`achievers`/`library_items`/`branches` editor RLS via `private.can_edit()` is correctly scoped and was **not** weakened by the baseline migration (unlike profiles/contributions/content_sections).

---

## 9. Authentication, Authorization & Security Audit

### 9.1 Critical findings (P0)

| Area                               | Finding                                                                                                                                                                                                                                                                                                       | Files                                                                                                  |
| ---------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------ |
| Privilege escalation               | Any user with only the `admin` role can grant themselves (or anyone) `super_admin` — `requireCallerIsAdmin` accepts either `admin` or `super_admin`, with no restriction on granting the top role. Directly contradicts the RolesPermissionMatrix UI, which documents role-assignment as `super_admin`-only.  | `src/lib/admin-hub.functions.ts:657-712`, `src/components/console/users/RolesPermissionMatrix.tsx:109` |
| `profiles` table publicly readable | See Section 8.1 — a live, unauthenticated-exploitable exposure of every member's phone number and lineage notes via the anon key, directly contradicting the app's own privacy-charter copy and the directory opt-out feature.                                                                                | `supabase/migrations/20260822000000_core_schema_baseline.sql`, `src/lib/directory.functions.ts:14-18`  |
| No password-reset flow             | The sign-in page has no "forgot password" link; the only `resetPasswordForEmail` call lives inside the already-authenticated Account > Security tab; there is zero `supabase.auth.updateUser` call anywhere in `src/`, so even a user who clicks the emailed recovery link has no form to set a new password. | `src/routes/auth.tsx`, `src/routes/_authenticated/account.tsx:175-186`                                 |

### 9.2 High-severity findings (P1)

| Area                                                    | Finding                                                                                                                                                                                                                                                                                                  | Files                                                    |
| ------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------------------------------------------------- |
| `super_admin` is functionally broken server-side        | Client gates (`useAuth.tsx:91`) treat `super_admin` as admin-equivalent, but `requireAdminAuth` (`auth-middleware.ts:143-163`) checks only for literal `'admin'` — an account provisioned with only `super_admin` sees the full console UI but every data call is rejected.                              |
| Permissions Matrix is cosmetic                          | `RolesPermissionMatrix.tsx` is a hardcoded static display with no link to `role_permissions`/`user_roles`, and its claims (e.g., "treasurer" can access items inside `/admin`) are false — `/admin` is gated by a single `isAdmin` boolean and blocks non-admins outright.                               |
| No per-tab/domain RBAC in the master console            | `AdminNavigation.ts` supports a `roles` field on domains/tabs but it is never set; every admin sees Users, Roles Matrix, Audit Logs, and Site Settings regardless of role — compounds the privilege-escalation finding above.                                                                            |
| App-level checks absent on sensitive mutations          | `upsertCmsRow`, `setCmsPublished`, `deleteCmsRow` (`cms.functions.ts:322-404`) and `reviewContribution` (`contributions.functions.ts:104-132`) use only generic `requireSupabaseAuth`; `requireEditorAuth`/`requireTreasuryAuth` exist in `auth-middleware.ts:165-207` but are never imported anywhere.  |
| Full unfiltered datasets returned before role filtering | `getCmsOverview` and `getTreasuryOverview` return every draft article and every member's contribution amount/phone/email to any authenticated user, filtering only client-side via a `canEdit`/`canReview` flag.                                                                                         |
| Fragmented, three-way authorization model               | `/admin`, `/content`, `/treasury` each reimplement their own ad hoc role check instead of sharing `requireAdminAuth`/`requireEditorAuth`/`requireTreasuryAuth`, none of which implements the documented 8-role model.                                                                                    |
| Page visibility bypass                                  | `content_pages.visibility` ("Family Only"/"Admin Only") is never enforced by the loader or RLS — see Section 8.1.                                                                                                                                                                                        |
| Contributions duplicate INSERT policy                   | See Section 8.1 — allows impersonated financial records.                                                                                                                                                                                                                                                 |
| No CAPTCHA on signup/sign-in                            | `supabase.auth.signUp`/`signInWithPassword` are called with no `captchaToken`; repo-wide search found zero hCaptcha/Turnstile integration. Open to scripted account creation/credential stuffing.                                                                                                        | `src/routes/auth.tsx`                                    |
| Public forms have no CAPTCHA or rate limiting           | Contact, achiever nomination, business listing forms rely solely on a client-side honeypot (`website_url_check`), trivially bypassed by any scripted client; all four tables (`contact_messages`, `inquiries`, `businesses`, `newsletter_subscribers`) grant public/anon INSERT with `WITH CHECK(true)`. | `src/lib/forms.schemas.ts`, `src/lib/forms.functions.ts` |

### 9.3 Medium/Low findings

- **Session expiry not handled reactively**: no global handler redirects to `/auth` when a session is revoked mid-use on `/account`, `/admin`, or `/treasury`; users see generic failure toasts instead of a re-auth prompt (`src/routes/_authenticated/route.tsx`, `src/hooks/useAuth.tsx`).
- **Public member-verification endpoint weak**: `getMemberVerification` (`account.functions.ts:87-149`) matches on a non-unique 6-hex-char UUID prefix and returns `profiles[0]` on collision, with no rate limiting.
- **Session tokens in `localStorage`**: default supabase-js behavior; widens blast radius of any future XSS to full session takeover (`src/integrations/supabase/client.ts:46-55`).
- **No self-service account deletion/data export**, despite the app's own "privacy charter" copy implying data-subject rights.
- **Signup form has no confirm-password field and no strength feedback**; a typo'd password can silently lock a user out immediately (`src/routes/auth.tsx`).
- **React Query cache not cleared on sign-out**: a second user signing in on the same tab can briefly see the previous user's cached account data (`src/routes/_authenticated/account.tsx:169-173`).
- **Auth configuration undocumented**: `supabase/config.toml` has no `[auth]` block; password policy, session lifetimes, and CAPTCHA settings live only in the dashboard and cannot be code-reviewed or reproduced.
- **Dead roles with zero effect**: `content_manager`/`family_manager` are assignable in the Users UI but checked nowhere, creating false confidence about access scoping (`src/components/console/users/UsersManager.tsx:46-55`).
- **Orphaned duplicate admin server-function module** (`src/lib/admin.functions.ts`) has functions with no role check at all; unclear whether still network-reachable despite being unimported.
- **SVG upload unsanitized**: `ImageUploadInput.tsx` accepts `image/*` including SVG with no sanitization — low risk (rendered only via `<img>`) but exploitable if a viewer opens the raw storage URL directly.
- **Navigation item URL has no protocol validation** — a `javascript:` URL would be accepted by `navigationItemInputSchema`.

### PASS — Authentication & Authorization

- `requireSupabaseAuth` performs real server-side JWT verification via `getClaims`/`getUser`, not client-trusted claims.
- `requireAdminAuth`/`requireEditorAuth`/`requireTreasuryAuth` perform genuine DB role lookups and `requireAdminAuth` is applied consistently to all ~60 functions in `admin-hub.functions.ts`.
- `_authenticated/route.tsx` performs a real server-verified `beforeLoad` check and redirects unauthenticated users.
- Role escalation to `user_roles` has no client-writable RLS path — only reachable via service-role-backed admin functions.
- Bearer-token architecture (not ambient cookies) sidesteps classic CSRF concerns for mutating server functions.
- Service-role key correctly isolated to `*.server.ts`, read only from `process.env`, fails closed if missing.
- Login errors use Supabase's generic message for both wrong-password and non-existent account, avoiding user enumeration.
- `.env` contains only the anon/publishable key; no service-role key committed.
- `getMemberVerification` deliberately avoids building an unsanitized `.or()` filter string, using a single regex-validated `.ilike()` instead — a good contrast to the global-search filter-injection finding below.
- `uploadContentMedia` performs an explicit in-handler role check in addition to RLS — the right pattern, just not applied consistently elsewhere.

---

## 10. Performance & Scalability Audit

| Area                                                            | Finding                                                                                                                                                                                                                                                                                                                                                                                                                        | Files                                                                                                | Severity                                                                                      |
| --------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ---------------------------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| No pagination on any public content list                        | `getPublishedNews/Initiatives/Achievers/Library` hardcode `.limit(200)`/`.limit(300)` with no offset/page parameter; `news.tsx`, `library.tsx`, `achievers.tsx`, `initiatives.tsx` render the entire filtered array in one pass with only client-side tab filters. Content beyond the hardcoded cap silently disappears with no error to editor or visitor. Explicitly called out as a brief requirement for News and Library. | `src/lib/cms.functions.ts`, `src/routes/news.tsx`, `library.tsx`, `achievers.tsx`, `initiatives.tsx` | Medium                                                                                        |
| Audit log hard-capped, no pagination                            | `getAuditLogsData` does `.limit(200)` with no cursor; the viewer just scrolls whatever it receives — history beyond 200 rows is permanently unreachable from the UI.                                                                                                                                                                                                                                                           | `src/lib/admin-hub.functions.ts:718-724`, `src/components/console/activity/AuditLogsViewer.tsx`      | Low                                                                                           |
| Full unfiltered dataset shipped to client before role filtering | `getCmsOverview`/`getTreasuryOverview` return every draft article / every contribution row to any authenticated caller, then compute a `canEdit`/`canReview` boolean for UI purposes only — an over-fetching pattern that is also a confidentiality problem (see Section 9.2).                                                                                                                                                 | `src/lib/cms.functions.ts:269-293`, `src/lib/contributions.functions.ts:79-102`                      | Medium                                                                                        |
| Missing indexes on FK columns                                   | `family_relationships.related_person_id`, `content_sections.page_id`, `event_registrations.event_id`, `businesses.branch_slug` have no supporting index; Postgres does not auto-index FKs, so joins/filters will sequential-scan as data grows.                                                                                                                                                                                | `supabase/migrations/20260822000000_core_schema_baseline.sql`                                        | Low                                                                                           |
| PostgREST filter-string injection risk in global search         | `getPublicGlobalSearch` splices raw user input into `.or()` filter strings across six queries with no escaping of PostgREST-reserved characters — can cause malformed queries/errors on a public, unauthenticated endpoint (not classic SQL injection, but an availability/correctness risk). Notably, the codebase demonstrably knows how to avoid this pattern elsewhere (`account.functions.ts`'s `getMemberVerification`). | `src/lib/cms.functions.ts:602-654`                                                                   | Medium                                                                                        |
| No caching layer anywhere                                       | No client-side query caching strategy beyond default React Query behavior, no CDN/edge caching directives observed for public content, and no mechanism to avoid refetching static reference data (e.g., branches, navigation) on every route load.                                                                                                                                                                            | Repo-wide                                                                                            | Low (not independently verified per-route; flagged as an absence, not a confirmed regression) |
| No pagination in admin content lists other than Articles        | Only `ArticlesManager` has real client-side pagination; achievers/initiatives/library admin tables render full result sets.                                                                                                                                                                                                                                                                                                    | `src/components/console/**`                                                                          | Low                                                                                           |

**Overall assessment:** No classic N+1 query pattern was identified in the reviewed server functions (each `getPublished*`/`getX Overview` function issues a single batched query per entity type). The primary scalability risk is the combination of hardcoded row caps with no pagination UI — content silently vanishes past 200–300 rows with no operator visibility, which will surface as the multi-generational family archive this site is designed to be grows over years.

---

## 11. Mobile/Responsive Audit

None of the twelve domain-specific audits that fed this report included a dedicated mobile-breakpoint or touch-interaction review, and no findings or PASS items in the underlying data speak directly to viewport behavior, touch target sizing, or responsive layout breakage. The only mobile-adjacent evidence available is indirect:

- The site's navigation is centrally sourced (`src/content/navigation.ts`) and consumed identically by `Header.tsx`, `MobileNav.tsx`, and `Footer.tsx` (confirmed PASS under the public-facing UI audit), which suggests the mobile navigation menu is at least structurally consistent with desktop rather than a stale, separately-maintained menu.
- Tailwind CSS v4 (the project's styling framework) provides responsive utility classes throughout, but no reviewer verified actual rendering at mobile/tablet breakpoints, tap-target sizing on interactive elements (buttons, form controls, the language switcher, the global search modal), or whether RTL layout holds correctly at narrow viewports.

**Recommendation:** This is a genuine coverage gap in the audit, not a confirmed pass or fail. Before launch, a dedicated pass should verify: the Header/MobileNav breakpoint transition, form usability on small screens (Contact, Contribute, Auth), the admin console's usability on tablet-width devices (the console layout appears designed for desktop use by staff, which may be acceptable but should be an explicit decision), and touch-target sizing across primary CTAs. No claim of pass or fail should be inferred from the absence of findings here.

---

## 12. Accessibility Audit

As with mobile responsiveness, no domain audit was scoped specifically to WCAG conformance, color contrast, keyboard navigation, or screen-reader flows end-to-end. The accessibility-relevant findings that did surface came incidentally from the internationalization review:

| Area                                                                                | Finding                                                                                                                                                                                                                                                                                                                     | Files                                                | Severity |
| ----------------------------------------------------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- | -------- |
| Language switcher lacks accessible semantics                                        | The two toggle buttons have `aria-pressed` but no `lang="ar"`/`lang="en"` attributes and no wrapping `role="group"`/`aria-label` — screen readers cannot announce that "ع"/"EN" form a language-selection control, nor pronounce "ع" correctly.                                                                             | `src/components/site/LanguageSwitcher.tsx`           | Low      |
| Announcement ticker controls have wrong-language aria-labels and non-flipping icons | Prev/next buttons render fixed `ChevronRight`/`ChevronLeft` with no RTL/LTR variant (unlike `Breadcrumbs.tsx`, which does flip correctly), and their `aria-label`s are hardcoded English ("Previous announcement"/"Next announcement") even though the sibling dismiss button in the same component is correctly bilingual. | `src/components/site/AnnouncementTicker.tsx:113-133` | Low      |

No findings or PASS items address color contrast ratios, focus-visible states, form error announcement to assistive technology, heading hierarchy, or full keyboard-only navigation of the admin console or public site. Given the site's stated commitment to accessibility (scalable fonts, screen-reader support, contrast — per the product brief) and the absence of any dedicated review, **this should be treated as an open risk area requiring a focused WCAG 2.1 AA pass before launch**, not as a passing grade by default.

---

## 13. Localization / RTL / LTR Audit

The site's bilingual/RTL foundation is generally solid (see PASS list), but several concrete gaps undermine the "Arabic-first, optional English" promise specifically for English-mode users and for search.

| Area                                               | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                      | Files                                                                                        | Severity | Priority |
| -------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | -------------------------------------------------------------------------------------------- | -------- | -------- |
| SSR/CSR language mismatch on every reload          | The server-rendered `<html>` shell is hardcoded `lang="ar" dir="rtl"`; the stored language preference is only applied client-side inside a `useEffect` after hydration. An English-preferring user sees a visible RTL-to-LTR flip and a flash of Arabic chrome on every page load/refresh — exactly the class of bug the team already solved for dark/light theme via a synchronous pre-hydration script (`themeInitScript`), but never applied to language. | `src/routes/__root.tsx`, `src/i18n/LanguageProvider.tsx`                                     | High     | P1       |
| Global search is Arabic-only end-to-end            | `getPublicGlobalSearch` selects and filters only `*_ar` columns (never `*_en`); `GlobalSearchModal.tsx` renders only `*_ar` fields, ignoring the `isAr` flag it otherwise uses correctly for its own labels. An English-mode user typing an English name/title gets zero results even when a matching `*_en` row exists.                                                                                                                                     | `src/lib/cms.functions.ts:602-654`, `src/components/site/GlobalSearchModal.tsx`              | High     | P1       |
| Per-route SEO metadata is Arabic-only, no hreflang | Every route's `head()` block (title/description/OG/Twitter tags) is hardcoded Arabic with no lang-conditional logic and no `hreflang` alternates — a single URL serves two content languages but only one language of metadata, breaking social-share previews and English-query SEO for English-mode users.                                                                                                                                                 | `src/routes/__root.tsx`, `about.tsx`, `achievers.tsx`, `news.tsx`, `contact.tsx`, and others | Medium   | P2       |
| Untranslated backend auth errors                   | Supabase Auth's raw English error message is preferred over the app's own bilingual `label()` fallback whenever `error.message` is non-empty — the normal case. Arabic-mode users see raw English like "Invalid login credentials."                                                                                                                                                                                                                          | `src/routes/auth.tsx:77-81`                                                                  | Medium   | P2       |
| Unused, drifted translation dictionary             | `src/i18n/translations.ts`'s `T` dictionary is imported nowhere in the codebase; `src/content/navigation.ts` independently defines its own (differently-worded) nav labels, showing the file was abandoned mid-refactor.                                                                                                                                                                                                                                     | `src/i18n/translations.ts`, `src/content/navigation.ts`                                      | Low      | P3       |
| Announcement ticker RTL/aria issues                | See Section 12 — same finding, cross-referenced here as an i18n consistency gap.                                                                                                                                                                                                                                                                                                                                                                             | `src/components/site/AnnouncementTicker.tsx`                                                 | Low      | P3       |
| Inconsistent Eastern Arabic-Indic numeral usage    | `formatHijri`/`toEasternNumerals` exist specifically to render Hijri years/counts in Eastern Arabic numerals, but are used in exactly one place (`news.$slug.tsx:103`) despite the utility's own doc comment calling for site-wide use; `news.tsx:74` and others render raw Western digits in Arabic mode.                                                                                                                                                   | `src/lib/text.ts`, `src/routes/news.tsx`                                                     | Low      | P3       |
| Language switcher accessibility                    | See Section 12.                                                                                                                                                                                                                                                                                                                                                                                                                                              | `src/components/site/LanguageSwitcher.tsx`                                                   | Low      | P3       |

### PASS — Internationalization / RTL

- Real, working language switcher with persisted preference, present consistently in both public header and admin console.
- Database schema is genuinely bilingual: nearly every content table has paired `*_ar` (NOT NULL) / `*_en` (nullable) columns — a sound "Arabic required, English optional" model.
- Consistent Arabic-with-English-fallback rendering pattern (`isAr ? x_ar : (x_en || x_ar)`) across `about.tsx`, `p.$slug.tsx`, `branches.tsx`, `directory.tsx`, `family-tree.tsx`, `AnnouncementTicker.tsx`.
- Self-hosted bilingual brand font (HT Baybars Display) with correct `@font-face`/`font-display: swap`; Arabic body fonts (IBM Plex Sans Arabic, Amiri) loaded via Google Fonts with sane fallback stacks.
- Genuinely RTL-aware CSS (not just mirrored layout) — swaps font-family/line-height/letter-spacing for Arabic script, and correctly forces `dir="ltr"` on embedded phone numbers/emails/license codes within RTL text.
- Chevron/arrow mirroring correctly implemented via `rtl:rotate-180` in most navigational contexts (though not in the ticker, per above).
- Locale-aware currency/date formatting (`Intl.NumberFormat`/`Intl.DateTimeFormat`) on the contribute and treasury pages.
- Centralized single-source navigation config replaced prior drifting duplicate nav lists.

---

## 14. Integrations & Third-Party Services Audit

| Integration                                    | Status                                    | Detail                                                                                                                                                                                                                                                                                                                                                                                                                      | Files                                                                               |
| ---------------------------------------------- | ----------------------------------------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------- |
| Payment/donation processing                    | PASS (honest placeholder)                 | The Contribute page does not fake payment processing — it links out to an approved Salla storefront for subscriptions and shows bank/IBAN details for manual transfer via a copy-to-clipboard dialog, explicitly warning against card/bank data requests via chat. This is a deliberate, documented placeholder, not a broken flow — **except** see the Critical finding below about the same dialog being unauthenticated. | `src/routes/contribute.tsx`                                                         |
| Bank-details dialog access control             | **High / Present in UI but inconsistent** | The "View Official Bank Details & IBAN" dialog is reachable by any anonymous visitor with no auth gate, directly contradicting the adjacent copy stating "account numbers are not published on this site."                                                                                                                                                                                                                  | `src/routes/contribute.tsx:391-480`, `src/content/site.ts:67-75`                    |
| CAPTCHA / bot protection                       | **Missing entirely**                      | No hCaptcha/Turnstile/reCAPTCHA integration anywhere in the repo despite Supabase Auth natively supporting `captchaToken`, and despite the product brief explicitly requiring CAPTCHA on the contact form. Only a client-side honeypot exists.                                                                                                                                                                              | `src/routes/auth.tsx`, `src/lib/forms.schemas.ts`                                   |
| Email/SMTP notification delivery               | **Missing entirely**                      | `.env.example` documents an intended `NOTIFICATION_RECEIVER_EMAIL` under an "Optional: Email/SMTP" heading, but no provider (Resend/SendGrid/Postmark/SMTP) is wired anywhere; `docs/temporary-vercel-auth-setup.md` explicitly confirms "external admin email notifications are not enabled yet." Only in-app notifications exist, and only for membership requests — not contact messages, inquiries, or contributions.   | `.env.example`, `docs/temporary-vercel-auth-setup.md`, `src/lib/forms.functions.ts` |
| Web analytics (Google Analytics or equivalent) | **Missing entirely**                      | Explicit brief requirement (README.md line 163); repo-wide search for `gtag`/`GA_MEASUREMENT`/`plausible`/`posthog`/`GTM-` returns zero matches. No visibility into traffic, page popularity, or donate-flow conversion.                                                                                                                                                                                                    | `src/routes/__root.tsx`                                                             |
| Error monitoring / APM (Sentry or equivalent)  | **Missing entirely**                      | `src/lib/lovable-error-reporting.ts` forwards errors only to `window.__lovableEvents`, which exists solely inside the Lovable editor preview iframe — in actual production deployment these globals are undefined and error reporting is a silent no-op. No Sentry or equivalent SDK anywhere in `src/`.                                                                                                                    | `src/lib/lovable-error-reporting.ts`, `src/lib/error-capture.ts`                    |
| Google Fonts                                   | PASS                                      | Correctly loaded via `<link rel="preconnect">` + stylesheet for Arabic body/heading faces, with real fallback stacks; brand display font is self-hosted.                                                                                                                                                                                                                                                                    | `src/routes/__root.tsx`, `src/styles.css`                                           |
| Supabase (sole backend)                        | Mixed — see Sections 8–9                  | Core integration is architecturally sound (JWT verification, service-role isolation) but undermined by RLS policy regressions and schema drift documented above.                                                                                                                                                                                                                                                            | —                                                                                   |
| File storage buckets                           | **Missing provisioning**                  | Six of seven storage buckets referenced by the Media Library/upload components (`site-media`, `family-photos`, `galleries`, `documents-public/private`, `avatars`) have no bucket-creation migration and no `storage.objects` RLS policy — see Section 8.3.                                                                                                                                                                 | `src/components/console/media/MediaLibrary.tsx`                                     |

---

## 15. Admin & Operational Capabilities Audit

The custom admin console is extensive in surface area but has severe gaps between what the UI presents and what actually persists, publishes, or displays live. Findings are grouped by subsystem.

### 15.1 Navigation Manager — fully disconnected from the live site

- The Navigation Manager correctly persists menu items to `navigation_menus`/`navigation_items` with audit logging, but `Header.tsx`, `Footer.tsx`, and mobile nav all import a **hardcoded static array** from `src/content/navigation.ts` — editing/adding/removing a nav link in the console has zero effect on the live site. **Critical, P0.** (`src/components/console/navigation/NavigationManager.tsx`, `src/components/site/Header.tsx`)
- No UI exists to create a new menu at all — `onSaveMenu` is destructured but never called. Medium, P2.
- The `navigation_menus`/`navigation_items` tables appear nowhere in the checked-in migrations despite being fully modeled in generated types — further schema drift. High, P1.

### 15.2 Page Builder — most block types are non-functional

- 19 block types are advertised in `BlockRegistry.tsx`; only 5 (hero, image, rich_text, quote, cta) have any editing UI in `PageBuilderDialog.tsx`. High, P1.
- The **public renderer** (`p.$slug.tsx`) only implements 6 of 19 block types — everything else, **including `cta`, which is fully editable in the admin**, falls through to a placeholder "Custom Section (type)" box on the live site. High, P1.
- The Live Preview tab covers only 3 of the 5 editable types (not `image`/`cta`), so an admin has no way to discover, before publishing, that a CTA button they configured will never appear live. Medium, P2.
- Statistics block: admin writes `defaultData.stats`, public renderer reads `data.items` — a field-name mismatch that makes every out-of-the-box Statistics block render as an empty grid. Medium, P2.
- "Rich Text" block is labeled/described as supporting formatting and links but is a plain `<Textarea>` rendered as raw whitespace-preserved text — no bold/links/lists ever render. (A security upside: no stored-HTML XSS vector.) Low, P3.
- Revision history (`content_revisions`) is captured correctly on every save but has no viewer/restore UI — data-complete, unusable. Low, P3.
- CMS page save (delete-then-insert of `content_sections`) is non-atomic — a failure between the two calls permanently empties a previously-published page. Medium, P2.
- "Scheduled" status exists in the DB enum but is not offered anywhere in the Page Builder's Status dropdown. Low, P3.

### 15.3 Homepage Manager — 4 of 10 sections have no effect

- `family_stats`, `tree_highlight`, `upcoming_events`, `heritage_gallery` are fully editable (toggle/reorder/edit) in the Homepage Manager but have no matching case in `index.tsx`'s render switch — toggling them produces a success toast and no visible change. Medium, P2.
- Default CTA URLs for "News Archive" and "All Events" sections point at `/content`, an authenticated admin-only route, not any public page. Medium, P2.

### 15.4 Recurring content modules (News/Achievers/Initiatives/Library/Events)

- **Library collection taxonomy mismatch**: the admin writes `collection` as `"photographs"`/`"recordings"`; the public merge function only recognizes `"publications"`/`"media"` — every photo/video an editor adds is silently invisible on the public site. **Critical, P0.** (`src/content/cms-adapt.ts`, `src/components/console/library/LibraryItemsManager.tsx`)
- **Library video playback is entirely non-functional**: Play buttons always show a static "still uploading" toast regardless of whether a real file/YouTube URL exists; the resolved `href` field is never read. **Critical, P0.** (`src/routes/library.tsx`)
- **News "Family" vs. "Fund" sections broken**: the reachable Articles editor has no `section` field at all and hardcodes `section: "fund"`; the correct `news_posts` editor with a working section selector lives at an unlinked `/content` route, and the moment any article is published, `getPublishedNews` stops querying `news_posts` entirely — family news silently vanishes. **Critical, P0.** (`src/lib/cms.functions.ts:140-190`)
- **Initiative "Completed" status displays as "Planned"** on both the public site and the admin's own list view — a genuine, finished capital project reads as still-pending. High, P1.
- **Achievers has no category control in the admin form** at all (hardcoded default `"medicine"`, which matches none of the public filter keys) — every new achiever is invisible under every category filter except "All." High, P1.
- **Events has no public surface whatsoever**: full admin CRUD, RSVP tracking, and CSV export exist, but there is no public route, no listing, and no visitor-facing RSVP form anywhere in the app. Medium, P2.
- Initiatives RLS has a redundant `USING (true)` public-read policy alongside the correctly-gated `is_published` policy — draft initiatives (which carry financial target/raised amounts) may be readable by anonymous callers. High, P1.
- News items have a hardcoded, incorrect Hijri year (`"1447"`) for every article-based row, acknowledged in-code as a placeholder. Low, P3.
- ArticlesManager offers an "In Review" status the DB `CHECK` constraint doesn't accept — saving fails with an opaque error. Medium, P2.

### 15.5 Audit trail and activity monitoring

- `audit_logs` has RLS enabled with zero policies — see Section 8.1. The entire audit/activity-trail feature is a no-op regardless of how much admin activity occurs. **Critical, P0.**
- Two parallel, non-communicating audit systems (`audit_log` singular vs. `audit_logs` plural) mean membership approvals, treasury reviews, and `/content`-route edits never appear in the console's own Audit Logs viewer. High, P1.
- Audit writes are fire-and-forget with no error check — a failed audit insert (as is currently happening) is silently swallowed, and the calling mutation still reports success. Medium, P2.
- Eight handlers (`upsertFamilyRelationship`, `deleteFamilyRelationship`, `upsertPlace`, `upsertFamilyHistory`, `upsertGallery`, `upsertDocument`, `updateInquiryStatus`, `addInquiryNote`) perform real mutations with no audit log entry at all. Medium, P2.
- Audit log viewer never displays _who_ performed an action, despite `actor_user_id` being stored — no join/lookup to resolve a name. Medium, P2.
- Hard 200-row cap on the audit log with no pagination. Low, P3.

### 15.6 Site Settings — saved but not consumed

- Site Settings (identity, contact/social, governance, SEO) are written by the admin under nested keys (`site_general`, `site_contact`, etc.), but `Footer.tsx` and `src/lib/seo.ts` read entirely different flat key names that are never written — every "Save" in this screen is decorative for exactly the fields (phone, email, SEO title/description) a non-developer admin expects to control. High, P1.
- `site_settings` has only a public-read RLS policy — no INSERT/UPDATE policy exists for any role, so even if the key mismatch were fixed, the save would still fail at the database. (Cross-ref Section 8.1.)
- DNA Studies save writes a `category` column that doesn't exist on `site_settings` — every "Save All" click is expected to error. High, P1.
- The dashboard's "Database Entities Health" and "RLS + RBAC Active" badges are hardcoded green/static regardless of actual system state — actively misleading given the confirmed RLS gaps above. Low, P3.
- Site Settings' Security tab asserts "every write operation is audited with actor metadata and payload snapshots" — contradicted by the broken audit_logs policy. Low, P3.
- Dashboard's Annual Fund Progress target (500,000 SAR) is a hardcoded constant with no admin control. Low, P3.

### 15.7 Search, and dead code

- The admin command palette (⌘K) indexes only 5 of ~15 data modules (family members, businesses, pages, articles, events) — achievers, initiatives, library, announcements, DNA studies, users/roles, treasury, and inquiries are unsearchable. Medium, P2.
- `ConsoleShell.tsx`/`ConsoleUI.tsx` (800+ lines) implement a complete, entirely unused second admin shell that no route imports — a genuine maintenance/audit-confusion hazard. Low, P3.

### PASS — Admin Console Operational Capability

- Dashboard KPIs are computed from genuine live Supabase queries, not mock data, including correctly derived aggregates.
- Bulk actions (family members, articles) are real, working server functions, not stubs.
- CSV import/export for family members is a genuine, working feature.
- ArticlesManager itself (search, filters, pagination, bulk actions, live word count) is solid, production-quality CRUD.
- The audit-logging _design_ (before/after JSON snapshots, consistent actor resolution) is sound even where the underlying table currently rejects writes.
- Homepage Manager, for the 6 section IDs it does share with the render switch, is a genuinely well-built, non-developer-friendly content tool.

---

## 16. Deployment & Infrastructure Audit

| Area                                                                    | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                  | Files                                                                   | Severity |
| ----------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ | ----------------------------------------------------------------------- | -------- |
| Deployment target ambiguity                                             | `vite.config.ts`'s shared Lovable config defaults its nitro preset to Cloudflare; project docs (`docs/temporary-vercel-auth-setup.md`, `.env.example`) describe Vercel as the actual live host. No committed `wrangler.toml` or `vercel.json` exists at the repo root (only an auto-generated build artifact under `.output/server/`). `package.json` pins `nitro: 3.0.260603-beta` — an explicit beta prerelease used for the production build pipeline.                | `vite.config.ts`, `docs/temporary-vercel-auth-setup.md`, `package.json` | Medium   |
| Canonical domain mismatch                                               | Runtime canonical/OG URLs default to `https://alboabid-heritage-hub.vercel.app` (`src/lib/seo.ts`'s `DEFAULT_BASE_URL`), while `public/sitemap.xml` and `public/robots.txt` both hardcode `https://albouabidfamily.com` as the canonical domain — a domain not confirmed live per the project's own cutover doc. Search engines following `robots.txt` to the declared sitemap domain get conflicting canonicalization signals from the actually-serving domain's pages. | `src/lib/seo.ts`, `public/robots.txt`, `public/sitemap.xml`             | Medium   |
| Static, incomplete sitemap                                              | `public/sitemap.xml` lists only 12–13 top-level routes, hand-stamped with an identical `lastmod` of today's date; no `/news/$slug`, `/initiatives/$slug`, or `/p/$slug` detail pages are included, and nothing regenerates it from published content.                                                                                                                                                                                                                    | `public/sitemap.xml`                                                    | Low      |
| Env var fallback masks misconfiguration                                 | `client.ts`/`client.server.ts` hardcode a `DEFAULT_SUPABASE_URL`/`DEFAULT_SUPABASE_PUBLISHABLE_KEY` fallback for the anon client — a deployment with no env vars set will silently and successfully connect to the **real production** Supabase project instead of failing fast, risking a preview/staging environment writing to live data. By contrast, the service-role client correctly fails closed.                                                                | `src/integrations/supabase/client.ts`, `client.server.ts`               | Medium   |
| Storage buckets not provisioned via migration                           | See Section 8.3 — six of seven referenced buckets have no bucket-creation migration or RLS policy; rebuilding the project from `supabase/migrations/*` would break most upload features.                                                                                                                                                                                                                                                                                 | `supabase/migrations/*`                                                 | Medium   |
| Beta/unusual dependency pins                                            | `vite: ^8.0.16` (stated stack is "Vite 6"), `nitro: 3.0.260603-beta`, `react: ^19.2.0` — bleeding-edge/beta versions with no automated dependency-vulnerability scanning (no Dependabot/Renovate config, no `bun audit`/`npm audit` CI step) found in the repo.                                                                                                                                                                                                          | `package.json`                                                          | Low      |
| `.env.example` modified without corresponding `.gitignore` entry review | Noted per task context as a modified file; `.gitignore` itself correctly excludes `.env`/`.env.*` while allowing `.env.example` — no actual secret leak found, but worth a final check on what changed.                                                                                                                                                                                                                                                                  | `.env.example`, `.gitignore`                                            | Low      |

### PASS — Deployment / Environment Hygiene

- `.env` is correctly excluded from version control; the tracked file contains only the anon/publishable Supabase key, never a service-role/secret key.
- Service-role client fails closed (throws) when `SUPABASE_SERVICE_ROLE_KEY` is missing rather than silently degrading.
- `robots.txt` correctly disallows crawling of authenticated/admin routes (`/admin`, `/account`, `/treasury`, `/content`, `/auth`, `/verify`).
- Per-route SEO metadata (title/description/canonical/OG/Twitter tags) is implemented broadly and correctly across all 23 route files via a shared `getCanonicalUrl()` helper — a genuine strength, limited only by the Arabic-only-metadata gap noted in Section 13.

---

## 17. Monitoring, Logging, Analytics & Recovery Audit

| Area                                                     | Finding                                                                                                                                                                                                                                                                                                                                                                                                                                                                | Files                                                                                                                           | Severity                          |
| -------------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------- | --------------------------------- |
| No crash/error monitoring in production                  | `lovable-error-reporting.ts` forwards errors only to `window.__lovableEvents`/`__lovableReportRuntimeError`, which exist solely inside the Lovable editor preview iframe. In an actual deployed environment (Vercel/Cloudflare) these globals are undefined, making error reporting a silent no-op — every client-side crash disappears with zero operator visibility. Server-side errors reach only `console.error`, with no aggregation, deduplication, or alerting. | `src/lib/lovable-error-reporting.ts`, `src/lib/error-capture.ts`                                                                | High                              |
| No analytics integration                                 | Explicit brief requirement (Google Analytics or equivalent); zero matches for `gtag`/`GA_MEASUREMENT`/`plausible`/`posthog`/`GTM-` in the codebase. No visibility into traffic, page popularity, or the Contribute/Donate conversion funnel.                                                                                                                                                                                                                           | `src/routes/__root.tsx`                                                                                                         | Medium                            |
| No automatic backups or documented DR process            | Nothing in the repo automates or documents periodic backups of the Postgres database or Storage buckets, despite being an explicit brief requirement and explicitly listed as an unfinished Phase 7 task in the project's own planning doc. Whether backups exist at all depends entirely on the (unverified) Supabase plan tier.                                                                                                                                      | `.lovable/plan/backend-architecture-al-bu-obaid-family-fund-2026-08-06.md`, `scripts/`                                          | High                              |
| Audit trail is effectively non-functional                | See Section 8.1/15.5 — `audit_logs` has RLS enabled with zero policies, meaning the primary mechanism for post-incident forensics ("who changed X, when") does not currently work despite every admin mutation appearing to write to it.                                                                                                                                                                                                                               | `supabase/migrations/20260822000000_core_schema_baseline.sql`, `src/lib/admin-hub.functions.ts`                                 | Critical (cross-ref Section 8/15) |
| Duplicate/fragmented audit logging                       | Membership approvals, treasury reviews, and `/content`-route edits land in a legacy `audit_log` table the console's viewer never reads, giving an incomplete picture even independent of the RLS gap.                                                                                                                                                                                                                                                                  | `src/lib/admin.functions.ts`, `contributions.functions.ts`, `cms.functions.ts`, `admin-hub.functions.ts`                        | High                              |
| Dashboard health indicators are fake                     | "Database Entities Health: Healthy" and "RLS + RBAC Active" badges are hardcoded, not backed by any real probe — actively misleading given the confirmed RLS gaps documented in Section 8.                                                                                                                                                                                                                                                                             | `src/components/console/dashboard/AdminDashboardOverview.tsx`                                                                   | Low                               |
| No outbound notification workflow for public submissions | Contact messages, inquiries, and contributions trigger no email/SMS/webhook to staff — submissions rely entirely on someone manually opening the admin console (which, per Section 15, doesn't even reliably surface `contact_messages` in the right screen). A working precedent exists for membership requests (an in-app notification trigger), but it was never extended to these other workflows.                                                                 | `src/lib/forms.functions.ts`, `contributions.functions.ts`, `supabase/migrations/20260822032238_secure_membership_approval.sql` | High                              |
| No dependency vulnerability scanning                     | No Dependabot/Renovate config or scheduled audit job to catch newly-disclosed CVEs in third-party packages.                                                                                                                                                                                                                                                                                                                                                            | `package.json`                                                                                                                  | Low                               |

### PASS — Monitoring & Recovery Fundamentals

- SSR crash resilience: `src/server.ts`/`src/lib/error-capture.ts` implement a deliberate mechanism to detect h3's swallowed 500 errors, recover the real underlying error, log it, and serve a branded bilingual error page rather than a raw stack trace.
- Root React error boundary and 404 component both render proper bilingual, on-brand fallback UI with working retry/home actions.
- Per-route SEO metadata coverage is broad and consistent (see Section 16), which supports discoverability even without dynamic sitemap generation.
- `.env` secret hygiene is correctly maintained (no service-role key ever committed).

**Overall assessment for this section:** the app currently has no meaningful path for a maintainer to learn about a production incident except a user reporting it, no verified backup/restore capability for a database holding real financial and PII records, and its own internal audit trail — the one mechanism that could partially substitute for real monitoring — is non-functional due to an RLS misconfiguration. This combination (Sections 8.1, 15.5, and 17) should be treated as a single, unified launch blocker: fix the `audit_logs` RLS policy, wire a real error-monitoring SDK, confirm/document the Supabase backup tier, and add basic outbound alerting for public form submissions before go-live.

## 18. Missing Features

**Internationalization**

- Per-route SEO metadata (title/description/OG/Twitter) is Arabic-only with no English variant and no hreflang alternates — `src/routes/__root.tsx`, `about.tsx`, `achievers.tsx`, `news.tsx`, `contact.tsx` (P2).

**Authentication & Accounts**

- No self-service session-expiry recovery: nothing detects a revoked/expired session on an authenticated page and redirects to sign-in — `src/routes/_authenticated/route.tsx`, `src/hooks/useAuth.tsx` (P2).
- No CAPTCHA/bot mitigation on sign-up or sign-in — `src/routes/auth.tsx` (P2).
- No self-service account deletion or personal-data export, despite an in-product "privacy charter" claim — `src/routes/_authenticated/account.tsx` (P3).
- No tracked `[auth]` config (password policy, session/JWT lifetimes, captcha) in `supabase/config.toml` — settings live only in the dashboard, unreviewable and unreproducible (P3).

**Admin Authorization**

- Per-tab/per-domain RBAC scaffolding exists in `AdminNavigation.ts` but is never populated — every domain/tab in `/admin` is visible to any plain `admin`, including User Management and Audit Logs (P1).
- `src/lib/admin.functions.ts` is an orphaned duplicate admin module with weaker/no role checks, unclear if still live as a server endpoint (P2).

**Database**

- Missing `CHECK` constraints: `contributions.amount` allows ≤0, `family_relationships` allows self-referencing rows, `events` allows end before start, `event_registrations` allows duplicate signups — `supabase/migrations/20260822000000_core_schema_baseline.sql` (P2).
- Missing indexes on `family_relationships.related_person_id`, `content_sections.page_id`, `event_registrations.event_id`, `businesses.branch_slug` (P3).
- Storage buckets referenced by app code (`family-photos`, dynamic media buckets) are never created by any migration — infrastructure exists only out-of-band in the dashboard (P2).

**CMS / Page Builder**

- No URL format/protocol validation on navigation item links — a `javascript:` URL passes schema validation — `src/lib/admin-hub.schemas.ts` (P3).
- `record_status` enum includes `'scheduled'` in the DB, but no UI option, publish-date field, or gating logic exists to use it — `PageBuilderDialog.tsx`, `PagesManager.tsx` (P3).

**Family Data**

- `family_relationships`, `places`, `family_history_entries` have RLS enabled but **zero** policies anywhere — default-deny blocks all reads/writes (P0, see blockers).

**Recurring Content**

- Achievers admin form has no `category` control at all — every CMS-added achiever is invisible under every field filter except "All" — `src/components/console/achievers/AchieversManager.tsx` (P1).
- No pagination on any public listing page (News/Library/Achievers/Initiatives) despite hardcoded 200–300-row query caps — `src/lib/cms.functions.ts`, `src/routes/news.tsx` etc. (P2).
- No admin/staff notification workflow for contact messages, inquiries, or contributions — `.env.example`'s `NOTIFICATION_RECEIVER_EMAIL` is documented but never wired — `src/lib/forms.functions.ts`, `src/lib/contributions.functions.ts` (P1).

**Cross-Cutting Operations**

- Audit log has no pagination — hard-capped at 200 rows with no way to see older history — `src/lib/admin-hub.functions.ts`, `AuditLogsViewer.tsx` (P3).
- No real crash/error monitoring (Sentry or equivalent) — the only error-reporting hook (`lovable-error-reporting.ts`) is a no-op outside the Lovable editor preview (P1).
- No analytics integration (GA4 or equivalent), despite an explicit brief requirement — README.md:163, `src/routes/__root.tsx` (P2).
- No automated/documented database or storage backups, despite being both a brief requirement and an item on the team's own unfinished hardening plan — `.lovable/plan/backend-architecture-al-bu-obaid-family-fund-2026-08-06.md` (P1).
- No transactional email provider configured — admin notifications are in-app only (P2).

## 19. Incomplete Features

- **Foundation/Governance page** (trustees, committees, financial report) is 100% hardcoded static content with zero CMS/loader wiring, unlike every sibling content area — `src/routes/foundation.tsx` (P2).
- **Business directory** shows a dead "Website" link for listings with no URL instead of hiding it — `src/routes/directory.tsx:299-308,132` (P3).
- **Signup form** has no password strength feedback and no confirm-password field — `src/routes/auth.tsx` (P3).
- **Directory membership gate** grants access based on holding _any_ `user_roles` row, not a specific "verified member" role, and self-registered users with no admin-approved request never get a role at all, with no explanatory empty state — `src/lib/directory.functions.ts`, `handle_new_user()` (P2/P3).
- **Navigation Manager** cannot create new menus — `onSaveMenu` prop is destructured but never called anywhere in the component (P2).
- **Page Builder editor** only implements fields for 5 of 19 registered block types (hero/image/rich_text/quote/cta) — the other 14 (gallery, video, timeline, member_spotlight, etc.) can be inserted with no way to configure them — `BlockRegistry.tsx`, `PageBuilderDialog.tsx` (P1).
- **Page Builder live preview** only renders 3 of 5 editable block types — image/cta blocks show no preview, hiding the fact that CTA never renders live either (P2).
- **Revision history** captures full snapshots on every save but has no UI to view or restore a past version — `PagesManager.tsx` (P3).
- **DNA/family tree "relationship graph"**: even when relationship rows exist, the viewer groups purely by flat `generation` and silently drops all but the last spouse for a person with multiple marriages — no adoption type, no polygamy support — `FamilyTreeViewer.tsx:48-76` (P1).
- **Public family tree** is still dominated by ~30 hardcoded fictional entries in `src/content/family-tree.ts`, and live rows that do merge in use wrong field names (`residence_ar/en` don't exist) — `src/routes/family-tree.tsx:113-162` (P1).
- **Initiatives status "completed"** is accepted by the admin form but collapsed into "Planned/Upcoming" everywhere it's displayed, on both public site and the admin's own list — `src/content/cms-adapt.ts`, `InitiativesManager.tsx` (P1).
- **News category/archive**: only a two-way Family/Fund filter exists — no topical taxonomy, no year/date archive — `src/routes/news.tsx` (P2).
- **Contact-form spam protection**: honeypot only, no CAPTCHA, no rate limiting, on any public insert endpoint — `src/lib/forms.schemas.ts`, `src/lib/forms.functions.ts` (P1).
- **Admin command palette / global search** only indexes 5 of ~15 console modules (achievers, initiatives, library, DNA, treasury, inquiries are unsearchable) — `src/routes/_authenticated/admin.tsx:384-447` (P2).
- **Audit trail coverage** inside `admin-hub.functions.ts` is inconsistent: relationship/place/history/gallery/document/inquiry mutations perform real writes with no audit_logs insert, unlike most sibling handlers (P2).
- **Audit log viewer** never resolves/displays `actor_user_id` to a name — answers "what/when" but never "who" — `AuditLogsViewer.tsx` (P2).
- **SEO/sitemap**: per-route metadata is broadly implemented (a genuine strength) but `public/sitemap.xml` is static, lists only 12 top-level routes, and never includes dynamic news/initiative/page detail URLs (P2).

## 20. Broken/Non-Functional Features

- **Library video/recording playback**: the Play button on every recording always shows a placeholder "still uploading" toast — the `href` resolved from the CMS row is never read — `src/routes/library.tsx:572-585,705-727` (P0/Critical for launch).
- **Library photographs/recordings collection mismatch**: the admin writes `collection = "photographs"/"recordings"`, but the public merge function only recognizes `"publications"/"media"` — every CMS-authored photo/video is silently dropped from the public site — `src/content/cms-adapt.ts`, `LibraryItemsManager.tsx` (P0).
- **Global search family-member deep link**: selecting a result navigates to `/family-tree?focus={id}`, but the page never reads the `focus` param — no-op — `GlobalSearchModal.tsx`, `family-tree.tsx` (P2).
- **RBAC Permissions Matrix**: a fully static, hardcoded display whose claims (e.g. "editor can write CMS," "treasurer can view ledger" inside `/admin`) do not match actual server-side enforcement — administrators configure roles based on false information — `RolesPermissionMatrix.tsx` (P1).
- **Dead roles**: `content_manager` and `family_manager` are assignable in the Users UI but checked by zero middleware/route guard anywhere in the codebase — assigning them does nothing — `UsersManager.tsx`, `useAuth.tsx` (P2).
- **Admin console tables never created**: ~14 tables (media_assets, navigation_menus/items, permissions, role_permissions, inquiry_notes, notifications, galleries, documents, article taxonomy tables) are queried by `admin-hub.functions.ts` but never defined in any migration — Media Library, Roles Matrix, Navigation Builder, Notifications, and taxonomy pickers throw `42P01` on first use (P0).
- **Missing RLS write policies** on 13 baseline tables (family_members, articles, events, site_settings, audit_logs, etc.) — create/edit/delete actions for the majority of the admin console are rejected by Postgres even for a legitimate admin (P0).
- **Duplicate/dead inquiry system**: the "Inquiries" admin screen reads `inquiries`/`inquiry_notes`, which the public Contact form never writes to; the real submissions land silently in the separate `contact_messages` table read by a completely different, unlinked admin surface (P0).
- **Navigation Manager not wired to the live site**: fully persists to `navigation_menus`/`navigation_items` with audit logging, but Header/Footer/mobile nav import a hardcoded static array and never read those tables — editing nav in the console has zero visible effect (P0).
- **Public page renderer block coverage**: `DynamicBlockRenderer` in `src/routes/p.$slug.tsx` only implements 6 of 19 block types; a fully-editable "CTA" block (title/button/URL) silently renders as a placeholder box on the live site (P1).
- **Family member CRUD schema mismatch**: the admin form/schema target columns (`branch_id`, `date_of_birth`, `status`, etc.) that don't exist in the real `family_members` table — every save/bulk action is expected to error (P0).
- **DNA Studies admin editor**: fully built UI, but its save function writes a nonexistent `category` column to `site_settings`, which additionally has no write RLS policy at all — every "Save All" click is expected to fail (P1).
- **Events management**: a fully-built admin feature (CRUD, RSVP tracking, attendee CSV export) with **no public route anywhere** — no visitor can ever discover or register for an event (P2).
- **Homepage builder default CTAs**: "News Archive" and "All Events" buttons default to the login-gated `/content` admin route, not any public page (P2).
- **Site Settings screen is decorative**: contact/social/governance/SEO fields save successfully but are never read under the shape the public site's Footer/`seo.ts` actually expect — changes have no visible effect (P1).
- **Audit log persistence**: `audit_logs` has RLS enabled with zero policies — every one of ~30 audit-write call sites and the Audit Logs viewer's reads are expected to silently fail or return empty, eliminating the console's entire accountability trail (P0).
- **Admin media upload buckets** (`site-media`, `family-photos`, `galleries`, `documents-public/private`, `avatars`) have no `storage.objects` RLS policy anywhere — uploads across nearly the entire CMS (news covers, achiever photos, avatars, library documents, hero images) are expected to fail (P0).
- **Dashboard health indicators**: "Database Entities Health: Healthy" and "RLS + RBAC Active" badges are hardcoded, unconditional, and actively false given the confirmed missing RLS/audit policies — `AdminDashboardOverview.tsx` (P3).

## 21. Technical Debt & Architecture Risks

**Security posture / defense-in-depth**

- Public `profiles` SELECT policy `USING (true)` (added in the baseline migration) OR's with and nullifies all prior owner/admin/directory-scoped policies — full PII exposure to the anon key — `supabase/migrations/20260822000000_core_schema_baseline.sql:466-467` (P0, see blockers).
- Redundant `contributions` INSERT policy `WITH CHECK(true)` allows user_id spoofing on financial records (P0/P1, see blockers).
- Any plain `admin` can self-escalate to `super_admin`; no distinct `requireSuperAdminAuth` exists despite the documented model requiring it — `src/lib/admin-hub.functions.ts:666-712` (P0).
- `super_admin`-only accounts are rejected by `requireAdminAuth` (checks only `'admin'`), making the nominal top role unusable on its own — `auth-middleware.ts:143-163` (P1).
- Several sensitive server functions (`getAdminOverview`, `getTreasuryOverview`, CMS mutation endpoints) rely solely on `requireSupabaseAuth`, ignoring `requireEditorAuth`/`requireTreasuryAuth` middleware that already exists unused in the same file tree (P0).
- Three structurally different, independently-implemented authorization models across `/admin`, `/content`, `/treasury` — no shared enforcement, easy to silently diverge (P2).
- Two duplicate admin server-function backends (`cms.functions.ts`/`admin.functions.ts`/`contributions.functions.ts` vs. `admin-hub.functions.ts`) with different security postures for the same operations (P1).
- `getCmsOverview`/`getTreasuryOverview` return the _entire_ unfiltered dataset (drafts, other members' financial data) to any authenticated caller before computing a client-side `canEdit` flag (P2).
- PostgREST filter-string injection in global search — raw user input spliced into `.or()` filters despite the codebase demonstrably knowing to avoid this pattern one file over — `cms.functions.ts:602-654` vs `account.functions.ts:97-100` (P2).

**Schema / migration integrity**

- Baseline migration's `CREATE INDEX` statements reference non-existent columns (`family_members.branch_id`, `articles.deleted_at`) — fails on a fresh database (P0).
- `content_pages.visibility` and `content_sections` RLS never actually gate access — "family only"/"admin only" pages are fully public (P0).
- Documented, acknowledged drift between the live production schema (roles, and by strong circumstantial evidence other structures) and the committed migrations — `src/hooks/useAuth.tsx:5-16` (P0).
- Zod enums (relationship type, visibility, status) permit values the DB `CHECK` constraints reject outright — guaranteed failures on valid-looking input (P0).
- Two divergent `CREATE TABLE` definitions for the same recurring-content tables across migration files, with incompatible column names — silent no-op today, but breaks any fresh-environment replay (P2).
- Seed/demo data (fabricated membership requests, contact messages, a hardcoded admin UUID/email) permanently mixed into versioned schema migrations rather than a separate seed script (P1).
- Two parallel, inconsistently-used audit tables (`audit_log` singular vs `audit_logs` plural) — no single trustworthy trail (P2).
- Inconsistent soft-delete vs hard-delete conventions across content types, and `articles`/`content_pages` reference a `deleted_at` column that doesn't exist (P2).
- `updated_at` triggers exist for all pre-baseline tables but none of the 14 baseline-era tables — correctness now depends entirely on every call site remembering to set it manually (P3).
- Directory opt-in default flipped from `false` (privacy-safe) to `true` between early and baseline migrations — a fresh environment would default new members into the public directory (P2).

**CMS / content-model consistency**

- Statistics block: admin writes `data.stats`, renderer reads `data.items` — every out-of-the-box use renders an empty grid — `BlockRegistry.tsx` vs `p.$slug.tsx:159-173` (P2).
- Homepage Manager exposes 4 sections (family_stats, tree_highlight, upcoming_events, heritage_gallery) with no matching render case on the homepage — toggling/editing them has zero effect (P2).
- CMS page save (delete-then-insert of `content_sections`) is non-atomic — a failure mid-operation can permanently empty a previously-published page (P2).
- "Rich Text" block is labeled/described as supporting formatting and links but is a plain `<Textarea>` with no formatting capability at all (P3).
- SVG uploads are accepted with no sanitization — a stored-XSS vector if a viewer opens the raw storage URL directly (P3).
- News/Library/Achievers/Initiatives share one root cause across two domain reviews: hardcoded 200–300-row query caps with no pagination (P2).
- Contribution review (`reviewContribution`) and `setMessageStatus` never check whether their `.update()` actually matched a row before returning `{ok:true}` and (for contributions) writing a false audit-log entry (P1/P3).
- Error handling: most `admin-hub.functions.ts` mutations throw raw Postgres error text instead of the structured `{ok:false,error:'code'}` pattern used elsewhere in the same codebase (P3).

**i18n/RTL consistency**

- Language preference is applied only post-hydration (no synchronous pre-paint script, unlike the theme system that already solves this) — every reload flashes Arabic/RTL for English-mode users — `__root.tsx`, `LanguageProvider.tsx` (P1).
- Global search backend queries and renders `*_ar` fields only — English-mode users searching in English get zero results — `cms.functions.ts:602-654`, `GlobalSearchModal.tsx` (P1).
- Supabase Auth error messages (raw English) take priority over the app's own bilingual fallback in the one flow (`auth.tsx`) that is otherwise carefully translated everywhere else (P2).
- Arabic numeral (Eastern Arabic-Indic digit) formatting utility exists and is documented as a site-wide rule but is used in exactly one place in the entire public site (P3).
- Unused, drifted, duplicate translation dictionary (`src/i18n/translations.ts`) that disagrees in wording with the actively-used `navigation.ts` (P3).
- Announcement ticker prev/next chevrons and aria-labels are hardcoded RTL/English regardless of active language, unlike the dismiss button two lines below in the same file (P3).

**Family data**

- Family CSV import uses a naive comma-split parser (no quoted-field support) and silently substitutes generic placeholder names for missing required fields instead of rejecting bad rows (P2).
- Directory access gate (`isMember = roleList.length > 0`) doesn't distinguish "verified member" from any other role that might exist in `user_roles` (P3).

**Operational**

- No committed deployment config for either implied target (Vercel docs vs. Cloudflare-defaulting nitro preset); `nitro` is pinned to an explicit beta prerelease for a production build pipeline (P2).
- Environment variable fallback: the anon/publishable Supabase client silently falls back to a hardcoded production URL/key if env vars are missing — fails open to real prod data instead of failing closed like the admin client does (P2).
- Canonical/OG domain (`alboabid-heritage-hub.vercel.app`) disagrees with the domain hardcoded into `robots.txt`/`sitemap.xml` (`albouabidfamily.com`) (P1).
- No dependency-vulnerability scanning (Dependabot/Renovate/`bun audit`) configured against fast-moving/prerelease dependencies (P3).

## 22. Prioritized Production Blockers (P0)

1. **Public `profiles` RLS policy exposes every member's PII** — `USING (true)` OR's with and defeats all owner/admin/directory-scoped policies; phone numbers and lineage notes are readable by anyone with the anon key. _(supabase/migrations/20260822000000_core_schema_baseline.sql:466-467)_
2. **No working password-reset flow exists** — no pre-login entry point, and no page to actually set a new password after the recovery email link. _(src/routes/auth.tsx, src/routes/\_authenticated/account.tsx)_
3. **Any plain `admin` can self-escalate to `super_admin`** or grant/revoke any role, with no distinct super-admin gate. _(src/lib/admin-hub.functions.ts:666-712)_
4. **Baseline migration cannot be applied to a fresh database** — `CREATE INDEX` references columns (`branch_id`, `deleted_at`) that don't exist in the tables it just defined. _(supabase/migrations/20260822000000_core_schema_baseline.sql:427,429)_
5. **~14 tables backing admin-console features were never created** by any migration — Media Library, Roles Matrix, Navigation Builder, Notifications, taxonomy, and document manager are dead on arrival. _(src/lib/admin-hub.functions.ts)_
6. **No admin/editor write RLS policy exists** for the majority of CMS/admin tables (family_members, articles, events, site_settings, content_pages, and more) — most of the console cannot persist writes at all. _(supabase/migrations/20260822000000_core_schema_baseline.sql)_
7. **A redundant `WITH CHECK(true)` INSERT policy on `contributions`** lets any authenticated user forge a financial contribution attributed to another member. _(supabase/migrations/20260822000000_core_schema_baseline.sql:515-516)_
8. **Sensitive server functions have no application-level role check**, relying entirely on RLS as the sole security boundary — a boundary already proven broken elsewhere in this same audit. _(src/lib/contributions.functions.ts, src/lib/cms.functions.ts, src/lib/admin.functions.ts)_
9. **`content_pages.visibility` is never enforced** by the loader or by RLS — pages marked "family only"/"admin only" are fully public. _(src/lib/cms.functions.ts, supabase/migrations/20260822000000_core_schema_baseline.sql)_
10. **`content_sections` RLS is unconditional `USING (true)`** — draft and admin-only page content is readable by any anonymous API caller. _(supabase/migrations/20260822000000_core_schema_baseline.sql:500)_
11. **Navigation Manager writes to the database but the live site never reads it** — the public Header/Footer/mobile nav import a hardcoded static file; nav edits in the console have zero effect. _(src/components/console/navigation/NavigationManager.tsx, src/components/site/Header.tsx, src/content/navigation.ts)_
12. **`family_relationships`/`places`/`family_history_entries` have RLS enabled with zero policies defined anywhere** — default-deny blocks all reads/writes, including for admins. _(supabase/migrations/20260822000000_core_schema_baseline.sql:444-446)_
13. **Family Members admin form/schema references non-existent columns** on the real `family_members` table — every save/bulk publish action is expected to fail with a database error. _(src/lib/admin-hub.schemas.ts, src/lib/admin-hub.functions.ts:1238-1294)_
14. **Zod enums permit values the DB `CHECK` constraints reject**, guaranteeing save failures on legal-looking form input for family members, history entries, and articles. _(src/lib/admin-hub.schemas.ts vs supabase/migrations/20260822000000_core_schema_baseline.sql)_
15. **Live production schema has documented, unreconciled drift from the committed migrations** — the migration history cannot be trusted as a source of truth for disaster recovery or fresh environments. _(src/hooks/useAuth.tsx:5-16)_
16. **Library "Photographs"/"Recordings" collection values never match what the public site reads** — every CMS-authored photo/video is silently invisible on launch. _(src/content/cms-adapt.ts, src/components/console/library/LibraryItemsManager.tsx)_
17. **Library video/recording playback is completely non-functional** — the Play control always shows a placeholder toast regardless of real content. _(src/routes/library.tsx)_
18. **The reachable Articles editor cannot produce "Family" news, and publishing any article silently blanks the entire separately-sourced family news feed.** _(src/lib/cms.functions.ts, src/components/console/articles/ArticlesManager.tsx)_
19. **The admin Inquiries panel reads a table the public Contact form never writes to** — real visitor messages are invisible to staff. _(src/lib/admin-hub.functions.ts, src/lib/forms.functions.ts)_
20. **Nearly every CMS media/upload bucket has no storage RLS policy** — image/document uploads across most of the console are expected to fail. _(src/components/console/media/MediaLibrary.tsx, src/components/console/media/ImageUploadInput.tsx)_
21. **`audit_logs` has RLS enabled with zero policies** — the entire admin console's accountability/audit trail silently fails to write and read. _(supabase/migrations/20260822000000_core_schema_baseline.sql, src/lib/admin-hub.functions.ts)_

## 23. Prioritized Recommended Improvements

### P1

- Contribute page publicly exposes full bank account number/IBAN, directly contradicting its own adjacent "not published" copy — gate behind membership or remove. _(src/routes/contribute.tsx, src/content/site.ts)_
- Family tree's actual interactive diagram is a static `public/interactive-tree.html` iframe disconnected from the admin-editable database, loading three external CDN scripts. _(src/routes/family-tree.tsx)_
- Language preference has no pre-hydration sync script — every reload flashes Arabic/RTL for English-mode users. _(src/routes/\_\_root.tsx, src/i18n/LanguageProvider.tsx)_
- Global search backend/UI is Arabic-only end-to-end — English queries return zero results. _(src/lib/cms.functions.ts, src/components/site/GlobalSearchModal.tsx)_
- RBAC Permissions Matrix is cosmetic and misrepresents real enforcement to administrators. _(src/components/console/users/RolesPermissionMatrix.tsx)_
- `super_admin`-only accounts are rejected by every server function. _(src/integrations/supabase/auth-middleware.ts)_
- Per-tab/per-domain admin nav RBAC scaffolding exists but is never applied. _(src/components/console/layout/AdminNavigation.ts, AdminConsoleLayout.tsx)_
- No app-level role check on `upsertCmsRow`/`setCmsPublished`/`deleteCmsRow`/`reviewContribution` — existing stricter middleware sits unused. _(src/lib/cms.functions.ts, src/lib/contributions.functions.ts)_
- Unpublished initiatives and content-page sections are exposed via an over-permissive RLS policy. _(supabase/migrations/20260822000000_core_schema_baseline.sql)_
- Seed/demo data (fake membership requests, hardcoded admin identity) mixed permanently into schema migrations. _(supabase/migrations/20260814150753…, 20260814150940…, 20260820121814…)_
- `reviewContribution` returns `{ok:true}` and writes a false audit entry even when the underlying update affected zero rows. _(src/lib/contributions.functions.ts)_
- Duplicate admin backends for the same operations with divergent security posture. _(cms.functions.ts vs admin-hub.functions.ts)_
- Navigation/content_pages schema (navigation_menus, navigation_items, content_revisions, wider content_pages columns) exists live but is absent from every migration. _(supabase/migrations, src/integrations/supabase/types.ts)_
- Page Builder editor only supports 5 of 19 registered block types. _(BlockRegistry.tsx, PageBuilderDialog.tsx)_
- Public page renderer only implements 6 of 19 block types, including dropping the fully-editable CTA block. _(src/routes/p.$slug.tsx)_
- DNA Studies save path writes a nonexistent column and has no write RLS policy at all. _(src/lib/admin-hub.functions.ts:1386-1414)_
- Family tree viewer groups by flat `generation` only and drops all but one spouse per person. _(FamilyTreeViewer.tsx:48-76)_
- Public family tree is still dominated by ~30 hardcoded fictional entries with wrong field mappings for live rows. _(src/routes/family-tree.tsx, src/content/family-tree.ts)_
- Initiatives "completed" status is mislabeled "Planned" everywhere it renders. _(cms-adapt.ts, initiatives.tsx, InitiativesManager.tsx)_
- Initiatives RLS has a redundant `USING(true)` SELECT policy exposing drafts. _(supabase/migrations)_
- Achievers admin form has no category selector — new entries are unfilterable by field. _(AchieversManager.tsx, achievers.tsx)_
- Business directory public submission targets columns that don't exist in the migrated `businesses` table, and no INSERT policy is granted at all. _(src/lib/forms.functions.ts, migrations)_
- Contact/nomination/listing spam protection is honeypot-only with no CAPTCHA or rate limiting. _(src/routes/contact.tsx, src/lib/forms.functions.ts)_
- No notification workflow (email/in-app) for new contact messages, inquiries, or contributions. _(src/lib/forms.functions.ts, src/lib/contributions.functions.ts)_
- Treasury verify/reject actions log to a legacy `audit_log` table invisible to the admin's unified Audit Logs viewer. _(src/lib/contributions.functions.ts)_
- Duplicate/parallel audit systems (`audit_log` vs `audit_logs`) written to inconsistently across the codebase. _(multiple files)_
- Site Settings (contact/social/governance/SEO) save successfully but are never consumed under the shape the public readers expect. _(SiteSettingsManager.tsx, Footer.tsx, seo.ts)_
- No real crash/error monitoring (Sentry-equivalent) — the only hook is a no-op outside the Lovable editor preview. _(src/lib/lovable-error-reporting.ts)_
- Canonical/OG domain disagrees with the domain hardcoded in `robots.txt`/`sitemap.xml`. _(src/lib/seo.ts, public/robots.txt, public/sitemap.xml)_
- No documented/automated database or storage backup strategy. _(no scripts/docs found)_

### P2

- No pagination anywhere on News/Library/Achievers/Initiatives despite hardcoded 200–300-row caps. _(cms.functions.ts, respective routes)_
- Foundation/Governance page is 100% hardcoded with no CMS wiring for trustees/committees/financial report. _(src/routes/foundation.tsx)_
- Global search's family-member deep link (`?focus=`) is never consumed by the target page. _(GlobalSearchModal.tsx, family-tree.tsx)_
- Per-route SEO metadata never varies by language; no hreflang alternates. _(all route `head()` functions)_
- Supabase Auth error messages surface raw English even in Arabic mode. _(src/routes/auth.tsx)_
- No reactive session-expiry redirect on already-authenticated pages. _(route.tsx, useAuth.tsx)_
- No CAPTCHA on sign-up/sign-in. _(src/routes/auth.tsx)_
- `/verify` public endpoint uses a non-unique 6-hex-char ID prefix match with no rate limiting. _(src/lib/account.functions.ts)_
- Two roles (`content_manager`, `family_manager`) are assignable but checked nowhere. _(UsersManager.tsx, useAuth.tsx)_
- `getCmsOverview`/`getTreasuryOverview` return full unfiltered datasets before client-side role filtering. _(cms.functions.ts, contributions.functions.ts)_
- Orphaned duplicate admin server-function module with weaker checks. _(src/lib/admin.functions.ts)_
- Three independently-implemented admin authorization models across `/admin`, `/content`, `/treasury`. _(admin.tsx, content.tsx, treasury.tsx)_
- Duplicate, disconnected inquiry/contact systems. _(forms.functions.ts, admin.functions.ts, admin-hub.functions.ts)_
- Duplicate audit-log tables written to inconsistently. _(migrations, multiple .functions.ts files)_
- Soft-delete vs hard-delete strategy mixed inconsistently across content tables, with two tables referencing a nonexistent `deleted_at` column. _(admin-hub.functions.ts, migrations)_
- Directory visibility silently depends on an admin manually granting a role, with no explanatory UI state. _(handle_new_user(), admin.functions.ts)_
- Missing `CHECK` constraints on financial/relationship data. _(migrations)_
- Storage buckets referenced by app code are never created via migration. _(migrations, FamilyMemberFormDialog.tsx)_
- PostgREST filter-string injection in global search. _(cms.functions.ts)_
- Schema drift: `assignUserRole` allows roles the live `user_roles` CHECK constraint (per migrations) does not. _(admin-hub.functions.ts vs migrations)_
- Navigation Manager cannot create new menus. _(NavigationManager.tsx)_
- Page Builder live preview skips image/CTA blocks. _(PageBuilderDialog.tsx)_
- Statistics block field-name mismatch (`stats` vs `items`) renders empty grids. _(BlockRegistry.tsx, p.$slug.tsx)_
- Homepage Manager exposes 4 sections with no matching render case on the homepage. _(HomepageManager.tsx, index.tsx)_
- CMS page save (delete-then-insert of sections) is non-atomic. _(admin-hub.functions.ts)_
- Family CSV import uses a naive comma-split parser with no duplicate detection, substituting placeholder names for bad rows. _(FamilyImportExportDialog.tsx)_
- Directory opt-in default flipped from `false` to `true` between migrations. _(migrations)_
- Events management has no public route/RSVP surface at all. _(EventsManager.tsx)_
- News has no topical category taxonomy or date archive. _(news.tsx)_
- Homepage builder default CTAs point at the login-gated `/content` route. _(HomepageManager.tsx)_
- Articles status dropdown offers values (`in_review`, `scheduled`) the DB `CHECK` constraint rejects. _(ArticlesManager.tsx, migrations)_
- Two divergent `CREATE TABLE` definitions for the same recurring-content tables across migrations. _(migrations)_
- File upload type/size limits enforced only client-side, with no storage-level or server backstop. _(contribute.tsx, ImageUploadInput.tsx)_
- Admin global search/command palette covers only 5 of ~15 modules. _(admin.tsx, AdminCommandPalette.tsx)_
- Audit trail coverage in `admin-hub.functions.ts` is inconsistent — 8 handlers perform real mutations with no audit_logs insert. _(admin-hub.functions.ts)_
- Audit log inserts are fire-and-forget with no error check — failures are silently swallowed. _(admin-hub.functions.ts)_
- Audit log viewer never resolves/displays the acting user. _(AuditLogsViewer.tsx)_
- No analytics integration despite explicit brief requirement. _(README.md, \_\_root.tsx)_
- `sitemap.xml` is static and never includes dynamic news/initiative/page URLs. _(public/sitemap.xml)_
- Anon Supabase client silently falls back to a hardcoded production URL/key if env vars are absent. _(client.ts, client.server.ts)_
- No committed deployment config for either implied hosting target; `nitro` pinned to a beta prerelease. _(vite.config.ts, package.json)_
- No transactional email provider configured for any notification workflow. _(docs/temporary-vercel-auth-setup.md, .env.example)_

### P3

- Business directory shows a dead "Website" link when no URL is set. _(directory.tsx)_
- Unused, drifted duplicate translation dictionary. _(src/i18n/translations.ts)_
- Announcement ticker prev/next chevrons and aria-labels are hardcoded regardless of active language. _(AnnouncementTicker.tsx)_
- Arabic numeral formatting utility exists but is used in only one place site-wide. _(src/lib/text.ts)_
- Language switcher lacks `lang` attributes and group semantics for screen readers. _(LanguageSwitcher.tsx)_
- Supabase session tokens stored in `localStorage`, readable by any XSS. _(client.ts)_
- No self-service account deletion or data export. _(account.tsx)_
- Signup form has no password strength meter or confirm-password field. _(auth.tsx)_
- Sign-out does not clear the React Query cache — brief cross-account data flash possible on shared devices. _(account.tsx)_
- No tracked `[auth]` config capturing password policy/session lifetimes. _(config.toml)_
- `updated_at` triggers missing on all 14 baseline-era tables. _(migrations)_
- Missing indexes on several frequently-joined FK columns. _(migrations)_
- Misleading migration header comment ("41 tables" vs. 25 actual). _(migrations)_
- Inconsistent raw-error-throwing pattern across `admin-hub.functions.ts` mutations. _(admin-hub.functions.ts)_
- Global search results return unsigned private storage paths instead of signed URLs. _(cms.functions.ts)_
- `setMessageStatus` and similar handlers return success without verifying a row was actually affected. _(admin.functions.ts)_
- Revision history has no view/restore UI despite complete underlying data. _(PagesManager.tsx)_
- "Rich Text" block over-promises formatting/link capability it doesn't have. _(BlockRegistry.tsx, PageBuilderDialog.tsx)_
- Navigation item URLs accept `javascript:` with no validation. _(admin-hub.schemas.ts)_
- `record_status` "scheduled" value is modeled in the DB but unreachable from the UI. _(PageBuilderDialog.tsx)_
- SVG uploads accepted with no sanitization. _(ImageUploadInput.tsx)_
- Directory membership gate doesn't distinguish "verified member" from any other role. _(directory.functions.ts)_
- News Hijri date is hardcoded to "1447" for every article regardless of actual date. _(cms.functions.ts)_
- Contribution review overwrites the single note/reviewer field with no history. _(contributions.functions.ts)_
- Audit log has a hard 200-row cap with no pagination. _(admin-hub.functions.ts, AuditLogsViewer.tsx)_
- ~800 lines of dead, unreferenced duplicate admin shell code. _(ConsoleShell.tsx, ConsoleUI.tsx)_
- Annual fund target is a hardcoded constant with no admin control. _(AdminDashboardOverview.tsx)_
- Dashboard health badges are always-"Healthy," not backed by any real check. _(AdminDashboardOverview.tsx)_
- Site Settings' Security tab makes a false "every write is audited" claim. _(SiteSettingsManager.tsx)_
- No dependency-vulnerability scanning configured against beta/bleeding-edge packages. _(package.json)_

## 24. Final Production Launch Checklist

### Security

- [ ] Drop the `USING (true)` public-read policy on `profiles`; restore owner/admin/directory-scoped access only
- [ ] Remove the redundant `WITH CHECK(true)` INSERT policy on `contributions`
- [ ] Restrict role assignment so only `super_admin` can grant `admin`/`super_admin`
- [ ] Fix `requireAdminAuth` to accept `super_admin` as well as `admin`
- [ ] Apply `requireEditorAuth`/`requireTreasuryAuth` to every CMS/treasury mutation currently gated only by generic auth
- [ ] Enforce `content_pages.visibility` and fix the `content_sections` RLS policy (no more `USING(true)`)
- [ ] Add RLS write policies for `family_relationships`, `places`, `family_history_entries`, and every other RLS-enabled table with zero policies
- [ ] Add missing `storage.objects` RLS policies for every bucket the CMS actually uploads to
- [ ] Add a working self-service password reset flow (pre-login link + post-recovery "set new password" form)
- [ ] Add CAPTCHA/rate limiting to signup, sign-in, contact form, achiever nomination, and business listing submission
- [ ] Fix `getMemberVerification`'s non-unique prefix match and add rate limiting to `/verify`
- [ ] Remove hardcoded Supabase URL/key fallback in the anon client; fail closed on missing env vars

### Data

- [ ] Fix broken `CREATE INDEX` statements in the baseline migration (`branch_id`, `deleted_at`)
- [ ] Reconcile Family Members admin schema/form with the real `family_members` columns
- [ ] Reconcile zod enums (relationship type, visibility, status) with actual DB `CHECK` constraints
- [ ] Add missing `CHECK` constraints (positive contribution amount, non-self relationships, valid event date ranges, unique event registration)
- [ ] Add missing indexes on frequently-joined FK columns
- [ ] Pull and reconcile the live production schema against the migration history to eliminate documented drift
- [ ] Move demo/seed data out of versioned migrations into `supabase/seed.sql`; purge fake rows from production if still present
- [ ] Consolidate duplicate audit tables (`audit_log` vs `audit_logs`) and duplicate inquiry tables (`contact_messages` vs `inquiries`)
- [ ] Add `updated_at` triggers to all baseline-era tables
- [ ] Create the ~14 missing tables (media_assets, navigation_menus/items, notifications, galleries, documents, taxonomy tables) or remove the console screens that depend on them

### Content

- [ ] Fix the Library "photographs"/"recordings" collection-value mismatch so CMS-authored media actually appears publicly
- [ ] Implement real video/YouTube playback on the Library page
- [ ] Add a `section` field to Articles so "Family" news can be authored without erasing the `news_posts`-sourced feed
- [ ] Fix Initiatives "completed" status mislabeling
- [ ] Add a category selector to the Achievers admin form
- [ ] Wire the Navigation Manager to the live Header/Footer/mobile nav
- [ ] Implement/relabel the 14 non-editable Page Builder block types; implement CTA rendering on the public page
- [ ] Fix the Statistics block field-name mismatch (`stats` vs `items`)
- [ ] Wire or remove the 4 unrendered Homepage Manager sections
- [ ] Wire the Foundation/Governance page (trustees, committees, financial report) to the CMS

### Legal/Compliance

- [ ] Remove or gate the public Contribute page's bank account/IBAN dialog to match its own stated privacy policy
- [ ] Add self-service account deletion and personal-data export (Saudi PDPL-adjacent data-subject rights)
- [ ] Verify and purge fabricated demo membership/contribution/contact rows from production before go-live
- [ ] Document actual live Supabase Auth security settings (password policy, session lifetimes, email confirmation) in-repo

### Performance

- [ ] Add pagination to News/Library/Achievers/Initiatives public listing pages
- [ ] Add real database pagination (not a 200/300-row hardcoded cap) to the underlying CMS queries
- [ ] Add pagination to the Audit Logs viewer

### Operations

- [ ] Wire a real crash/error monitoring service (Sentry or equivalent) for both client and server
- [ ] Add Google Analytics (or privacy-friendly equivalent) with a consent gate
- [ ] Generate a dynamic sitemap including news/initiative/page detail URLs
- [ ] Reconcile the canonical/OG domain with the domain hardcoded in `robots.txt`/`sitemap.xml`
- [ ] Confirm and document the Supabase backup/PITR tier; write a restore runbook
- [ ] Commit an explicit deployment config for the actual hosting target (Vercel or Cloudflare) and move off the beta `nitro` release
- [ ] Configure a transactional email provider for admin/staff notifications
- [ ] Add dependency-vulnerability scanning (Dependabot/Renovate or scheduled `bun audit`)

## Master Gap Matrix

| Finding                                              | Domain                | Severity | Priority | Effort | Status Category                        |
| ---------------------------------------------------- | --------------------- | -------- | -------- | ------ | -------------------------------------- |
| Profiles RLS `USING(true)` exposes PII (auth)        | Authentication        | Critical | P0       | —      | Implemented but weak/fragile           |
| Password reset flow missing                          | Authentication        | Critical | P0       | —      | Missing entirely                       |
| Privilege escalation via role assignment             | Admin Authorization   | Critical | P0       | —      | Implemented but inconsistent           |
| Migration references non-existent columns            | DB Architecture       | Critical | P0       | —      | Implemented but weak/fragile           |
| Admin tables never created (14)                      | DB Architecture       | Critical | P0       | —      | Present in UI but not functional       |
| Missing RLS write policies (13 tables)               | DB Architecture       | Critical | P0       | —      | Present in UI but not functional       |
| Profiles public-read defeats directory privacy (DB)  | DB Architecture       | Critical | P0       | —      | Implemented but inconsistent           |
| RLS — profiles (server-side)                         | Server-side Logic     | Critical | P0       | —      | Implemented but weak/fragile           |
| RLS — contributions (server-side)                    | Server-side Logic     | Critical | P0       | —      | Implemented but weak/fragile           |
| Page access control (visibility) unenforced          | CMS/Admin Tooling     | Critical | P0       | —      | Implemented but weak/fragile           |
| Content sections RLS `USING(true)`                   | CMS/Admin Tooling     | Critical | P0       | —      | Implemented but weak/fragile           |
| Navigation Manager not wired to live site            | CMS/Admin Tooling     | Critical | P0       | —      | Present in UI but not functional       |
| Member privacy profiles RLS (family domain)          | Family-data Modules   | Critical | P0       | —      | Implemented but weak/fragile           |
| Family relationship tables have zero RLS policies    | Family-data Modules   | Critical | P0       | —      | Missing entirely                       |
| Family member CRUD schema mismatch                   | Family-data Modules   | Critical | P0       | —      | Present in UI but not functional       |
| Library photographs/recordings collection mismatch   | Recurring Content     | Critical | P0       | Small  | Implemented but inconsistent           |
| Library recordings video playback non-functional     | Recurring Content     | Critical | P0       | Medium | Present in UI but not functional       |
| News family vs fund sections broken                  | Recurring Content     | Critical | P0       | Medium | Implemented but inconsistent           |
| Contribution RLS integrity (dup INSERT policy)       | Public Forms/Treasury | Critical | P0       | —      | Implemented but weak/fragile           |
| Inquiries admin panel data source mismatch           | Public Forms/Treasury | Critical | P0       | —      | Present in UI but not functional       |
| Audit log persistence (audit_logs RLS)               | Cross-cutting Admin   | Critical | P0       | —      | Present in UI but not functional       |
| RLS write policies core admin tables                 | Cross-cutting Admin   | Critical | P0       | —      | Implemented but weak/fragile           |
| App-level checks absent, RLS-only backstop           | Admin Authorization   | High     | P0       | —      | Implemented but inconsistent           |
| Server functions rely on RLS alone                   | Server-side Logic     | High     | P0       | —      | Implemented but weak/fragile           |
| Zod enum values vs Postgres CHECK                    | Family-data Modules   | High     | P0       | —      | Implemented but inconsistent           |
| Schema/production drift (repo-wide)                  | Family-data Modules   | High     | P0       | —      | Implemented but weak/fragile           |
| Admin media upload storage policies missing          | Public Forms/Treasury | High     | P0       | —      | Present in UI but not functional       |
| Library — video playback (public UI)                 | Public-facing UI      | High     | P1       | Small  | Present in UI but not functional       |
| Contribute — bank details exposure                   | Public-facing UI      | High     | P1       | Small  | Implemented but inconsistent           |
| Family tree diagram not CMS-driven                   | Public-facing UI      | High     | P1       | Large  | Implemented but inconsistent           |
| Language persistence SSR-CSR mismatch                | i18n                  | High     | P1       | —      | Implemented but inconsistent           |
| Global search Arabic-only                            | i18n                  | High     | P1       | —      | Implemented but inconsistent           |
| Cosmetic Permissions Matrix UI                       | Admin Authorization   | High     | P1       | —      | Present in UI but not functional       |
| super_admin broken server-side                       | Admin Authorization   | High     | P1       | —      | Implemented but weak/fragile           |
| Dead per-tab RBAC scaffolding                        | Admin Authorization   | High     | P1       | —      | Missing entirely                       |
| Financial ownership bypass contributions insert      | DB Architecture       | High     | P1       | —      | Implemented but weak/fragile           |
| Unpublished content exposed (initiatives/sections)   | DB Architecture       | High     | P1       | —      | Implemented but inconsistent           |
| Seed/demo data in migrations                         | DB Architecture       | High     | P1       | —      | Implemented but weak/fragile           |
| Contribution review silent no-op                     | Server-side Logic     | High     | P1       | —      | Implemented but weak/fragile           |
| Duplicate admin backends                             | Server-side Logic     | High     | P1       | —      | Implemented but inconsistent           |
| Navigation & content_pages schema drift              | CMS/Admin Tooling     | High     | P1       | —      | Implemented but inconsistent           |
| Page Builder block coverage (editor)                 | CMS/Admin Tooling     | High     | P1       | —      | Partially implemented                  |
| Public page renderer block coverage                  | CMS/Admin Tooling     | High     | P1       | —      | Present in UI but not functional       |
| DNA studies persistence broken                       | Family-data Modules   | High     | P1       | —      | Present in UI but not functional       |
| Initiatives status "completed" mislabeled            | Recurring Content     | High     | P1       | Small  | Partially implemented                  |
| Initiatives RLS overly permissive                    | Recurring Content     | High     | P1       | Small  | Implemented but weak/fragile           |
| Achievers category/field taxonomy missing            | Recurring Content     | High     | P1       | Small  | Missing entirely                       |
| Business directory public submission schema mismatch | Public Forms/Treasury | High     | P1       | —      | Implemented but inconsistent           |
| Contact/inquiry notification workflow missing        | Public Forms/Treasury | High     | P1       | —      | Missing entirely                       |
| Treasury audit trail fragmentation                   | Public Forms/Treasury | High     | P1       | —      | Implemented but inconsistent           |
| Duplicate/parallel audit systems                     | Cross-cutting Admin   | High     | P1       | —      | Implemented but inconsistent           |
| Site Settings public-site consumption broken         | Cross-cutting Admin   | High     | P1       | —      | Present in UI but not functional       |
| Crash/error monitoring missing                       | Operational Readiness | High     | P1       | —      | Missing entirely                       |
| Automatic backups missing                            | Operational Readiness | High     | P1       | —      | Missing entirely                       |
| Family tree relationship model depth                 | Family-data Modules   | Medium   | P1       | —      | Partially implemented                  |
| Public family tree data source static                | Family-data Modules   | Medium   | P1       | —      | Partially implemented                  |
| Contact spam protection (forms domain)               | Public Forms/Treasury | Medium   | P1       | —      | Partially implemented                  |
| Domain/canonical URL consistency                     | Operational Readiness | Medium   | P1       | —      | Implemented but inconsistent           |
| News/Library/Achievers/Initiatives pagination        | Public-facing UI      | Medium   | P2       | Medium | Missing entirely                       |
| Foundation page no CMS wiring                        | Public-facing UI      | Medium   | P2       | Large  | Partially implemented                  |
| Global search family deep link                       | Public-facing UI      | Medium   | P2       | Small  | Present in UI but not functional       |
| Per-route SEO metadata not localized                 | i18n                  | Medium   | P2       | —      | Missing entirely                       |
| Untranslated auth error messages                     | i18n                  | Medium   | P2       | —      | Implemented but inconsistent           |
| Session expiry handling                              | Authentication        | Medium   | P2       | —      | Missing entirely                       |
| Signup abuse protection (captcha)                    | Authentication        | Medium   | P2       | —      | Missing entirely                       |
| Public member verification endpoint weak             | Authentication        | Medium   | P2       | —      | Implemented but weak/fragile           |
| Dead roles assignable                                | Admin Authorization   | Medium   | P2       | —      | Present in UI but not functional       |
| Full dataset returned before role filtering          | Admin Authorization   | Medium   | P2       | —      | Implemented but weak/fragile           |
| Orphaned duplicate admin function module             | Admin Authorization   | Medium   | P2       | —      | Missing entirely                       |
| Fragmented authorization model                       | Admin Authorization   | Medium   | P2       | —      | Implemented but inconsistent           |
| Duplicate inquiry/contact systems                    | DB Architecture       | Medium   | P2       | —      | Present in UI but not functional       |
| Duplicate audit-log tables                           | DB Architecture       | Medium   | P2       | —      | Implemented but inconsistent           |
| Soft-delete vs hard-delete inconsistent              | DB Architecture       | Medium   | P2       | —      | Implemented but inconsistent           |
| Directory visibility depends on admin grant          | DB Architecture       | Medium   | P2       | —      | Partially implemented                  |
| Missing CHECK constraints                            | DB Architecture       | Medium   | P2       | —      | Missing entirely                       |
| Storage buckets never created via migration          | DB Architecture       | Medium   | P2       | —      | Missing entirely                       |
| PostgREST filter injection global search             | Server-side Logic     | Medium   | P2       | —      | Implemented but weak/fragile           |
| Spam protection on public mutations                  | Server-side Logic     | Medium   | P2       | —      | Partially implemented                  |
| Schema drift roles CHECK constraint                  | Server-side Logic     | Medium   | P2       | —      | Implemented but inconsistent           |
| Navigation Manager menu creation missing             | CMS/Admin Tooling     | Medium   | P2       | —      | Partially implemented                  |
| Page Builder live preview coverage                   | CMS/Admin Tooling     | Medium   | P2       | —      | Partially implemented                  |
| Statistics block field mismatch                      | CMS/Admin Tooling     | Medium   | P2       | —      | Implemented but weak/fragile           |
| Homepage Manager section coverage                    | CMS/Admin Tooling     | Medium   | P2       | —      | Present in UI but not functional       |
| CMS page save non-atomic                             | CMS/Admin Tooling     | Medium   | P2       | —      | Implemented but weak/fragile           |
| Family CSV import/export weak                        | Family-data Modules   | Medium   | P2       | —      | Implemented but weak/fragile           |
| Directory opt-in default inconsistency               | Family-data Modules   | Medium   | P2       | —      | Implemented but inconsistent           |
| Events no public surface                             | Recurring Content     | Medium   | P2       | Medium | Present in UI but not functional       |
| Pagination (content domain)                          | Recurring Content     | Medium   | P2       | Medium | Missing entirely                       |
| News category/archive missing                        | Recurring Content     | Medium   | P2       | Medium | Partially implemented                  |
| Homepage builder default CTAs wrong                  | Recurring Content     | Medium   | P2       | Small  | Present in UI but not functional       |
| Articles status vs DB constraint                     | Recurring Content     | Medium   | P2       | Small  | Implemented but weak/fragile           |
| Schema/migration hygiene duplicate defs              | Recurring Content     | Medium   | P2       | Medium | Implemented but weak/fragile           |
| File upload validation depth                         | Public Forms/Treasury | Medium   | P2       | —      | Implemented but weak/fragile           |
| Global search coverage (admin palette)               | Cross-cutting Admin   | Medium   | P2       | —      | Partially implemented                  |
| Audit trail coverage inconsistent                    | Cross-cutting Admin   | Medium   | P2       | —      | Partially implemented                  |
| Audit log write reliability                          | Cross-cutting Admin   | Medium   | P2       | —      | Implemented but weak/fragile           |
| Audit log viewer actor identity                      | Cross-cutting Admin   | Medium   | P2       | —      | Functional but incomplete              |
| Analytics missing                                    | Operational Readiness | Medium   | P2       | —      | Missing entirely                       |
| SEO metadata / sitemap dynamic gen                   | Operational Readiness | Medium   | P2       | —      | Partially implemented                  |
| Environment variable validation                      | Operational Readiness | Medium   | P2       | —      | Implemented but weak/fragile           |
| Deployment/build target coherence                    | Operational Readiness | Medium   | P2       | —      | Implemented but weak/fragile           |
| Notification/email delivery workflow                 | Operational Readiness | Medium   | P2       | —      | Missing entirely                       |
| Directory — empty website field                      | Public-facing UI      | Low      | P3       | Small  | Functional but incomplete              |
| Sitemap static/incomplete                            | Public-facing UI      | Low      | P3       | Medium | Implemented but weak/fragile           |
| Unused translation dictionary                        | i18n                  | Low      | P3       | —      | Implemented but inconsistent           |
| Announcement ticker RTL icon/aria                    | i18n                  | Low      | P3       | —      | Implemented but inconsistent           |
| Arabic numeral formatting inconsistent               | i18n                  | Low      | P3       | —      | Implemented but inconsistent           |
| Language switcher accessibility                      | i18n                  | Low      | P3       | —      | Implemented but weak/fragile           |
| Session token storage in localStorage                | Authentication        | Low      | P3       | —      | Implemented but weak/fragile           |
| Account deletion/data export missing                 | Authentication        | Low      | P3       | —      | Missing entirely                       |
| Signup form validation weak                          | Authentication        | Low      | P3       | —      | Partially implemented                  |
| Query cache identity isolation                       | Authentication        | Low      | P3       | —      | Implemented but weak/fragile           |
| Auth/session config reproducibility                  | Authentication        | Low      | P3       | —      | Missing entirely                       |
| updated_at triggers missing                          | DB Architecture       | Low      | P3       | —      | Implemented but inconsistent           |
| Missing indexes                                      | DB Architecture       | Low      | P3       | —      | Missing entirely                       |
| Misleading migration documentation                   | DB Architecture       | Low      | P3       | —      | Implemented but weak/fragile           |
| Error handling consistency admin-hub                 | Server-side Logic     | Low      | P3       | —      | Implemented but inconsistent           |
| Global search missing signed media URLs              | Server-side Logic     | Low      | P3       | —      | Functional but incomplete              |
| Success responses not reflecting outcome             | Server-side Logic     | Low      | P3       | —      | Implemented but weak/fragile           |
| Revision history no UI                               | CMS/Admin Tooling     | Low      | P3       | —      | Partially implemented                  |
| Rich text block over-promises                        | CMS/Admin Tooling     | Low      | P3       | —      | Implemented but inconsistent           |
| Navigation item URL validation                       | CMS/Admin Tooling     | Low      | P3       | —      | Missing entirely                       |
| CMS page status "scheduled" unusable                 | CMS/Admin Tooling     | Low      | P3       | —      | Missing entirely                       |
| SVG upload no sanitization                           | CMS/Admin Tooling     | Low      | P3       | —      | Implemented but weak/fragile           |
| Directory access gate breadth                        | Family-data Modules   | Low      | P3       | —      | Implemented but inconsistent           |
| News Hijri date hardcoded                            | Recurring Content     | Low      | P3       | Small  | Implemented but weak/fragile           |
| Contribution review history not preserved            | Public Forms/Treasury | Low      | P3       | —      | Implemented but weak/fragile           |
| Audit log pagination                                 | Cross-cutting Admin   | Low      | P3       | —      | Missing entirely                       |
| Dead/orphaned admin shell code                       | Cross-cutting Admin   | Low      | P3       | —      | Missing entirely                       |
| Dashboard treasury target hardcoded                  | Cross-cutting Admin   | Low      | P3       | —      | Implemented but weak/fragile           |
| Dashboard health indicators fake                     | Cross-cutting Admin   | Low      | P3       | —      | Present in UI but not functional       |
| Site settings security tab false claim               | Cross-cutting Admin   | Low      | P3       | —      | Implemented but inconsistent           |
| Dependency versions (beta risk)                      | Operational Readiness | Low      | P3       | —      | Implemented but weak/fragile           |
| .env/secrets hygiene                                 | Operational Readiness | Low      | P3       | —      | Fully implemented and production-ready |

## What Must Be Done Before Production Launch

- Drop or rewrite the `profiles` RLS policy so it no longer exposes every member's PII to the anon key
- Remove the redundant permissive `contributions` INSERT policy that allows financial-record spoofing
- Fix the privilege-escalation gap so only `super_admin` can grant `admin`/`super_admin`
- Fix `requireAdminAuth` to also accept `super_admin`
- Add application-level role checks (`requireEditorAuth`/`requireTreasuryAuth`) to every CMS/treasury mutation currently backstopped only by RLS
- Enforce `content_pages.visibility` and fix the `content_sections` blanket-public RLS policy
- Add RLS write policies to every table currently missing them (family_relationships, places, family_history_entries, and the ~13 baseline tables with SELECT-only policies)
- Create the ~14 tables the admin console queries but that don't exist in any migration, or remove the dependent console screens
- Add storage RLS policies for every bucket the CMS actually uploads to
- Fix the broken `CREATE INDEX` statements in the baseline migration so schema is reproducible from scratch
- Reconcile the Family Members admin schema/form with the actual `family_members` table columns
- Reconcile zod enums with the DB's actual `CHECK` constraints
- Reconcile the live production schema with the committed migrations (documented drift)
- Build a real self-service password reset flow (currently entirely absent)
- Fix the Library collection-value mismatch so CMS-authored photos/videos actually appear publicly
- Implement real video/YouTube playback on the Library page
- Fix the Articles/News section bug that silently erases the Family news feed on first article publish
- Wire the Navigation Manager to the live Header/Footer, or stop presenting it as functional
- Fix the Inquiries admin panel to read the table the public Contact form actually writes to
- Remove or gate the public bank-details/IBAN dialog on the Contribute page
- Add CAPTCHA and/or rate limiting to signup, sign-in, contact form, and other public mutation endpoints
- Add real crash/error monitoring and confirm/establish an automated backup strategy
- Fix the Language provider's pre-hydration flash and the Arabic-only global search backend
- Fix the RolesPermissionMatrix so it reflects real enforcement, or relabel it as illustrative
- Fill the per-tab/per-domain RBAC scaffolding gap so `Users & Roles`/`Audit Logs` aren't open to every plain admin
- Fix the two divergent audit-log tables and the duplicate admin server-function backends
- Wire Site Settings to the actual public readers (Footer, SEO) so admin edits take effect
- Fix Page Builder/renderer block coverage gaps, especially the CTA block that's fully editable but never renders

## Recommended Implementation Sequence

**Phase 1 — Security & data-integrity blockers (before any further work)**

1. Fix `profiles` RLS (drop `USING(true)`), `contributions` RLS (drop redundant INSERT policy), `content_pages`/`content_sections` visibility RLS — these are live, exploitable data leaks.
2. Fix the broken `CREATE INDEX` statements in the baseline migration so the schema is reproducible from a clean database.
3. Reconcile the family-data schema mismatch: align `family_members`/`family_relationships` columns, zod enums, and DB `CHECK` constraints; add the missing RLS policies for `family_relationships`/`places`/`family_history_entries`.
4. Add missing RLS write policies for the remaining CMS/admin tables (articles, events, site_settings, content_pages) and create the ~14 tables referenced by admin-hub.functions.ts but never migrated.
5. Add storage RLS policies for every referenced bucket.
6. Fix `audit_logs` RLS so the accountability trail actually persists and is readable.
7. Close the privilege-escalation gap (role assignment) and the `super_admin`/`requireAdminAuth` mismatch.
8. Add application-level role middleware (`requireEditorAuth`/`requireTreasuryAuth`) to every mutation currently relying on RLS alone.

**Phase 2 — Core functional restoration (features that appear to work but don't)** 9. Fix the Library collection-value mismatch and implement real video playback. 10. Fix the Articles/News section bug so Family news isn't erased by publishing a Fund article. 11. Wire the Navigation Manager to the live Header/Footer. 12. Fix the Inquiries panel to read real contact-form submissions. 13. Wire Site Settings to the public readers (Footer, seo.ts, contact.tsx, foundation.tsx). 14. Fix Page Builder/renderer block coverage (at minimum CTA), the Statistics field mismatch, and Homepage Manager's 4 dead sections. 15. Fix DNA Studies save path (nonexistent column + missing RLS). 16. Add an Achievers category selector, fix Initiatives "completed" status, and fix the Initiatives RLS over-permission.

**Phase 3 — Authentication & account completeness** 17. Build the missing password-reset flow end-to-end. 18. Add CAPTCHA/rate limiting to public forms and auth endpoints. 19. Add session-expiry detection/redirect on authenticated routes. 20. Fix the Contribute page's public bank-details exposure.

**Phase 4 — Consolidation & technical-debt cleanup** 21. Consolidate duplicate audit-log tables, duplicate inquiry/contact systems, and duplicate admin server-function backends into single canonical implementations. 22. Reconcile migration history against the live production schema (eliminate documented drift) and clean up duplicate/conflicting `CREATE TABLE` definitions. 23. Remove dead code (orphaned `admin.functions.ts`, `ConsoleShell.tsx`/`ConsoleUI.tsx`, unused `translations.ts`). 24. Fix i18n gaps: pre-hydration language flash, Arabic-only global search, untranslated auth errors, per-route localized SEO metadata.

**Phase 5 — Operational readiness** 25. Wire real crash/error monitoring and analytics. 26. Establish and document an automated backup/restore procedure. 27. Commit an explicit deployment config for the actual hosting target and resolve the canonical-domain mismatch. 28. Add dynamic sitemap generation and pagination to all recurring-content listing pages. 29. Add dependency-vulnerability scanning and move off beta build tooling.
