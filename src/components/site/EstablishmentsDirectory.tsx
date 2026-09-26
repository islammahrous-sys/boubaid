import { useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Briefcase,
  Building2,
  Code,
  Compass,
  Copy,
  ExternalLink,
  GitBranch,
  Globe,
  LayoutGrid,
  List,
  MapPin,
  MessageCircle,
  Phone,
  QrCode,
  Search,
  Share2,
  ShieldCheck,
  Stethoscope,
  Store,
  Utensils,
  X,
} from "lucide-react";
import QRCode from "qrcode";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { branches } from "@/content/site";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { copy } from "@/content/page-copy/establishmentsdirectory";

/**
 * دليل المنشآت العائلية — the verified establishment listings, their filters and
 * the quick-view card, presented on the Projects page (`/initiatives`).
 *
 * The listings themselves stay exactly where they were: the `businesses` CMS
 * table, edited in Admin → دليل الأعمال. This component only renders rows the
 * caller passes in, so nothing about the records, media or relationships moves.
 */
export type BusinessRow = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  category_ar: string;
  category_en?: string | null;
  city_ar: string;
  city_en?: string | null;
  description_ar?: string | null;
  description_en?: string | null;
  owner_branch_ar?: string | null;
  owner_branch_en?: string | null;
  contact: string;
  website?: string | null;
};

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

export function EstablishmentsDirectory({ businesses }: { businesses: BusinessRow[] }) {
  const { t, lang } = useLang();
  const isAr = lang === "ar";

  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [detailBiz, setDetailBiz] = useState<BusinessItem | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  const allBusinesses: BusinessItem[] = useMemo(
    () =>
      (businesses ?? []).map((b) => ({
        id: b.id,
        name: { ar: b.name_ar, en: b.name_en || b.name_ar },
        category: { ar: b.category_ar, en: b.category_en || b.category_ar },
        city: { ar: b.city_ar, en: b.city_en || b.city_ar },
        description: { ar: b.description_ar || "", en: b.description_en || "" },
        ownerBranch: { ar: b.owner_branch_ar || "", en: b.owner_branch_en || "" },
        contact: b.contact,
        website: b.website || "",
      })),
    [businesses],
  );

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

  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allBusinesses.filter((b) => {
      if (selectedCategory !== "all" && b.category.ar !== selectedCategory) return false;
      if (selectedBranch !== "all") {
        const branchMatch =
          b.ownerBranch.ar.includes(selectedBranch) || b.ownerBranch.en.includes(selectedBranch);
        if (!branchMatch) return false;
      }
      if (selectedCity !== "all" && b.city.ar !== selectedCity) return false;
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
    toast.success(
      isAr ? "تم نسخ بيانات المنشأة للحافظة" : "Business contact info copied to clipboard",
    );
  };

  const handleShareBiz = (b: BusinessItem) => {
    const shareData = {
      title: t(b.name),
      text: `${t(b.name)} - ${t(b.category)} | ${isAr ? "دليل أعمال أسرة آل بوعبيد" : "Al Bu Obaid Directory"}`,
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
    <div className="space-y-8">
      {/* Top Metrics & Value Banner */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-r from-card via-card to-muted/30 border border-border">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground nums">{allBusinesses.length}</div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "منشأة معتمدة" : "Active Businesses"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-amber-500/10 flex items-center justify-center text-amber-600 dark:text-amber-400 shrink-0">
            <Briefcase className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground nums">{sectors.length}</div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "قطاعات اقتصادية" : "Industry Sectors"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-emerald-500/10 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shrink-0">
            <MapPin className="w-5 h-5" />
          </div>
          <div>
            <div className="text-lg font-bold text-foreground nums">{cities.length || 3}</div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "مدن ومناطق" : "Cities Covered"}
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-indigo-500/10 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="text-xs font-bold text-foreground">
              {isAr ? "شبكة موثقة" : "Verified Hub"}
            </div>
            <div className="text-[11px] text-muted-foreground">
              {isAr ? "اعتماد رسمي" : "Family Network"}
            </div>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="space-y-4 bg-card p-5 rounded-xl border border-border shadow-xs">
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search
              className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
              aria-hidden="true"
            />
            <Input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={t(copy.searchPlaceholder)}
              className="ps-10 pe-9 h-10 text-xs sm:text-sm bg-background"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label={isAr ? "مسح البحث" : "Clear search"}
                className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <select
              value={selectedBranch}
              onChange={(e) => setSelectedBranch(e.target.value)}
              aria-label={t(copy.labelBranch)}
              className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
            >
              <option value="all">{isAr ? "جميع الفروع" : "All Branches"}</option>
              {branches.map((b) => (
                <option key={b.id} value={t(b.name)}>
                  {t(b.name)}
                </option>
              ))}
            </select>

            {cities.length > 0 && (
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                aria-label={t(copy.labelCity)}
                className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
              >
                <option value="all">{isAr ? "جميع المدن" : "All Cities"}</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            )}

            <div className="flex items-center border border-border rounded-md p-0.5 bg-muted/40 shrink-0">
              <button
                type="button"
                onClick={() => setViewMode("grid")}
                aria-pressed={viewMode === "grid"}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "grid"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={isAr ? "عرض شبكي" : "Grid View"}
              >
                <LayoutGrid className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={() => setViewMode("list")}
                aria-pressed={viewMode === "list"}
                className={`p-1.5 rounded text-xs transition-colors ${
                  viewMode === "list"
                    ? "bg-background text-foreground shadow-xs font-semibold"
                    : "text-muted-foreground hover:text-foreground"
                }`}
                title={isAr ? "عرض قائمة" : "List View"}
              >
                <List className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>

        {/* Sector Filter Chips */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar text-xs">
          <button
            type="button"
            onClick={() => setSelectedCategory("all")}
            className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-xs font-medium border ${
              selectedCategory === "all"
                ? "bg-primary text-primary-foreground border-primary shadow-xs"
                : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
            }`}
          >
            {isAr ? "كافة القطاعات" : "All Sectors"} ({allBusinesses.length})
          </button>
          {sectors.map((sector) => {
            const count = allBusinesses.filter((b) => b.category.ar === sector).length;
            const isSelected = selectedCategory === sector;
            return (
              <button
                key={sector}
                type="button"
                onClick={() => setSelectedCategory(sector)}
                className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap text-xs font-medium border ${
                  isSelected
                    ? "bg-primary text-primary-foreground border-primary shadow-xs"
                    : "bg-muted/50 hover:bg-muted text-muted-foreground hover:text-foreground border-border"
                }`}
              >
                {sector} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* Results Count & Active Filters Indicator */}
      <div className="flex items-center justify-between text-xs text-muted-foreground px-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground nums">{filteredBusinesses.length}</span>
          <span>{t(copy.resultsCount)}</span>
          {(selectedCategory !== "all" ||
            selectedBranch !== "all" ||
            selectedCity !== "all" ||
            query) && (
            <button
              type="button"
              onClick={resetFilters}
              className="ms-2 text-primary hover:underline inline-flex items-center gap-1"
            >
              <X className="w-3 h-3" />
              {isAr ? "إعادة ضبط الفلاتر" : "Reset Filters"}
            </button>
          )}
        </div>
      </div>

      {/* Business Cards Display */}
      {filteredBusinesses.length === 0 ? (
        <div className="py-20 text-center space-y-4 border border-dashed border-border rounded-xl bg-card">
          <Building2 className="w-10 h-10 text-muted-foreground/50 mx-auto" />
          <h4 className="text-sm font-semibold text-foreground">{t(copy.empty)}</h4>
          <p className="text-xs text-muted-foreground max-w-sm mx-auto">
            {isAr
              ? "جرب تغيير مصطلحات البحث أو إعادة تعيين الفلاتر لعرض المنشآت."
              : "Try clearing search or filters to see all listings."}
          </p>
          <Button variant="outline" size="sm" onClick={resetFilters} className="text-xs">
            {isAr ? "عرض كافة المنشآت" : "Show All Businesses"}
          </Button>
        </div>
      ) : viewMode === "grid" ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredBusinesses.map((b) => {
            const SectorIcon = getSectorIcon(b.category.ar);
            const badgeColor = getSectorBadgeColor(b.category.ar);
            const waNumber = cleanPhoneForWhatsApp(b.contact);
            const waUrl = `https://wa.me/${waNumber}?text=${encodeURIComponent(
              isAr
                ? `السلام عليكم ورحمة الله، أتواصل معكم عبر دليل أعمال أسرة آل بوعبيد بخصوص منشأة (${t(b.name)})`
                : `Hello, reaching out via Al Bu Obaid Business Directory regarding ${t(b.name)}`,
            )}`;

            return (
              <div
                key={b.id}
                className="group relative flex flex-col justify-between rounded-xl border border-border bg-card p-5 transition-all hover:shadow-md hover:border-primary/40"
              >
                <div className="space-y-3.5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 transition-transform group-hover:scale-105">
                        <SectorIcon className="w-5 h-5" />
                      </div>
                      <div>
                        <span
                          className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${badgeColor}`}
                        >
                          {t(b.category)}
                        </span>
                      </div>
                    </div>

                    <span
                      className="inline-flex items-center gap-1 text-[11px] text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium"
                      title={t(copy.verifiedBadge)}
                    >
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span className="hidden sm:inline">{isAr ? "موثقة" : "Verified"}</span>
                    </span>
                  </div>

                  <div>
                    <h3
                      onClick={() => setDetailBiz(b)}
                      className="text-base font-bold text-foreground hover:text-primary transition-colors cursor-pointer line-clamp-1"
                    >
                      {t(b.name)}
                    </h3>
                    {b.name.en && isAr && (
                      <p className="text-[11px] text-muted-foreground font-mono mt-0.5 line-clamp-1">
                        {b.name.en}
                      </p>
                    )}
                  </div>

                  <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[2rem]">
                    {t(b.description)}
                  </p>

                  <div className="flex flex-wrap items-center gap-2 pt-1">
                    {b.ownerBranch.ar && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        <GitBranch className="w-3 h-3 text-bronze dark:text-gold" />
                        {t(b.ownerBranch)}
                      </span>
                    )}
                    {b.city.ar && (
                      <span className="inline-flex items-center gap-1 text-[11px] text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-md">
                        <MapPin className="w-3 h-3 text-muted-foreground" />
                        {t(b.city)}
                      </span>
                    )}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <a
                      href={`tel:${b.contact.replace(/\s/g, "")}`}
                      className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                      title={t(copy.call)}
                      aria-label={`${t(copy.call)} — ${t(b.name)}`}
                    >
                      <Phone className="w-3.5 h-3.5" />
                    </a>

                    <a
                      href={waUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-md bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground transition-colors"
                      title={t(copy.whatsapp)}
                      aria-label={`${t(copy.whatsapp)} — ${t(b.name)}`}
                    >
                      <MessageCircle className="w-3.5 h-3.5" />
                    </a>

                    {b.website && (
                      <a
                        href={b.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                        title={t(copy.visit)}
                        aria-label={`${t(copy.visit)} — ${t(b.name)}`}
                      >
                        <ExternalLink className="w-3.5 h-3.5" />
                      </a>
                    )}

                    <button
                      type="button"
                      onClick={() => handleCopyBizInfo(b)}
                      className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                      title={t(copy.copyContact)}
                      aria-label={`${t(copy.copyContact)} — ${t(b.name)}`}
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDetailBiz(b)}
                    className="h-8 text-xs font-semibold gap-1 text-primary hover:text-primary"
                  >
                    {t(copy.viewDetails)}
                    {isAr ? (
                      <ArrowLeft className="w-3.5 h-3.5" />
                    ) : (
                      <ArrowRight className="w-3.5 h-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
          {filteredBusinesses.map((b) => {
            const SectorIcon = getSectorIcon(b.category.ar);
            const badgeColor = getSectorBadgeColor(b.category.ar);
            const waUrl = `https://wa.me/${cleanPhoneForWhatsApp(b.contact)}`;

            return (
              <div
                key={b.id}
                className="p-5 flex flex-col lg:flex-row lg:items-center justify-between gap-4 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-11 h-11 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0 mt-0.5">
                    <SectorIcon className="w-5 h-5" />
                  </div>
                  <div className="space-y-1.5 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3
                        onClick={() => setDetailBiz(b)}
                        className="text-base font-bold text-foreground hover:text-primary cursor-pointer"
                      >
                        {t(b.name)}
                      </h3>
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-semibold border ${badgeColor}`}
                      >
                        {t(b.category)}
                      </span>
                      <span className="inline-flex items-center gap-0.5 text-[10px] text-emerald-600 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                        <ShieldCheck className="w-3 h-3" />
                        {isAr ? "موثقة" : "Verified"}
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground max-w-2xl leading-relaxed">
                      {t(b.description)}
                    </p>
                    <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground pt-1">
                      {b.ownerBranch.ar && (
                        <span className="inline-flex items-center gap-1">
                          <GitBranch className="w-3.5 h-3.5 text-bronze dark:text-gold" />
                          {t(b.ownerBranch)}
                        </span>
                      )}
                      {b.city.ar && (
                        <span className="inline-flex items-center gap-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {t(b.city)}
                        </span>
                      )}
                      <span className="inline-flex items-center gap-1 nums font-mono">
                        <Phone className="w-3.5 h-3.5" />
                        {b.contact}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end lg:self-center shrink-0">
                  <a
                    href={`tel:${b.contact.replace(/\s/g, "")}`}
                    className="h-8 px-3 rounded-md bg-muted hover:bg-primary/10 hover:text-primary text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {t(copy.call)}
                  </a>
                  <a
                    href={waUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="h-8 px-3 rounded-md bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-600 text-xs font-semibold inline-flex items-center gap-1.5 transition-colors"
                  >
                    <MessageCircle className="w-3 h-3" />
                    {t(copy.whatsapp)}
                  </a>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setDetailBiz(b)}
                    className="h-8 text-xs font-semibold gap-1"
                  >
                    {t(copy.viewDetails)}
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Quick view */}
      <Dialog open={!!detailBiz} onOpenChange={(open) => !open && setDetailBiz(null)}>
        <DialogContent className="max-w-xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          {detailBiz && (
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-14 h-14 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center text-primary shrink-0">
                  <Building2 className="w-7 h-7" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2 mb-1">
                    <span
                      className={`px-2.5 py-0.5 rounded-md text-xs font-semibold border ${getSectorBadgeColor(detailBiz.category.ar)}`}
                    >
                      {t(detailBiz.category)}
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full font-medium">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      {t(copy.verifiedBadge)}
                    </span>
                  </div>
                  <h2 className="text-xl font-bold text-foreground">{t(detailBiz.name)}</h2>
                  {detailBiz.name.en && isAr && (
                    <p className="text-xs text-muted-foreground font-mono">{detailBiz.name.en}</p>
                  )}
                </div>
              </div>

              <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isAr ? "نبذة عن النشاط والخدمات" : "About the Business & Services"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(detailBiz.description)}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1">
                    <GitBranch className="w-3.5 h-3.5 text-bronze dark:text-gold" />
                    {t(copy.labelBranch)}
                  </div>
                  <div className="font-semibold text-foreground">
                    {t(detailBiz.ownerBranch) || "—"}
                  </div>
                </div>

                <div className="p-3 rounded-lg border border-border bg-card">
                  <div className="text-muted-foreground text-[11px] mb-1 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5" />
                    {t(copy.labelCity)}
                  </div>
                  <div className="font-semibold text-foreground">{t(detailBiz.city) || "—"}</div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isAr ? "قنوات التواصل المباشرة" : "Direct Contact Channels"}
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <a
                    href={`tel:${detailBiz.contact.replace(/\s/g, "")}`}
                    className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors"
                  >
                    <div className="w-8 h-8 rounded-md bg-primary/10 flex items-center justify-center text-primary shrink-0">
                      <Phone className="w-4 h-4" />
                    </div>
                    <div className="min-w-0">
                      <div className="text-[11px] text-muted-foreground">
                        {t(copy.labelContact)}
                      </div>
                      <div className="font-mono text-xs font-semibold text-foreground truncate">
                        {detailBiz.contact}
                      </div>
                    </div>
                  </a>

                  {detailBiz.contact && (
                    <a
                      href={`https://wa.me/${cleanPhoneForWhatsApp(detailBiz.contact)}?text=${encodeURIComponent(
                        isAr
                          ? `السلام عليكم ورحمة الله، أتواصل معكم عبر دليل أعمال أسرة آل بوعبيد بخصوص منشأة (${t(detailBiz.name)})`
                          : `Hello, reaching out via Al Bu Obaid Business Directory regarding ${t(detailBiz.name)}`,
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-emerald-500/20 bg-emerald-500/5 hover:border-emerald-500/50 transition-colors"
                    >
                      <div className="w-8 h-8 rounded-md bg-emerald-500/10 flex items-center justify-center text-emerald-600 shrink-0">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <div className="min-w-0">
                        <div className="text-[11px] text-emerald-600 font-medium">
                          {t(copy.whatsapp)}
                        </div>
                        <div className="text-xs font-semibold text-foreground truncate">
                          {isAr ? "محادثة فورية" : "Instant Chat"}
                        </div>
                      </div>
                    </a>
                  )}

                  {detailBiz.website && (
                    <a
                      href={detailBiz.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-3 p-3 rounded-lg border border-border bg-card hover:border-primary/50 transition-colors sm:col-span-2"
                    >
                      <div className="w-8 h-8 rounded-md bg-muted flex items-center justify-center text-foreground shrink-0">
                        <Globe className="w-4 h-4" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="text-[11px] text-muted-foreground">{t(copy.visit)}</div>
                        <div className="text-xs font-semibold text-primary truncate flex items-center gap-1">
                          {detailBiz.website}
                          <ExternalLink className="w-3 h-3 shrink-0" />
                        </div>
                      </div>
                    </a>
                  )}
                </div>
              </div>

              {qrCodeDataUrl && (
                <div className="p-4 rounded-xl border border-border bg-muted/20 flex items-center justify-between gap-4">
                  <div>
                    <div className="text-xs font-bold text-foreground flex items-center gap-1.5 mb-1">
                      <QrCode className="w-4 h-4 text-primary" />
                      {isAr ? "مسح الرمز عبر الجوال" : "Scan via Mobile Camera"}
                    </div>
                    <p className="text-[11px] text-muted-foreground max-w-xs">
                      {isAr
                        ? "امسح الرمز بكاميرا هاتفك للوصول السريع إلى بيانات المنشأة ومشاركتها."
                        : "Scan with your phone camera to quickly access or save contact info."}
                    </p>
                  </div>
                  <img
                    src={qrCodeDataUrl}
                    alt={isAr ? "رمز الاستجابة السريعة للمنشأة" : "Business QR code"}
                    className="w-20 h-20 rounded-lg bg-white p-1 border border-border shrink-0 shadow-xs"
                  />
                </div>
              )}

              <div className="flex items-center justify-between gap-2 pt-4 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareBiz(detailBiz)}
                  className="gap-1.5 text-xs"
                >
                  <Share2 className="w-3.5 h-3.5" />
                  {isAr ? "مشاركة" : "Share"}
                </Button>

                <div className="flex items-center gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopyBizInfo(detailBiz)}
                    className="gap-1.5 text-xs"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {t(copy.copyContact)}
                  </Button>
                  <Button
                    type="button"
                    size="sm"
                    onClick={() => setDetailBiz(null)}
                    className="text-xs"
                  >
                    {isAr ? "إغلاق" : "Close"}
                  </Button>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
