# Craft pass: motion, interaction, and finish

Goal: make the site read as if a print-trained designer hand-tuned every screen — motion that feels physical, transitions that feel edited, details that reward a second look. No new features, no content changes.

## Where it currently falls short

- Scroll reveals are only wired into 4 of 14 pages (home, about, foundation, and the engine itself). Ten pages — news, library, DNA, achievers, branches, directory, initiatives, contact, contribute, family tree — appear instantly with no entrance at all, so navigating between pages feels inconsistent.
- Route changes are a hard cut: no page transition, no scroll reset choreography.
- Reveal timing is one fixed curve with fixed 80ms steps regardless of element size, so large plates animate at the same speed as small labels.
- Interaction states are limited to `hover-lift` and a shared focus ring: no press feedback on cards, no hover states on figures, images pop in un-faded once loaded.
- No motion primitives beyond CSS keyframes — nothing to coordinate sequenced or gesture-driven motion.

## The work

### 1. Motion system (foundation)

Define a small named set of durations and easings as CSS variables in `src/styles.css` — `--ease-editorial`, `--ease-exit`, and duration steps (quick 180ms / normal 320ms / slow 560ms / cinematic 900ms) — and refactor existing animations to consume them so nothing is a magic number anymore. Add reveal variants: `reveal-fade` (opacity only, for text), `reveal-rise` (current), `reveal-plate` (slower, slight scale, for images and framed figures), and `reveal-rule` (hairline rules that draw open horizontally). Each variant gets its own duration from the scale, so a heavy plate moves slower than a caption.

### 2. Reveal coverage on every page

Apply the reveal variants across all ten uncovered routes, section by section, matching variant to element weight. Section heading + rule + body + figure become a short choreographed sequence rather than one block fade. Extend the stagger delays to support grids (currently caps at 8 children; library and directory have far more) using an index-driven delay via CSS custom property instead of long `nth-child` chains.

### 3. Page transitions

Add a route-level transition wrapper: content fades and lifts out on exit, in on enter, with a shorter exit than enter so navigation feels decisive. Coordinate with scroll-to-top so the new page enters from the top rather than mid-scroll. Header stays fixed and does not participate in the transition.

### 4. Interaction craft

- Cards and list rows: hairline border warms to bronze on hover, plate frame inset shifts, caption slides up 2px — no scale bounce.
- Press feedback (`active-scale`) on every clickable card and button.
- Images: fade in from a paper-toned placeholder on load so plates resolve like a print emerging, instead of flashing.
- Links in prose: the existing underline sweep applied consistently.
- Nav: active-state underline animates between items rather than jumping; mobile nav panel gets a staggered item entrance.
- Buttons and CTAs: gold seal accents get a slow breathing highlight on hover only.

### 5. Typographic and layout finish

- Consistent section rhythm: audit vertical spacing across pages so section padding comes from one scale.
- Optical fixes: hanging punctuation and balanced headline wrapping (`text-wrap: balance` on h1/h2, `pretty` on paragraphs).
- Figure captions unified into one component so every plate is presented identically.
- Numbers everywhere use the existing `nums` tabular utility (currently applied unevenly).

### 6. Accessibility and performance guardrails

- Every new motion respects `prefers-reduced-motion`: reveals resolve to visible, page transitions become instant, breathing stops.
- Reveal transforms stay on opacity/transform only; `will-change` cleared after reveal so long pages don't hold GPU layers.
- Focus order unaffected by transitions; focus ring never animated away.

## Technical notes

- Motion stays CSS-driven plus the existing `IntersectionObserver` engine in `src/components/site/ScrollReveal.tsx`, extended to handle the new variants and set per-element stagger index. No animation library added — the current approach is lighter and already RTL-safe, which matters since transforms must mirror direction.
- Page transitions hook into TanStack Router's resolved-route subscription already used by `ScrollReveal`, applied in `src/routes/__root.tsx` around `<Outlet />`.
- Touched files: `src/styles.css`, `src/components/site/ScrollReveal.tsx`, `src/routes/__root.tsx`, `Header.tsx`, `MobileNav.tsx`, `Editorial.tsx`, `PageHeader.tsx`, and all route files for class application. No data, content, or routing changes.

## Suggested order

1 → 2 → 3 first (the visible, structural half), then 4 → 5 as the detail pass, with 6 verified at the end across light, dark, Arabic RTL, and English LTR.
