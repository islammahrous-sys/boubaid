# Full production audit — Al Bu Obaid family website

Deliverable: a written audit report (`docs/production-audit-2026-08-23.md`) with an application map, a master matrix, prioritized findings (P0–P3), a readiness scorecard, and a recommended fix order. No product code changes in this pass — fixes come after you approve the roadmap.

## How the audit will be run

1. **Static map** — every route under `src/routes` (23 public + 5 authenticated), every console manager (~25 components, ~19k lines), every server function file, classified Public / Member / Admin / CMS / Restricted, with the guard that actually protects it.
2. **Backend trace** — for each screen, follow UI → server function → table → RLS policy → grants, so a feature is only marked complete when persistence, validation, and permissions all line up.
3. **Data integrity queries** — row counts, orphans, duplicate slugs and members, broken media/document references, invalid or circular relationships, inconsistent status values, missing Arabic/English fields.
4. **Permission probes** — call the same server functions and tables as anonymous, plain member, editor, treasurer, admin; confirm a hidden button is also a blocked action, and that private storage objects are not publicly addressable.
5. **Browser passes (Playwright)** — signed-out, member, and admin; desktop / tablet / mobile; Arabic RTL and English LTR; each pass captures load, refresh, direct URL, back/forward, invalid IDs, and loading / empty / error / unauthorized / not-found states, plus console errors and request timings.
6. **End-to-end workflows** — news create → draft → publish → public (AR+EN) → edit → unpublish; event create → publish → member view → register → past; member create → relationship → directory → tree; contribution record → receipt → treasurer verify; sign-up → membership request → approval → role granted.

## Preliminary findings already confirmed (will be verified and expanded in the report)

- `family_relationships` has 0 rows while `family_members` has 21 — the public family tree still renders from the static file `src/content/family-tree.ts`, so admin edits to relationships cannot show up. Likely P0/P1 for the tree.
- Two parallel news models: `articles` (3 rows) and `news_posts` (0 rows). The public reader merges both; the console edits them in different places. Ambiguous source of truth.
- `notifications` has 0 rows and is referenced only in admin code — no member-facing notification surface. Notification lifecycle is effectively unbuilt.
- `documents`, `galleries`, `content_pages`, `event_registrations`, `inquiries` are all empty; media library has 89 assets. Needs checking whether these features are unreachable or merely unused.
- Only one authenticated area exists (`/account`, `/admin`, `/content`, `/treasury`) — there is no coherent member portal home. Likely P1 UX.
- Contact/about pages still carry placeholder markers; site-wide contact details in `src/content/site.ts` are invented values.
- RLS is enabled on every public table (verified), so the security pass will focus on policy correctness, grants, and storage URL exposure rather than missing RLS.

## Report structure

- A. Application map (routes, guards, data sources)
- B. Master matrix: Area / Feature / UI / UX / Backend / Data / Permissions / Mobile / AR-EN / Status / Priority
- C. Feature classification: Fully built / Partially built / UI only / Backend only / Broken / Missing / Needs validation
- D. Findings, each with Problem, Evidence (file, route, query), Impact, Root cause, Fix, Priority, Affected areas
- E. "Looks finished but isn't" list
- F. "Missing but should exist" list
- G. Security & privacy risks (family PII, storage, API authorization)
- H. Performance measurements with actual numbers
- I. Bilingual and responsive findings with screenshots
- J. Readiness scorecard per area, with evidence for every rating
- K. Recommended fix order, sequenced P0 → P3

## Technical notes

- Auditing is read-only: file reads, `rg`, `supabase--read_query`, Playwright against `localhost:8080`. No migrations, no writes, no seeding.
- Screenshots go under `docs/audit-2026-08-23/` and are referenced from the report.
- Any P0 discovered mid-audit (privacy leak, broken auth, data loss) is reported to you immediately rather than held for the final document.
