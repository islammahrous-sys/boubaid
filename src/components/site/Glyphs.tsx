import type { SVGProps } from "react";
import { cn } from "@/lib/utils";

/**
 * Heritage glyph set — hand-drawn thin-stroke SVG marks.
 *
 * All glyphs use `currentColor` so they inherit `text-bronze`,
 * `text-gold`, or `text-muted-foreground` from their parent. Line
 * weight is deliberately hairline (1.25px on a 24 viewBox) to sit
 * with Naskh Arabic type rather than compete with it.
 */

type GlyphProps = SVGProps<SVGSVGElement>;

function base(props: GlyphProps) {
  return {
    xmlns: "http://www.w3.org/2000/svg",
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.25,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
    ...props,
    className: cn("shrink-0", props.className),
  };
}

/** Date palm — the family's landscape and its earliest endowment asset. */
export function PalmGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 22V11" />
      <path d="M12 11c-2-3-5-3.5-7-3 .5 2 3 4 7 3z" />
      <path d="M12 11c2-3 5-3.5 7-3-.5 2-3 4-7 3z" />
      <path d="M12 10c-1.5-3-1-6 0-8 1 2 1.5 5 0 8z" />
      <path d="M12 11c-2-1-4-.5-6 .5 1.5 1.5 4 2 6 .5z" />
      <path d="M12 11c2-1 4-.5 6 .5-1.5 1.5-4 2-6 .5z" />
      <path d="M10 22h4" />
    </svg>
  );
}

/** Scroll / deed — for archive, library, and records marks. */
export function ScrollGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M6 4h11a2 2 0 0 1 2 2v11" />
      <path d="M17 20H7a2 2 0 0 1-2-2V6a2 2 0 0 1 4 0v14" />
      <path d="M9 8h6M9 12h6M9 16h4" />
    </svg>
  );
}

/** Seal / stamp — for official notices and governance. */
export function SealGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="8" />
      <circle cx="12" cy="12" r="5" />
      <path d="M12 4v2M12 18v2M4 12h2M18 12h2" />
      <path d="m9 12 2 2 4-4" />
    </svg>
  );
}

/** Star ornament — matches the site's existing star-and-rule motif. */
export function StarGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3l1.6 5.2H19l-4.3 3.2 1.6 5.2L12 13.4l-4.3 3.2 1.6-5.2L5 8.2h5.4z" />
    </svg>
  );
}

/** Majlis lamp — for hospitality, gatherings, Ramadan programmes. */
export function LampGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M12 3v2" />
      <path d="M8 5h8l-1.5 4h-5z" />
      <path d="M9 9c-1 2-1 4 0 5.5C10 16 14 16 15 14.5c1-1.5 1-3.5 0-5.5" />
      <path d="M10 15v3a2 2 0 0 0 4 0v-3" />
      <path d="M8 21h8" />
    </svg>
  );
}

/** Bound book — for library and publications. */
export function BookGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M4 4.5A1.5 1.5 0 0 1 5.5 3H19a1 1 0 0 1 1 1v15a1 1 0 0 1-1 1H5.5A1.5 1.5 0 0 1 4 18.5z" />
      <path d="M4 18.5A1.5 1.5 0 0 1 5.5 17H20" />
      <path d="M8 7h8M8 11h8" />
    </svg>
  );
}

/** Water channel (falaj) — for the Ahsa oasis endowments. */
export function ChannelGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <path d="M3 8c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
      <path d="M3 14c2 0 2 2 4 2s2-2 4-2 2 2 4 2 2-2 4-2" />
    </svg>
  );
}

/** Compass rose — for direction, mission, and the diaspora map. */
export function CompassGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="12" cy="12" r="9" />
      <path d="m12 3 1 3-1 3-1-3z" />
      <path d="m12 21-1-3 1-3 1 3z" />
      <path d="m3 12 3-1 3 1-3 1z" />
      <path d="m21 12-3-1-3 1 3 1z" />
      <circle cx="12" cy="12" r="1" />
    </svg>
  );
}

/** Key — for membership, records, family register. */
export function KeyGlyph(props: GlyphProps) {
  return (
    <svg {...base(props)}>
      <circle cx="8" cy="15" r="4" />
      <path d="M10.8 12.2 21 3" />
      <path d="m18 6 2 2M15 9l2 2" />
    </svg>
  );
}

export const glyphs = {
  palm: PalmGlyph,
  scroll: ScrollGlyph,
  seal: SealGlyph,
  star: StarGlyph,
  lamp: LampGlyph,
  book: BookGlyph,
  channel: ChannelGlyph,
  compass: CompassGlyph,
  key: KeyGlyph,
} as const;

export type GlyphName = keyof typeof glyphs;
