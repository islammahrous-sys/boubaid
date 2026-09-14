import { ExternalLink } from "lucide-react";
import { useLang } from "@/i18n/LanguageProvider";
import { cn } from "@/lib/utils";

export interface InstagramReelEmbedProps {
  /** Public Instagram reel/post URL, e.g. https://www.instagram.com/reel/CmW1QtUKSW2/ */
  url: string;
  /** Accessible / visible title shown under the player. */
  title: string;
  subtitle?: string | null;
  className?: string;
}

/**
 * Official Instagram embed for a reel.
 *
 * The reel is rendered directly in an `/embed` iframe, so the video itself is
 * visible on page load (no thumbnail-only card, no "open" step). Playback,
 * looping and audio are owned by Instagram inside its cross-origin player:
 * the parent page cannot legitimately drive them, so we expose Instagram's own
 * player controls (which include mute/unmute) rather than a decorative
 * control that would do nothing, and offer a direct link to Instagram for
 * full-screen viewing with sound.
 */
export function InstagramReelEmbed({ url, title, subtitle, className }: InstagramReelEmbedProps) {
  const { lang } = useLang();
  const rtl = lang === "ar";
  const shortcode = extractShortcode(url);
  if (!shortcode) return null;
  const embedSrc = `https://www.instagram.com/reel/${shortcode}/embed/`;

  return (
    <figure
      className={cn(
        "flex flex-col overflow-hidden rounded border border-border bg-card shadow-sm",
        className,
      )}
    >
      <div className="relative w-full bg-secondary/40">
        {/* Instagram's embed viewport is portrait; the ratio keeps the reel
            uncropped and inside the container on every screen size. */}
        <div className="mx-auto w-full max-w-[420px] aspect-[9/14]">
          <iframe
            src={embedSrc}
            title={title}
            loading="lazy"
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
            allowFullScreen
            scrolling="no"
            className="h-full w-full border-0"
          />
        </div>
      </div>
      <figcaption className="flex flex-col gap-1.5 p-4">
        <h3 className="break-words text-base font-bold leading-snug text-foreground">{title}</h3>
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-1 inline-flex items-center gap-1.5 self-start border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
        >
          {rtl ? "مشاهدة المقطع على إنستغرام" : "Watch on Instagram"}
          <ExternalLink className="h-3.5 w-3.5" aria-hidden="true" />
        </a>
      </figcaption>
    </figure>
  );
}

/** Accepts reel/reels/p URLs and bare shortcodes; ignores anything unsafe. */
function extractShortcode(url: string): string | null {
  const match = url.match(/instagram\.com\/(?:reel|reels|p|tv)\/([A-Za-z0-9_-]+)/i);
  if (match?.[1]) return match[1];
  return /^[A-Za-z0-9_-]{5,}$/.test(url.trim()) ? url.trim() : null;
}
