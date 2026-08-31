import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMemberDirectory, getPublishedBusinesses } from "@/lib/directory.functions";
import { submitBusinessListing } from "@/lib/forms.functions";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import {
  Lock,
  Mail,
  UserCheck,
  ShieldCheck,
  Search,
  ExternalLink,
  Phone,
  Building2,
  PlusCircle,
  CheckCircle2,
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
  Sparkles,
  ArrowRight,
  ArrowLeft,
  QrCode,
  Globe,
  SlidersHorizontal,
  X,
  Compass,
  Building,
} from "lucide-react";
import { toast } from "sonner";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
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
import { SaudiCulturalAvatar } from "@/components/common/SaudiCulturalAvatar";
import { getCanonicalUrl } from "@/lib/seo";
import QRCode from "qrcode";

export const Route = createFileRoute("/directory")({
  loader: async () => {
    const liveBiz = await getPublishedBusinesses();
    return { liveBusinesses: liveBiz };
  },
  head: () => ({
    meta: [
      { title: "دليل الأعمال والمنشآت العائلية | آل بوعبيد" },
      {
        name: "description",
        content: "دليل المنشآت والأعمال وأفراد أسرة آل بوعبيد المعتمدين في المملكة والخليج.",
      },
      { property: "og:title", content: "دليل الأعمال والمنشآت العائلية | آل بوعبيد" },
      {
        property: "og:description",
        content: "دليل المنشآت والأعمال وأفراد أسرة آل بوعبيد المعتمدين.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/directory") },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/directory") }],
  }),
  component: DirectoryPage,
});

const copy = {
  eyebrow: { ar: "دليل مبوب", en: "Classified index" } as BiText,
  title: { ar: "دليل الأسرة والأعمال", en: "Family & Business Directory" } as BiText,
  subtitle: {
    ar: "بوابة التواصل المهني والتجاري والاجتماعي، تشمل منشآت أبناء الأسرة ودليل الأفراد المعتمدين.",
    en: "Professional, commercial, and social directory featuring family-owned businesses and verified members.",
  } as BiText,

  tabs: {
    businesses: { ar: "دليل الأعمال والمنشآت", en: "Business Directory" } as BiText,
    members: { ar: "دليل أفراد الأسرة", en: "Member Directory" } as BiText,
  },

  metaListings: { ar: "عدد القيود", en: "Listings" } as BiText,
  metaSectors: { ar: "القطاعات", en: "Sectors" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  searchLabel: { ar: "بحث في الدليل", en: "Search directory" } as BiText,
  searchPlaceholder: {
    ar: "ابحث باسم المنشأة، النشاط، الفرع، أو المدينة…",
    en: "Search by business name, sector, branch, or city…",
  } as BiText,
  memberSearchPlaceholder: {
    ar: "بحث بالاسم، الفرع، أو البريد…",
    en: "Search by name, branch, or email…",
  } as BiText,
  resultsCount: { ar: "منشأة مطابقة", en: "matching businesses" } as BiText,
  empty: {
    ar: "لا توجد منشآت مطابقة لمعايير البحث الحالية.",
    en: "No businesses match the current filter criteria.",
  } as BiText,

  labelCity: { ar: "المدينة", en: "City" } as BiText,
  labelBranch: { ar: "الفرع", en: "Branch" } as BiText,
  labelContact: { ar: "الهاتف", en: "Telephone" } as BiText,
  labelEmail: { ar: "البريد", en: "Email" } as BiText,
  visit: { ar: "الموقع الإلكتروني", en: "Visit Website" } as BiText,
  call: { ar: "اتصال", en: "Call" } as BiText,
  whatsapp: { ar: "واتساب", en: "WhatsApp" } as BiText,
  copyContact: { ar: "نسخ البيانات", en: "Copy Info" } as BiText,
  viewDetails: { ar: "تفاصيل المنشأة", en: "Details" } as BiText,
  verifiedBadge: { ar: "منشأة عائلية معتمدة", en: "Verified Family Enterprise" } as BiText,

  listTitle: {
    ar: "هل تمتلك منشأة أو نشاطاً تجارياً؟",
    en: "Own a business or professional venture?",
  } as BiText,
  listBody: {
    ar: "ندعو أبناء وبنات الأسرة لإدراج منشآتهم في الدليل لتعزيز التكامل والتعاون الاقتصادي وتبادل الخبرات بين أفراد العائلة.",
    en: "We invite family members to list their enterprises to foster mutual business synergy and professional networking.",
  } as BiText,

  memberGated: {
    title: { ar: "دليل خاص بالأعضاء المعتمدين", en: "Members-Only Directory" } as BiText,
    body: {
      ar: "هذا القسم مخصص للتواصل بين أبناء الأسرة الموثقين فقط. يرجى تسجيل الدخول أو إتمام توثيق العضوية لعرض البيانات.",
      en: "This directory is for verified family members only. Please sign in to view details.",
    },
    action: { ar: "تسجيل الدخول", en: "Sign In" } as BiText,
  },
  memberPending: {
    title: { ar: "العضوية قيد المراجعة والاعتماد", en: "Membership Pending" } as BiText,
    body: {
      ar: "حسابك قيد المراجعة لدى الأمانة العامة. ستتمكن من تصفح دليل الأفراد فور اعتماد التوثيق.",
      en: "Your account is awaiting verification by the secretariat. You'll see the directory once approved.",
    },
    action: { ar: "متابعة حالة الحساب", en: "Account Settings" } as BiText,
  },
  memberOptInNote: {
    ar: "تنويه الخصوصية: يظهر في دليل الأفراد حصرياً الأعضاء الذين فعّلوا خيار مشاركة بياناتهم من إعدادات الملف الشخصي.",
    en: "Privacy note: Only family members who opted to share their details via profile settings appear in the member directory.",
  } as BiText,
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

function DirectoryPage() {
  const { t, lang } = useLang();
  const isAr = lang === "ar";
  const { liveBusinesses } = Route.useLoaderData();
  const { user, isMember: authIsMember, loading: authLoading } = useAuth();

  const [activeTab, setActiveTab] = useState("businesses");
  const [query, setQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [selectedBranch, setSelectedBranch] = useState<string>("all");
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  // Selected Business for Detail Dialog
  const [detailBiz, setDetailBiz] = useState<BusinessItem | null>(null);
  const [qrCodeDataUrl, setQrCodeDataUrl] = useState<string>("");

  // Member tab query
  const [memberQuery, setMemberQuery] = useState("");
  const [memberBranch, setMemberBranch] = useState("all");

  // Business registration modal
  const [bizModalOpen, setBizModalOpen] = useState(false);
  const [isSubmittingBiz, setIsSubmittingBiz] = useState(false);
  const [bizSuccess, setBizSuccess] = useState(false);

  const [bizForm, setBizForm] = useState({
    name_ar: "",
    name_en: "",
    category: "تجارة وتجزئة",
    city: "المبرز، الأحساء",
    owner_name_ar: "",
    branch_slug: "",
    phone: "",
    email: "",
    website: "",
    national_address: "",
    description_ar: "",
    description_en: "",
    website_url_check: "",
  });

  const sendBizListing = useServerFn(submitBusinessListing);

  const handleBizSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!bizForm.name_ar || !bizForm.category || !bizForm.owner_name_ar || !bizForm.phone) {
      toast.error(isAr ? "يرجى تعبئة الحقول الأساسية المطلوبة" : "Please fill in required fields");
      return;
    }

    setIsSubmittingBiz(true);
    try {
      const res = await sendBizListing({ data: bizForm });
      if (res.ok) {
        setBizSuccess(true);
        toast.success(
          isAr
            ? "تم إرسال طلب تسجيل المنشأة للأمانة العامة بنجاح"
            : "Business listing submitted successfully",
        );
      } else {
        toast.error(isAr ? "تعذر حفظ البيانات، يرجى المحاولة لاحقاً" : "Failed to submit listing");
      }
    } catch {
      toast.error(isAr ? "حدث خطأ أثناء الإرسال" : "An error occurred");
    } finally {
      setIsSubmittingBiz(false);
    }
  };

  const getMembers = useServerFn(getMemberDirectory);
  const { data: memberData, isLoading: membersLoading } = useQuery({
    queryKey: ["member-directory"],
    queryFn: () => getMembers(),
    enabled: !!user,
  });

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


  const branchMap = useMemo(() => {
    const m = new Map<string, BiText>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, []);

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

  const filteredMembers = useMemo(() => {
    if (!memberData?.members) return [];
    const q = memberQuery.trim().toLowerCase();
    return memberData.members.filter((m) => {
      if (memberBranch !== "all" && m.branch_slug !== memberBranch) {
        return false;
      }
      if (q) {
        const hay = [
          m.full_name_ar,
          m.full_name_en,
          m.email,
          m.phone,
          m.branch_slug ? t(branchMap.get(m.branch_slug) || { ar: "", en: "" }) : "",
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase();
        if (!hay.includes(q)) return false;
      }
      return true;
    });
  }, [memberData, memberQuery, memberBranch, branchMap, t]);

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
            value: (allBusinesses.length + (memberData?.members?.length ?? 0)).toString(),
            mono: true,
          },
          { label: t(copy.metaSectors), value: sectors.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-10 md:py-14">
        {/* Main Tabs: Businesses vs Members */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <TabsList className="grid w-full sm:w-80 grid-cols-2 p-1 bg-muted/60 border border-border">
              <TabsTrigger value="businesses" className="text-xs sm:text-sm font-medium">
                {t(copy.tabs.businesses)}
              </TabsTrigger>
              <TabsTrigger value="members" className="text-xs sm:text-sm font-medium">
                {t(copy.tabs.members)}
              </TabsTrigger>
            </TabsList>

            {activeTab === "businesses" && (
              <Button
                type="button"
                onClick={() => setBizModalOpen(true)}
                className="gap-2 text-xs font-bold shrink-0 self-start sm:self-auto shadow-sm"
              >
                <PlusCircle className="w-4 h-4 text-primary-foreground" />
                {isAr ? "سجّل منشأتك العائلية" : "Register Your Business"}
              </Button>
            )}
          </div>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 1: BUSINESS DIRECTORY (GUEST & PUBLIC ACCESSIBLE)           */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="businesses" className="mt-0 focus-visible:ring-0 space-y-8">
            {/* Top Metrics & Value Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4 rounded-xl bg-gradient-to-r from-card via-card to-muted/30 border border-border">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center text-primary shrink-0">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-lg font-bold text-foreground nums">
                    {allBusinesses.length}
                  </div>
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
                {/* Search Box */}
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
                      className="absolute top-1/2 end-3 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Dropdowns & View Mode Switcher */}
                <div className="flex flex-wrap items-center gap-2.5">
                  {/* Branch Filter */}
                  <select
                    value={selectedBranch}
                    onChange={(e) => setSelectedBranch(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  >
                    <option value="all">{isAr ? "جميع الفروع" : "All Branches"}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={t(b.name)}>
                        {t(b.name)}
                      </option>
                    ))}
                  </select>

                  {/* City Filter */}
                  {cities.length > 0 && (
                    <select
                      value={selectedCity}
                      onChange={(e) => setSelectedCity(e.target.value)}
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

                  {/* View Mode Toggle */}
                  <div className="flex items-center border border-border rounded-md p-0.5 bg-muted/40 shrink-0">
                    <button
                      type="button"
                      onClick={() => setViewMode("grid")}
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
                <span className="font-semibold text-foreground nums">
                  {filteredBusinesses.length}
                </span>
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
                        {/* Card Header: Icon + Category Badge */}
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

                        {/* Title */}
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

                        {/* Description */}
                        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2 min-h-[2rem]">
                          {t(b.description)}
                        </p>

                        {/* Badges: Branch & Location */}
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

                      {/* Card Footer: Quick Actions */}
                      <div className="mt-5 pt-4 border-t border-border flex items-center justify-between gap-2">
                        <div className="flex items-center gap-1.5">
                          {/* Call button */}
                          <a
                            href={`tel:${b.contact.replace(/\s/g, "")}`}
                            className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                            title={t(copy.call)}
                          >
                            <Phone className="w-3.5 h-3.5" />
                          </a>

                          {/* WhatsApp button */}
                          <a
                            href={waUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="p-2 rounded-md bg-muted/60 hover:bg-emerald-500/10 hover:text-emerald-600 text-muted-foreground transition-colors"
                            title={t(copy.whatsapp)}
                          >
                            <MessageCircle className="w-3.5 h-3.5" />
                          </a>

                          {/* Website */}
                          {b.website && (
                            <a
                              href={b.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                              title={t(copy.visit)}
                            >
                              <ExternalLink className="w-3.5 h-3.5" />
                            </a>
                          )}

                          {/* Copy Info */}
                          <button
                            type="button"
                            onClick={() => handleCopyBizInfo(b)}
                            className="p-2 rounded-md bg-muted/60 hover:bg-primary/10 hover:text-primary text-muted-foreground transition-colors"
                            title={t(copy.copyContact)}
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
              /* List Mode */
              <div className="divide-y divide-border rounded-xl border border-border bg-card overflow-hidden">
                {filteredBusinesses.map((b) => {
                  const SectorIcon = getSectorIcon(b.category.ar);
                  const badgeColor = getSectorBadgeColor(b.category.ar);
                  const waNumber = cleanPhoneForWhatsApp(b.contact);
                  const waUrl = `https://wa.me/${waNumber}`;

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

            {/* Bottom Invitation Banner */}
            <aside className="mt-12 rounded-xl border border-border bg-gradient-to-r from-card to-muted/40 p-6 flex flex-col sm:flex-row sm:items-center justify-between gap-5 shadow-xs">
              <div className="space-y-1.5">
                <div className="inline-flex items-center gap-1.5 text-xs font-bold text-bronze dark:text-gold">
                  <Sparkles className="w-4 h-4" />
                  {t(copy.listTitle)}
                </div>
                <p className="text-xs leading-relaxed text-muted-foreground max-w-xl">
                  {t(copy.listBody)}
                </p>
              </div>
              <Button
                type="button"
                onClick={() => setBizModalOpen(true)}
                className="gap-2 text-xs font-bold shrink-0 self-start sm:self-auto"
              >
                <PlusCircle className="w-4 h-4" />
                {isAr ? "تقديم طلب إدراج منشأة" : "Submit Business Request"}
              </Button>
            </aside>
          </TabsContent>

          {/* ════════════════════════════════════════════════════════════════ */}
          {/* TAB 2: MEMBER DIRECTORY (AUTH GATED)                            */}
          {/* ════════════════════════════════════════════════════════════════ */}
          <TabsContent value="members" className="mt-0 focus-visible:ring-0 space-y-6">
            {!user ? (
              <Card className="mx-auto mt-8 max-w-2xl border-dashed">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{t(copy.memberGated.title)}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {t(copy.memberGated.body)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center pb-8">
                  <Button asChild>
                    <Link to="/auth">{t(copy.memberGated.action)}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : !authIsMember ? (
              <Card className="mx-auto mt-8 max-w-2xl border-dashed">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <ShieldCheck className="h-6 w-6 text-bronze dark:text-gold" />
                  </div>
                  <CardTitle className="text-xl">{t(copy.memberPending.title)}</CardTitle>
                  <CardDescription className="mt-2 text-sm leading-relaxed">
                    {t(copy.memberPending.body)}
                  </CardDescription>
                </CardHeader>
                <CardFooter className="flex justify-center pb-8">
                  <Button variant="outline" asChild>
                    <Link to="/account">{t(copy.memberPending.action)}</Link>
                  </Button>
                </CardFooter>
              </Card>
            ) : (
              <>
                {/* Member Filter Bar */}
                <div className="bg-card p-4 rounded-xl border border-border shadow-xs flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                  <div className="relative flex-1">
                    <Search
                      className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
                      aria-hidden="true"
                    />
                    <Input
                      type="search"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder={t(copy.memberSearchPlaceholder)}
                      className="ps-10 h-10 text-xs sm:text-sm bg-background"
                    />
                  </div>

                  <select
                    value={memberBranch}
                    onChange={(e) => setMemberBranch(e.target.value)}
                    className="h-10 rounded-md border border-border bg-background px-3 py-1.5 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none shrink-0"
                  >
                    <option value="all">{isAr ? "كافة الفروع العائلية" : "All Branches"}</option>
                    {branches.map((b) => (
                      <option key={b.id} value={b.id}>
                        {t(b.name)}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="text-xs text-muted-foreground px-1">
                  <span className="font-semibold text-foreground nums">
                    {filteredMembers.length}
                  </span>{" "}
                  {isAr ? "عضو معتمد مشارك في الدليل" : "verified members listed"}
                </div>

                {membersLoading ? (
                  <div className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <p className="py-20 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredMembers.map((m) => {
                      const branchText = m.branch_slug ? branchMap.get(m.branch_slug) : null;
                      return (
                        <div
                          key={m.id}
                          className="rounded-xl border border-border bg-card p-4 flex flex-col justify-between gap-4 hover:shadow-xs transition-shadow"
                        >
                          <div className="flex items-start gap-3">
                            <SaudiCulturalAvatar
                              src={(m as any).avatar_path}
                              alt={m.full_name_ar || ""}
                              size="md"
                            />
                            <div className="flex-1 min-w-0">
                              <h3 className="text-sm font-bold text-foreground truncate">
                                {t({ ar: m.full_name_ar || "", en: m.full_name_en || "" })}
                              </h3>
                              {branchText && (
                                <p className="text-[11px] text-bronze dark:text-gold flex items-center gap-1 mt-0.5">
                                  <GitBranch className="w-3 h-3" />
                                  {t(branchText)}
                                </p>
                              )}
                              {m.lineage_notes && (
                                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                  {m.lineage_notes}
                                </p>
                              )}
                            </div>
                          </div>

                          <div className="pt-3 border-t border-border flex items-center justify-between gap-2 text-xs">
                            {m.phone ? (
                              <a
                                href={`tel:${m.phone.replace(/\s/g, "")}`}
                                className="nums inline-flex items-center gap-1 text-muted-foreground hover:text-primary font-mono"
                              >
                                <Phone className="w-3 h-3" />
                                {m.phone}
                              </a>
                            ) : (
                              <span />
                            )}

                            {m.email && (
                              <a
                                href={`mailto:${m.email}`}
                                className="inline-flex items-center gap-1 text-muted-foreground hover:text-primary truncate max-w-[140px]"
                                title={m.email}
                              >
                                <Mail className="w-3 h-3" />
                                <span className="truncate">{m.email}</span>
                              </a>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}

                <aside className="mt-8 border-s-2 border-bronze/40 ps-4 dark:border-gold/40">
                  <p className="label-caps mb-1 text-bronze dark:text-gold">
                    {isAr ? "إشعار الخصوصية" : "Privacy Notice"}
                  </p>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {t(copy.memberOptInNote)}
                  </p>
                </aside>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* QUICK VIEW BUSINESS DETAIL MODAL                                 */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Dialog open={!!detailBiz} onOpenChange={(open) => !open && setDetailBiz(null)}>
        <DialogContent className="max-w-xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          {detailBiz && (
            <div className="space-y-6">
              {/* Header */}
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

              {/* Description */}
              <div className="space-y-2 p-4 rounded-xl bg-muted/30 border border-border">
                <h4 className="text-xs font-bold text-foreground uppercase tracking-wider">
                  {isAr ? "نبذة عن النشاط والخدمات" : "About the Business & Services"}
                </h4>
                <p className="text-xs text-muted-foreground leading-relaxed whitespace-pre-line">
                  {t(detailBiz.description)}
                </p>
              </div>

              {/* Metadata Grid */}
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

              {/* Communication & Channels */}
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

              {/* QR Code Quick Scan */}
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
                    alt="Business QR Code"
                    className="w-20 h-20 rounded-lg bg-white p-1 border border-border shrink-0 shadow-xs"
                  />
                </div>
              )}

              {/* Modal Footer Actions */}
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

      {/* ════════════════════════════════════════════════════════════════ */}
      {/* BUSINESS REGISTRATION MODAL                                      */}
      {/* ════════════════════════════════════════════════════════════════ */}
      <Dialog
        open={bizModalOpen}
        onOpenChange={(open) => {
          setBizModalOpen(open);
          if (!open) setBizSuccess(false);
        }}
      >
        <DialogContent className="max-w-2xl p-6 bg-card border-border max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-bronze dark:text-gold">
              <Building2 className="w-4 h-4" />
              {isAr ? "دليل الأعمال العائلي" : "Family Business Index"}
            </div>
            <DialogTitle className="text-xl font-bold text-foreground">
              {isAr ? "تسجيل منشأة في دليل الأعمال" : "Register a Business Listing"}
            </DialogTitle>
            <DialogDescription className="text-xs text-muted-foreground">
              {isAr
                ? "يتم مراجعة بيانات المنشأة من قبل أمانة المجلس والتحقق من الانتساب العائلي قبل النشر في الدليل العام."
                : "Listing submissions are audited by the secretariat before being published in the public directory."}
            </DialogDescription>
          </DialogHeader>

          {bizSuccess ? (
            <div className="py-8 text-center space-y-4">
              <div className="w-14 h-14 rounded-full bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 mx-auto flex items-center justify-center">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-foreground">
                {isAr ? "تم استلام بيانات المنشأة بنجاح" : "Business Submitted Successfully"}
              </h3>
              <p className="text-xs text-muted-foreground max-w-md mx-auto leading-relaxed">
                {isAr
                  ? "شكراً لتسجيل منشأتك. ستتم المراجعة والاعتماد من قبل أمانة المجلس والتواصل معكم عند الحاجة لتوثيق السجل التجاري."
                  : "Thank you for registering. Your submission will be reviewed by the council secretariat and approved shortly."}
              </p>
              <Button
                type="button"
                onClick={() => {
                  setBizModalOpen(false);
                  setBizSuccess(false);
                }}
                className="mt-4"
              >
                {isAr ? "تم" : "Done"}
              </Button>
            </div>
          ) : (
            <form onSubmit={handleBizSubmit} className="space-y-4 mt-2">
              <input
                type="text"
                name="website_url_check"
                value={bizForm.website_url_check}
                onChange={(e) => setBizForm({ ...bizForm, website_url_check: e.target.value })}
                className="hidden"
                tabIndex={-1}
                autoComplete="off"
              />

              {/* Section 1: Business Identity */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Building2 className="w-3.5 h-3.5 text-primary" />
                  {isAr ? "١. بيانات المنشأة الأساسية" : "1. Business Identity"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "اسم المنشأة بالعربية *" : "Business Name (Arabic) *"}
                    </Label>
                    <Input
                      required
                      value={bizForm.name_ar}
                      onChange={(e) => setBizForm({ ...bizForm, name_ar: e.target.value })}
                      placeholder={isAr ? "شركة آل بوعبيد للتطوير" : "Arabic name"}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "اسم المنشأة بالإنجليزية" : "Business Name (English)"}
                    </Label>
                    <Input
                      value={bizForm.name_en}
                      onChange={(e) => setBizForm({ ...bizForm, name_en: e.target.value })}
                      placeholder="Al Bu Obaid Development Co."
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "قطاع النشاط *" : "Industry Sector *"}
                    </Label>
                    <select
                      value={bizForm.category}
                      onChange={(e) => setBizForm({ ...bizForm, category: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="العقارات والمقاولات">
                        {isAr ? "العقارات والمقاولات" : "Real Estate & Construction"}
                      </option>
                      <option value="الهندسة والاستشارات">
                        {isAr ? "الهندسة والاستشارات" : "Engineering & Consulting"}
                      </option>
                      <option value="الخدمات الطبية والرعاية">
                        {isAr ? "الخدمات الطبية والرعاية" : "Medical & Healthcare"}
                      </option>
                      <option value="التكنولوجيا والبرمجيات">
                        {isAr ? "التكنولوجيا والبرمجيات" : "Technology & Software"}
                      </option>
                      <option value="الأغذية والضيافة">
                        {isAr ? "الأغذية والضيافة" : "Food & Hospitality"}
                      </option>
                      <option value="تجارة وتجزئة">
                        {isAr ? "تجارة وتجزئة" : "Retail & Commerce"}
                      </option>
                      <option value="خدمات مهنية">
                        {isAr ? "خدمات مهنية وقانونية" : "Professional & Legal"}
                      </option>
                      <option value="أخرى">{isAr ? "قطاع آخر" : "Other Sector"}</option>
                    </select>
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "المدينة / المقر الرئيسي *" : "City / HQ *"}
                    </Label>
                    <Input
                      required
                      value={bizForm.city}
                      onChange={(e) => setBizForm({ ...bizForm, city: e.target.value })}
                      placeholder={isAr ? "المبرز، الأحساء" : "e.g. Al-Ahsa / Riyadh"}
                      className="text-xs"
                    />
                  </div>
                </div>
              </div>

              {/* Section 2: Owner & Affiliation */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <GitBranch className="w-3.5 h-3.5 text-primary" />
                  {isAr ? "٢. بيانات المالك والانتساب العائلي" : "2. Owner & Branch Affiliation"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "اسم المالك / المدير المسؤول *" : "Owner / Manager Name *"}
                    </Label>
                    <Input
                      required
                      value={bizForm.owner_name_ar}
                      onChange={(e) => setBizForm({ ...bizForm, owner_name_ar: e.target.value })}
                      placeholder={isAr ? "الاسم الثلاثي أو الرباعي" : "Full Name"}
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "الفرع العائلي" : "Family Branch"}
                    </Label>
                    <select
                      value={bizForm.branch_slug}
                      onChange={(e) => setBizForm({ ...bizForm, branch_slug: e.target.value })}
                      className="w-full rounded-md border border-border bg-background px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                    >
                      <option value="">
                        {isAr ? "-- اختر الفرع العائلي --" : "-- Select Branch --"}
                      </option>
                      {branches.map((b) => (
                        <option key={b.id} value={t(b.name)}>
                          {t(b.name)}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Section 3: Contact Channels */}
              <div className="space-y-3 p-4 rounded-xl bg-muted/20 border border-border">
                <div className="text-xs font-bold text-foreground flex items-center gap-1.5">
                  <Phone className="w-3.5 h-3.5 text-primary" />
                  {isAr ? "٣. قنوات التواصل والموقع" : "3. Contact Channels & Location"}
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "هاتف التواصل / واتساب *" : "Phone / WhatsApp *"}
                    </Label>
                    <Input
                      type="tel"
                      required
                      value={bizForm.phone}
                      onChange={(e) => setBizForm({ ...bizForm, phone: e.target.value })}
                      placeholder="05xxxxxxxx"
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "البريد الإلكتروني" : "Email"}
                    </Label>
                    <Input
                      type="email"
                      value={bizForm.email}
                      onChange={(e) => setBizForm({ ...bizForm, email: e.target.value })}
                      placeholder="info@company.com"
                      className="text-xs"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold">
                      {isAr ? "الموقع الإلكتروني" : "Website"}
                    </Label>
                    <Input
                      type="url"
                      value={bizForm.website}
                      onChange={(e) => setBizForm({ ...bizForm, website: e.target.value })}
                      placeholder="https://..."
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <Label className="text-xs font-semibold">
                    {isAr ? "نبذة عن النشاط والخدمات *" : "Business Description *"}
                  </Label>
                  <textarea
                    rows={3}
                    required
                    value={bizForm.description_ar}
                    onChange={(e) => setBizForm({ ...bizForm, description_ar: e.target.value })}
                    placeholder={
                      isAr
                        ? "صف نشاط منشأتك وخدماتها لأبناء الأسرة والعموم…"
                        : "Brief overview of products and services…"
                    }
                    className="w-full rounded-md border border-border bg-background p-3 text-xs text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-border">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setBizModalOpen(false)}
                  className="text-xs"
                >
                  {isAr ? "إلغاء" : "Cancel"}
                </Button>
                <Button
                  type="submit"
                  disabled={isSubmittingBiz}
                  className="text-xs font-bold gap-1.5"
                >
                  {isSubmittingBiz
                    ? isAr
                      ? "جاري الإرسال…"
                      : "Submitting…"
                    : isAr
                      ? "إرسال طلب التسجيل"
                      : "Submit Listing"}
                </Button>
              </div>
            </form>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
