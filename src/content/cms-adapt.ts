import type { BiText } from "@/i18n/LanguageProvider";
import type {
  AchieverRow,
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
  title: BiText;
  status: "ongoing" | "upcoming";
  summary: BiText;
  body: BiText;
};

export function mapInitiativeRow(row: InitiativeRow): InitiativeItem {
  return {
    slug: row.slug,
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    status: row.status === "ongoing" ? "ongoing" : "upcoming",
    summary: { ar: row.summary_ar ?? "", en: row.summary_en ?? row.summary_ar ?? "" },
    body: { ar: row.body_ar ?? "", en: row.body_en ?? row.body_ar ?? "" },
  };
}

export function mergeInitiatives(
  dbRows: InitiativeRow[],
  staticItems: InitiativeItem[],
): InitiativeItem[] {
  const dbItems = dbRows.map(mapInitiativeRow);
  const dbSlugs = new Set(dbItems.map((i) => i.slug));
  return [...dbItems, ...staticItems.filter((i) => !dbSlugs.has(i.slug))];
}

/* ----------------------------- achievers -------------------------------- */

export type AchieverItem = {
  name: BiText;
  field: BiText;
  achievement: BiText;
  category: string;
  branch: BiText;
  image: string;
};

const achieverImageFallback = "/images/achiever-executive.png";

export function mapAchieverRow(row: AchieverRow): AchieverItem {
  return {
    name: { ar: row.name_ar, en: row.name_en ?? row.name_ar },
    field: { ar: row.field_ar ?? "", en: row.field_en ?? row.field_ar ?? "" },
    achievement: {
      ar: row.achievement_ar ?? "",
      en: row.achievement_en ?? row.achievement_ar ?? "",
    },
    category: row.category,
    branch: { ar: row.branch_ar ?? "", en: row.branch_en ?? row.branch_ar ?? "" },
    image: row.image_path ?? achieverImageFallback,
  };
}

export function mergeAchievers(
  dbRows: AchieverRow[],
  staticItems: AchieverItem[],
): AchieverItem[] {
  const dbItems = dbRows.map(mapAchieverRow);
  const dbNames = new Set(dbItems.map((i) => i.name.ar));
  return [...dbItems, ...staticItems.filter((i) => !dbNames.has(i.name.ar))];
}

/* ------------------------------ library --------------------------------- */

export type LibraryDocument = {
  title: BiText;
  year: number;
  kind: string;
  ncnpRef: string;
  href?: string;
};

export type LibraryPhoto = {
  title: BiText;
  year: number;
  category: string;
};

export type LibraryVideo = {
  title: BiText;
  year: number;
  duration: string;
};

export type LibraryData = {
  documents: LibraryDocument[];
  photos: LibraryPhoto[];
  videos: LibraryVideo[];
};

function mapLibraryDocumentRow(row: LibraryRow): LibraryDocument {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    kind: row.kind ?? "",
    ncnpRef: row.reference ?? "",
    href: row.file_path ?? row.external_url ?? undefined,
  };
}

function mapLibraryPhotoRow(row: LibraryRow): LibraryPhoto {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    category: row.kind ?? "",
  };
}

function mapLibraryVideoRow(row: LibraryRow): LibraryVideo {
  return {
    title: { ar: row.title_ar, en: row.title_en ?? row.title_ar },
    year: row.year ?? 0,
    duration: row.kind ?? "",
  };
}

/**
 * `collection` on the DB row maps onto the three tabs the library page
 * already renders: "documents" -> Documents & Bylaws, "publications" ->
 * Photographs, "media" -> Recordings.
 */
export function mergeLibrary(
  dbRows: LibraryRow[],
  staticItems: LibraryData,
): LibraryData {
  const documentRows = dbRows.filter((r) => r.collection === "documents");
  const photoRows = dbRows.filter((r) => r.collection === "publications");
  const videoRows = dbRows.filter((r) => r.collection === "media");

  const dbDocuments = documentRows.map(mapLibraryDocumentRow);
  const dbPhotos = photoRows.map(mapLibraryPhotoRow);
  const dbVideos = videoRows.map(mapLibraryVideoRow);

  const docKeys = new Set(dbDocuments.map((d) => d.title.ar));
  const photoKeys = new Set(dbPhotos.map((p) => p.title.ar));
  const videoKeys = new Set(dbVideos.map((v) => v.title.ar));

  return {
    documents: [
      ...dbDocuments,
      ...staticItems.documents.filter((d) => !docKeys.has(d.title.ar)),
    ],
    photos: [...dbPhotos, ...staticItems.photos.filter((p) => !photoKeys.has(p.title.ar))],
    videos: [...dbVideos, ...staticItems.videos.filter((v) => !videoKeys.has(v.title.ar))],
  };
}
