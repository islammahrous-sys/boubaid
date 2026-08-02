# Adopt the official logo and brand palette

The uploaded brand sheet gives two things: the official Arabic calligraphic wordmark ("مجلس أسرة آل بوعبيد") in gold and in cream/white, and a fixed colour palette. The site currently uses its own bronze/gold/sepia tokens and placeholder logo files, so both need to be replaced with the official identity.

## Brand palette from the sheet

```text
#8B5433  clay brown        primary brand brown
#78462A  deep brown        dark surfaces, footer, headings
#BE744A  copper            secondary accent
#FDE7D6  cream             page background / light surface
#26583C  heritage green    supporting accent (endowment, success)
#E6EAF0  cool grey         neutral surface, borders
#EDA746  brand gold        the logo gold; used sparingly as a seal
```

## What changes

1. **Logo** — register the gold wordmark and the cream/white wordmark from the brand sheet as site assets and use them in place of the current `logo-brown` / `logo-gold` files:
   - Header: gold wordmark on light theme, cream wordmark on dark theme, sized so the Arabic calligraphy stays legible; the wordmark already contains the family name, so the stacked text lockup next to it is trimmed to just the English/Arabic subtitle line.
   - Footer, hero emblem, and the seal/watermark elements switch to the same wordmark.
   - Favicon regenerated from the gold mark.
2. **Colour tokens** — rewrite the heritage palette in `src/styles.css` to the seven brand colours (light and dark themes), keeping the existing token names (`gold`, `bronze`, `ink`, `paper`, `emerald`, …) so no component has to change. Mapping: brand gold → `gold`, clay/copper → `bronze`, deep brown → `ink`, cream → `paper`/`ivory`, heritage green → `emerald`, cool grey → `rule`/`border`.
3. **Contrast pass** — cream backgrounds with deep-brown text, dark theme on deep brown with cream text; check the header registration strip, buttons, badges, and form focus rings still meet AA and fix any that read low after the swap.
4. **Sweep for stragglers** — grep for hardcoded brown/gold/navy hex or utility values across routes and components and route them through the tokens.

Existing imagery stays as-is; the new palette is warm-brown-and-gold, which the current editorial photography already sits well against.

## Technical notes

- Wordmark images are extracted from the PDF and registered via the asset CLI, then imported as ES module pointers; the favicon stays a real file in `public/`.
- Token edits are confined to the `@theme` block and `:root` / `.dark` blocks of `src/styles.css`, expressed in oklch to match the current file's convention.
- No content, routing, or data changes.
