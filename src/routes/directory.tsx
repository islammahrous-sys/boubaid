import { useServerFn } from "@tanstack/react-start";
import { useQuery } from "@tanstack/react-query";
import { getMemberDirectory } from "@/lib/directory.functions";
import { useAuth } from "@/hooks/useAuth";
import { Link } from "@tanstack/react-router";
import { Lock, Mail, UserCheck, ShieldCheck, Search, ExternalLink, Phone } from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { branches } from "@/content/site";
import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { businesses } from "@/content/site";
import { PageHeader } from "@/components/site/PageHeader";
import { Eyebrow } from "@/components/site/Editorial";

export const Route = createFileRoute("/directory")({
  head: () => ({
    meta: [
      { title: "دليل الأعمال والأفراد | آل بوعبيد" },
      { name: "description", content: "دليل المنشآت والأعمال وأفراد أسرة آل بوعبيد المعتمدين." },
      { property: "og:title", content: "دليل آل بوعبيد" },
      { property: "og:description", content: "دليل المنشآت والأعمال وأفراد أسرة آل بوعبيد المعتمدين." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://alboabid-heritage-hub.lovable.app/directory" },
    ],
    links: [{ rel: "canonical", href: "https://alboabid-heritage-hub.lovable.app/directory" }],
  }),
  component: DirectoryPage,
});

const copy = {
  eyebrow: { ar: "دليل مبوب", en: "Classified index" } as BiText,
  title: { ar: "دليل الأسرة", en: "Family Directory" } as BiText,
  subtitle: {
    ar: "بوابة التواصل المهني والاجتماعي بين أبناء الأسرة، تشمل المنشآت التجارية ودليل الأفراد المعتمدين.",
    en: "A professional and social gateway for family members, including business listings and verified member directory.",
  } as BiText,

  tabs: {
    businesses: { ar: "دليل الأعمال", en: "Business Directory" } as BiText,
    members: { ar: "دليل الأفراد", en: "Member Directory" } as BiText,
  },

  metaListings: { ar: "عدد القيود", en: "Listings" } as BiText,
  metaSectors: { ar: "القطاعات", en: "Sectors" } as BiText,
  metaUpdated: { ar: "آخر تحديث", en: "Updated" } as BiText,
  metaUpdatedValue: { ar: "١٤٤٧ هـ", en: "1447 AH" } as BiText,

  searchLabel: { ar: "بحث في الدليل", en: "Search the directory" } as BiText,
  searchPlaceholder: {
    ar: "اسم المنشأة، القطاع، أو المدينة…",
    en: "Name, sector, or city…",
  } as BiText,
  memberSearchPlaceholder: {
    ar: "بحث بالاسم، الفرع، أو البريد…",
    en: "Search by name, branch, or email…",
  } as BiText,
  resultsCount: { ar: "قيد مطابق", en: "matching listings" } as BiText,
  empty: {
    ar: "لا توجد قيود مطابقة. جرّب كلمة بحث أخرى.",
    en: "No matching listings. Try a different search term.",
  } as BiText,

  labelCity: { ar: "المدينة", en: "City" } as BiText,
  labelBranch: { ar: "الفرع", en: "Branch" } as BiText,
  labelContact: { ar: "الهاتف", en: "Telephone" } as BiText,
  labelEmail: { ar: "البريد", en: "Email" } as BiText,
  visit: { ar: "الموقع", en: "Website" } as BiText,

  listTitle: { ar: "إدراج منشأة في الدليل", en: "Listing a business" } as BiText,
  listBody: {
    ar: "يُقيَّد في الدليل بعد التحقق من انتساب المالك أو المدير لأحد الفروع السبعة. تُرسل الطلبات إلى الأمانة العامة.",
    en: "Entries are recorded after verifying that the owner or manager belongs to one of the seven branches. Requests go to the secretariat.",
  } as BiText,

  memberGated: {
    title: { ar: "دليل خاص بالأعضاء", en: "Members-Only Directory" } as BiText,
    body: {
      ar: "هذا الدليل مخصص للتواصل بين أبناء الأسرة الموثقين فقط. يرجى تسجيل الدخول لعرض البيانات.",
      en: "This directory is for verified family members only. Please sign in to view details.",
    },
    action: { ar: "تسجيل الدخول", en: "Sign In" } as BiText,
  },
  memberPending: {
    title: { ar: "العضوية قيد المراجعة", en: "Membership Pending" } as BiText,
    body: {
      ar: "حسابك قيد انتظار مراجعة الأمانة العامة. ستتمكن من رؤية الدليل فور اعتماد عضويتك.",
      en: "Your account is awaiting verification by the secretariat. You'll see the directory once approved.",
    },
    action: { ar: "إعدادات الحساب", en: "Account Settings" } as BiText,
  },
  memberOptInNote: {
    ar: "تنويه: يظهر هنا فقط أفراد الأسرة الذين اختاروا مشاركة بياناتهم في الدليل من خلال إعدادات الملف الشخصي.",
    en: "Note: Only family members who opted to share their data in the directory via profile settings appear here.",
  } as BiText,
};

export function DirectoryPage() {
  const { t } = useLang();
  const { user, isMember: authIsMember, loading: authLoading } = useAuth();
  const [activeTab, setActiveTab] = useState("businesses");
  const [query, setQuery] = useState("");
  const [memberQuery, setMemberQuery] = useState("");

  const getMembers = useServerFn(getMemberDirectory);
  const { data: memberData, isLoading: membersLoading } = useQuery({
    queryKey: ["member-directory"],
    queryFn: () => getMembers(),
    enabled: !!user,
  });

  const branchMap = useMemo(() => {
    const m = new Map<string, BiText>();
    branches.forEach((b) => m.set(b.id, b.name));
    return m;
  }, []);

  const sectors = useMemo(() => Array.from(new Set(businesses.map((b) => b.category.en))), []);

  const filteredBusinesses = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return businesses;
    return businesses.filter((b) =>
      [
        b.name.ar,
        b.name.en,
        b.category.ar,
        b.category.en,
        b.city.ar,
        b.city.en,
        b.description.ar,
        b.description.en,
      ]
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  const filteredMembers = useMemo(() => {
    if (!memberData?.members) return [];
    const q = memberQuery.trim().toLowerCase();
    if (!q) return memberData.members;
    return memberData.members.filter((m) =>
      [
        m.full_name_ar,
        m.full_name_en,
        m.email,
        m.phone,
        m.branch_slug ? t(branchMap.get(m.branch_slug) || { ar: "", en: "" }) : "",
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(q),
    );
  }, [memberData, memberQuery, branchMap, t]);

  const groupedBusinesses = useMemo(() => {
    const map = new Map<string, typeof businesses>();
    for (const b of filteredBusinesses) {
      const key = b.category.en;
      map.set(key, [...(map.get(key) ?? []), b]);
    }
    return Array.from(map.entries());
  }, [filteredBusinesses]);

  return (
    <>
      <PageHeader
        eyebrow={t(copy.eyebrow)}
        title={t(copy.title)}
        subtitle={t(copy.subtitle)}
        meta={[
          {
            label: t(copy.metaListings),
            value: (businesses.length + (memberData?.members?.length ?? 0)).toString(),
            mono: true,
          },
          { label: t(copy.metaSectors), value: sectors.length.toString(), mono: true },
          { label: t(copy.metaUpdated), value: t(copy.metaUpdatedValue) },
        ]}
      />

      <div className="container-page py-12 md:py-14">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="mb-8 grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="businesses" className="text-xs sm:text-sm">
              {t(copy.tabs.businesses)}
            </TabsTrigger>
            <TabsTrigger value="members" className="text-xs sm:text-sm">
              {t(copy.tabs.members)}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="businesses" className="mt-0 focus-visible:ring-0">
            {/* Business Search */}
            <div className="border-b border-border pb-5">
              <label
                htmlFor="directory-search"
                className="label-caps mb-2.5 block text-bronze dark:text-gold"
              >
                {t(copy.searchLabel)}
              </label>
              <div className="relative max-w-xl">
                <Search
                  className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
                  aria-hidden="true"
                />
                <input
                  id="directory-search"
                  type="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder={t(copy.searchPlaceholder)}
                  className="w-full border border-input bg-background py-2.5 text-sm outline-none transition-colors focus:border-bronze ps-11 pe-3.5 dark:focus:border-gold"
                />
              </div>
              <p className="nums mt-2.5 text-xs text-muted-foreground" aria-live="polite">
                {filteredBusinesses.length} {t(copy.resultsCount)}
              </p>
            </div>

            {filteredBusinesses.length === 0 ? (
              <p className="py-20 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
            ) : (
              groupedBusinesses.map(([sector, items]) => (
                <section key={sector} className="reveal-on-scroll mt-12 first:mt-10">
                  <Eyebrow>{t(items[0].category)}</Eyebrow>

                  <ol className="mt-4 border-t border-ink/25 dark:border-ivory/20">
                    {items.map((b) => (
                      <li key={b.id} className="border-b border-border py-6">
                        <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[1fr_minmax(0,16rem)]">
                          <div>
                            <h3 className="text-[15px] font-semibold text-foreground">{t(b.name)}</h3>
                            <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                              {t(b.description)}
                            </p>
                          </div>

                          <dl className="space-y-1.5 text-[13px] lg:border-s lg:border-border lg:ps-8">
                            <div className="flex gap-2">
                              <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                {t(copy.labelCity)}
                              </dt>
                              <dd className="text-foreground">{t(b.city)}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                {t(copy.labelBranch)}
                              </dt>
                              <dd className="text-foreground">{t(b.ownerBranch)}</dd>
                            </div>
                            <div className="flex gap-2">
                              <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                {t(copy.labelContact)}
                              </dt>
                              <dd>
                                <a
                                  href={`tel:${b.contact.replace(/\s/g, "")}`}
                                  dir="ltr"
                                  className="nums inline-flex items-center gap-1.5 font-mono text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                                >
                                  <Phone className="h-3 w-3" aria-hidden="true" />
                                  {b.contact}
                                </a>
                              </dd>
                            </div>
                            <div className="flex gap-2 pt-1">
                              <dt className="w-20 shrink-0" aria-hidden="true" />
                              <dd>
                                <a
                                  href={b.website}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1.5 border-b border-bronze pb-0.5 font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
                                >
                                  {t(copy.visit)}
                                  <ExternalLink className="h-3 w-3" aria-hidden="true" />
                                </a>
                              </dd>
                            </div>
                          </dl>
                        </div>
                      </li>
                    ))}
                  </ol>
                </section>
              ))
            )}

            <aside className="mt-14 border-s-2 border-bronze/40 ps-5 dark:border-gold/40">
              <p className="label-caps mb-2 text-bronze dark:text-gold">{t(copy.listTitle)}</p>
              <p className="measure text-[13px] leading-relaxed text-muted-foreground">
                {t(copy.listBody)}
              </p>
            </aside>
          </TabsContent>

          <TabsContent value="members" className="mt-0 focus-visible:ring-0">
            {!user ? (
              <Card className="mx-auto mt-8 max-w-2xl border-dashed">
                <CardHeader className="text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
                    <Lock className="h-6 w-6 text-muted-foreground" />
                  </div>
                  <CardTitle className="text-xl">{t(copy.memberGated.title)}</CardTitle>
                  <CardDescription className="mt-2 text-sm">
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
                  <CardDescription className="mt-2 text-sm">
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
                {/* Member Search */}
                <div className="border-b border-border pb-5">
                  <label
                    htmlFor="member-search"
                    className="label-caps mb-2.5 block text-bronze dark:text-gold"
                  >
                    {t(copy.searchLabel)}
                  </label>
                  <div className="relative max-w-xl">
                    <Search
                      className="pointer-events-none absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground start-3.5"
                      aria-hidden="true"
                    />
                    <input
                      id="member-search"
                      type="search"
                      value={memberQuery}
                      onChange={(e) => setMemberQuery(e.target.value)}
                      placeholder={t(copy.memberSearchPlaceholder)}
                      className="w-full border border-input bg-background py-2.5 text-sm outline-none transition-colors focus:border-bronze ps-11 pe-3.5 dark:focus:border-gold"
                    />
                  </div>
                  <p className="nums mt-2.5 text-xs text-muted-foreground" aria-live="polite">
                    {filteredMembers.length} {t(copy.resultsCount)}
                  </p>
                </div>

                {membersLoading ? (
                  <div className="py-20 text-center">
                    <div className="mx-auto h-8 w-8 animate-spin rounded-full border-2 border-bronze border-t-transparent dark:border-gold" />
                  </div>
                ) : filteredMembers.length === 0 ? (
                  <p className="py-20 text-center text-sm text-muted-foreground">{t(copy.empty)}</p>
                ) : (
                  <ol className="mt-8 border-t border-ink/25 dark:border-ivory/20">
                    {filteredMembers.map((m) => (
                      <li key={m.id} className="border-b border-border py-6">
                        <div className="grid gap-x-10 gap-y-4 lg:grid-cols-[1fr_minmax(0,16rem)]">
                          <div>
                            <h3 className="text-[15px] font-semibold text-foreground">
                              {t({ ar: m.full_name_ar || "", en: m.full_name_en || "" })}
                            </h3>
                            {m.lineage_notes && (
                              <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                                {m.lineage_notes}
                              </p>
                            )}
                          </div>

                          <dl className="space-y-1.5 text-[13px] lg:border-s lg:border-border lg:ps-8">
                            <div className="flex gap-2">
                              <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                {t(copy.labelBranch)}
                              </dt>
                              <dd className="text-foreground">
                                {m.branch_slug ? t(branchMap.get(m.branch_slug) || { ar: m.branch_slug, en: m.branch_slug }) : "—"}
                              </dd>
                            </div>
                            {m.phone && (
                              <div className="flex gap-2">
                                <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                  {t(copy.labelContact)}
                                </dt>
                                <dd>
                                  <a
                                    href={`tel:${m.phone.replace(/\s/g, "")}`}
                                    dir="ltr"
                                    className="nums inline-flex items-center gap-1.5 font-mono text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                                  >
                                    <Phone className="h-3 w-3" aria-hidden="true" />
                                    {m.phone}
                                  </a>
                                </dd>
                              </div>
                            )}
                            {m.email && (
                              <div className="flex gap-2">
                                <dt className="label-caps w-20 shrink-0 pt-0.5 text-muted-foreground">
                                  {t(copy.labelEmail)}
                                </dt>
                                <dd className="truncate">
                                  <a
                                    href={`mailto:${m.email}`}
                                    className="inline-flex items-center gap-1.5 text-foreground transition-colors hover:text-bronze dark:hover:text-gold"
                                  >
                                    <Mail className="h-3 w-3" aria-hidden="true" />
                                    {m.email}
                                  </a>
                                </dd>
                              </div>
                            )}
                          </dl>
                        </div>
                      </li>
                    ))}
                  </ol>
                )}

                <aside className="mt-14 border-s-2 border-bronze/40 ps-5 dark:border-gold/40">
                  <p className="label-caps mb-2 text-bronze dark:text-gold">{t({ ar: "تنبيه", en: "Notice" })}</p>
                  <p className="measure text-[13px] leading-relaxed text-muted-foreground">
                    {t(copy.memberOptInNote)}
                  </p>
                </aside>
              </>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
