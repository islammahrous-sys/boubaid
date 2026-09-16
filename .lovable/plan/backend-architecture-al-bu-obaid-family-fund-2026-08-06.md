# Backend architecture — Al Bu Obaid Family Fund

Goal: turn the current static bilingual site into a working system with verified member accounts, a trustee admin panel over all content, and both manual and online contributions — built in verified phases, nothing half-wired.

## Architecture in one paragraph

A modular monolith on the stack the site already runs: TanStack Start on the server, Lovable Cloud (Postgres + Auth + Storage) for data. No separate API service, no Docker, no microservices — the app's own server layer _is_ the backend, deployed with the frontend on every publish. Access control lives in the database (row-level security), so a rule written once holds for every screen, and the family register cannot leak through a forgotten check in the UI.

Every table gets policies before any screen reads it. Content is public-readable only where the site is already public (news, initiatives, library, achievers); member data (contacts, lineage records, contributions) is readable by its owner and trustees only.

## Data model

Grouped by domain. Bilingual fields are stored as Arabic + English columns so the current `t({ar, en})` pattern keeps working.

- **People & access** — `profiles` (name ar/en, branch, phone, kinship notes), `user_roles` (separate table: `admin`, `editor`, `treasurer`, `member`), `membership_requests` (the approval queue), `audit_log` (who changed what, when).
- **Content** — `news`, `initiatives`, `library_items`, `achievers`, `businesses`, each with `status` (draft/published), Hijri + Gregorian dates, cover image, author, publish timestamp.
- **Lineage** — `branches`, `lineage_persons` (self-referencing parent link), `branch_documents`. This is the sensitive dataset: editable by admins only, and living members are visible to signed-in verified members, not the public.
- **Money** — `pledges` (a member's committed subscription), `contributions` (one row per received amount: online or bank transfer, with receipt file, confirmed-by, confirmed-at), `payment_events` (raw gateway callbacks, for reconciliation).
- **Communication** — `contact_messages`, `newsletter_subscribers`, `notifications`.

Files (portraits, receipts, PDFs, tree posters) go to Lovable Cloud storage: a public bucket for published media, a private bucket for receipts and member documents.

## Roadmap

Each phase ends with a working, verified slice. I do not start the next one until the previous one is exercised end to end in the preview.

**Phase 1 — Foundation & forms.** Enable Lovable Cloud. Create the schema above with RLS and role helpers. Wire the existing contact form, a membership request form, and newsletter signup to real tables with server-side validation. Set up email from the fund's own domain so the secretariat is notified and the sender is confirmed. _Deliverable:_ nothing on the site is a dead form any more.

**Phase 2 — Accounts & approval.** Email/password + Google sign-in, email verification, password reset. Registration creates a _pending_ membership request, not an active member — an admin approves it from a review queue, which grants the `member` role and notifies the applicant. Sign-in state in the header, sign-out, an account page. _Deliverable:_ a real, gated membership.

**Phase 3 — Admin panel, content first.** A trustee-only area: publish and edit news, initiatives, library items, achievers, and businesses, with image upload, draft/publish, and bilingual fields. Public pages start reading from the database instead of `src/content/site.ts`, migrated content-type by content-type so no page ever goes blank. _Deliverable:_ trustees maintain the site without me.

**Phase 4 — Family tree & branches.** Admin editors for branches and lineage records, including the parent-child structure that feeds the tree view, plus per-branch documents. Members-only visibility for living individuals. _Deliverable:_ the register stops being hard-coded.

**Phase 5 — Contributions.** Two paths, one ledger:

- _Bank transfer:_ the member records a transfer and uploads a receipt; the treasurer confirms or rejects it; the member sees the status.
- _Online:_ card / Apple Pay / mada checkout through Lovable's built-in payment integration, with a signed webhook writing confirmed contributions.

Both feed the same `contributions` table, so the treasurer sees one reconciled view. A treasurer dashboard shows totals by period and branch, with CSV export.

_Two things to confirm before I build this phase:_ Lovable's built-in payments needs a Pro plan, and I need to check whether the fund can onboard as a seller from Saudi Arabia — if not, we use a Saudi gateway (Moyasar or Tap) with the fund's merchant credentials instead. The bank-transfer path works either way and ships first.

**Phase 6 — Member directory & search.** A signed-in directory of approved members with search and filtering by branch, honouring each member's visibility preference. Postgres full-text search across news, initiatives, and library items with Arabic-aware normalisation.

**Phase 7 — Hardening & handover.** Rate limits on public forms, security review of every policy, audit-log coverage on sensitive writes, database backups verified, and a written handover: environment variables, admin runbook, how to add a trustee, how to reconcile contributions.

## Technical notes

- Server logic uses TanStack server functions for app-internal reads and writes, and server routes only for external callers (the payment webhook). No Edge Functions.
- Roles live in a dedicated `user_roles` table read by a security-definer `has_role()` function — never a column on `profiles` — to avoid privilege escalation.
- Validation with Zod on both the client and the server; every write path revalidates server-side regardless of what the form sent.
- Public reads use narrow anon-role policies with explicit column projections; privileged writes verify the caller's role first.
- Sensitive files sit in a private bucket served through signed URLs; receipts are never publicly addressable.
- Every migration includes table grants alongside its policies, and seed data ships as SQL so the first screen is never empty.
- Testing is proportionate to a site this size: server-side validation and policy checks exercised directly, plus a browser pass over each finished flow (register → approve → sign in → publish → contribute). No Docker or CI pipeline — Lovable builds and deploys on publish.
- Content migration is additive: the database becomes the source of truth per content type, and `src/content/site.ts` is only removed once the corresponding pages read from the database.

## What I need from you along the way

- Phase 1: the secretariat email address for form notifications, and the domain to send from.
- Phase 2: which addresses should be admins at launch.
- Phase 5: the fund's bank/IBAN details as they should appear, and the licence/commercial details for gateway onboarding.
