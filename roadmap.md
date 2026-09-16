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
