import { createFileRoute, Link } from "@tanstack/react-router";
import {
  ArrowLeft,
  ArrowRight,
  Award,
  BadgeCheck,
  Banknote,
  BookOpen,
  Briefcase,
  Calculator,
  CalendarDays,
  ClipboardList,
  CreditCard,
  Dna,
  FileBadge,
  FileText,
  Flower2,
  Frame,
  GitBranch,
  Globe,
  GraduationCap,
  HandHeart,
  HeartHandshake,
  Images,
  Landmark,
  LayoutTemplate,
  Mail,
  Megaphone,
  Network,
  PencilLine,
  Scale,
  ShieldCheck,
  Shirt,
  Sparkles,
  Store,
  Trophy,
  Users,
  Search,
  Loader2,
  CheckCircle2,
  Clock,
  AlertCircle,
  XCircle,
  Copy,
  Check,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import type { BiText } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { PageHeader } from "@/components/site/PageHeader";
import { SectionRail, type RailSection } from "@/components/site/SectionRail";
import { Eyebrow, Ornament } from "@/components/site/Editorial";
import { getCanonicalUrl } from "@/lib/seo";
import { CouncilRequestForm } from "@/components/site/CouncilRequestForm";
import type { CouncilRequestType } from "@/lib/forms.schemas";
import {
  COMMITTEE_REQUEST_DESTINATIONS,
  COUNCIL_REQUESTS,
  TEMPLATE_REQUESTS,
} from "@/lib/council-requests";
import { copy } from "@/content/page-copy/requests";
import {
  trackCouncilRequest,
  getMyCouncilRequests,
  type TrackedRequestResult,
} from "@/lib/forms.functions";
import { formatDualDate } from "@/lib/dates";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { inl } from "@/content/page-copy/requests-inline";

export const Route = createFileRoute("/requests")({
  /**
   * `?request=<type>` lets any action elsewhere on the site (Roll of Honour
   * nomination, archive photo submission, …) land directly on its own request
   * form instead of asking the visitor to find the card again.
   */
  validateSearch: (search: Record<string, unknown>): { request?: CouncilRequestType } => {
    const value = search.request;
    return typeof value === "string" && value in COUNCIL_REQUESTS
      ? { request: value as CouncilRequestType }
      : {};
  },
  head: () => ({
    meta: [
      { title: "مركز الطلبات | آل بوعبيد" },
      {
        name: "description",
        content:
          "مركز الطلبات في موقع أسرة آل بوعبيد: بوابة واحدة لتقديم طلبات توثيق العضوية والاشتراك والمساهمة وإدراج الأعمال والترشيح لسجل المتميزين ومتابعة حالتها.",
      },
      { property: "og:title", content: "مركز الطلبات — آل بوعبيد" },
      {
        property: "og:description",
        content: "بوابة واحدة لجميع الطلبات: التقديم، المتابعة، والاعتماد.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: getCanonicalUrl("/requests") },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: getCanonicalUrl("/requests") }],
  }),
  component: RequestsHubPage,
});

type RequestGroup =
  | "membership"
  | "committee_requests"
  | "services"
  | "tree"
  | "fund"
  | "participation"
  | "announcements"
  | "general";

const groupTitles: Record<RequestGroup, BiText> = {
  membership: inl.t_d63a2e6a,
  committee_requests: inl.t_7bbf4196,
  services: inl.t_00ee2c37,
  tree: inl.t_8dd1a46a,
  fund: inl.t_71add7e5,
  participation: inl.t_96b311a7,
  announcements: inl.t_1f24e1df,
  general: inl.t_34015107,
};

const groupOrder: RequestGroup[] = [
  "membership",
  "committee_requests",
  "services",
  "tree",
  "fund",
  "participation",
  "announcements",
  "general",
];

/** Logo variant with the strongest contrast against each category's colour band. */
const bandLogo: Record<RequestGroup, string> = {
  membership: "/logo-mark-cream.svg",
  committee_requests: "/logo-mark-cream.svg",
  services: "/logo-mark-cream.svg",
  tree: "/logo-mark-brown.svg",
  fund: "/logo-mark-brown.svg",
  participation: "/logo-mark-cream.svg",
  announcements: "/logo-mark-brown.svg",
  general: "/logo-mark-brown.svg",
};

type RequestEntry = {
  id: string;
  group: RequestGroup;
  /** Either an existing page on this site… */
  to?: string;
  /** …or one of the hub's own forms, submitted in place. */
  form?: CouncilRequestType;
  Icon: LucideIcon;
  name: BiText;
  desc: BiText;
  requiresAuth?: boolean;
  /** Official template code, for the announcement requests linked to a template. */
  templateCode?: string;
};

const committeeIcons: Record<(typeof COMMITTEE_REQUEST_DESTINATIONS)[number]["slug"], LucideIcon> =
  {
    "development-follow-up": ClipboardList,
    "family-headquarters": Landmark,
    "finance-investment": Banknote,
    "family-communication": HeartHandshake,
    "activities-initiatives": Sparkles,
    "media-support-services": Megaphone,
  };

/** Only request types that actually exist on this website. */
const requests: RequestEntry[] = [
  {
    id: "membership",
    group: "membership",
    form: "membership_verification",
    Icon: BadgeCheck,
    name: inl.t_8a980f66,
    desc: inl.t_2b1b2539,
  },
  {
    id: "membership-card",
    group: "membership",
    form: "membership_card",
    Icon: CreditCard,
    name: inl.t_0b324e14,
    desc: inl.t_6059f864,
  },
  {
    id: "contribution",
    group: "membership",
    form: "fund_contribution",
    Icon: Banknote,
    name: inl.t_b8f9bdc1,
    desc: inl.t_63d8e837,
  },

  ...COMMITTEE_REQUEST_DESTINATIONS.map((committee): RequestEntry => ({
    id: committee.slug,
    group: "committee_requests",
    form: committee.requestType as CouncilRequestType,
    Icon: committeeIcons[committee.slug],
    name: committee.name,
    desc: committee.desc,
  })),

  {
    id: "directory",
    group: "services",
    form: "business_listing_new",
    Icon: Briefcase,
    name: inl.t_76decf7d,
    desc: inl.t_82a18b99,
  },
  {
    id: "directory-update",
    group: "services",
    form: "business_listing_update",
    Icon: PencilLine,
    name: inl.t_1023e9f5,
    desc: inl.t_47a4daa3,
  },
  {
    id: "service-establishment",
    group: "services",
    form: "service_establishment",
    Icon: Store,
    name: inl.t_12858ee2,
    desc: inl.t_f807f699,
  },
  {
    id: "service-family",
    group: "services",
    form: "service_family",
    Icon: HandHeart,
    name: inl.t_0c2f876d,
    desc: inl.t_2c3bb6d0,
  },
  {
    id: "legal-consultancy",
    group: "services",
    form: "legal_consultancy",
    Icon: Scale,
    name: inl.t_d2bc3783,
    desc: inl.t_8d784a05,
  },
  {
    id: "accounting-service",
    group: "services",
    form: "accounting_service",
    Icon: Calculator,
    name: inl.t_98f13776,
    desc: inl.t_c9ee1393,
  },
  {
    id: "website-design",
    group: "services",
    form: "website_design",
    Icon: Globe,
    name: inl.t_51f12b37,
    desc: inl.t_daba8870,
  },
  {
    id: "bisht-purchase",
    group: "services",
    form: "bisht_purchase",
    Icon: Shirt,
    name: inl.t_2e0841b0,
    desc: inl.t_92111368,
  },
  {
    id: "oud-purchase",
    group: "services",
    form: "oud_purchase",
    Icon: Flower2,
    name: inl.t_e79957b0,
    desc: inl.t_db2290b7,
  },

  {
    id: "frame",
    group: "tree",
    form: "family_tree_frame",
    Icon: Frame,
    name: inl.t_fb6bdb1d,
    desc: inl.t_c9ad9ef9,
  },
  {
    id: "digital-tree",
    group: "tree",
    form: "digital_family_tree",
    Icon: Network,
    name: inl.t_c34ca41b,
    desc: inl.t_e8be24cd,
  },
  {
    id: "tree-correction",
    group: "tree",
    form: "tree_data_correction",
    Icon: GitBranch,
    name: inl.t_d39996e3,
    desc: inl.t_db0d2c1d,
  },
  {
    id: "archive-contribution",
    group: "tree",
    form: "archive_contribution",
    Icon: Images,
    name: inl.t_8e5051ca,
    desc: inl.t_05408b6e,
  },
  {
    id: "library-submission",
    group: "tree",
    form: "library_submission",
    Icon: BookOpen,
    name: inl.t_0c152b7a,
    desc: inl.t_87595996,
  },
  {
    id: "museum-visit",
    group: "tree",
    form: "museum_visit",
    Icon: Landmark,
    name: inl.t_b5d15301,
    desc: inl.t_e540201e,
  },
  {
    id: "dna-participation",
    group: "tree",
    form: "dna_participation",
    Icon: Dna,
    name: inl.t_b4897956,
    desc: inl.t_4c6e110e,
  },

  {
    id: "fund-attestation",
    group: "fund",
    form: "fund_attestation",
    Icon: FileBadge,
    name: inl.t_9bb407c1,
    desc: inl.t_53395850,
  },
  {
    id: "financial-statements",
    group: "fund",
    form: "financial_statement_copy",
    Icon: FileText,
    name: inl.t_0a7f18b5,
    desc: inl.t_d22cfcd1,
  },
  {
    id: "social-assistance",
    group: "fund",
    form: "social_assistance",
    Icon: HeartHandshake,
    name: inl.t_5b0fc131,
    desc: inl.t_a0547cbb,
  },

  {
    id: "committee-nomination",
    group: "participation",
    form: "committee_nomination",
    Icon: Users,
    name: inl.t_930b7b2c,
    desc: inl.t_73310b90,
  },
  {
    id: "achiever",
    group: "participation",
    form: "achiever_nomination",
    Icon: Award,
    name: inl.t_c83df14a,
    desc: inl.t_57a3747f,
  },
  {
    id: "family-competencies",
    group: "participation",
    form: "family_competencies_nomination",
    Icon: Users,
    name: inl.t_90f0e3d6,
    desc: inl.t_440601a0,
  },
  {
    id: "excellence-award",
    group: "participation",
    form: "excellence_award_application",
    Icon: Trophy,
    name: inl.t_f43136e0,
    desc: inl.t_6ec89112,
  },
  {
    id: "ahsa-councils-join",
    group: "participation",
    form: "ahsa_family_councils_join",
    Icon: HeartHandshake,
    name: inl.t_851a6386,
    desc: inl.t_5010eeca,
  },
  {
    id: "youth-program",
    group: "participation",
    form: "youth_program_enrolment",
    Icon: GraduationCap,
    name: inl.t_d0d09466,
    desc: inl.t_f5d5bd8a,
  },
  {
    id: "competition-entry",
    group: "participation",
    form: "competition_entry",
    Icon: Trophy,
    name: inl.t_f6364880,
    desc: inl.t_3e8de27d,
  },
  {
    id: "event-attendance",
    group: "participation",
    form: "event_attendance",
    Icon: CalendarDays,
    name: inl.t_82e8839d,
    desc: inl.t_419829df,
  },
  {
    id: "initiative-participation",
    group: "participation",
    form: "initiative_participation",
    Icon: Sparkles,
    name: inl.t_a863f942,
    desc: inl.t_4fba5117,
  },

  /**
   * Announcement requests are generated from the official template library —
   * exactly one request per template in النماذج والقوالب, carrying that
   * template's code. The three earlier generic announcement requests (a family
   * occasion request, a customised template request and an official greeting
   * request) duplicated these and have been retired in `council-requests.ts`.
   */
  ...TEMPLATE_REQUESTS.map((tpl): RequestEntry => ({
    id: `template-${tpl.templateCode.toLowerCase()}`,
    group: "announcements",
    form: tpl.key,
    Icon: LayoutTemplate,
    name: tpl.title,
    desc: tpl.desc ?? tpl.details,
    templateCode: tpl.templateCode,
  })),

  {
    id: "inquiry",
    group: "general",
    form: "general_inquiry",
    Icon: Mail,
    name: inl.t_2535ec14,
    desc: inl.t_88cd0626,
  },
];

type ApprovalEntry = {
  id: string;
  group: RequestGroup;
  name: BiText;
  desc: BiText;
  /** Either an in-console tab or a standalone review route. */
  admin?: { domain: string; tab: string };
  route?: "/treasury";
  allow: (roles: string[]) => boolean;
};

const isAdmin = (roles: string[]) => roles.includes("admin") || roles.includes("super_admin");

const approvals: ApprovalEntry[] = [
  {
    id: "ap-membership",
    group: "membership",
    name: inl.t_f4d79be6,
    desc: inl.t_90861988,
    admin: { domain: "system", tab: "users" },
    allow: isAdmin,
  },
  {
    id: "ap-contributions",
    group: "fund",
    name: inl.t_704198a5,
    desc: inl.t_3403d9c8,
    route: "/treasury",
    allow: (roles) => isAdmin(roles) || roles.includes("treasurer"),
  },
  {
    id: "ap-directory",
    group: "services",
    name: inl.t_74f6facc,
    desc: inl.t_eb16d7ce,
    admin: { domain: "community", tab: "directory" },
    allow: isAdmin,
  },
  {
    id: "ap-achievers",
    group: "participation",
    name: inl.t_1600ce22,
    desc: inl.t_fcd2b124,
    admin: { domain: "community", tab: "achievers" },
    allow: isAdmin,
  },
  {
    id: "ap-inquiries",
    group: "general",
    name: inl.t_3962f0d5,
    desc: inl.t_b29ea01d,
    admin: { domain: "community", tab: "inquiries" },
    allow: isAdmin,
  },
];

const railSections: RailSection[] = [
  { id: "submit", label: inl.t_d3b6d1b9 },
  { id: "mine", label: inl.t_0bd69562 },
  { id: "approvals", label: inl.t_3bd71d6a },
];

function RequestsHubPage() {
  const { t, lang } = useLang();
  const { user, roles } = useAuth();
  const rtl = lang === "ar";
  const Arrow = rtl ? ArrowLeft : ArrowRight;

  const myApprovals = approvals.filter((a) => a.allow(roles));
  const { request: requestedForm } = Route.useSearch();
  // Committee-nomination links lead to the committee requests section, never auto-open a form.
  const autoOpen = requestedForm && requestedForm !== "committee_nomination" ? requestedForm : null;
  const [activeForm, setActiveForm] = useState<CouncilRequestType | null>(autoOpen);
  useEffect(() => {
    if (requestedForm !== "committee_nomination") return;
    const id = window.setTimeout(() => {
      document
        .getElementById("committee-requests")
        ?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 300);
    return () => window.clearTimeout(id);
  }, [requestedForm]);

  // Request Tracker state
  const [trackRefInput, setTrackRefInput] = useState("");
  const [isSearchingTrack, setIsSearchingTrack] = useState(false);
  const [trackedResult, setTrackedResult] = useState<TrackedRequestResult | null>(null);
  const [trackedSearched, setTrackedSearched] = useState(false);
  const [copiedTrackRef, setCopiedTrackRef] = useState(false);

  const trackServerFn = useServerFn(trackCouncilRequest);
  const getMyRequestsServerFn = useServerFn(getMyCouncilRequests);

  const { data: myRequestsData, isLoading: isLoadingMyRequests } = useQuery({
    queryKey: ["my-council-requests", user?.id],
    queryFn: () => getMyRequestsServerFn(),
    enabled: !!user,
  });

  const handleTrackSubmit = async (e?: React.FormEvent, overrideRef?: string) => {
    if (e) e.preventDefault();
    const clean = (overrideRef ?? trackRefInput).trim();
    if (!clean) return;
    if (overrideRef) setTrackRefInput(overrideRef);
    setIsSearchingTrack(true);
    setTrackedSearched(true);
    try {
      const res = await trackServerFn({ data: { reference: clean } });
      setTrackedResult(res);
      if (!res.ok) {
        toast.error(t(copy.trackNotFound));
      }
    } catch {
      setTrackedResult({ ok: false, error: "not_found" });
      toast.error(t(copy.trackNotFound));
    } finally {
      setIsSearchingTrack(false);
    }
  };

  const copyRefToClipboard = (ref: string) => {
    navigator.clipboard.writeText(ref);
    setCopiedTrackRef(true);
    toast.success(t(inl.t_028c6abd));
    setTimeout(() => setCopiedTrackRef(false), 2000);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "new":
        return (
          <Badge
            variant="outline"
            className="border-blue-500/30 bg-blue-500/10 text-blue-700 dark:text-blue-400 gap-1.5 py-1 px-3"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-blue-500 animate-pulse" />
            {t(copy.statusNew)}
          </Badge>
        );
      case "open":
      case "in_progress":
        return (
          <Badge
            variant="outline"
            className="border-amber-500/30 bg-amber-500/10 text-amber-700 dark:text-amber-400 gap-1.5 py-1 px-3"
          >
            <Clock className="h-3.5 w-3.5" />
            {t(copy.statusReview)}
          </Badge>
        );
      case "approved":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5 py-1 px-3"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t(copy.statusApproved)}
          </Badge>
        );
      case "rejected":
        return (
          <Badge
            variant="outline"
            className="border-red-500/30 bg-red-500/10 text-red-700 dark:text-red-400 gap-1.5 py-1 px-3"
          >
            <XCircle className="h-3.5 w-3.5" />
            {t(copy.statusRejected)}
          </Badge>
        );
      case "resolved":
      case "completed":
        return (
          <Badge
            variant="outline"
            className="border-emerald-500/30 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 gap-1.5 py-1 px-3"
          >
            <CheckCircle2 className="h-3.5 w-3.5" />
            {t(copy.statusCompleted)}
          </Badge>
        );
      default:
        return (
          <Badge variant="outline" className="text-muted-foreground py-1 px-3">
            {status}
          </Badge>
        );
    }
  };

  return (
    <>
      <PageHeader eyebrow={t(copy.eyebrow)} title={t(copy.title)} subtitle={t(copy.subtitle)} />

      <SectionRail sections={railSections} className="print-hide" />

      <div className="container-page py-14 md:py-16">
        {/* ── مسار الطلب ─────────────────────────────────────── */}
        <section className="reveal-on-scroll">
          <Eyebrow rule>{t(copy.lifecycleTitle)}</Eyebrow>
          <ol className="mt-4 flex flex-wrap items-center gap-x-3 gap-y-2 text-[12.5px] text-muted-foreground">
            {copy.steps.map((s, i) => (
              <li key={i} className="flex items-center gap-3">
                <span className="inline-flex items-center gap-2">
                  <span className="nums font-mono text-bronze/70 dark:text-gold/60">
                    {String(i + 1).padStart(2, "0")}
                  </span>
                  <span>{t(s)}</span>
                </span>
                {i < copy.steps.length - 1 ? (
                  <Arrow className="h-3.5 w-3.5 opacity-40" aria-hidden="true" />
                ) : null}
              </li>
            ))}
          </ol>
        </section>

        {/* ── تقديم طلب ──────────────────────────────────────── */}
        <section
          id="submit"
          className="scroll-mt-28 reveal-on-scroll mt-14 border-t border-border pt-12"
        >
          <Eyebrow rule>{t(copy.submitTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.submitNote)}
          </p>

          {groupOrder.map((g) => {
            const items = requests.filter((r) => r.group === g);
            if (items.length === 0) return null;
            return (
              <div
                key={g}
                id={g === "committee_requests" ? "committee-requests" : undefined}
                className="mt-10 scroll-mt-28"
              >
                <h2 className="flex items-center gap-2.5 text-[13px] font-semibold uppercase tracking-[0.14em] text-foreground">
                  <span
                    className={`req-tone-${g} inline-block h-3 w-3 rounded-full bg-[var(--req-band)]`}
                    aria-hidden="true"
                  />
                  {t(groupTitles[g])}
                </h2>
                {g === "committee_requests" ? (
                  <p className="measure mt-2 text-[13px] leading-relaxed text-muted-foreground">
                    {t(copy.committeeIntro)}
                  </p>
                ) : null}
                <ul className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r) => {
                    const Icon = r.Icon;
                    const linkCls =
                      "mt-4 inline-flex items-center gap-2 self-start scroll-mt-28 rounded-md bg-[var(--req-band)] px-3.5 py-2 text-[13px] font-semibold text-[var(--req-on-band)] shadow-sm transition-opacity hover:opacity-90";
                    return (
                      <li
                        key={r.id}
                        tabIndex={0}
                        role="button"
                        aria-label={t(r.name)}
                        onClick={() => {
                          if (r.form) setActiveForm(r.form);
                        }}
                        onKeyDown={(e) => {
                          if (e.key === "Enter" || e.key === " ") {
                            e.preventDefault();
                            if (r.form) setActiveForm(r.form);
                          }
                        }}
                        className={`req-tone req-tone-${g} group flex flex-col overflow-hidden rounded-xl border shadow-sm transition-all hover:shadow-md hover:border-bronze/50 dark:hover:border-gold/50 cursor-pointer focus-visible:outline-hidden focus-visible:ring-2 focus-visible:ring-bronze`}
                      >
                        <div className="flex h-16 items-center justify-between gap-3 bg-[var(--req-band)] px-4">
                          <img
                            src={bandLogo[g]}
                            alt={t(inl.t_0a08ec6f)}
                            className="h-12 w-auto object-contain"
                            loading="lazy"
                          />
                          <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--req-on-band)]/30 text-[var(--req-on-band)]">
                            <Icon className="h-4.5 w-4.5" aria-hidden="true" />
                          </span>
                        </div>
                        <div className="flex flex-1 flex-col p-5">
                          <h3 className="text-[15px] font-semibold text-[var(--req-text)]">
                            {t(r.name)}
                          </h3>
                          <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--req-muted)]">
                            {t(r.desc)}
                          </p>
                          {r.templateCode ? (
                            <Link
                              to="/templates"
                              onClick={(e) => e.stopPropagation()}
                              className="mt-3 inline-flex w-fit items-center gap-1.5 font-mono text-[11px] text-[var(--req-link)] underline-offset-4 hover:underline"
                            >
                              {r.templateCode}
                            </Link>
                          ) : null}
                          {r.requiresAuth && !user ? (
                            <p className="mt-3 text-[11.5px] text-[var(--req-muted)]">
                              {t(copy.signInNote)}
                            </p>
                          ) : null}
                          {r.form ? (
                            <button
                              type="button"
                              id={r.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setActiveForm(r.form!);
                              }}
                              className={linkCls}
                            >
                              {t(copy.action)}
                              <Arrow
                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                                aria-hidden="true"
                              />
                            </button>
                          ) : (
                            <Link
                              to={r.requiresAuth && !user ? "/auth" : (r.to ?? "/contact")}
                              onClick={(e) => e.stopPropagation()}
                              className={linkCls}
                            >
                              {t(copy.action)}
                              <Arrow
                                className="h-3.5 w-3.5 transition-transform group-hover:translate-x-1 rtl:group-hover:-translate-x-1"
                                aria-hidden="true"
                              />
                            </Link>
                          )}
                        </div>
                      </li>
                    );
                  })}
                </ul>
              </div>
            );
          })}
        </section>

        <Ornament className="mt-16" />

        {/* ── طلباتي ─────────────────────────────────────────── */}
        <section
          id="mine"
          className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
        >
          <Eyebrow rule>{t(copy.mineTitle)}</Eyebrow>
          <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
            {t(copy.mineNote)}
          </p>

          {/* تتبع الطلب برقم المعاملة */}
          <div className="mt-8 rounded-2xl border border-border/80 bg-card/60 p-6 md:p-8 backdrop-blur-xs shadow-xs">
            <h3 className="text-base font-bold text-foreground flex items-center gap-2">
              <Search className="h-4.5 w-4.5 text-bronze dark:text-gold" />
              {t(copy.trackTitle)}
            </h3>
            <p className="mt-1 text-xs text-muted-foreground">{t(copy.trackSubtitle)}</p>

            <form
              onSubmit={handleTrackSubmit}
              className="mt-5 flex flex-col sm:flex-row gap-2.5 max-w-xl"
            >
              <Input
                type="text"
                value={trackRefInput}
                onChange={(e) => setTrackRefInput(e.target.value)}
                placeholder={t(copy.trackPlaceholder)}
                className="font-mono text-sm uppercase bg-background"
                disabled={isSearchingTrack}
              />
              <Button
                type="submit"
                disabled={isSearchingTrack || !trackRefInput.trim()}
                className="gap-2 shrink-0 font-bold"
              >
                {isSearchingTrack ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    {t(copy.trackSearching)}
                  </>
                ) : (
                  <>
                    <Search className="h-4 w-4" />
                    {t(copy.trackButton)}
                  </>
                )}
              </Button>
            </form>

            {/* نتيجة التتبع */}
            {trackedSearched && (
              <div className="mt-6 border-t border-border/60 pt-6">
                {trackedResult?.ok && trackedResult.request ? (
                  <div className="rounded-xl border border-bronze/20 bg-bronze/5 dark:bg-bronze/10 p-5 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border/40 pb-4">
                      <div>
                        <span className="text-[11px] font-medium text-muted-foreground block">
                          {t(copy.referenceLabel)}
                        </span>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="font-mono text-base font-bold text-foreground">
                            {trackedResult.request.reference}
                          </span>
                          <button
                            type="button"
                            onClick={() => copyRefToClipboard(trackedResult.request!.reference)}
                            className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                            title={t(inl.t_ffe8c95d)}
                          >
                            {copiedTrackRef ? (
                              <Check className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <Copy className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </div>
                      <div>{getStatusBadge(trackedResult.request.status)}</div>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2 text-xs">
                      <div>
                        <span className="text-muted-foreground block text-[11px] mb-1">
                          {t(inl.t_c8429046)}
                        </span>
                        <span className="font-semibold text-foreground text-sm">
                          {rtl
                            ? trackedResult.request.title || trackedResult.request.topic
                            : trackedResult.request.title_en ||
                              trackedResult.request.title ||
                              trackedResult.request.topic}
                        </span>
                      </div>
                      {(trackedResult.request.committee_name_ar ||
                        trackedResult.request.committee_name_en) && (
                        <div>
                          <span className="text-muted-foreground block text-[11px] mb-1">
                            {t(inl.t_4449482e)}
                          </span>
                          <span className="font-semibold text-foreground text-sm">
                            {rtl
                              ? trackedResult.request.committee_name_ar
                              : trackedResult.request.committee_name_en ||
                                trackedResult.request.committee_name_ar}
                          </span>
                        </div>
                      )}
                      <div>
                        <span className="text-muted-foreground block text-[11px] mb-1">
                          {t(copy.dateSubmitted)}
                        </span>
                        <span className="font-mono text-foreground">
                          {formatDualDate(trackedResult.request.created_at, lang, "short")}
                        </span>
                      </div>
                    </div>

                    {/* Timeline stages */}
                    <div className="pt-3 border-t border-border/40">
                      <span className="text-[11px] font-medium text-muted-foreground block mb-3">
                        {t(inl.t_f1c045d2)}
                      </span>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-xs">
                        <div className="flex items-center gap-2 p-2 rounded-lg bg-emerald-500/10 text-emerald-700 dark:text-emerald-400">
                          <CheckCircle2 className="h-4 w-4 shrink-0" />
                          <span className="font-medium text-[11.5px]">{t(inl.t_a496f8c0)}</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            [
                              "open",
                              "in_progress",
                              "approved",
                              "rejected",
                              "resolved",
                              "completed",
                            ].includes(trackedResult.request.status)
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
                          }`}
                        >
                          {[
                            "open",
                            "in_progress",
                            "approved",
                            "rejected",
                            "resolved",
                            "completed",
                          ].includes(trackedResult.request.status) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : (
                            <Clock className="h-4 w-4 shrink-0 animate-pulse" />
                          )}
                          <span className="font-medium text-[11.5px]">{t(inl.t_0c0bd091)}</span>
                        </div>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            trackedResult.request.status === "rejected"
                              ? "bg-red-500/10 text-red-700 dark:text-red-400"
                              : ["approved", "resolved", "completed"].includes(
                                    trackedResult.request.status,
                                  )
                                ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                                : ["open", "in_progress"].includes(trackedResult.request.status)
                                  ? "bg-amber-500/10 text-amber-700 dark:text-amber-400 font-semibold"
                                  : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {trackedResult.request.status === "rejected" ? (
                            <XCircle className="h-4 w-4 shrink-0" />
                          ) : ["approved", "resolved", "completed"].includes(
                              trackedResult.request.status,
                            ) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : ["open", "in_progress"].includes(trackedResult.request.status) ? (
                            <Clock className="h-4 w-4 shrink-0 animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-current shrink-0" />
                          )}
                          <span className="font-medium text-[11.5px]">
                            {trackedResult.request.status === "rejected"
                              ? t(inl.t_adf4aa12)
                              : t(inl.t_d9f032c0)}
                          </span>
                        </div>
                        <div
                          className={`flex items-center gap-2 p-2 rounded-lg ${
                            ["resolved", "completed"].includes(trackedResult.request.status)
                              ? "bg-emerald-500/10 text-emerald-700 dark:text-emerald-400"
                              : trackedResult.request.status === "approved"
                                ? "bg-blue-500/10 text-blue-700 dark:text-blue-400 font-semibold"
                                : "bg-muted/40 text-muted-foreground"
                          }`}
                        >
                          {["resolved", "completed"].includes(trackedResult.request.status) ? (
                            <CheckCircle2 className="h-4 w-4 shrink-0" />
                          ) : trackedResult.request.status === "approved" ? (
                            <Clock className="h-4 w-4 shrink-0 animate-pulse" />
                          ) : (
                            <div className="h-4 w-4 rounded-full border border-current shrink-0" />
                          )}
                          <span className="font-medium text-[11.5px]">{t(inl.t_74a04d37)}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-4 rounded-xl border border-destructive/20 bg-destructive/5 text-destructive text-xs">
                    <AlertCircle className="h-5 w-5 shrink-0" />
                    <span>{t(copy.trackNotFound)}</span>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* طلبات المستخدم المسجل */}
          {user && (
            <div className="mt-10">
              <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-4">
                <ClipboardList className="h-4 w-4 text-bronze dark:text-gold" />
                {t(copy.myRecentRequests)}
              </h3>

              {isLoadingMyRequests ? (
                <div className="flex items-center justify-center p-8 text-muted-foreground text-xs gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>{t(copy.trackSearching)}</span>
                </div>
              ) : myRequestsData?.requests && myRequestsData.requests.length > 0 ? (
                <div className="grid gap-3 sm:grid-cols-2">
                  {myRequestsData.requests.map((item) => (
                    <div
                      key={item.id}
                      className="p-4 rounded-xl border border-border bg-card/60 flex flex-col justify-between gap-3 text-xs"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div>
                          <span className="font-mono text-[11px] font-bold text-bronze dark:text-gold">
                            {item.reference}
                          </span>
                          <h4 className="font-semibold text-foreground mt-1 line-clamp-1">
                            {item.subject}
                          </h4>
                          {(item.committee_name_ar || item.committee_name_en) && (
                            <span className="text-[11px] text-muted-foreground block mt-0.5">
                              {rtl
                                ? item.committee_name_ar
                                : item.committee_name_en || item.committee_name_ar}
                            </span>
                          )}
                        </div>
                        <div>{getStatusBadge(item.status)}</div>
                      </div>

                      <div className="flex items-center justify-between border-t border-border/40 pt-2 text-[11px] text-muted-foreground">
                        <span className="font-mono">
                          {formatDualDate(item.created_at, lang, "short")}
                        </span>
                        <button
                          type="button"
                          onClick={() => handleTrackSubmit(undefined, item.reference)}
                          className="font-bold text-primary hover:underline flex items-center gap-1"
                        >
                          <Search className="h-3 w-3" />
                          {t(inl.t_8c775a6c)}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-muted-foreground italic">{t(copy.noRequestsYet)}</p>
              )}
            </div>
          )}

          <div className="mt-8">
            <Link
              to={user ? "/account" : "/auth"}
              className="tap-target-y inline-flex items-center gap-2 border-b border-bronze pb-0.5 text-sm font-medium text-bronze transition-colors hover:border-foreground hover:text-foreground dark:border-gold dark:text-gold dark:hover:border-ivory dark:hover:text-ivory"
            >
              <ClipboardList className="h-4 w-4" aria-hidden="true" />
              {user ? t(copy.mineCta) : t(copy.signInCta)}
            </Link>
          </div>
        </section>

        {/* ── الاعتماد ───────────────────────────────────────── */}
        {myApprovals.length > 0 ? (
          <section
            id="approvals"
            className="scroll-mt-28 reveal-on-scroll mt-16 border-t border-border pt-12"
          >
            <Eyebrow rule>{t(copy.approvalsTitle)}</Eyebrow>
            <p className="measure mt-3 text-[13px] leading-relaxed text-muted-foreground">
              {t(copy.approvalsNote)}
            </p>
            <ul className="mt-8 grid gap-4 sm:grid-cols-2">
              {myApprovals.map((a) => {
                const reviewLinkClass =
                  "mt-4 inline-flex items-center gap-2 self-start rounded-md bg-[var(--req-band)] px-3.5 py-2 text-[13px] font-semibold text-[var(--req-on-band)] shadow-sm transition-opacity hover:opacity-90";
                return (
                  <li
                    key={a.id}
                    className={`req-tone req-tone-${a.group} flex flex-col overflow-hidden rounded-xl border shadow-sm transition-shadow hover:shadow-md`}
                  >
                    <div className="flex h-16 items-center justify-between gap-3 bg-[var(--req-band)] px-4">
                      <img
                        src={bandLogo[a.group]}
                        alt={t(inl.t_0a08ec6f)}
                        className="h-12 w-auto max-w-[75%] object-contain"
                      />
                      <span className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-[var(--req-on-band)]/30 text-[var(--req-on-band)]">
                        <ShieldCheck className="h-4.5 w-4.5" aria-hidden="true" />
                      </span>
                    </div>
                    <div className="flex flex-1 flex-col p-5">
                      <h3 className="text-[15px] font-semibold text-[var(--req-text)]">
                        {t(a.name)}
                      </h3>
                      <p className="mt-2 flex-1 text-[13px] leading-relaxed text-[var(--req-muted)]">
                        {t(a.desc)}
                      </p>
                      {a.route ? (
                        <Link to={a.route} className={reviewLinkClass}>
                          {t(inl.t_f62d4b93)}
                          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : a.admin ? (
                        <Link
                          to="/admin"
                          search={{ domain: a.admin.domain, tab: a.admin.tab }}
                          className={reviewLinkClass}
                        >
                          {t(inl.t_f62d4b93)}
                          <Arrow className="h-3.5 w-3.5" aria-hidden="true" />
                        </Link>
                      ) : null}
                    </div>
                  </li>
                );
              })}
            </ul>
          </section>
        ) : null}
      </div>

      <CouncilRequestForm
        type={activeForm}
        open={activeForm !== null}
        onOpenChange={(next) => {
          if (!next) setActiveForm(null);
        }}
      />
    </>
  );
}
