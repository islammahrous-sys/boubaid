import { createServerFn } from "@tanstack/react-start";

export type ServiceCategory = "family" | "establishment";

export type ServiceDocument = {
  id: string;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  /** Ready-to-view URL for the in-app viewer. */
  url: string | null;
};

export type PublicService = {
  id: string;
  slug: string;
  category: ServiceCategory;
  title_ar: string;
  title_en: string | null;
  description_ar: string | null;
  description_en: string | null;
  sort_order: number;
  documents: ServiceDocument[];
};

/**
 * Published service catalogue for "خدمات أفراد الأسرة وخدمات المنشآت", with the
 * documents each service carries. Documents are attached through
 * `documents.service_id`, so anything an administrator uploads later shows up
 * here automatically without a code change.
 */
export const getPublicServices = createServerFn({ method: "GET" }).handler(
  async (): Promise<PublicService[]> => {
    try {
      const { createPublicServerClient } = await import("./supabase-public.server");
      const supabase = createPublicServerClient();

      const [servicesRes, docsRes] = await Promise.all([
        supabase
          .from("services")
          .select("id, slug, category, title_ar, title_en, description_ar, description_en, sort_order")
          .eq("is_published", true)
          .order("sort_order", { ascending: true }),
        supabase
          .from("documents")
          .select("id, service_id, title_ar, title_en, description_ar, description_en, file_path")
          .eq("status", "published")
          .eq("visibility", "public")
          .not("service_id", "is", null)
          .order("created_at", { ascending: true }),
      ]);

      if (servicesRes.error) {
        console.error("[services] read failed", servicesRes.error.message);
        return [];
      }

      const docs = docsRes.error ? [] : (docsRes.data ?? []);
      const { signContentPaths, resolveMedia } = await import("./content-media.server");
      const signed = await signContentPaths(docs.map((d) => d.file_path));

      return (servicesRes.data ?? []).map((s) => ({
        id: s.id,
        slug: s.slug,
        category: (s.category === "family" ? "family" : "establishment") as ServiceCategory,
        title_ar: s.title_ar,
        title_en: s.title_en,
        description_ar: s.description_ar,
        description_en: s.description_en,
        sort_order: s.sort_order,
        documents: docs
          .filter((d) => d.service_id === s.id)
          .map((d) => ({
            id: d.id,
            title_ar: d.title_ar,
            title_en: d.title_en,
            description_ar: d.description_ar,
            description_en: d.description_en,
            url: resolveMedia(d.file_path, signed),
          })),
      }));
    } catch (err) {
      console.error("[services] getPublicServices error", err);
      return [];
    }
  },
);
