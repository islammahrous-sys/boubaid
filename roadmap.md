# Task Roadmap

## Done

- [x] Rebuild the Roll of Honor with an empty Family Members’ Competencies section and exactly 22 Excellence Award recipients grouped by 1444–1447 AH; keep all Projects unchanged.
- Switched Family Tree frame purchase actions and header/mobile basket link to the official external store: https://albouabidfamily.com/
- Kept current navigation sequence unchanged.

## In progress

- Repair and verify every user-facing View action for documents and media locally and on the published website.
- Rename and restructure the directory into family-member services and establishment services.
- Connect service documents to existing admin upload and view-only viewer flows.
- Verify Arabic/English, desktop/mobile, permissions, and existing workflows.
- [x] Fix distorted Arabic text rendering in the shared document viewer across all site pages.

## 33-point update (Sep 2026) — complete

- [x] Programs (/programs) + `initiatives.kind` section selector in admin
- [x] Five service price lists uploaded and linked to their service records
- [x] Three new request types in the Requests Hub (committee nomination, establishment service, family service)
- [x] "رشّح نفسك" (Committees) and "سجّل خدمتك" (Services) point at the hub
- [x] Lineage / Branches / Genetic studies moved under Family Tree; News-only under More
- [x] جائزة التميز ceremony photo on /achievers

## Forms & Templates (Sep 2026) — complete

- [x] 14 official announcement templates uploaded and displayed as a visible gallery with Arabic/English titles and template codes
- [x] Template index and template system PDFs published with an in-browser View action
- [x] Records live in the library CMS (collection «النماذج و القوالب») so future templates need no code change

## Requests Hub expansion (Sep 2026) — complete

- All 24 audit-suggested request types added to /requests (32 cards total), grouped into 7 subject sections in both languages.
- 21 new types submit through the shared council request form into the `inquiries` inbox with their own `source`; labels live in src/lib/council-requests.ts.
- Existing pages reused for tree frame, events, initiatives, directory, achievers, contribute, account, contact.

## Templates ↔ Requests Hub alignment + Archive video playback (Sep 2026) — complete

- [x] 14 template-linked announcement requests generated from the official template library (one per template code, male/female kept separate); each form collects only the fields that template needs, accepts up to 3 attachments, and shows the linked template code.
- [x] Submissions resolve the template code against the library record, get a unique reference number (ABF-REQ-…), and land in the existing inbox with the template id recorded; historical submissions untouched.
- [x] The three earlier generic announcement requests (family occasion, customised template, official greeting) retired as duplicates — definitions kept so old submissions stay readable.
- [x] Archive → الفيديوهات now plays the 11 website-hosted clips with the native player (loop, muted autoplay, real sound toggle in both languages); no Instagram needed. Fixed the batched media lookup that made the tab appear empty.

## 2026-09 — Targeted update (home poem, elders, requests routing, establishments, downloads)

- Home: «مقترح شاعر» section no longer rendered; its CMS record is untouched.
- Archive → كبارنا: leaf folders now show all their photographs inline (grid + lightbox, 24 per page).
- Requests Hub: `?request=<type>` opens a specific form; new requests `achiever_nomination` (replaces the standalone form on /achievers, same inbox source) and `business_listing_new` (replaces the /directory link card).
- Archive photo CTA and Roll of Honour nomination CTA now open their Requests Hub forms directly.
- Establishment listings, filters and quick-view moved from /directory to /initiatives#establishments via `EstablishmentsDirectory`; records, media and routes unchanged.
- Forms & Templates: every template and reference document now has «تحميل الملف / Download File» alongside «عرض الملف».
- 14 official template requests and the 11 self-hosted archive videos verified unchanged.

## Home page & family tree update (Sep 2026) — complete

- [x] Removed the branches, genetic-study, achievers and family-events blocks from the home page (records and their own pages untouched)
- [x] Electronic family tree, official tree plate and visual genealogy now render on the home page right after the council message, from one shared implementation (src/components/site/FamilyTreeSections.tsx)
- [x] Removed the generation-by-generation explorer from the lineage page; family-tree data untouched
- [x] Names now always fit inside the tree node frames (auto-shrink, then ellipsis with full-name tooltip)
- [x] Arabic navigation label under Family Tree renamed to «المشجرة» (English stays "Lineage")
- [x] Home colophon strip keeps the licence number and registration date, and now offers three icon links: Family Development Fund, Requests Centre, Archive
- [x] All user-facing dates go through src/lib/dates.ts and show Gregorian + Hijri (Umm al-Qura)

## Audit follow-up (Sep 2026) — complete

- [x] Photos compressed: public/images 63 MB → 17 MB (largest file now 0.65 MB); no filenames or references changed, no visible quality loss.
- [x] All 27 archive/museum folders now have English titles (Arabic untouched).
- [x] Empty published folder `archive-occasions-eid-greetings` set back to draft so it no longer shows an empty page.
- [x] Business listing submissions now write via the service-role client inside the rate-limited server function; the direct public insert policy was dropped.
- [x] Private buckets `receipts` and `nomination-docs` given the missing update/delete policies (owner + treasury/CMS staff).
- [x] Prettier run across the project; both real lint errors fixed (irregular whitespace, prefer-const). Generated files (routeTree.gen.ts, supabase/types.ts) excluded from lint/format. `eslint .` = 0 errors, `tsgo --noEmit` clean.
- [ ] Leaked-password protection: must be switched on in the hosted auth settings (no code/SQL path) — pending user action.
- [ ] Deliberately not done (structural, higher risk than benefit right now): merging the `articles`/`news_posts` models, removing the static `src/content` duplicates, splitting the four largest files.

- Templates Editable Assets Library: name the library "Occasions Manual Editable Templates" (user rename request 2026-09-17).

- [x] Occasions Manual Editable Templates library (14 editable PPTX + reference PDF, native reference content) — done 2026-09-17

## Visual Identity Library (Sep 2026) — complete

- [x] Added the first visual-identity section to the existing Forms & Templates area without changing unrelated pages.
- [x] Uploaded the supplied visual identity PDF, colour image, typography image, and 68 extracted assets unchanged into the existing CMS/storage system.
- [x] Preserved official PDFs and the Occasions Manual Editable Templates section; hid only the image-based official announcement template gallery from public display.
- [x] Renamed the More-menu destination to Visual Identity in Arabic and English, made the Arabic page MSA-first, and moved the two official reference cards beneath the editable occasions templates without changing their files.
- [x] Extracted both AI prompts from the identity guide and published them in a bilingual copy-ready section with concise usage and confidentiality guidance.

## Collaterals section (Sep 2026) — complete

- [x] Added «المواد التعريفية — Collaterals» directly after «أصول الهوية البصرية» on the Visual Identity page; no existing section modified.
- [x] Only the 9 actual documents inside Collaterals.zip included (7 DOCX, 1 PPTX, 1 XLSX) — nothing added from the identity PDF, prior lists, or recommendations.
- [x] Originals uploaded byte-identical (SHA-256 verified) to the media bucket; 9 CMS records (COLL-001..COLL-009) with MSA labels taken from each document; previews are separately generated first-page images — no HTML conversion, originals always downloaded.
- [x] View opens the first-page preview in the site viewer; Download delivers the original editable file; responsive (desktop/mobile), bilingual, keyboard-accessible, no console errors, no horizontal overflow.
- [x] Added nine supplied DOCX variants as individual collateral records: gold, clay, and copper editions of the business card, certificate of appreciation, and report cover. Each original was SHA-256 verified after upload and has its own generated preview, View action, and original-file Download action.
- [x] Grouped collateral editions by document type so each business card, certificate, and report-cover family appears together in the public library.

## News & establishments cleanup (Sep 2026) — complete
- Deleted all 9 family establishment listings (businesses) and removed the "خدمات المنشآت العائلية" section from Projects.
- Deleted all news records (news_posts + articles, including archived test rows) and cleared the static news fallback in src/content/site.ts.
- Published a single news item "تجديد التفويض بإدارة الحسابات البنكية لعام 2026" (slug authorisation-renewal-2026, section fund); shown on Home and /news.

## Request hub CTA behaviour (Sep 2026) — complete
- Roll of Honour "تقديم ترشيح جديد" now links to /requests (hub overview) without auto-opening the nomination dialog; verified mobile viewport, no dialog, no console errors.

## Homepage Awaser identity (Sep 2026) — complete
- [x] Enlarged the official calligraphic family mark in the homepage opening area using the existing vector artwork.
- [x] Renamed the homepage platform to «أواصر | Awaser» and added the supplied bilingual primary tagline and full descriptor.
- [x] Kept the homepage structure, imagery, navigation, calls to action and visual identity unchanged.

## Committee organizational charts + homepage name removal (Sep 2026) — complete
- [x] Add the supplied master and six committee organizational-chart images to the existing Committees page, with View and Download actions.
- [x] Update committee text and names to the official six-committee source.
- [x] Add the supplied editable committee organizational-charts PPTX under Visual Identity.
- [x] Remove the Awaser name from the homepage in Arabic and English.
## 2026-09 — Homepage dynamic cards and committee requests
- [x] Replace the homepage committee-contact CTA and route it to committee requests.
- [x] Add six committee-specific request options in the Requests Hub and store the selected committee with submissions.
- [x] Add admin filtering/search visibility for committee requests.
- [x] Replace the homepage licence/date/fund card area with visit count, current date, and Eastern Province weather.
- [x] Apply the confirmed wording: homepage CTA points to Requests Hub, request workflow says “Send a Request”, and committee requests are dedicated.
- [x] Verify homepage and committee request flows on desktop and mobile.
