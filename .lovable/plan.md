
## Goal

Ship a professional bilingual (Arabic RTL + English LTR) website for **آل بوعبيد / Al Bu Obaid family**, structured like the reference Saudi family fund sites. Full public site, all sections requested, populated with **real content drawn from the uploaded research report** (lineage, DNA study, foundation formation) alongside clearly-marked editable placeholders for names, photos, and figures the family will provide later.

## Content grounded in the uploaded research

The research report gives us authentic material to seed pages instead of generic filler:

- **Lineage** (About / Family Tree): descent from فرع العبادل → عبد الله بن دارم → بنو تميم → عدنان, meeting the Prophet ﷺ's line at إلياس بن مضر.
- **Homeland**: الأحساء, Eastern Arabia; historical spread of بني دارم across Najd to the eastern coast.
- **Historical figures**: الأحنف بن قيس التميمي as a heritage callout.
- **DNA / genealogy section** (About or dedicated card in Family Tree): Y-DNA haplogroup **J-Z20777** (~600 CE), branch context J-Z20776 / J-Z20774, geographic distribution across Qatar (Al-Kuwari, Al-Mohannadi, Al-Buainain, Al-Khayarin) and the Gulf.
- **Foundation** (Fund page): **صندوق التنمية العائلية / Family Development Fund**, formally established **20 Safar 1447 AH** after four years of preparation, aligned with Saudi Vision 2030. Strategic real-estate acquisition of a future headquarters (~93% of first-cycle capital expenditure) framed as the fund's foundational asset.
- **Compliance & governance**: registered non-profit posture, bylaws (اللائحة الأساسية), audited financials.
- **References**: cited sources listed at the bottom of About with links (masaha.org, archive.org, FamilyTreeDNA project pages).

Names, board photos, exact registration number, current stats, contact numbers → placeholders labelled clearly.

## Visual identity

- Palette: deep midnight navy `#0B1E3F` + refined gold `#C9A24B` accent + warm ivory `#F5F1E8` surfaces, dark emerald as secondary highlight. Calm, formal, heritage-forward.
- Typography: **IBM Plex Sans Arabic** (Arabic) + **Cormorant Garamond** display / **Inter** body (English). Loaded via `<link>` in `__root.tsx` head.
- Wordmark placeholder: bilingual lockup — "آل بوعبيد" in Plex Arabic large; "Al Bu Obaid Family" in Cormorant small caps beneath; slim gold ornamental divider.
- Generous whitespace, thin gold hairlines, soft-shadow cards, hero imagery with archival warmth, rounded-md corners, no gratuitous gradients.
- Fully responsive; RTL is primary.

## Language & RTL

- `LanguageProvider` (React context) with `ar` (default) and `en`. Persists in `localStorage`.
- Sets `<html lang dir>` on switch (Arabic → `rtl`, English → `ltr`).
- All copy lives in one `src/i18n/translations.ts` dictionary keyed per page/section; each string has `ar` and `en`.
- Switcher (ع / EN) top-inline-end of header.
- Tailwind logical properties (`ms-*`, `me-*`, `ps-*`, `pe-*`, `text-start`, `text-end`) so layout flips cleanly.

## Routes (TanStack file-based)

```
src/routes/
  __root.tsx             fonts, language provider, header, footer
  index.tsx              Home
  about.tsx              About Us + lineage + DNA study
  foundation.tsx         Fund (structure, bylaws, plan, committees, financials)
  family-tree.tsx        Family Tree + members directory
  achievers.tsx          Family Achievers
  initiatives.tsx        Initiatives list
  initiatives.$slug.tsx  Initiative detail
  news.tsx               News (Family + Fund tabs)
  news.$slug.tsx         News article
  library.tsx            Library (Documents / Photos / Videos)
  contact.tsx            Contact
  contribute.tsx         Contribute / Donate
```

Each route has its own bilingual `head()` (title, description, og:title, og:description, og:type, twitter:card). Root `head()` gets updated title/description too. No og:image on root.

## Shared chrome

- **Header**: wordmark on start side; nav (Home, About, Foundation, Family Tree, Achievers, Initiatives, News, Library, Contact); gold outline "Contribute" CTA; language switcher. Mobile: slide-in sheet menu.
- **Footer**: short blurb, quick links, contact block (phone / email / Al-Ahsa headquarters placeholder), social icons (X, Instagram, Snapchat, TikTok, YouTube, WhatsApp), copyright, top gold hairline.

## Page-by-page

### Home
- Hero slider (3 slides) with generated heritage imagery + bilingual headline/subhead + primary CTA (WhatsApp community) + secondary CTA (About the fund).
- About preview block (2–3 lines drawn from lineage summary) → link to /about.
- Animated stats strip (IntersectionObserver counters): members (placeholder), year founded (1447 AH / 2025 CE), initiatives, chapters/regions.
- Latest news: 3 cards.
- Initiatives highlight: 3 cards with status pills (upcoming / ongoing / completed).
- CTA band: join WhatsApp / Telegram (placeholder links).
- Quick contact form (name, email, message) — zod validation, toast on submit, no backend.

### About Us
- **Origin & lineage** section using real chain: العبادل → عبد الله بن دارم → بنو تميم → عدنان, meeting point with the Prophet ﷺ at إلياس بن مضر.
- **Geography & history**: Al-Ahsa homeland, expansion of بنو دارم from Najd to the eastern coast; Al-Ahnaf ibn Qais callout.
- **Vision / Mission / Goals** cards (fund-aligned, Vision 2030 language).
- **Genetic genealogy / DNA study** card: haplogroup **J-Z20777 (~600 CE)**, branches J-Z20776 / J-Z20774, distribution across Qatar and Gulf Tamim families — small table.
- Registration number field (placeholder).
- Historical photo gallery (sepia-toned generated imagery).
- Sources section with the report's external links.

### Foundation
- Overview: **صندوق التنمية العائلية / Al Bu Obaid Family Development Fund**, established **20 Safar 1447 AH** after four years of coordination, Saudi Vision 2030 alignment.
- Board of Trustees grid (6 placeholder profiles).
- Bylaws / اللائحة الأساسية: PDF download link placeholders.
- Strategic plan summary (3 pillars).
- Committees: social, financial, media, cultural.
- First-cycle financial highlight card: land acquisition for the future HQ noted as the flagship capital investment.

### Family Tree
- Semi-interactive SVG family tree: ancestor node at root → branches → generations. Pan/zoom on desktop, vertical stack on mobile. Purely visual for v1.
- Searchable directory (~12 placeholder members) with generation filter and privacy notice.
- Elder / founder bios (3 longer profile cards).

### Achievers
- Category chips: Medical, Academic, Sports, Business, Public Service.
- Grid of achiever cards (photo, name, achievement, field) — placeholders.

### Initiatives
- Grid with status pills.
- Detail page: hero, description, timeline, related news.

### News
- Tabs: Family News / Fund News.
- Card grid, client-side pagination over placeholder array.
- Detail page: cover, title, date, body, share buttons (X, WhatsApp, copy link).

### Library
- Tabs: Documents (PDF cards + download), Photos (masonry), Videos (YouTube embed placeholders).
- Year + category filters.

### Contact
- Form with zod + simple math captcha.
- Phone / email / address blocks. Static map placeholder + "Open in Google Maps" link.
- WhatsApp / Telegram community CTA.

### Contribute
- Copy explaining how contributions fund initiatives and the future HQ.
- Bank-transfer placeholder details + disabled "Pay online — coming soon" note referencing local regulations.
- 3-item FAQ.

## Data shape

All content lives in typed modules under `src/content/` (`news.ts`, `initiatives.ts`, `achievers.ts`, `members.ts`, `trustees.ts`, `library.ts`, `stats.ts`, `lineage.ts`, `dna.ts`). Every entry has `{ ar, en }` fields → easy handoff to a real CMS later.

## Imagery

Generate ~10 refined heritage-tone images with `imagegen` (fast tier): Al-Ahsa oasis at dusk, majlis interior, gathering silhouette, Arabic calligraphy detail, archival document texture, palm-grove macro, etc. Stored in `src/assets/`, imported per route.

## Technical

- Tokens added to `src/styles.css`: `--navy`, `--gold`, `--ivory`, `--emerald`, mapped via `@theme inline`. Font families: `--font-arabic`, `--font-display`, `--font-body`.
- Fonts loaded via Google Fonts `<link>` in `__root.tsx` head.
- Motion: CSS transitions + small IntersectionObserver hook for counters / reveal-on-scroll. No heavy libs.
- SEO: unique bilingual `<title>` + description per route; hreflang `ar` / `en`; updated `sitemap.xml` and `robots.txt`.
- Accessibility: semantic landmarks, focus rings on gold, AA contrast on ivory, rem-based type, `aria-label`s on icon buttons.
- No backend, no auth, no payments in v1. Forms validate + toast only.

## Out of scope for v1 (explicitly deferred, extension points left in code)

- CMS / admin panel (needs Lovable Cloud + tables + auth).
- Real member login, e-voting.
- Working online donations / payment provider.
- Google Analytics wiring (commented placeholder in `__root.tsx`).
- Real Google Maps embed (static placeholder + external link).

## Deliverable

A working bilingual site at all 12 routes with the heritage visual identity above, seeded with authentic lineage / DNA / foundation content from the research report and clearly-marked placeholders everywhere else. Ready to publish and iterate.
