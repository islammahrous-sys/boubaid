import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo, lazy, Suspense } from "react";
import { toast } from "sonner";
import { AlertTriangle, RefreshCw, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { AdminConsoleLayout } from "@/components/console/layout/AdminConsoleLayout";
import { AdminTabSkeleton } from "@/components/console/layout/AdminTabSkeleton";
import { ADMIN_DOMAINS } from "@/components/console/layout/AdminNavigation";
import {
  getDashboardOverview,
  getFamilyHubData,
  upsertFamilyMember,
  deleteFamilyMember,
  upsertFamilyBranch,
  upsertFamilyRelationship,
  deleteFamilyRelationship,
  upsertPlace,
  upsertFamilyHistory,
  getCmsPagesData,
  upsertCmsPage,
  deleteCmsPage,
  getArticlesData,
  upsertArticle,
  getEventsData,
  upsertEvent,
  getAnnouncementsData,
  upsertAnnouncement,
  getMediaAssetsData,
  registerMediaAsset,
  upsertGallery,
  deleteGallery,
  upsertGalleryMedia,
  deleteGalleryMedia,
  updateSortOrder,
  getInquiriesData,
  updateInquiryStatus,
  deleteInquiry,
  updateContactMessageStatus,
  addInquiryNote,
  getUsersAndRolesData,
  assignUserRole,
  removeUserRole,
  getAuditLogsData,
  getSiteSettingsData,
  upsertSiteSetting,
  getDirectoryManagementData,
  upsertBusiness,
  deleteBusiness,
  reviewMembershipRequest,
  getTreasuryManagementData,
  reviewTreasuryContribution,
  getInitiativesManagementData,
  upsertInitiative,
  deleteInitiative,
  getAchieversManagementData,
  upsertAchiever,
  deleteAchiever,
  getLibraryManagementData,
  upsertLibraryItem,
  deleteLibraryItem,
  getNavigationManagementData,
  upsertNavigationMenu,
  upsertNavigationItem,
  deleteNavigationItem,
  updateEventRegistrationStatus,
  deleteEventRegistration,
  updateInitiativeRegistrationStatus,
  deleteInitiativeRegistration,
  bulkFamilyMembersAction,
  bulkArticlesAction,
  broadcastNotification,
  getDnaStudiesData,
  saveDnaStudiesData,
  getAdminNotificationsList,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotification,
} from "@/lib/admin-hub.functions";
import { saveTreasuryConfig, createManualContribution } from "@/lib/contributions.functions";
// Every manager below is only ever shown for one admin tab at a time, so
// loading all ~26 of them eagerly bloated /admin's own JS bundle to ~935KB —
// dwarfing every other route's chunk and dominating the "admin feels laggy"
// complaint, since that has to download+parse+execute before *anything*
// renders, even a first visit to the small Dashboard tab. Lazy-loading each
// one means /admin's own bundle now only carries the shell (AdminConsoleLayout
// + AdminTabSkeleton), and each manager's chunk is fetched on first visit to
// its tab, then cached by the browser for the rest of the session.
const AdminDashboardOverview = lazy(() =>
  import("@/components/console/dashboard/AdminDashboardOverview").then((m) => ({
    default: m.AdminDashboardOverview,
  })),
);
const HomepageManager = lazy(() =>
  import("@/components/console/cms/HomepageManager").then((m) => ({ default: m.HomepageManager })),
);
const RolesPermissionMatrix = lazy(() =>
  import("@/components/console/users/RolesPermissionMatrix").then((m) => ({
    default: m.RolesPermissionMatrix,
  })),
);
const FamilyMembersTable = lazy(() =>
  import("@/components/console/family/FamilyMembersTable").then((m) => ({
    default: m.FamilyMembersTable,
  })),
);
const FamilyTreeViewer = lazy(() =>
  import("@/components/console/family/FamilyTreeViewer").then((m) => ({
    default: m.FamilyTreeViewer,
  })),
);
const FamilyBranchesManager = lazy(() =>
  import("@/components/console/family/FamilyBranchesManager").then((m) => ({
    default: m.FamilyBranchesManager,
  })),
);
const FamilyRelationshipsManager = lazy(() =>
  import("@/components/console/family/FamilyRelationshipsManager").then((m) => ({
    default: m.FamilyRelationshipsManager,
  })),
);
const FamilyHistoryManager = lazy(() =>
  import("@/components/console/family/FamilyHistoryManager").then((m) => ({
    default: m.FamilyHistoryManager,
  })),
);
const FamilyImportExportDialog = lazy(() =>
  import("@/components/console/family/FamilyImportExportDialog").then((m) => ({
    default: m.FamilyImportExportDialog,
  })),
);
const PagesManager = lazy(() =>
  import("@/components/console/cms/PagesManager").then((m) => ({ default: m.PagesManager })),
);
const ArticlesManager = lazy(() =>
  import("@/components/console/articles/ArticlesManager").then((m) => ({
    default: m.ArticlesManager,
  })),
);
const EventsManager = lazy(() =>
  import("@/components/console/events/EventsManager").then((m) => ({ default: m.EventsManager })),
);
const AnnouncementsManager = lazy(() =>
  import("@/components/console/announcements/AnnouncementsManager").then((m) => ({
    default: m.AnnouncementsManager,
  })),
);
const MediaLibrary = lazy(() =>
  import("@/components/console/media/MediaLibrary").then((m) => ({ default: m.MediaLibrary })),
);
const MuseumArchiveManager = lazy(() =>
  import("@/components/console/museum/MuseumArchiveManager").then((m) => ({
    default: m.MuseumArchiveManager,
  })),
);
const PlacesManager = lazy(() =>
  import("@/components/console/places/PlacesManager").then((m) => ({ default: m.PlacesManager })),
);
const InquiriesManager = lazy(() =>
  import("@/components/console/inquiries/InquiriesManager").then((m) => ({
    default: m.InquiriesManager,
  })),
);
const UsersManager = lazy(() =>
  import("@/components/console/users/UsersManager").then((m) => ({ default: m.UsersManager })),
);
const AuditLogsViewer = lazy(() =>
  import("@/components/console/activity/AuditLogsViewer").then((m) => ({
    default: m.AuditLogsViewer,
  })),
);
const SiteSettingsManager = lazy(() =>
  import("@/components/console/settings/SiteSettingsManager").then((m) => ({
    default: m.SiteSettingsManager,
  })),
);
const DirectoryManager = lazy(() =>
  import("@/components/console/directory/DirectoryManager").then((m) => ({
    default: m.DirectoryManager,
  })),
);
const TreasuryManager = lazy(() =>
  import("@/components/console/treasury/TreasuryManager").then((m) => ({
    default: m.TreasuryManager,
  })),
);
const InitiativesManager = lazy(() =>
  import("@/components/console/initiatives/InitiativesManager").then((m) => ({
    default: m.InitiativesManager,
  })),
);
const AchieversManager = lazy(() =>
  import("@/components/console/achievers/AchieversManager").then((m) => ({
    default: m.AchieversManager,
  })),
);
const LibraryItemsManager = lazy(() =>
  import("@/components/console/library/LibraryItemsManager").then((m) => ({
    default: m.LibraryItemsManager,
  })),
);
const NavigationManager = lazy(() =>
  import("@/components/console/navigation/NavigationManager").then((m) => ({
    default: m.NavigationManager,
  })),
);
const DnaStudiesManager = lazy(() =>
  import("@/components/console/dna/DnaStudiesManager").then((m) => ({
    default: m.DnaStudiesManager,
  })),
);

type AdminSearch = {
  domain?: string;
  tab?: string;
};

export const Route = createFileRoute("/_authenticated/admin")({
  validateSearch: (search: Record<string, unknown>): AdminSearch => {
    return {
      domain: typeof search.domain === "string" ? search.domain : undefined,
      tab: typeof search.tab === "string" ? search.tab : undefined,
    };
  },
  head: () => ({
    meta: [
      { title: "منظومة أمانة المجلس والـ CMS الشاملة | أسرة آل بوعبيد" },
      {
        name: "description",
        content:
          "المنظومة الإدارية المتكاملة لإدارة شجرة العائلة، الخزينة، الدليل، المبادرات، والمحتوى.",
      },
      { name: "robots", content: "noindex" },
    ],
  }),
  component: MasterAdminPage,
});

function MasterAdminPage() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const { canAccessConsole, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const searchParams = useSearch({ from: "/_authenticated/admin" });
  const navigate = useNavigate({ from: Route.fullPath });

  const activeDomainId = searchParams.domain || "dashboard";
  const activeTabId =
    searchParams.tab ||
    (activeDomainId === "dashboard"
      ? "overview"
      : ADMIN_DOMAINS.find((d) => d.id === activeDomainId)?.tabs[0]?.id || "overview");

  const [importExportOpen, setImportExportOpen] = useState(false);
  // Sub-switcher inside the merged "library_items" tab -- library documents
  // and museum photo collections are different enough in shape (flat items
  // vs. collection-of-images) to stay separate managers, but they now share
  // one admin tab per the merge with the public /library page.
  const [librarySubTab, setLibrarySubTab] = useState<"documents" | "museum">("documents");
  const [selectedRelMemberId, setSelectedRelMemberId] = useState<string | null>(null);

  // Server functions
  const fetchOverview = useServerFn(getDashboardOverview);
  const fetchFamily = useServerFn(getFamilyHubData);
  const fetchPages = useServerFn(getCmsPagesData);
  const fetchArticles = useServerFn(getArticlesData);
  const fetchEvents = useServerFn(getEventsData);
  const fetchAnnouncements = useServerFn(getAnnouncementsData);
  const fetchMedia = useServerFn(getMediaAssetsData);
  const fetchInquiries = useServerFn(getInquiriesData);
  const fetchUsers = useServerFn(getUsersAndRolesData);
  const fetchAudit = useServerFn(getAuditLogsData);
  const fetchSettings = useServerFn(getSiteSettingsData);
  const fetchDirectory = useServerFn(getDirectoryManagementData);
  const fetchTreasury = useServerFn(getTreasuryManagementData);
  const fetchInitiatives = useServerFn(getInitiativesManagementData);
  const fetchAchievers = useServerFn(getAchieversManagementData);
  const fetchLibrary = useServerFn(getLibraryManagementData);
  const fetchNavigation = useServerFn(getNavigationManagementData);
  const fetchDna = useServerFn(getDnaStudiesData);
  const fetchNotifs = useServerFn(getAdminNotificationsList);

  // Mutations
  const saveMemberMut = useServerFn(upsertFamilyMember);
  const delMemberMut = useServerFn(deleteFamilyMember);
  const bulkMembersMut = useServerFn(bulkFamilyMembersAction);
  const saveBranchMut = useServerFn(upsertFamilyBranch);
  const saveRelMut = useServerFn(upsertFamilyRelationship);
  const delRelMut = useServerFn(deleteFamilyRelationship);
  const savePlaceMut = useServerFn(upsertPlace);
  const saveHistMut = useServerFn(upsertFamilyHistory);
  const savePageMut = useServerFn(upsertCmsPage);
  const delPageMut = useServerFn(deleteCmsPage);
  const saveArtMut = useServerFn(upsertArticle);
  const bulkArtMut = useServerFn(bulkArticlesAction);
  const saveEventMut = useServerFn(upsertEvent);
  const updateRegMut = useServerFn(updateEventRegistrationStatus);
  const delRegMut = useServerFn(deleteEventRegistration);
  const saveAnnMut = useServerFn(upsertAnnouncement);
  const broadcastNotifMut = useServerFn(broadcastNotification);
  const markNotifReadMut = useServerFn(markNotificationRead);
  const markAllNotifsReadMut = useServerFn(markAllNotificationsRead);
  const deleteNotifMut = useServerFn(deleteNotification);
  const saveMediaMut = useServerFn(registerMediaAsset);
  const saveGalleryMut = useServerFn(upsertGallery);
  const delGalleryMut = useServerFn(deleteGallery);
  const saveGalleryMediaMut = useServerFn(upsertGalleryMedia);
  const delGalleryMediaMut = useServerFn(deleteGalleryMedia);
  const reorderMut = useServerFn(updateSortOrder);
  const updateInqStatusMut = useServerFn(updateInquiryStatus);
  const delInquiryMut = useServerFn(deleteInquiry);
  const updateContactStatusMut = useServerFn(updateContactMessageStatus);
  const addNoteMut = useServerFn(addInquiryNote);
  const assignRoleMut = useServerFn(assignUserRole);
  const removeRoleMut = useServerFn(removeUserRole);
  const saveSettingMut = useServerFn(upsertSiteSetting);
  const saveBizMut = useServerFn(upsertBusiness);
  const delBizMut = useServerFn(deleteBusiness);
  const reviewReqMut = useServerFn(reviewMembershipRequest);
  const reviewTreasuryMut = useServerFn(reviewTreasuryContribution);
  const saveTreasuryConfigMut = useServerFn(saveTreasuryConfig);
  const createManualContributionMut = useServerFn(createManualContribution);
  const saveInitMut = useServerFn(upsertInitiative);
  const delInitMut = useServerFn(deleteInitiative);
  const updateInitRegMut = useServerFn(updateInitiativeRegistrationStatus);
  const delInitRegMut = useServerFn(deleteInitiativeRegistration);
  const saveAchMut = useServerFn(upsertAchiever);
  const delAchMut = useServerFn(deleteAchiever);
  const saveLibMut = useServerFn(upsertLibraryItem);
  const delLibMut = useServerFn(deleteLibraryItem);
  const saveNavMenuMut = useServerFn(upsertNavigationMenu);
  const saveNavItemMut = useServerFn(upsertNavigationItem);
  const delNavItemMut = useServerFn(deleteNavigationItem);
  const saveDnaMut = useServerFn(saveDnaStudiesData);

  // Gated, high-performance cached queries (5 min staleTime, 30 min cache)
  const queryConfig = {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 30,
    placeholderData: (previousData: any) => previousData,
  };

  const {
    data: overviewData,
    isLoading: overviewLoading,
    error: overviewError,
  } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: canAccessConsole && activeDomainId === "dashboard",
    ...queryConfig,
  });

  const {
    data: familyData,
    isLoading: familyLoading,
    error: familyError,
  } = useQuery({
    queryKey: ["family-hub-data"],
    queryFn: () => fetchFamily(),
    enabled:
      canAccessConsole &&
      (activeDomainId === "family" || (activeDomainId === "content" && activeTabId === "events")),
    ...queryConfig,
  });

  const {
    data: pagesData,
    isLoading: pagesLoading,
    error: pagesError,
  } = useQuery({
    queryKey: ["cms-pages-data"],
    queryFn: () => fetchPages(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "pages",
    ...queryConfig,
  });

  const {
    data: articlesData,
    isLoading: articlesLoading,
    error: articlesError,
  } = useQuery({
    queryKey: ["cms-articles-data"],
    queryFn: () => fetchArticles(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "articles",
    ...queryConfig,
  });

  const {
    data: eventsData,
    isLoading: eventsLoading,
    error: eventsError,
  } = useQuery({
    queryKey: ["events-data"],
    queryFn: () => fetchEvents(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "events",
    ...queryConfig,
  });

  const {
    data: announcementsData,
    isLoading: announcementsLoading,
    error: announcementsError,
  } = useQuery({
    queryKey: ["announcements-data"],
    queryFn: () => fetchAnnouncements(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "announcements",
    ...queryConfig,
  });

  const {
    data: mediaData,
    isLoading: mediaLoading,
    error: mediaError,
  } = useQuery({
    queryKey: ["media-data"],
    queryFn: () => fetchMedia(),
    enabled:
      canAccessConsole &&
      (activeDomainId === "media" || activeDomainId === "content") &&
      (activeTabId === "media_library" || activeTabId === "library_items"),
    ...queryConfig,
  });

  const {
    data: inquiriesData,
    isLoading: inquiriesLoading,
    error: inquiriesError,
  } = useQuery({
    queryKey: ["inquiries-data"],
    queryFn: () => fetchInquiries(),
    enabled: canAccessConsole && activeDomainId === "community" && activeTabId === "inquiries",
    ...queryConfig,
  });

  const {
    data: usersData,
    isLoading: usersLoading,
    error: usersError,
  } = useQuery({
    queryKey: ["users-data"],
    queryFn: () => fetchUsers(),
    enabled:
      canAccessConsole &&
      activeDomainId === "system" &&
      // The roles matrix renders the live `permissions` / `role_permissions`
      // rows this same query returns, so it needs the data too.
      (activeTabId === "users" || activeTabId === "roles_matrix"),
    ...queryConfig,
  });

  const {
    data: auditData,
    isLoading: auditLoading,
    error: auditError,
  } = useQuery({
    queryKey: ["audit-data"],
    queryFn: () => fetchAudit(),
    enabled: canAccessConsole && activeDomainId === "system" && activeTabId === "audit_logs",
    ...queryConfig,
  });

  const {
    data: settingsData,
    isLoading: settingsLoading,
    error: settingsError,
  } = useQuery({
    queryKey: ["site-settings-data"],
    queryFn: () => fetchSettings(),
    enabled:
      canAccessConsole &&
      (activeDomainId === "system" || (activeDomainId === "content" && activeTabId === "homepage")),
    ...queryConfig,
  });

  const {
    data: directoryData,
    isLoading: directoryLoading,
    error: directoryError,
  } = useQuery({
    queryKey: ["directory-management-data"],
    queryFn: () => fetchDirectory(),
    enabled:
      canAccessConsole &&
      activeDomainId === "community" &&
      (activeTabId === "directory" || activeTabId === "verification"),
    ...queryConfig,
  });

  const {
    data: treasuryData,
    isLoading: treasuryLoading,
    error: treasuryError,
  } = useQuery({
    queryKey: ["treasury-management-data"],
    queryFn: () => fetchTreasury(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "treasury_ledger",
    ...queryConfig,
  });

  const {
    data: initiativesData,
    isLoading: initiativesLoading,
    error: initiativesError,
  } = useQuery({
    queryKey: ["initiatives-management-data"],
    queryFn: () => fetchInitiatives(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "initiatives",
    ...queryConfig,
  });

  const {
    data: achieversData,
    isLoading: achieversLoading,
    error: achieversError,
  } = useQuery({
    queryKey: ["achievers-management-data"],
    queryFn: () => fetchAchievers(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "achievers",
    ...queryConfig,
  });

  const {
    data: libraryData,
    isLoading: libraryLoading,
    error: libraryError,
  } = useQuery({
    queryKey: ["library-management-data"],
    queryFn: () => fetchLibrary(),
    enabled:
      canAccessConsole &&
      (activeDomainId === "media" || activeDomainId === "content") &&
      activeTabId === "library_items",
    ...queryConfig,
  });

  const {
    data: navigationData,
    isLoading: navigationLoading,
    error: navigationError,
  } = useQuery({
    queryKey: ["navigation-management-data"],
    queryFn: () => fetchNavigation(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "navigation",
    ...queryConfig,
  });

  const {
    data: dnaData,
    isLoading: dnaLoading,
    error: dnaError,
  } = useQuery({
    queryKey: ["dna-studies-data"],
    queryFn: () => fetchDna(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "dna",
    ...queryConfig,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifs(),
    enabled: canAccessConsole,
    refetchInterval: 60000,
    staleTime: 30000,
  });

  // Query Refreshes
  const refreshNotifs = () => {
    void queryClient.invalidateQueries({ queryKey: ["admin-notifications"] });
  };
  const refreshFamily = () => {
    void queryClient.invalidateQueries({ queryKey: ["family-hub-data"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const refreshPages = () => {
    void queryClient.invalidateQueries({ queryKey: ["cms-pages-data"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const refreshArticles = () => {
    void queryClient.invalidateQueries({ queryKey: ["cms-articles-data"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const refreshEvents = () => {
    void queryClient.invalidateQueries({ queryKey: ["events-data"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const refreshAnnouncements = () => {
    void queryClient.invalidateQueries({ queryKey: ["announcements-data"] });
  };
  const refreshMedia = () => {
    void queryClient.invalidateQueries({ queryKey: ["media-data"] });
  };
  const refreshInquiries = () => {
    void queryClient.invalidateQueries({ queryKey: ["inquiries-data"] });
    void queryClient.invalidateQueries({ queryKey: ["admin-overview"] });
  };
  const refreshUsers = () => {
    void queryClient.invalidateQueries({ queryKey: ["users-data"] });
  };
  const refreshDirectory = () => {
    void queryClient.invalidateQueries({ queryKey: ["directory-management-data"] });
  };
  const refreshTreasury = () => {
    void queryClient.invalidateQueries({ queryKey: ["treasury-management-data"] });
  };
  const refreshInitiatives = () => {
    void queryClient.invalidateQueries({ queryKey: ["initiatives-management-data"] });
  };
  const refreshAchievers = () => {
    void queryClient.invalidateQueries({ queryKey: ["achievers-management-data"] });
  };
  const refreshLibrary = () => {
    void queryClient.invalidateQueries({ queryKey: ["library-management-data"] });
  };
  const refreshNavigation = () => {
    void queryClient.invalidateQueries({ queryKey: ["navigation-management-data"] });
  };
  const refreshDna = () => {
    void queryClient.invalidateQueries({ queryKey: ["dna-studies-data"] });
  };

  // Every mutation below used to fire-and-forget: a failed save (validation,
  // a forbidden role, a network blip) was silently swallowed — the admin got
  // no feedback and the panel just looked unresponsive. Route every mutation
  // through here so failures always surface as a toast.
  // Every one of this console's ~47 save/delete/assign actions is wired
  // through this one function, and most of their manager components wrap
  // their own call in `try { await onXxx(...); toast.success(...) } catch {
  // toast.error(...) }` -- clearly written assuming a failure throws. It
  // didn't: this used to swallow every error internally and never rethrow,
  // so `await onXxx(...)` always resolved and every one of those callers'
  // success toasts fired unconditionally, even when the action had actually
  // failed server-side (this masked a real bug: removing a role silently
  // did nothing while still reporting "Role removed"). Rethrowing after
  // showing this function's own error toast restores the behavior those
  // callers already assumed.
  const runMutation = async (action: () => Promise<unknown>, onSuccess: () => void) => {
    try {
      await action();
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.message ||
          (isAr
            ? "حدث خطأ أثناء الحفظ. حاول مرة أخرى."
            : "Something went wrong. Please try again."),
      );
      throw err;
    }
  };

  // Badge counts calculation
  const badgeCounts = useMemo(() => {
    const pendingInquiries = inquiriesData
      ? inquiriesData.inquiries.filter((i: any) => i.status === "new").length
      : (overviewData?.pendingInquiries ?? 0);

    const pendingReceipts = treasuryData
      ? treasuryData.contributions.filter((c: any) => c.status === "pending").length
      : (overviewData?.pendingReceipts ?? 0);

    const pendingVerifications = directoryData
      ? directoryData.membershipRequests.filter((r: any) => r.status === "pending").length
      : (overviewData?.pendingVerifications ?? 0);

    const draftArticles = articlesData
      ? articlesData.articles.filter((a: any) => a.status === "draft").length
      : (overviewData?.draftArticles ?? 0);

    return {
      pendingInquiries,
      pendingReceipts,
      pendingVerifications,
      draftArticles,
    };
  }, [overviewData, treasuryData, directoryData, articlesData, inquiriesData]);

  // Inbox KPI cards / filter-tab counters. These used to be passed as literal
  // zeros, so the Inquiries panel permanently reported "0 in progress" and
  // "0 resolved" no matter what the table held, and its "All" tab showed the
  // pending count instead of the real total. Derive all four from the same
  // merged list the panel itself paginates, using the status buckets
  // `getInquiriesPaginated` filters by.
  const inquiryCounts = useMemo(() => {
    const rows = (inquiriesData?.inquiries ?? []) as { status?: string | null }[];
    if (rows.length === 0) {
      const pending = overviewData?.pendingInquiries ?? 0;
      return { newCount: pending, inProgressCount: 0, resolvedCount: 0, totalCount: pending };
    }
    return {
      newCount: rows.filter((i) => i.status === "new").length,
      inProgressCount: rows.filter((i) => i.status === "in_progress" || i.status === "open").length,
      resolvedCount: rows.filter((i) => i.status === "resolved" || i.status === "read").length,
      totalCount: rows.length,
    };
  }, [inquiriesData, overviewData]);

  /* A failed tab query (a revoked role, an expired session, a network blip)
   * leaves `data` undefined while `isLoading` flips back to false -- which
   * rendered every panel as a convincingly empty table with no hint that
   * anything went wrong. Surface the failure for whichever tab is on screen. */
  const activeTabError = useMemo(() => {
    const errorsByTab: Record<string, unknown> = {
      "dashboard:overview": overviewError,
      "family:members": familyError,
      "family:tree": familyError,
      "family:branches": familyError,
      "family:relationships": familyError,
      "family:history": familyError,
      "family:places": familyError,
      "family:privacy": familyError,
      "content:homepage": settingsError,
      "content:pages": pagesError,
      "content:articles": articlesError,
      "content:announcements": announcementsError,
      "content:events": eventsError,
      "content:navigation": navigationError,
      "content:dna": dnaError,
      "content:media_library": mediaError,
      "content:library_items": libraryError,
      "community:inquiries": inquiriesError,
      "community:directory": directoryError,
      "community:verification": directoryError,
      "treasury:treasury_ledger": treasuryError,
      "treasury:initiatives": initiativesError,
      "treasury:achievers": achieversError,
      "system:users": usersError,
      "system:roles_matrix": usersError,
      "system:audit_logs": auditError,
      "system:site_settings": settingsError,
    };
    return (errorsByTab[`${activeDomainId}:${activeTabId}`] as Error | undefined) ?? null;
  }, [
    activeDomainId,
    activeTabId,
    overviewError,
    familyError,
    settingsError,
    pagesError,
    articlesError,
    announcementsError,
    eventsError,
    navigationError,
    dnaError,
    mediaError,
    libraryError,
    inquiriesError,
    directoryError,
    treasuryError,
    initiativesError,
    achieversError,
    usersError,
    auditError,
  ]);

  /**
   * Tracks whether the currently active tab has cached data to display.
   * If a background query fails, we distinguish between a tab that has NO data
   * (render dedicated Error/Retry Card) versus a tab with stale cached data
   * (render existing UI with a top warning banner).
   */
  const activeTabHasData = useMemo(() => {
    switch (`${activeDomainId}:${activeTabId}`) {
      case "dashboard:overview":
        return Boolean(overviewData);
      case "family:members":
      case "family:tree":
      case "family:branches":
      case "family:relationships":
      case "family:history":
      case "family:places":
      case "family:privacy":
        return Boolean(familyData);
      case "content:homepage":
        return Boolean(settingsData);
      case "content:pages":
        return Boolean(pagesData);
      case "content:articles":
        return Boolean(articlesData);
      case "content:announcements":
        return Boolean(announcementsData);
      case "content:events":
        return Boolean(eventsData);
      case "content:navigation":
        return Boolean(navigationData);
      case "content:dna":
        return Boolean(dnaData);
      case "content:media_library":
        return Boolean(mediaData);
      case "content:library_items":
        return Boolean(libraryData);
      case "community:inquiries":
        return Boolean(inquiriesData);
      case "community:directory":
      case "community:verification":
        return Boolean(directoryData);
      case "treasury:treasury_ledger":
        return Boolean(treasuryData);
      case "treasury:initiatives":
        return Boolean(initiativesData);
      case "treasury:achievers":
        return Boolean(achieversData);
      case "system:users":
      case "system:roles_matrix":
        return Boolean(usersData);
      case "system:audit_logs":
        return Boolean(auditData);
      case "system:site_settings":
        return Boolean(settingsData);
      default:
        return true;
    }
  }, [
    activeDomainId,
    activeTabId,
    overviewData,
    familyData,
    settingsData,
    pagesData,
    articlesData,
    announcementsData,
    eventsData,
    navigationData,
    dnaData,
    mediaData,
    libraryData,
    inquiriesData,
    directoryData,
    treasuryData,
    initiativesData,
    achieversData,
    usersData,
    auditData,
  ]);

  // Search items index
  const searchItems = useMemo(() => {
    const list: any[] = [];
    ((familyData?.members as any[]) ?? []).forEach((m: any) => {
      list.push({
        id: `member-${m.id}`,
        title: `${m.first_name_ar} ${m.last_name_ar}`,
        subtitle: m.occupation_ar || m.slug,
        category: "family",
        onSelect: () => handleSelectTab("family", "members"),
      });
    });
    (directoryData?.businesses ?? []).forEach((b) => {
      list.push({
        id: `biz-${b.id}`,
        title: b.name_ar,
        subtitle: b.category_ar,
        category: "directory",
        onSelect: () => handleSelectTab("community", "directory"),
      });
    });
    (pagesData?.pages ?? []).forEach((p) => {
      list.push({
        id: `page-${p.id}`,
        title: p.title_ar,
        subtitle: `/${p.slug}`,
        category: "content",
        onSelect: () => handleSelectTab("content", "pages"),
      });
    });
    (articlesData?.articles ?? []).forEach((a) => {
      list.push({
        id: `article-${a.id}`,
        title: a.title_ar,
        subtitle: a.slug,
        category: "articles",
        onSelect: () => handleSelectTab("content", "articles"),
      });
    });
    (eventsData?.events ?? []).forEach((e) => {
      list.push({
        id: `event-${e.id}`,
        title: e.title_ar,
        subtitle: e.slug,
        category: "events",
        onSelect: () => handleSelectTab("content", "events"),
      });
    });
    return list;
  }, [familyData, directoryData, pagesData, articlesData, eventsData]);

  const handleSelectTab = (domainId: string, tabId: string) => {
    void navigate({
      search: { domain: domainId, tab: tabId },
    });
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === "add_member") {
      handleSelectTab("family", "members");
    } else if (actionId === "add_article") {
      handleSelectTab("content", "articles");
    } else if (actionId === "add_event") {
      handleSelectTab("content", "events");
    }
  };

  if (authLoading) {
    // Was plain unstyled text -- on top of the sign-in form's own busy
    // spinner and the route's beforeLoad check, this used to be the third
    // visually distinct "loading" treatment in one transition, which is
    // part of what read as janky rather than one continuous hand-off.
    return (
      <div className="container-page flex flex-col items-center justify-center gap-3 py-32">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
        <p className="text-sm text-muted-foreground">
          {isAr ? "جارٍ التحقق من الصلاحيات..." : "Checking access..."}
        </p>
      </div>
    );
  }

  if (!canAccessConsole) {
    return (
      <div className="container-page py-24">
        <h1 className="text-2xl font-bold text-foreground">
          {isAr ? "هذه الصفحة لأمانة المجلس" : "This area is for council administrators"}
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          {isAr
            ? "حسابك لا يملك صلاحية الوصول إلى منظومة الإدارة."
            : "Your account doesn't have access to the admin console."}
        </p>
      </div>
    );
  }

  return (
    <ConfirmProvider>
      <AdminConsoleLayout
        activeDomainId={activeDomainId}
        activeTabId={activeTabId}
        onSelectTab={handleSelectTab}
        badgeCounts={badgeCounts}
        notificationsData={notificationsData}
        onMarkNotificationRead={(id) =>
          runMutation(() => markNotifReadMut({ data: { id } }), refreshNotifs)
        }
        onMarkAllNotificationsRead={() => runMutation(() => markAllNotifsReadMut(), refreshNotifs)}
        onDeleteNotification={(id) =>
          runMutation(() => deleteNotifMut({ data: { id } }), refreshNotifs)
        }
        onBroadcastNotification={(data) =>
          runMutation(() => broadcastNotifMut({ data }), refreshNotifs)
        }
        searchItems={searchItems}
        onQuickAction={handleQuickAction}
      >
        <Suspense fallback={<AdminTabSkeleton type="table" cardCount={3} />}>
          <div className="transition-opacity duration-200">
            {activeTabError && !activeTabHasData ? (
              <div className="flex flex-col items-center justify-center p-12 text-center border border-destructive/30 bg-destructive/5 rounded-3xl my-6">
                <div className="w-14 h-14 rounded-2xl bg-destructive/10 text-destructive flex items-center justify-center mb-4 shadow-xs">
                  <AlertTriangle className="w-7 h-7" />
                </div>
                <h2 className="text-xl font-bold text-foreground mb-2">
                  {isAr ? "تعذّر تحميل بيانات هذا القسم" : "Failed to load section data"}
                </h2>
                <p className="text-sm text-muted-foreground max-w-md mb-6 leading-relaxed">
                  {activeTabError.message ||
                    (isAr
                      ? "حدث خطأ غير متوقع أثناء الاتصال بالخادم. اضغط على زر إعادة المحاولة للتحديث دون الحاجة لإعادة تحميل الصفحة بالكامل."
                      : "An unexpected error occurred while contacting the server. Click retry to reload without refreshing the page.")}
                </p>
                <div className="flex flex-wrap items-center gap-3">
                  <Button
                    onClick={() => void queryClient.invalidateQueries()}
                    className="gap-2 font-bold px-6"
                  >
                    <RefreshCw className="w-4 h-4" />
                    {isAr ? "إعادة تحميل البيانات" : "Retry Now"}
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => handleSelectTab("dashboard", "overview")}
                    className="gap-2"
                  >
                    {isAr ? "العودة للوحة القيادة" : "Back to Overview"}
                  </Button>
                </div>
              </div>
            ) : activeTabError && activeTabHasData ? (
              <div
                role="alert"
                className="mb-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-destructive/30 bg-destructive/5"
              >
                <div className="flex items-start gap-2.5 min-w-0">
                  <AlertTriangle className="w-4 h-4 text-destructive shrink-0 mt-0.5" />
                  <div className="min-w-0">
                    <p className="text-xs font-bold text-foreground">
                      {isAr
                        ? "تعذّر تحديث أحدث البيانات لهذا القسم"
                        : "Could not fetch the latest data for this section"}
                    </p>
                    <p className="text-[11px] text-muted-foreground break-words">
                      {activeTabError.message ||
                        (isAr
                          ? "حدث خطأ غير متوقع أثناء الاتصال بالخادم."
                          : "An unexpected error occurred while contacting the server.")}
                    </p>
                    <p className="text-[11px] text-muted-foreground mt-1">
                      {isAr
                        ? "البيانات المعروضة حاليًا من الذاكرة المؤقتة (قديمة)."
                        : "Currently displaying cached data."}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs gap-1.5 shrink-0"
                  onClick={() => void queryClient.invalidateQueries()}
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  {isAr ? "إعادة المحاولة" : "Retry"}
                </Button>
              </div>
            ) : null}

            {/* 1. DOMAIN: DASHBOARD (Command Center) */}
            {activeDomainId === "dashboard" &&
              activeTabId === "overview" &&
              (overviewLoading && !overviewData ? (
                <AdminTabSkeleton type="overview" cardCount={4} />
              ) : (
                <AdminDashboardOverview
                  overviewData={{
                    totalMembers: overviewData?.totalMembers ?? 0,
                    livingMembers: overviewData?.livingMembers ?? 0,
                    deceasedMembers: overviewData?.deceasedMembers ?? 0,
                    totalUsers: overviewData?.totalUsers ?? 0,
                    approvedMembers: overviewData?.approvedMembers ?? 0,
                    pendingInquiries: overviewData?.pendingInquiries ?? 0,
                    totalArticles: overviewData?.totalArticles ?? 0,
                    draftArticles: overviewData?.draftArticles ?? 0,
                    totalEvents: overviewData?.totalEvents ?? 0,
                    pendingReceipts: overviewData?.pendingReceipts ?? 0,
                    pendingVerifications: overviewData?.pendingVerifications ?? 0,
                    totalBusinesses: overviewData?.totalBusinesses ?? 0,
                    totalInitiatives: overviewData?.totalInitiatives ?? 0,
                    totalAchievers: overviewData?.totalAchievers ?? 0,
                    treasuryVerified: overviewData?.treasuryVerified ?? 0,
                    recentActivity: overviewData?.recentActivity ?? [],
                  }}
                  onNavigateTab={handleSelectTab}
                  onQuickAction={handleQuickAction}
                />
              ))}

            {/* 2. DOMAIN: FAMILY & LINEAGE */}
            {activeDomainId === "family" &&
              activeTabId === "members" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <FamilyMembersTable
                  initialStats={{
                    total: overviewData?.totalMembers ?? 0,
                    living: overviewData?.livingMembers ?? 0,
                    deceased: overviewData?.deceasedMembers ?? 0,
                  }}
                  branches={(familyData?.branches ?? []) as any}
                  places={(familyData?.places ?? []) as any}
                  onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
                  onDeleteMember={(id) =>
                    runMutation(() => delMemberMut({ data: { id } }), refreshFamily)
                  }
                  onBulkAction={(data) =>
                    runMutation(() => bulkMembersMut({ data }), refreshFamily)
                  }
                  onOpenRelationships={(memberId) => {
                    setSelectedRelMemberId(memberId);
                    handleSelectTab("family", "relationships");
                  }}
                  onOpenImportExport={() => setImportExportOpen(true)}
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "tree" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="overview" cardCount={0} />
              ) : (
                <FamilyTreeViewer
                  members={(familyData?.members ?? []) as any}
                  branches={(familyData?.branches ?? []) as any}
                  relationships={(familyData?.relationships ?? []) as any}
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "branches" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="grid" cardCount={2} />
              ) : (
                <FamilyBranchesManager
                  branches={(familyData?.branches ?? []) as any}
                  onSaveBranch={(data) => runMutation(() => saveBranchMut({ data }), refreshFamily)}
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "relationships" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="table" cardCount={2} />
              ) : (
                <FamilyRelationshipsManager
                  members={(familyData?.members ?? []) as any}
                  relationships={(familyData?.relationships ?? []) as any}
                  filterMemberId={selectedRelMemberId}
                  onSaveRelationship={(data) =>
                    runMutation(() => saveRelMut({ data }), refreshFamily)
                  }
                  onDeleteRelationship={(id) =>
                    runMutation(() => delRelMut({ data: { id } }), refreshFamily)
                  }
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "history" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="table" cardCount={2} />
              ) : (
                <FamilyHistoryManager
                  historyItems={(familyData?.history ?? []) as any}
                  places={(familyData?.places ?? []) as any}
                  onSaveHistory={(data) => runMutation(() => saveHistMut({ data }), refreshFamily)}
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "places" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="grid" cardCount={2} />
              ) : (
                <PlacesManager
                  places={(familyData?.places ?? []) as any}
                  onSavePlace={(data) => runMutation(() => savePlaceMut({ data }), refreshFamily)}
                />
              ))}

            {activeDomainId === "family" &&
              activeTabId === "privacy" &&
              (familyLoading && !familyData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <FamilyMembersTable
                  initialStats={{
                    total: overviewData?.totalMembers ?? 0,
                    living: overviewData?.livingMembers ?? 0,
                    deceased: overviewData?.deceasedMembers ?? 0,
                  }}
                  branches={(familyData?.branches ?? []) as any}
                  places={(familyData?.places ?? []) as any}
                  onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
                  onDeleteMember={(id) =>
                    runMutation(() => delMemberMut({ data: { id } }), refreshFamily)
                  }
                  onBulkAction={(data) =>
                    runMutation(() => bulkMembersMut({ data }), refreshFamily)
                  }
                  onOpenRelationships={(memberId) => {
                    setSelectedRelMemberId(memberId);
                    handleSelectTab("family", "relationships");
                  }}
                  onOpenImportExport={() => setImportExportOpen(true)}
                />
              ))}

            {/* 3. DOMAIN: CONTENT & CMS */}
            {activeDomainId === "content" &&
              activeTabId === "homepage" &&
              (settingsLoading && !settingsData ? (
                <AdminTabSkeleton type="form" cardCount={0} />
              ) : (
                <HomepageManager
                  initialSettings={(settingsData ?? []) as any}
                  onSaveSettings={(data) =>
                    runMutation(
                      () => saveSettingMut({ data }),
                      () => queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
                    )
                  }
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "pages" &&
              (pagesLoading && !pagesData ? (
                <AdminTabSkeleton type="table" cardCount={3} />
              ) : (
                <PagesManager
                  pages={(pagesData?.pages ?? []) as any}
                  sections={(pagesData?.sections ?? []) as any}
                  revisions={(pagesData?.revisions ?? []) as any}
                  onSavePage={(data) => runMutation(() => savePageMut({ data }), refreshPages)}
                  onDeletePage={(id) =>
                    runMutation(() => delPageMut({ data: { id } }), refreshPages)
                  }
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "articles" &&
              (articlesLoading && !articlesData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <ArticlesManager
                  articles={(articlesData?.articles ?? []) as any}
                  categories={(articlesData?.categories ?? []) as any}
                  onSaveArticle={(data) => runMutation(() => saveArtMut({ data }), refreshArticles)}
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "announcements" &&
              (announcementsLoading && !announcementsData ? (
                <AdminTabSkeleton type="table" cardCount={2} />
              ) : (
                <AnnouncementsManager
                  announcements={(announcementsData ?? []) as any}
                  onSaveAnnouncement={(data) =>
                    runMutation(() => saveAnnMut({ data }), refreshAnnouncements)
                  }
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "events" &&
              (eventsLoading && !eventsData ? (
                <AdminTabSkeleton type="grid" cardCount={3} />
              ) : (
                <EventsManager
                  events={(eventsData?.events ?? []) as any}
                  registrations={(eventsData?.registrations ?? []) as any}
                  places={(familyData?.places ?? []) as any}
                  onSaveEvent={(data) => runMutation(() => saveEventMut({ data }), refreshEvents)}
                  onUpdateRegistrationStatus={(id, status) =>
                    runMutation(() => updateRegMut({ data: { id, status } }), refreshEvents)
                  }
                  onDeleteRegistration={(id) =>
                    runMutation(() => delRegMut({ data: { id } }), refreshEvents)
                  }
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "navigation" &&
              (navigationLoading && !navigationData ? (
                <AdminTabSkeleton type="form" cardCount={0} />
              ) : (
                <NavigationManager
                  menus={(navigationData?.menus ?? []) as any}
                  items={(navigationData?.items ?? []) as any}
                  onSaveMenu={(data) =>
                    runMutation(() => saveNavMenuMut({ data }), refreshNavigation)
                  }
                  onSaveItem={(data) =>
                    runMutation(() => saveNavItemMut({ data }), refreshNavigation)
                  }
                  onDeleteItem={(id) =>
                    runMutation(() => delNavItemMut({ data: { id } }), refreshNavigation)
                  }
                />
              ))}

            {activeDomainId === "content" &&
              activeTabId === "dna" &&
              (dnaLoading && !dnaData ? (
                <AdminTabSkeleton type="form" cardCount={3} />
              ) : (
                <DnaStudiesManager
                  initialData={(dnaData as any) ?? null}
                  onSaveData={(data) => runMutation(() => saveDnaMut({ data }), refreshDna)}
                />
              ))}

            {/* 4. DOMAIN: MEDIA & ARCHIVE */}
            {(activeDomainId === "media" || activeDomainId === "content") &&
              activeTabId === "media_library" &&
              (mediaLoading && !mediaData ? (
                <AdminTabSkeleton type="grid" cardCount={3} />
              ) : (
                <MediaLibrary
                  mediaAssets={(mediaData?.media ?? []) as any}
                  onRegisterMedia={(data) =>
                    runMutation(() => saveMediaMut({ data }), refreshMedia)
                  }
                />
              ))}

            {(activeDomainId === "media" || activeDomainId === "content") &&
              activeTabId === "library_items" && (
                <div className="space-y-4">
                  <Tabs
                    value={librarySubTab}
                    onValueChange={(v) => setLibrarySubTab(v as "documents" | "museum")}
                  >
                    <TabsList>
                      <TabsTrigger value="documents" className="text-xs">
                        {isAr ? "الوثائق والمكتبة الرقمية" : "Documents & Library"}
                      </TabsTrigger>
                      <TabsTrigger value="museum" className="text-xs">
                        {isAr ? "مجموعات المتحف المصورة" : "Museum Collections"}
                      </TabsTrigger>
                    </TabsList>
                  </Tabs>

                  {librarySubTab === "documents" &&
                    (libraryLoading && !libraryData ? (
                      <AdminTabSkeleton type="table" cardCount={3} />
                    ) : (
                      <LibraryItemsManager
                        libraryItems={(libraryData ?? []) as any}
                        onSaveLibraryItem={(data) =>
                          runMutation(() => saveLibMut({ data }), refreshLibrary)
                        }
                        onDeleteLibraryItem={(id) =>
                          runMutation(() => delLibMut({ data: { id } }), refreshLibrary)
                        }
                      />
                    ))}

                  {librarySubTab === "museum" &&
                    (mediaLoading && !mediaData ? (
                      <AdminTabSkeleton type="grid" cardCount={3} />
                    ) : (
                      <MuseumArchiveManager
                        galleries={(mediaData?.galleries ?? []) as any}
                        galleryMedia={(mediaData?.galleryMedia ?? []) as any}
                        mediaAssets={(mediaData?.media ?? []) as any}
                        onSaveGallery={(data) => saveGalleryMut({ data })}
                        onDeleteGallery={(id) => delGalleryMut({ data: { id } })}
                        onRegisterMedia={(data) => saveMediaMut({ data })}
                        onSaveGalleryMedia={(data) => saveGalleryMediaMut({ data })}
                        onDeleteGalleryMedia={(id) => delGalleryMediaMut({ data: { id } })}
                        onReorder={(table, items) => reorderMut({ data: { table, items } })}
                        onRefresh={refreshMedia}
                      />
                    ))}
                </div>
              )}

            {/* 5. DOMAIN: COMMUNITY & INQUIRIES */}
            {activeDomainId === "community" &&
              activeTabId === "inquiries" &&
              (inquiriesLoading && !inquiriesData ? (
                <AdminTabSkeleton type="table" cardCount={3} />
              ) : (
                <InquiriesManager
                  notes={(inquiriesData?.notes ?? []) as any}
                  newCount={inquiryCounts.newCount}
                  inProgressCount={inquiryCounts.inProgressCount}
                  resolvedCount={inquiryCounts.resolvedCount}
                  totalCount={inquiryCounts.totalCount}
                  onUpdateStatus={(id, status, sourceTable) =>
                    sourceTable === "contact_messages"
                      ? runMutation(
                          () => updateContactStatusMut({ data: { id, status: status as any } }),
                          refreshInquiries,
                        )
                      : runMutation(
                          () => updateInqStatusMut({ data: { id, status: status as any } }),
                          refreshInquiries,
                        )
                  }
                  onAddNote={(inquiry_id, note) =>
                    runMutation(() => addNoteMut({ data: { inquiry_id, note } }), refreshInquiries)
                  }
                  onDelete={(id, sourceTable) =>
                    runMutation(
                      () => delInquiryMut({ data: { id, source_table: sourceTable } }),
                      refreshInquiries,
                    )
                  }
                />
              ))}

            {activeDomainId === "community" &&
              activeTabId === "directory" &&
              (directoryLoading && !directoryData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <DirectoryManager
                  businesses={(directoryData?.businesses ?? []) as any}
                  membershipRequests={(directoryData?.membershipRequests ?? []) as any}
                  onSaveBusiness={(data) =>
                    runMutation(() => saveBizMut({ data }), refreshDirectory)
                  }
                  onDeleteBusiness={(id) =>
                    runMutation(() => delBizMut({ data: { id } }), refreshDirectory)
                  }
                  onReviewRequest={(data) =>
                    runMutation(() => reviewReqMut({ data }), refreshDirectory)
                  }
                />
              ))}

            {activeDomainId === "community" &&
              activeTabId === "verification" &&
              (directoryLoading && !directoryData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <DirectoryManager
                  businesses={(directoryData?.businesses ?? []) as any}
                  membershipRequests={(directoryData?.membershipRequests ?? []) as any}
                  defaultTab="requests"
                  onSaveBusiness={(data) =>
                    runMutation(() => saveBizMut({ data }), refreshDirectory)
                  }
                  onDeleteBusiness={(id) =>
                    runMutation(() => delBizMut({ data: { id } }), refreshDirectory)
                  }
                  onReviewRequest={(data) =>
                    runMutation(() => reviewReqMut({ data }), refreshDirectory)
                  }
                />
              ))}

            {/* 6. DOMAIN: TREASURY & INITIATIVES */}
            {activeDomainId === "treasury" &&
              activeTabId === "treasury_ledger" &&
              (treasuryLoading && !treasuryData ? (
                <AdminTabSkeleton type="table" cardCount={4} />
              ) : (
                <TreasuryManager
                  verifiedTotal={treasuryData?.verifiedTotal ?? 0}
                  pendingTotal={treasuryData?.pendingTotal ?? 0}
                  rejectedTotal={treasuryData?.rejectedTotal ?? 0}
                  pendingCount={
                    (treasuryData?.contributions ?? []).filter((c) => c.status === "pending").length
                  }
                  verifiedCount={
                    (treasuryData?.contributions ?? []).filter((c) => c.status === "verified")
                      .length
                  }
                  rejectedCount={
                    (treasuryData?.contributions ?? []).filter((c) => c.status === "rejected")
                      .length
                  }
                  totalCount={
                    treasuryData?.totalCount ?? (treasuryData?.contributions ?? []).length
                  }
                  byPurpose={treasuryData?.byPurpose}
                  initialConfig={treasuryData?.treasuryConfig as never}
                  onReviewContribution={(data) =>
                    runMutation(() => reviewTreasuryMut({ data }), refreshTreasury)
                  }
                  onSaveTreasuryConfig={(config) =>
                    runMutation(() => saveTreasuryConfigMut({ data: config }), refreshTreasury)
                  }
                  onCreateManualContribution={(data) =>
                    runMutation(() => createManualContributionMut({ data }), refreshTreasury)
                  }
                />
              ))}

            {activeDomainId === "treasury" &&
              activeTabId === "initiatives" &&
              (initiativesLoading && !initiativesData ? (
                <AdminTabSkeleton type="grid" cardCount={3} />
              ) : (
                <InitiativesManager
                  initiatives={(initiativesData?.initiatives ?? []) as any}
                  registrations={(initiativesData?.registrations ?? []) as any}
                  onSaveInitiative={(data) =>
                    runMutation(() => saveInitMut({ data }), refreshInitiatives)
                  }
                  onDeleteInitiative={(id) =>
                    runMutation(() => delInitMut({ data: { id } }), refreshInitiatives)
                  }
                  onUpdateRegistrationStatus={(id, status) =>
                    runMutation(
                      () => updateInitRegMut({ data: { id, status } }),
                      refreshInitiatives,
                    )
                  }
                  onDeleteRegistration={(id) =>
                    runMutation(() => delInitRegMut({ data: { id } }), refreshInitiatives)
                  }
                />
              ))}

            {activeDomainId === "treasury" &&
              activeTabId === "achievers" &&
              (achieversLoading && !achieversData ? (
                <AdminTabSkeleton type="grid" cardCount={3} />
              ) : (
                <AchieversManager
                  achievers={(achieversData ?? []) as any}
                  onSaveAchiever={(data) =>
                    runMutation(() => saveAchMut({ data }), refreshAchievers)
                  }
                  onDeleteAchiever={(id) =>
                    runMutation(() => delAchMut({ data: { id } }), refreshAchievers)
                  }
                />
              ))}

            {/* 7. DOMAIN: SYSTEM, SECURITY & GOVERNANCE */}
            {activeDomainId === "system" &&
              activeTabId === "users" &&
              (usersLoading && !usersData ? (
                <AdminTabSkeleton type="table" cardCount={3} />
              ) : (
                <UsersManager
                  profiles={(usersData?.profiles ?? []) as any}
                  userRoles={(usersData?.userRoles ?? []) as any}
                  onAssignRole={(user_id, role) =>
                    runMutation(() => assignRoleMut({ data: { user_id, role } }), refreshUsers)
                  }
                  onRemoveRole={(user_id, role) =>
                    runMutation(() => removeRoleMut({ data: { user_id, role } }), refreshUsers)
                  }
                />
              ))}

            {activeDomainId === "system" &&
              activeTabId === "roles_matrix" &&
              (usersLoading && !usersData ? (
                <AdminTabSkeleton type="table" cardCount={0} />
              ) : (
                <RolesPermissionMatrix
                  permissions={(usersData?.permissions ?? []) as any}
                  rolePermissions={(usersData?.rolePermissions ?? []) as any}
                />
              ))}

            {activeDomainId === "system" &&
              activeTabId === "audit_logs" &&
              (auditLoading && !auditData ? (
                <AdminTabSkeleton type="table" cardCount={0} />
              ) : (
                <AuditLogsViewer auditLogs={(auditData ?? []) as any} />
              ))}

            {activeDomainId === "system" &&
              activeTabId === "site_settings" &&
              (settingsLoading && !settingsData ? (
                <AdminTabSkeleton type="form" cardCount={0} />
              ) : (
                <SiteSettingsManager
                  settings={(settingsData ?? []) as any}
                  onSaveSetting={(data) =>
                    runMutation(
                      () => saveSettingMut({ data }),
                      () => queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
                    )
                  }
                />
              ))}
          </div>
        </Suspense>

        {/* CSV/JSON Import & Export Modal */}
        <Suspense fallback={null}>
          <FamilyImportExportDialog
            open={importExportOpen}
            onOpenChange={setImportExportOpen}
            initialStats={{
              total: overviewData?.totalMembers ?? 0,
              living: overviewData?.livingMembers ?? 0,
              deceased: overviewData?.deceasedMembers ?? 0,
            }}
            onImportMembers={(importedList) =>
              runMutation(async () => {
                for (const member of importedList) {
                  await saveMemberMut({ data: member });
                }
              }, refreshFamily)
            }
          />
        </Suspense>
      </AdminConsoleLayout>
    </ConfirmProvider>
  );
}
