import { useEffect, useRef, useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Settings,
  Globe,
  Shield,
  Palette,
  Search,
  Save,
  Users,
  Share2,
  Image as ImageIcon,
} from "lucide-react";
import { toast } from "sonner";
import type { SiteSettingInput } from "@/lib/admin-hub.schemas";
import { PageTextsManager } from "./PageTextsManager";
import { SponsorsManager } from "./SponsorsManager";
import { SeoManager } from "./SeoManager";
import { PageImagesManager } from "./PageImagesManager";

export function SiteSettingsManager({
  settings,
  onSaveSetting,
}: {
  settings: { key: string; category: string; value: any }[];
  onSaveSetting: (data: SiteSettingInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [loading, setLoading] = useState(false);

  // Helper to extract setting value with fallback
  const getVal = (key: string, field: string, fallback = "") => {
    const s = settings.find((item) => item.key === key);
    return s?.value?.[field] ?? fallback;
  };

  // General & License
  const [licenseNumber, setLicenseNumber] = useState(
    getVal("site_general", "license", "1200758400"),
  );
  const [unifiedNumber, setUnifiedNumber] = useState(
    getVal("site_general", "unified_number", "7051186638"),
  );
  const [nationalAddress, setNationalAddress] = useState(
    getVal("site_general", "national_address", "FMDF7959 — حي الحزام الذهبي، المبرز، الأحساء"),
  );

  // Contact & Social
  const [contactEmail, setContactEmail] = useState(
    getVal("site_contact", "email", "contact@albouabidfamily.com"),
  );
  const [contactPhone, setContactPhone] = useState(
    getVal("site_contact", "phone", "+966 13 580 0000"),
  );
  const [whatsappUrl, setWhatsappUrl] = useState(
    getVal("site_contact", "whatsapp", "https://chat.whatsapp.com/albouabidfamily"),
  );
  const [xUrl, setXUrl] = useState(getVal("site_contact", "x", "https://x.com/albouabidfamily"));
  const [instagramUrl, setInstagramUrl] = useState(
    getVal("site_contact", "instagram", "https://instagram.com/albouabidfamily"),
  );
  const [youtubeUrl, setYoutubeUrl] = useState(
    getVal("site_contact", "youtube", "https://youtube.com/@albouabidfamily"),
  );
  const [snapchatUrl, setSnapchatUrl] = useState(
    getVal("site_contact", "snapchat", "https://www.snapchat.com/add/alboubaidsa"),
  );
  const [hoursAr, setHoursAr] = useState(
    getVal("site_contact", "hours_ar", "الأحد إلى الخميس، ٤:٠٠ — ٨:٠٠ مساءً بتوقيت المملكة."),
  );
  const [hoursEn, setHoursEn] = useState(
    getVal("site_contact", "hours_en", "Sunday to Thursday, 4:00 — 8:00 pm Saudi time."),
  );

  // Governance & Board
  const [deanName, setDeanName] = useState(
    getVal("site_governance", "dean_name", "الأستاذ سعد بن عبدالرحمن بن علي بوعبيد"),
  );
  const [chairmanName, setChairmanName] = useState(
    getVal("site_governance", "chairman_name", "د. خالد بن يوسف بن أحمد بوعبيد"),
  );
  const [viceChairmanName, setViceChairmanName] = useState(
    getVal("site_governance", "vice_chairman_name", "الأستاذ حسين بن عبدالله بن حسين بوعبيد"),
  );

  // `settings` loads asynchronously (a TanStack Query fetch) — this component
  // can easily mount before it resolves, and useState's initializer only ever
  // runs once, on that first (empty) render. Re-derive every field the moment
  // real data arrives, but only that once, so a later refetch doesn't clobber
  // whatever the admin is mid-way through editing.
  const hydratedRef = useRef(false);
  useEffect(() => {
    if (hydratedRef.current || settings.length === 0) return;
    hydratedRef.current = true;
    setLicenseNumber(getVal("site_general", "license", licenseNumber));
    setUnifiedNumber(getVal("site_general", "unified_number", unifiedNumber));
    setNationalAddress(getVal("site_general", "national_address", nationalAddress));
    setContactEmail(getVal("site_contact", "email", contactEmail));
    setContactPhone(getVal("site_contact", "phone", contactPhone));
    setWhatsappUrl(getVal("site_contact", "whatsapp", whatsappUrl));
    setXUrl(getVal("site_contact", "x", xUrl));
    setInstagramUrl(getVal("site_contact", "instagram", instagramUrl));
    setYoutubeUrl(getVal("site_contact", "youtube", youtubeUrl));
    setSnapchatUrl(getVal("site_contact", "snapchat", snapchatUrl));
    setHoursAr(getVal("site_contact", "hours_ar", hoursAr));
    setHoursEn(getVal("site_contact", "hours_en", hoursEn));
    setDeanName(getVal("site_governance", "dean_name", deanName));
    setChairmanName(getVal("site_governance", "chairman_name", chairmanName));
    setViceChairmanName(getVal("site_governance", "vice_chairman_name", viceChairmanName));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings]);

  const handleSaveCategory = async (cat: any, key: string, payload: Record<string, any>) => {
    try {
      setLoading(true);
      await onSaveSetting({
        category: cat,
        key,
        value: payload,
        is_public: true,
      });
      toast.success(isAr ? "تم حفظ الإعدادات بنجاح" : "Settings saved successfully");
    } catch (err: any) {
      toast.error(err.message || (isAr ? "فشل حفظ الإعدادات" : "Failed to save settings"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <Settings className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "إعدادات المنصة والهوية الرسمية والحوكمة" : "Platform Settings & Governance"}
          </h3>
        </div>
      </div>

      <div className="border border-border rounded-xl bg-card p-6">
        <Tabs defaultValue="general" className="w-full">
          <TabsList className="flex flex-wrap h-auto w-full mb-6 gap-1">
            <TabsTrigger value="general" className="text-xs gap-1.5">
              <Globe className="w-3.5 h-3.5" />
              {isAr ? "الهوية والترخيص" : "Identity & License"}
            </TabsTrigger>
            <TabsTrigger value="contact" className="text-xs gap-1.5">
              <Share2 className="w-3.5 h-3.5" />
              {isAr ? "التواصل والشبكات" : "Contact & Social"}
            </TabsTrigger>
            <TabsTrigger value="governance" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {isAr ? "أمانة المجلس" : "Governance"}
            </TabsTrigger>
            <TabsTrigger value="seo" className="text-xs gap-1.5">
              <Search className="w-3.5 h-3.5" />
              {isAr ? "محركات البحث (SEO)" : "SEO & Meta"}
            </TabsTrigger>
            <TabsTrigger value="images" className="text-xs gap-1.5">
              <ImageIcon className="w-3.5 h-3.5" />
              {isAr ? "صور الصفحات" : "Page images"}
            </TabsTrigger>
            <TabsTrigger value="texts" className="text-xs gap-1.5">
              <Palette className="w-3.5 h-3.5" />
              {isAr ? "نصوص الصفحات" : "Page texts"}
            </TabsTrigger>
            <TabsTrigger value="sponsors" className="text-xs gap-1.5">
              <Users className="w-3.5 h-3.5" />
              {isAr ? "جدول رعاة الجائزة" : "Award sponsors"}
            </TabsTrigger>
            <TabsTrigger value="security" className="text-xs gap-1.5">
              <Shield className="w-3.5 h-3.5" />
              {isAr ? "الأمان والـ RLS" : "Security"}
            </TabsTrigger>
          </TabsList>

          {/* General & License */}
          <TabsContent value="general" className="space-y-4">
            <p className="rounded-lg border border-border bg-muted/30 p-3 text-xs leading-relaxed text-muted-foreground">
              {isAr
                ? "اسم الكيان والشعار اللفظي يُعدَّلان من «نصوص الصفحات ← بيانات عامة للموقع» ليظهرا بالعربية والإنجليزية في كل مكان."
                : "The entity name and tagline are edited under “Page texts → Site-wide details”, so they update in Arabic and English everywhere."}
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "رقم ترخيص المركز الوطني (NCNP)" : "NCNP License No."}
                </Label>
                <Input value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "الرقم الموحد للكيان (UNN)" : "Unified National Number (UNN)"}
                </Label>
                <Input value={unifiedNumber} onChange={(e) => setUnifiedNumber(e.target.value)} />
              </div>
            </div>

            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr ? "العنوان الوطني المسجل" : "National Address"}
              </Label>
              <Input value={nationalAddress} onChange={(e) => setNationalAddress(e.target.value)} />
            </div>

            <div className="flex justify-end pt-3">
              <Button
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5"
                onClick={() =>
                  handleSaveCategory("general", "site_general", {
                    license: licenseNumber,
                    unified_number: unifiedNumber,
                    national_address: nationalAddress,
                  })
                }
              >
                <Save className="w-3.5 h-3.5" />
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ بيانات الهوية والترخيص"
                    : "Save Identity Settings"}
              </Button>
            </div>
          </TabsContent>

          {/* Contact & Social */}
          <TabsContent value="contact" className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "البريد الإلكتروني الرسمي" : "Official Email"}
                </Label>
                <Input
                  type="email"
                  value={contactEmail}
                  onChange={(e) => setContactEmail(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "رقم الهاتف والواتساب" : "Phone"}
                </Label>
                <Input value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "رابط مجتمع الواتساب العائلي" : "WhatsApp Group URL"}
                </Label>
                <Input value={whatsappUrl} onChange={(e) => setWhatsappUrl(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "حساب منصة X (تويتر)" : "X (Twitter)"}
                </Label>
                <Input value={xUrl} onChange={(e) => setXUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "حساب إنستغرام" : "Instagram"}
                </Label>
                <Input value={instagramUrl} onChange={(e) => setInstagramUrl(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">YouTube</Label>
                <Input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">Snapchat</Label>
                <Input value={snapchatUrl} onChange={(e) => setSnapchatUrl(e.target.value)} />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "أوقات العمل (بالعربية)" : "Office hours (Arabic)"}
                </Label>
                <Input dir="rtl" value={hoursAr} onChange={(e) => setHoursAr(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "أوقات العمل (بالإنجليزية)" : "Office hours (English)"}
                </Label>
                <Input dir="ltr" value={hoursEn} onChange={(e) => setHoursEn(e.target.value)} />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5"
                onClick={() =>
                  handleSaveCategory("contact", "site_contact", {
                    email: contactEmail,
                    phone: contactPhone,
                    whatsapp: whatsappUrl,
                    x: xUrl,
                    instagram: instagramUrl,
                    youtube: youtubeUrl,
                    snapchat: snapchatUrl,
                    hours_ar: hoursAr,
                    hours_en: hoursEn,
                  })
                }
              >
                <Save className="w-3.5 h-3.5" />
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ قنوات التواصل"
                    : "Save Channels"}
              </Button>
            </div>
          </TabsContent>

          {/* Governance & Board */}
          <TabsContent value="governance" className="space-y-4">
            <div className="space-y-1.5">
              <Label className="text-xs font-semibold">
                {isAr ? "عميد الأسرة (المنصب التقليدي)" : "Family Dean"}
              </Label>
              <Input value={deanName} onChange={(e) => setDeanName(e.target.value)} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "رئيس مجلس الأمناء" : "Chairman"}
                </Label>
                <Input value={chairmanName} onChange={(e) => setChairmanName(e.target.value)} />
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs font-semibold">
                  {isAr ? "نائب رئيس مجلس الأمناء" : "Vice Chairman"}
                </Label>
                <Input
                  value={viceChairmanName}
                  onChange={(e) => setViceChairmanName(e.target.value)}
                />
              </div>
            </div>

            <div className="flex justify-end pt-3">
              <Button
                size="sm"
                disabled={loading}
                className="text-xs gap-1.5"
                onClick={() =>
                  handleSaveCategory("governance", "site_governance", {
                    dean_name: deanName,
                    chairman_name: chairmanName,
                    vice_chairman_name: viceChairmanName,
                  })
                }
              >
                <Save className="w-3.5 h-3.5" />
                {loading
                  ? isAr
                    ? "جاري الحفظ..."
                    : "Saving..."
                  : isAr
                    ? "حفظ قيادات الأمانة والمجلس"
                    : "Save Board"}
              </Button>
            </div>
          </TabsContent>

          {/* SEO */}
          <TabsContent value="seo">
            <SeoManager settings={settings} onSaveSetting={onSaveSetting} isAr={isAr} />
          </TabsContent>

          <TabsContent value="images">
            <PageImagesManager settings={settings} onSaveSetting={onSaveSetting} isAr={isAr} />
          </TabsContent>

          <TabsContent value="texts">
            <PageTextsManager settings={settings} onSaveSetting={onSaveSetting} isAr={isAr} />
          </TabsContent>
          <TabsContent value="sponsors">
            <SponsorsManager settings={settings} onSaveSetting={onSaveSetting} isAr={isAr} />
          </TabsContent>

          {/* Security */}
          <TabsContent value="security" className="space-y-4">
            <div className="p-4 border border-border rounded-xl bg-muted/20 space-y-2">
              <h4 className="text-xs font-semibold text-foreground">
                {isAr ? "أمان قاعدة البيانات و RLS وحاويات التخزين" : "Database Security & Storage"}
              </h4>
              <p className="text-xs text-muted-foreground">
                {isAr
                  ? "جميع الجداول (24+ جدول) والملفات في حاويات Supabase Storage محمية بسياسات الأمان على مستوى الصف (RLS). لا يمكن تعديل السجلات الحساسة إلا للمشرفين المصرح لهم مع تسجيل كامل لجميع العمليات في جدول التدقيق والرقابة."
                  : "All tables (24+ tables) and storage buckets are protected with Row Level Security (RLS) policies. Every write operation is audited with actor metadata and payload snapshots."}
              </p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
