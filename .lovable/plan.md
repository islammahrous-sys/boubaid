# Making the site functional: full backend plan

Today every page is static. All content lives in `src/content/*.ts`, there is no backend
in the project (`src/integrations` does not exist), and the contact form only shows a
local success message — nothing is stored or emailed.

Enabling the backend failed on the first attempt; the first step below is to retry it.

## What the backend will do

| Area | Becomes functional |
| --- | --- |
| Contact form | Submissions saved and emailed to the Secretariat |
| Membership / contribute | Applications saved, status tracked, applicant notified |
| Newsletter | Subscriber list with confirmation and unsubscribe |
| Accounts | Family-member sign-in (email + Google), separate roles table (`admin`, `secretariat`, `member`) |
| Member area | Own profile, own membership status, private documents |
| Admin panel | Secretariat manages news, initiatives, achievers, library items and files |
| Directory / family tree | Person and branch records stored in the database, editable |
| Library | Real file uploads with access rules (public vs members-only) |
| Achievers | Member nominations, admin review and publish |

## External connectors needed

Only one is required. Everything else is native.

1. **Email sending — required.** Form notifications, membership decisions, newsletter,
   sign-in and password-reset emails. Uses Lovable's built-in email; it needs a domain
   the family owns (e.g. `notify.albuobaid.sa`) verified once via DNS.
2. **Payments — optional, deferred.** Only if online contributions are collected. For
   Saudi coverage (Mada, Apple Pay, SADAD) a local gateway such as Moyasar or Tap is the
   better fit and needs API keys from that provider. For now the site keeps
   bank-transfer instructions.
3. **SMS / OTP — optional.** Twilio, only if phone verification for members is wanted.

Not needed: separate database, auth provider, file storage or CDN accounts — all built in.
Google sign-in is included without an external account.

## Build order

**Phase 1 — forms and email (immediate value)**
- Retry enabling the backend.
- Tables: `contact_submissions`, `membership_applications`, `newsletter_subscribers`.
  Public insert-only, admin/secretariat read.
- Server-side validation on every submission (length limits, email format, basic
  anti-spam), plus the existing client-side checks.
- Wire `contact.tsx` and `contribute.tsx` to real submissions with proper success/error
  states in both Arabic and English.
- Set up the email domain and send notification + acknowledgement emails.

**Phase 2 — accounts and roles**
- Sign-in and sign-up (email/password + Google), password reset page.
- `profiles` table (name, branch, phone, preferred language) created automatically on
  signup; `user_roles` table kept separate for security.
- Protected member area: own profile, own application status.

**Phase 3 — admin panel (content out of code)**
- Tables for `news`, `initiatives`, `achievers`, `library_items`, `people`, `branches`,
  each with draft/published state and owner-plus-public read rules.
- Secretariat-only editor screens with file/image upload to storage.
- Public pages read from the database, falling back to nothing missing — same layout,
  same design, no visual change.
- Achiever nominations from members with admin approval.

**Phase 4 — contributions (only when a gateway is chosen)**
- Contribution records, receipts, a simple fund ledger view for admins.

## Technical notes

- Backend: Lovable Cloud (Postgres + auth + storage) with row-level security on every
  table and explicit grants; roles checked through a security-definer `has_role` function,
  never stored on the profile row.
- Server logic: TanStack `createServerFn` for app calls; `src/routes/api/public/*` only
  for external callers (email events, future payment webhooks) with signature checks.
- Bilingual content columns stored as `title_ar`/`title_en` pairs so the existing
  `t({ ar, en })` pattern keeps working unchanged.
- Content files stay as the seed source: Phase 3 migrations insert the current
  `src/content/*.ts` data so nothing disappears when pages switch to the database.
- Public pages keep server-side rendering and their SEO/OG metadata; only the member and
  admin areas sit behind the authenticated layout.

## Recommendation

Approve Phase 1 first — it turns the two forms and the newsletter into something real
within one pass, and requires only the email domain from the family. Phases 2 and 3 follow
once sign-in policy (who may register) is decided.
