# UI/UX enhancement pass — beyond motion

The motion and visual layers are in place: a shared duration/easing scale, five reveal
variants applied across all pages, condensing masthead, page transitions, plate hovers.
So the remaining gains are not more animation — they are wayfinding, reading comfort,
usable data, and accessibility. That is where the site still feels like a set of long
documents rather than a navigable archive.

## Where it falls short today

- The long pages carry a lot of content in one scroll (Library, Home, Foundation, DNA,
  Family Tree, About) with no in-page navigation, so there is no sense of position.
- Deep pages have no breadcrumb and no "related" exits — a news article or initiative is
  a dead end.
- The archive lists (library documents, photographs, news, achievers, directory) have no
  filtering or sorting beyond what search offers, and no result counts.
- Photographs open nothing — there is no lightbox for the archive plates.
- Empty and loading states are minimal, and the contact form gives only a toast.
- Bilingual/RTL details: number and Hijri date formatting is inconsistent, and switching
  language does not preserve reading position.
- Accessibility: no skip-to-content link, focus rings are inconsistent on custom
  controls, some icon-only buttons lack labels, and dark-mode contrast has not been
  audited.

## Planned work

**1. Wayfinding**
- Sticky in-page section rail on the long pages (About, Foundation, DNA, Library,
  Family Tree) — bilingual labels, current-section highlight, collapses to a compact
  chip row on mobile.
- Breadcrumbs on detail routes (News, Initiatives) matching the editorial type scale.
- "Continue reading" blocks: next/previous article and 2–3 related initiatives or
  documents at the end of each detail page.
- Thin reading-progress rule under the masthead on article routes only.

**2. Archive usability**
- Filter and sort controls for Library (kind, decade, ascending/descending), News (year,
  category) and Achievers (branch, field), with live result counts and a clear-all.
- Filter state reflected in the URL so views are shareable and survive reload.
- Photograph lightbox: keyboard navigable (arrows, Escape), caption and Hijri metadata,
  focus trapped and restored, respecting reduced motion.
- Better empty states — an explanatory bilingual message plus a reset action instead of a
  bare "no results".

**3. Reading comfort**
- Consistent numeral and Hijri/Gregorian date formatting through one shared helper, used
  everywhere.
- Measure and hyphenation tuned per script — Arabic and English need different line
  lengths for the same comfort.
- Pull quotes, footnote markers and source citations styled as part of the editorial
  scale rather than ad-hoc.
- Language switch preserves the scroll anchor so the reader stays on the same section.

**4. Interaction feedback**
- Contact and contribute forms: inline per-field validation with bilingual messages,
  disabled/pending button state, and a persistent success panel rather than a toast that
  disappears.
- Copy-to-clipboard on the IBAN, email and phone with confirmation.
- Skeleton placeholders sized to the real content for the family-tree and directory
  searches so the layout does not jump.

**5. Accessibility and polish**
- Skip-to-content link, a single `<main>` landmark check, and a heading-level audit per
  page.
- Uniform `focus-visible` treatment on every custom control; `aria-label` on all
  icon-only buttons; minimum 44px tap targets on mobile.
- Dark-mode contrast audit across brand clay/copper/gold on dark surfaces, fixing any
  token pair that fails.
- Print stylesheet so lineage, DNA and foundation pages print as clean documents — a
  real need for an archive of this kind.

## Technical notes

- All additions use the existing tokens in `src/styles.css` and the current reveal
  utilities — no new colors, fonts or animation libraries.
- The section rail, lightbox and filter controls become small components under
  `src/components/site/`, kept presentational so page content stays in `src/content/*.ts`.
- Filters use TanStack Router search params with validation, so SSR and OG metadata on
  public routes are unaffected.
- Formatting helpers extend `src/lib/text.ts`; the lightbox and rail are client-only where
  they touch layout measurement, to avoid hydration mismatches.

## Suggested order

Wayfinding first (biggest perceived change), then archive usability, then reading comfort
and forms, with the accessibility and print pass last as a sweep across everything.
