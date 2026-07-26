/**
 * An official mark — a ring of small text around a centred emblem, in the
 * manner of a certifying stamp on a charter. Used once per page at most;
 * it reads as a seal precisely because it is rare.
 */
export function Seal({
  ringText,
  centerLine1,
  centerLine2,
  className,
}: {
  /** Short label repeated around the ring, e.g. the issuing authority. */
  ringText: string;
  centerLine1: string;
  centerLine2?: string;
  className?: string;
}) {
  const ringId = "seal-ring-path";

  return (
    <svg
      viewBox="0 0 160 160"
      className={className}
      role="img"
      aria-label={`${ringText} — ${centerLine1}${centerLine2 ? ` ${centerLine2}` : ""}`}
    >
      <defs>
        <path id={ringId} d="M 80,80 m -62,0 a 62,62 0 1,1 124,0 a 62,62 0 1,1 -124,0" />
      </defs>

      <circle cx="80" cy="80" r="75" fill="none" stroke="currentColor" strokeWidth="1" />
      <circle cx="80" cy="80" r="68" fill="none" stroke="currentColor" strokeWidth="0.75" />
      <circle cx="80" cy="80" r="44" fill="none" stroke="currentColor" strokeWidth="0.75" />

      <text fill="currentColor" fontSize="8.5" letterSpacing="2.5" fontWeight="600">
        <textPath href={`#${ringId}`} startOffset="50%" textAnchor="middle">
          {ringText}
        </textPath>
      </text>

      {/* Eight-point star — the same geometric device used as `ornament-star`
          elsewhere on the site, redrawn inline since SVG cannot apply a CSS
          mask-image utility to itself. */}
      <path
        d="M80 66 L83.06 71.88 L89.6 69.6 L87.32 76.14 L92 80 L86.68 81.86 L88.32 87.54 L82.66 85.76 L80 91 L77.34 85.76 L71.68 87.54 L73.32 81.86 L68 80 L72.68 76.14 L70.4 69.6 L76.94 71.88 Z"
        fill="currentColor"
        opacity="0.85"
      />

      <text x="80" y="103" textAnchor="middle" fill="currentColor" fontSize="9" fontWeight="700">
        {centerLine1}
      </text>
      {centerLine2 ? (
        <text x="80" y="114" textAnchor="middle" fill="currentColor" fontSize="7.5" opacity="0.8">
          {centerLine2}
        </text>
      ) : null}
    </svg>
  );
}
