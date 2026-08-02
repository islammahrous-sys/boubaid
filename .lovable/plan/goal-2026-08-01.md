## Goal

Elevate the site's visual craft with a coordinated pass of UI/UX polish plus a curated set of new, editorial images and icon-glyphs distributed only where they add meaning — no decorative filler.

## Scope (what changes)

### 1. Image generation — targeted, not blanket

Audit each route and generate images only where a real editorial gap exists. Planned additions:

- **Home** — a second supporting figure below the hero (heritage/oasis scene) so the page has a visual anchor after the video ends; a small figure for the "Foundation at a glance" band.
- **About** — one missing plate for the Lineage → Banu Tamim section (currently text-only), plus a DNA/haplogroup abstract illustration for the DNA study card.
- **Foundation** — a portrait-style plate for the Secretariat/organizational chart intro (currently no image between committees and endowment).
- **Family Tree** — a decorative but meaningful "tree of names" plate at the page header (calligraphic tree, not literal photo).
- **Achievers** — an editorial header plate (graduation/scholarship scene in Ahsa context).
- **Initiatives** — replace the generic fallback (`fallback_initiative.png`) with 2 authored fallbacks (cultural vs. social program), and add missing images for any initiative slug still hitting the fallback.
- **News** — one authored fallback replacing `fallback_initiative.png` reuse; add slug-specific images for any current news item missing one.
- **Library** — 1–2 extra contact-sheet frames if the current grid has awkward gaps.
- **Contact** — no new photo; the majlis image is enough.
- **Contribute** — a second supporting plate (endowment/palm grove context) below the Ramadan image.

All new images generated with `imagegen` at editorial quality, saved under `src/assets/` or `public/images/` following existing naming conventions, and wired through `src/content/images.ts`, `initiativeImages`, and `newsImages` maps. No image is added unless a specific slot in a route calls for it.

### 2. Iconography — a small custom glyph set

Introduce ~8–10 thin-stroke bronze/gold line glyphs (palm, minaret, scroll, star-ornament, majlis lamp, compass, book, seal, water channel, key). Use them, sparingly, to:

- Replace the current generic lucide icons on the Home "Pillars" / Foundation objectives lists.
- Mark section eyebrows on About, Foundation, Initiatives, Library.
- Anchor the four mobile tab-bar items with heritage-styled versions (still lucide fallback for a11y sizing).

Delivered as inline SVG React components in `src/components/site/glyphs/` so they inherit `currentColor` and respect the bronze/gold theme.

### 3. UI/UX polish pass

Per route, tighten what's already there — no restructuring:

- **Home**: promote the video → next-section transition (soft fade band already exists; add a paper-grain divider); tighten pillar cards' spacing; add subtle hover lift on the news preview cards.
- **About**: apply drop-cap to first paragraph of each major section; add margin numerals (I/II/III) to section headings using existing `SectionHeading` `index` prop.
- **Foundation**: convert the committees grid to a definition-list style hybrid so it reads as a document, not a card grid.
- **Family Tree / Directory**: improve empty-state and search feedback micro-copy; add hover on branch cards.
- **Achievers**: refine card typography hierarchy (name / role / year).
- **Initiatives (index + detail)**: hover motion on cards; stronger date/status treatment on detail.
- **News (index + detail)**: consistent kicker + date treatment; improve article typography (measure width, drop cap).
- **Library**: contact-sheet captions on hover; keyboard focus rings.
- **Contact / Contribute**: form field polish (focus ring, label spacing), success-state placeholder styling.
- **Global**: refine `ScrollReveal` timing (slightly slower, ease-out-quart), add a bronze rule under active nav item in header, improve mobile drawer type scale.

No changes to routing, data model, i18n keys, or business logic.

### 4. Verification

- `tsgo` typecheck clean.
- Visual check via Playwright screenshots at desktop + mobile on: `/`, `/about`, `/foundation`, `/family-tree`, `/initiatives`, `/news`, `/library`.
- Confirm no route regresses on light/dark and RTL/LTR.

## Out of scope

- New routes, new data schemas, new features.
- Any change to the hero video, header structure, or navigation IA (already settled).
- Copy rewrites beyond micro-copy on empty/loading states.

## Technical notes

- Image generation uses the agent-side `generate_image` tool (project files), fast tier for photographic plates, premium only if text/typography appears in the image. Transparent PNG for glyphs is not needed — glyphs are hand-authored SVG for crispness at any size and theme-color inheritance.
- All new images registered in `src/content/images.ts` / `initiative-images` / `news-images` maps so index and detail views cannot drift.
- Glyphs live in `src/components/site/glyphs/index.tsx` exporting named components; consumed via `<PalmGlyph className="h-4 w-4 text-bronze" />`.
- Motion changes stay within existing `ScrollReveal` + Tailwind utilities; no new animation library.
