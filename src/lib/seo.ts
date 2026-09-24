
const DEFAULT_BASE_URL = "https://alboabid-heritage-hub.lovable.app";

export function getBaseUrl(): string {
  const envUrl =
    typeof import.meta !== "undefined" && import.meta.env
      ? (import.meta.env.VITE_SITE_URL as string | undefined)
      : undefined;
  const processUrl =
    typeof process !== "undefined" && process.env
      ? process.env.VITE_SITE_URL || process.env.SITE_URL
      : undefined;
  const raw = envUrl || processUrl || DEFAULT_BASE_URL;
  return raw.replace(/\/+$/, "");
}

export function getCanonicalUrl(path = ""): string {
  const base = getBaseUrl();
  const cleanPath = path.startsWith("/") ? path : `/${path}`;
  return cleanPath === "/" ? base : `${base}${cleanPath}`;
}
