import { getPublishedBusinesses } from "@/lib/directory.functions";
import { getPublicServices } from "@/lib/services-public.functions";
import { ServiceCatalogue } from "@/components/site/ServiceCatalogue";
import {
  ShieldCheck,
  Search,
  ExternalLink,
  Phone,
  Building2,
  MapPin,
  GitBranch,
  Copy,
  Share2,
  MessageCircle,
  LayoutGrid,
  List,
  Briefcase,
  Stethoscope,
  Code,
  Utensils,
  Store,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Globe,
  X,
  Compass,
  Building,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { branches } from "@/content/site";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState, useEffect } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";

import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import QRCode from "qrcode";
import { copy } from "@/content/page-copy/directory";
import { inl } from "@/content/page-copy/directory-inline";

export const Route = createFileRoute("/directory")({
  loader: async () => {
    const [liveBiz, services] = await Promise.all([getPublishedBusinesses(), getPublicServices()]);
    return { liveBusinesses: liveBiz, services };
  },
  head: () => ({
    meta: [
      { title: "خدمات افراد الأسرة و خدمات المنشأت – اسرتي تنتج | آل بوعبيد" },
      {
        name: "description",
        content:
          "خدمات أفراد أسرة آل بوعبيد وخدمات المنشآت العائلية: الاستشارات القانونية والمحاسبية والتعليمية، وخدمات الأعمال والمواقع الإلكترونية وشجرات العائلة.",
      },
      {
        property: "og:title",
        content: "خدمات افراد الأسرة و خدمات المنشأت – اسرتي تنتج | آل بوعبيد",
      },
      {
        property: "og:description",
        content: "دليل خدمات أفراد أسرة آل بوعبيد وخدمات المنشآت العائلية المعتمدة.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/directory") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/directory") }],
  }),
  component: DirectoryPage,
});

type BusinessItem = {
  id: string;
  name: BiText;
  category: BiText;
  city: BiText;
  description: BiText;
  ownerBranch: BiText;
  contact: string;
  website: string;
};

function getSectorIcon(categoryName: string) {
  const cat = categoryName.toLowerCase();
  if (
    cat.includes("عقار") ||
    cat.includes("بناء") ||
    cat.includes("مقاول") ||
    cat.includes("estate") ||
    cat.includes("construction")
  ) {
    return Building2;
  }
  if (
    cat.includes("هندس") ||
    cat.includes("استشار") ||
    cat.includes("engineering") ||
    cat.includes("consult")
  ) {
    return Compass;
  }
  if (
    cat.includes("طب") ||
    cat.includes("صح") ||
    cat.includes("عياد") ||
    cat.includes("medical") ||
    cat.includes("health")
  ) {
    return Stethoscope;
  }
  if (
    cat.includes("تقن") ||
    cat.includes("برمج") ||
    cat.includes("معلومات") ||
    cat.includes("tech") ||
    cat.includes("software")
  ) {
    return Code;
  }
  if (
    cat.includes("غذا") ||
    cat.includes("طعام") ||
    cat.includes("مطعم") ||
    cat.includes("مخبز") ||
    cat.includes("food") ||
    cat.includes("hospitality")
  ) {
    return Utensils;
  }
  if (
    cat.includes("تجار") ||
    cat.includes("تجزئ") ||
    cat.includes("بيع") ||
    cat.includes("retail") ||
    cat.includes("store")
  ) {
    return Store;
  }
  return Briefcase;
}

function getSectorBadgeColor(categoryName: string) {
  const cat = categoryName.toLowerCase();
  if (cat.includes("عقار") || cat.includes("بناء") || cat.includes("مقاول"))
    return "bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20";
  if (cat.includes("هندس") || cat.includes("استشار"))
    return "bg-blue-500/10 text-blue-600 dark:text-blue-400 border-blue-500/20";
  if (cat.includes("طب") || cat.includes("صح"))
    return "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20";
  if (cat.includes("تقن") || cat.includes("برمج"))
    return "bg-purple-500/10 text-purple-600 dark:text-purple-400 border-purple-500/20";
  if (cat.includes("غذا") || cat.includes("مطعم"))
    return "bg-orange-500/10 text-orange-600 dark:text-orange-400 border-orange-500/20";
  if (cat.includes("تجار") || cat.includes("تجزئ"))
    return "bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20";
  return "bg-primary/10 text-primary border-primary/20";
}

function cleanPhoneForWhatsApp(phone: string): string {
  let cleaned = phone.replace(/[^0-9+]/g, "");
  if (cleaned.startsWith("05")) {
    cleaned = "966" + cleaned.slice(1);
  } else if (cleaned.startsWith("5")) {
    cleaned = "966" + cleaned;
  } else if (cleaned.startsWith("+")) {
    cleaned = cleaned.slice(1);
  }
  return cleaned;
}

function DirectoryPage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { liveBusinesses, services } = Route.useLoaderData();

  const [activeTab, setActiveTab] = useState("members");

  // Deep links from the "Services" dropdown: #family-services / #establishment-services
  useEffect(() => {
    const applyHash = () => {
      const hash = window.location.hash.replace("#", "");
      if (hash === "establishment-services") setActiveTab("businesses");
      else if (hash === "family-services") setActiveTab("members");
    };
    applyHash();
    window.addEventListener("hashchange", applyHash);
    return () => window.removeEventListener("hashchange", applyHash);
  }, []);
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected Business for Detail Dialog
  const [detailBiz, setDetailBiz] = useState<BusinessItem | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const allBusinesses: BusinessItem[] = useMemo(() => {
    // The directory shows only real, admin-approved businesses from the
    // database. There is deliberately no static fallback list.
    return (liveBusinesses ?? []).map((b) => ({
      id: b.id,
      name: { ar: b.name_ar, en: b.name_en || b.name_ar },
      category: { ar: b.category_ar, en: b.category_en || b.category_ar },
      city: { ar: b.city_ar, en: b.city_en || b.city_ar },
      description: { ar: b.description_ar || "", en: b.description_en || "" },
      ownerBranch: { ar: b.owner_branch_ar || "", en: b.owner_branch_en || "" },
      contact: b.contact,
      website: b.website || "",
    }));
  }, [liveBusinesses]);

  const sectors = useMemo(() => {
    const set = new Set<string>();
    allBusinesses.forEach((b) => set.add(b.category.ar));
    return Array.from(set);
  }, [allBusinesses]);

  const cities = useMemo(() => {
    const set = new Set<string>();
    allBusinesses.forEach((b) => {
      if (b.city.ar) set.add(b.city.ar);
    });
    return Array.from(set);
  }, [allBusinesses]);

  // Filtered Businesses
  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBusinesses.filter((b) => {
      // Category filter
      if (selectedCategory !== "all" && b.category.ar !== selectedCategory) {
        return false;
      }
      // Branch filter
      if (selectedBranch !== "all") {
        const branchMatch =
          b.ownerBranch.ar.includes(selectedBranch) || b.ownerBranch.en.includes(selectedBranch);
        if (!branchMatch) return false;
      }
      // City filter
      if (selectedCity !== "all" && b.city.ar !== selectedCity) {
        return false;
      }
      // Search query
      if (q) {
        const hay = [
          b.name.ar,
          b.name.en,
          b.category.ar,
          b.category.en,
          b.city.ar,
          b.city.en,
          b.description.ar,
          b.description.en,
          b.ownerBranch.ar,
          b.contact,
        ]
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [allBusinesses, query, selectedCategory, selectedBranch, selectedCity]);

  // Generate QR Code when detailBiz changes
  useEffect(() => {
    if (detailBiz) {
      const vCardOrUrl = detailBiz.website || `tel:${detailBiz.contact}`;
      QRCode.toDataURL(vCardOrUrl, {
        width: 180,
        margin: 1,
        color: { dark: "#1c1917", light: "#ffffff" },
      })
        .then((url) => setQrCodeDataUrl(url))
        .catch(() => setQrCodeDataUrl(""));
    }
  }, [detailBiz]);

  const handleCopyBizInfo = (b: BusinessItem) => {
    const text = `${t(b.name)}\n${t(b.category)} - ${t(b.city)}\n${t(copy.labelContact)}: ${b.contact}${b.website ? `\n${t(copy.visit)}: ${b.website}` : ""}`;
    navigator.clipboard.writeText(text);
    toast.success(t(inl.t_397a5063));
  };

  const handleShareBiz = (b: BusinessItem) => {
    const shareData = {
      title: t(b.name),
      text: `${t(b.name)} - ${t(b.category)} | ${t(inl.t_18f3dba4)}`,
      url: window.location.href,
    };
    if (navigator.share) {
      navigator.share(shareData).catch(() => {});
    } else {
      handleCopyBizInfo(b);
    }
  };

  const resetFilters = () => {
    setQuery("");
    setSelectedCategory("all");
    setSelectedBranch("all");
    setSelectedCity("all");
  };

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: t(copy.metaListings),
            value: allBusinesses.length.toString(),
            mono: true,
          },
          { label: t(copy.metaSectors), value: sectors.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-10 md:py-14">
        {/* Two primary categories: family-member services vs establishment services */}
        <span id="family-services" className="block scroll-mt-28" aria-hidden="true" />
        <span id="establishment-services" className="block scroll-mt-28" aria-hidden="true" />
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="mb-8">
            <TabsList className="grid h-auto w-full sm:w-[26rem] grid-cols-2 gap-1 p-1 bg-muted/60 border border-border">
              <TabsTrigger
                value="members"
                className="h-auto whitespace-normal py-2 text-center text-xs leading-5 font-medium sm:text-sm"
              >
                {t(copy.tabs.members)}
              </TabsTrigger>
              <TabsTrigger
                value="businesses"
                className="h-auto whitespace-normal py-2 text-center text-xs leading-5 font-medium sm:text-sm"
              >
                {t(copy.tabs.businesses)}
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* CATEGORY: خدمات المنشآت — services catalogue                     */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="businesses" className="mt-0 focus-visible:ring-0 space-y-8">
            <ServiceCatalogue services={services} category="establishment" />
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* CATEGORY: خدمات أفراد الأسرة — family-member services catalogue */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="members" className="mt-0 focus-visible:ring-0 space-y-8">
            <ServiceCatalogue services={services} category="family" />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
