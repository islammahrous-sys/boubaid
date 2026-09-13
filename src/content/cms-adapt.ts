import type { BiText } from "@/i18n/LanguageProvider";
import type {
  AchieverRow,
  BranchRow,
  InitiativeRow,
  LibraryRow,
  NewsRow,
} from "@/lib/cms.functions";

/**
 * Adapter layer between the admin-managed CMS rows (Supabase) and the
 * exact shapes the public pages already consume from `src/content/site.ts`.
 *
 * Rule for every merge helper below: DB rows come first (already ordered by
 * the server function), and any static entry sharing the same identifying
 * key (slug, or name/title text) is dropped in favour of the DB row.
 */

/* ------------------------------- news --------------------------------- */

export type NewsItem = {
  slug: string;
  date: string;
  dateGregorian: string;
  section: "fund" | "family";
  title: BiText;
  excerpt: BiText;
  body: BiText;
  /** Uploaded cover, when the editor attached one. */
  image?: string;
};

export function mapNewsRow(row: NewsRow): NewsItem {
  return {
    slug: row.slug,
    date: row.hijri_date ?? "",
    dateGregorian: row.gregorian_date ?? "",
    section: row.section === "family" ? "family" : "fund",
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    excerpt: { ar: row.excerpt_ar ?? "", en: row.excerpt_en ?? row.excerpt_ar ?? "" },
    body: { ar: row.body_ar ?? "", en: row.body_en ?? row.body_ar ?? "" },
    image: row.cover_url ?? undefined,
  };
}

export function mergeNews(dbRows: NewsRow[], staticItems: NewsItem[]): NewsItem[] {
  const dbItems = dbRows.map(mapNewsRow);
  const dbSlugs = new Set(dbItems.map((i) => i.slug));
  return [...dbItems, ...staticItems.filter((i) => !dbSlugs.has(i.slug))];
}

/* ---------------------------- initiatives ------------------------------ */

export type InitiativeItem = {
  slug: string;
  /** "project" for المشاريع, "program" for البرامج. */
  kind?: "project" | "program";
  title: BiText;
  /**
   * "upcoming" is this app's public-facing label for the DB's "planned"
   * status (kept for compatibility with the static fallback content in
   * content/site.ts, which predates the DB-backed "completed" state).
   */
  status: "ongoing" | "upcoming" | "completed";
  summary: BiText;
  body: BiText;
  /** Uploaded cover, when the editor attached one. */
  image?: string;
};

export function mapInitiativeRow(row: InitiativeRow): InitiativeItem {
  return {
    slug: row.slug,
    kind: row.kind === "program" ? "program" : "project",
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    status:
      row.status === "ongoing" ? "ongoing" : row.status === "completed" ? "completed" : "upcoming",
    summary: { ar: row.summary_ar ?? "", en: row.summary_en ?? row.summary_ar ?? "" },
    body: { ar: row.body_ar ?? "", en: row.body_en ?? row.body_ar ?? "" },
    image: row.cover_url ?? undefined,
  };
}

export function mergeInitiatives(
  dbRows: InitiativeRow[],
  staticItems: InitiativeItem[],
): InitiativeItem[] {
  // البرامج live in the same table under kind = "program" and have their own
  // page (/programs); المشاريع pages must not list them.
  const dbItems = dbRows.filter((r) => r.kind !== "program").map(mapInitiativeRow);
  const dbSlugs = new Set(dbItems.map((i) => i.slug));
  return [...dbItems, ...staticItems.filter((i) => !dbSlugs.has(i.slug))];
}

/* ----------------------------- achievers -------------------------------- */

export type AchieverItem = {
  id: string;
  name: BiText;
  field: BiText;
  achievement: BiText;
  category: string;
  branch: BiText;
  image: string;
  section: "family_competency" | "excellence_award";
  awardYear?: string;
  sortOrder: number;
};

const achieverImageFallback = "/images/achiever-executive.png";

export function mapAchieverRow(row: AchieverRow): AchieverItem {
  return {
    id: row.id,
    name: { ar: row.name_ar, en: row.name_en ?? row.name_ar },
    field: { ar: row.field_ar ?? "", en: row.field_en ?? row.field_ar ?? "" },
    achievement: {
      ar: row.achievement_ar ?? "",
      en: row.achievement_en ?? row.achievement_ar ?? "",
    },
    category: row.category,
    branch: { ar: row.branch_ar ?? "", en: row.branch_en ?? row.branch_ar ?? "" },
    image: row.image_url ?? achieverImageFallback,
    section: row.section,
    awardYear: row.award_year ?? undefined,
    sortOrder: row.sort_order,
  };
}

/* ------------------------------ library --------------------------------- */

export type LibraryDocument = {
  title: BiText;
  year: number;
  kind: string;
  ncnpRef: string;
  href?: string;
  description?: BiText;
};

export type LibraryPhoto = {
  title: BiText;
  year: number;
  category: string;
  image?: string;
  description?: BiText;
};

export type LibraryVideo = {
  title: BiText;
  year: number;
  duration: string;
  href?: string;
  description?: BiText;
};

export type LibraryData = {
  documents: LibraryDocument[];
  photos: LibraryPhoto[];
  videos: LibraryVideo[];
};

const bi = (ar: string | null, en: string | null): BiText | undefined =>
  ar || en ? { ar: ar ?? en ?? "", en: en ?? ar ?? "" } : undefined;

/** Uploaded file wins; an external link is the fallback. */
const libraryHref = (row: LibraryRow) => row.file_url ?? row.external_url ?? undefined;

function mapLibraryDocumentRow(row: LibraryRow): LibraryDocument {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    kind: row.kind ?? "",
    ncnpRef: row.reference ?? "",
    href: libraryHref(row),
    description: bi(row.description_ar, row.description_en),
  };
}

function mapLibraryPhotoRow(row: LibraryRow): LibraryPhoto {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    category: row.kind ?? "",
    image: libraryHref(row),
    description: bi(row.description_ar, row.description_en),
  };
}

function mapLibraryVideoRow(row: LibraryRow): LibraryVideo {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    duration: row.kind ?? "",
    href: libraryHref(row),
    description: bi(row.description_ar, row.description_en),
  };
}

/**
 * `collection` on the DB row maps onto the three tabs the library page
 * already renders: "documents" -> Documents & Bylaws, "photographs" ->
 * Photographs, "recordings" -> Recordings. These three values are exactly
 * what the admin console's Library form (LibraryItemsManager) lets an
 * editor pick, so this mapping must stay in lockstep with that form.
 */
export function mergeLibrary(dbRows: LibraryRow[], staticItems: LibraryData): LibraryData {
  const documentRows = dbRows.filter((r) => r.collection === "documents");
  const photoRows = dbRows.filter((r) => r.collection === "photographs");
  const videoRows = dbRows.filter((r) => r.collection === "recordings");

  const dbDocuments = documentRows.map(mapLibraryDocumentRow);
  const dbPhotos = photoRows.map(mapLibraryPhotoRow);
  const dbVideos = videoRows.map(mapLibraryVideoRow);

  const docKeys = new Set(dbDocuments.map((d) => d.title.ar));
  const photoKeys = new Set(dbPhotos.map((p) => p.title.ar));
  const videoKeys = new Set(dbVideos.map((v) => v.title.ar));

  return {
    documents: [...dbDocuments, ...staticItems.documents.filter((d) => !docKeys.has(d.title.ar))],
    photos: [...dbPhotos, ...staticItems.photos.filter((p) => !photoKeys.has(p.title.ar))],
    videos: [...dbVideos, ...staticItems.videos.filter((v) => !videoKeys.has(v.title.ar))],
  };
}

/* ------------------------------ branches --------------------------------- */

export type BranchItem = {
  slug: string;
  name: BiText;
  description: BiText;
  elder: BiText;
  image?: string;
};

export function mapBranchRow(row: BranchRow): BranchItem {
  return {
    slug: row.slug,
    name: { ar: row.name_ar, en: row.name_en ?? row.name_ar },
    description: {
      ar: row.description_ar ?? "",
      en: row.description_en ?? row.description_ar ?? "",
    },
    elder: { ar: row.elder_ar ?? "", en: row.elder_en ?? row.elder_ar ?? "" },
    image: row.image_url ?? undefined,
  };
}

export function mergeBranches<T extends { slug: string }>(
  dbRows: BranchRow[],
  staticItems: T[],
): (BranchItem | T)[] {
  const dbItems = dbRows.map(mapBranchRow);
  const dbSlugs = new Set(dbItems.map((b) => b.slug));
  return [...dbItems, ...staticItems.filter((b) => !dbSlugs.has(b.slug))];
}
