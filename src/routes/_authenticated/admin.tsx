import { createFileRoute, useNavigate, useSearch } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { ConfirmProvider } from "@/hooks/useConfirm";
import { AdminConsoleLayout } from "@/components/console/layout/AdminConsoleLayout";
import { AdminTabSkeleton } from "@/components/console/layout/AdminTabSkeleton";
import { ADMIN_DOMAINS } from "@/components/console/layout/AdminNavigation";
import { AdminDashboardOverview } from "@/components/console/dashboard/AdminDashboardOverview";
import { HomepageManager } from "@/components/console/cms/HomepageManager";
import { RolesPermissionMatrix } from "@/components/console/users/RolesPermissionMatrix";
import { FamilyMembersTable } from "@/components/console/family/FamilyMembersTable";
import { FamilyTreeViewer } from "@/components/console/family/FamilyTreeViewer";
import { FamilyBranchesManager } from "@/components/console/family/FamilyBranchesManager";
import { FamilyRelationshipsManager } from "@/components/console/family/FamilyRelationshipsManager";
import { FamilyHistoryManager } from "@/components/console/family/FamilyHistoryManager";
import { FamilyImportExportDialog } from "@/components/console/family/FamilyImportExportDialog";
import { PagesManager } from "@/components/console/cms/PagesManager";
import { ArticlesManager } from "@/components/console/articles/ArticlesManager";
import { EventsManager } from "@/components/console/events/EventsManager";
import { AnnouncementsManager } from "@/components/console/announcements/AnnouncementsManager";
import { MediaLibrary } from "@/components/console/media/MediaLibrary";
import { PlacesManager } from "@/components/console/places/PlacesManager";
import { InquiriesManager } from "@/components/console/inquiries/InquiriesManager";
import { UsersManager } from "@/components/console/users/UsersManager";
import { AuditLogsViewer } from "@/components/console/activity/AuditLogsViewer";
import { SiteSettingsManager } from "@/components/console/settings/SiteSettingsManager";
import { DirectoryManager } from "@/components/console/directory/DirectoryManager";
import { TreasuryManager } from "@/components/console/treasury/TreasuryManager";
import { InitiativesManager } from "@/components/console/initiatives/InitiativesManager";
import { AchieversManager } from "@/components/console/achievers/AchieversManager";
import { LibraryItemsManager } from "@/components/console/library/LibraryItemsManager";
import { NavigationManager } from "@/components/console/navigation/NavigationManager";
import { DnaStudiesManager } from "@/components/console/dna/DnaStudiesManager";
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
  getArticlesData,
  upsertArticle,
  getEventsData,
  upsertEvent,
  getAnnouncementsData,
  upsertAnnouncement,
  getMediaAssetsData,
  registerMediaAsset,
  getInquiriesData,
  updateInquiryStatus,
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
        content: "المنظومة الإدارية المتكاملة لإدارة شجرة العائلة، الخزينة، الدليل، المبادرات، والمحتوى.",
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
  const updateInqStatusMut = useServerFn(updateInquiryStatus);
  const updateContactStatusMut = useServerFn(updateContactMessageStatus);
  const addNoteMut = useServerFn(addInquiryNote);
  const assignRoleMut = useServerFn(assignUserRole);
  const removeRoleMut = useServerFn(removeUserRole);
  const saveSettingMut = useServerFn(upsertSiteSetting);
  const saveBizMut = useServerFn(upsertBusiness);
  const delBizMut = useServerFn(deleteBusiness);
  const reviewReqMut = useServerFn(reviewMembershipRequest);
  const reviewTreasuryMut = useServerFn(reviewTreasuryContribution);
  const saveInitMut = useServerFn(upsertInitiative);
  const delInitMut = useServerFn(deleteInitiative);
  const saveAchMut = useServerFn(upsertAchiever);
  const delAchMut = useServerFn(deleteAchiever);
  const saveLibMut = useServerFn(upsertLibraryItem);
  const delLibMut = useServerFn(deleteLibraryItem);
  const saveNavMenuMut = useServerFn(upsertNavigationMenu);
  const saveNavItemMut = useServerFn(upsertNavigationItem);
  const delNavItemMut = useServerFn(deleteNavigationItem);
  const saveDnaMut = useServerFn(saveDnaStudiesData);

  // Gated, high-performance cached queries (5 min staleTime, 15 min cache)
  const queryConfig = {
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
  };

  const { data: overviewData, isLoading: overviewLoading } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: canAccessConsole && activeDomainId === "dashboard",
    ...queryConfig,
  });

  const { data: familyData, isLoading: familyLoading } = useQuery({
    queryKey: ["family-hub-data"],
    queryFn: () => fetchFamily(),
    enabled: canAccessConsole && (activeDomainId === "family" || (activeDomainId === "content" && activeTabId === "events")),
    ...queryConfig,
  });

  const { data: pagesData, isLoading: pagesLoading } = useQuery({
    queryKey: ["cms-pages-data"],
    queryFn: () => fetchPages(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "pages",
    ...queryConfig,
  });

  const { data: articlesData, isLoading: articlesLoading } = useQuery({
    queryKey: ["cms-articles-data"],
    queryFn: () => fetchArticles(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "articles",
    ...queryConfig,
  });

  const { data: eventsData, isLoading: eventsLoading } = useQuery({
    queryKey: ["events-data"],
    queryFn: () => fetchEvents(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "events",
    ...queryConfig,
  });

  const { data: announcementsData, isLoading: announcementsLoading } = useQuery({
    queryKey: ["announcements-data"],
    queryFn: () => fetchAnnouncements(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "announcements",
    ...queryConfig,
  });

  const { data: mediaData, isLoading: mediaLoading } = useQuery({
    queryKey: ["media-data"],
    queryFn: () => fetchMedia(),
    enabled: canAccessConsole && activeDomainId === "media" && activeTabId === "media_library",
    ...queryConfig,
  });

  const { data: inquiriesData, isLoading: inquiriesLoading } = useQuery({
    queryKey: ["inquiries-data"],
    queryFn: () => fetchInquiries(),
    enabled: canAccessConsole && activeDomainId === "community" && activeTabId === "inquiries",
    ...queryConfig,
  });

  const { data: usersData, isLoading: usersLoading } = useQuery({
    queryKey: ["users-data"],
    queryFn: () => fetchUsers(),
    enabled: canAccessConsole && activeDomainId === "system" && activeTabId === "users",
    ...queryConfig,
  });

  const { data: auditData, isLoading: auditLoading } = useQuery({
    queryKey: ["audit-data"],
    queryFn: () => fetchAudit(),
    enabled: canAccessConsole && activeDomainId === "system" && activeTabId === "audit_logs",
    ...queryConfig,
  });

  const { data: settingsData, isLoading: settingsLoading } = useQuery({
    queryKey: ["site-settings-data"],
    queryFn: () => fetchSettings(),
    enabled: canAccessConsole && (activeDomainId === "system" || (activeDomainId === "content" && activeTabId === "homepage")),
    ...queryConfig,
  });

  const { data: directoryData, isLoading: directoryLoading } = useQuery({
    queryKey: ["directory-management-data"],
    queryFn: () => fetchDirectory(),
    enabled: canAccessConsole && activeDomainId === "community" && (activeTabId === "directory" || activeTabId === "verification"),
    ...queryConfig,
  });

  const { data: treasuryData, isLoading: treasuryLoading } = useQuery({
    queryKey: ["treasury-management-data"],
    queryFn: () => fetchTreasury(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "treasury_ledger",
    ...queryConfig,
  });

  const { data: initiativesData, isLoading: initiativesLoading } = useQuery({
    queryKey: ["initiatives-management-data"],
    queryFn: () => fetchInitiatives(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "initiatives",
    ...queryConfig,
  });

  const { data: achieversData, isLoading: achieversLoading } = useQuery({
    queryKey: ["achievers-management-data"],
    queryFn: () => fetchAchievers(),
    enabled: canAccessConsole && activeDomainId === "treasury" && activeTabId === "achievers",
    ...queryConfig,
  });

  const { data: libraryData, isLoading: libraryLoading } = useQuery({
    queryKey: ["library-management-data"],
    queryFn: () => fetchLibrary(),
    enabled: canAccessConsole && activeDomainId === "media" && activeTabId === "library_items",
    ...queryConfig,
  });

  const { data: navigationData, isLoading: navigationLoading } = useQuery({
    queryKey: ["navigation-management-data"],
    queryFn: () => fetchNavigation(),
    enabled: canAccessConsole && activeDomainId === "content" && activeTabId === "navigation",
    ...queryConfig,
  });

  const { data: dnaData, isLoading: dnaLoading } = useQuery({
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
        err?.message || (isAr ? "حدث خطأ أثناء الحفظ. حاول مرة أخرى." : "Something went wrong. Please try again."),
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

  // Search items index
  const searchItems = useMemo(() => {
    const list: any[] = [];
    (familyData?.members ?? []).forEach((m) => {
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
    return (
      <div className="container-page py-24 text-sm text-muted-foreground">
        {isAr ? "جارٍ التحقق…" : "Checking access…"}
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
      onMarkNotificationRead={(id) => runMutation(() => markNotifReadMut({ data: { id } }), refreshNotifs)}
      onMarkAllNotificationsRead={() => runMutation(() => markAllNotifsReadMut(), refreshNotifs)}
      onDeleteNotification={(id) => runMutation(() => deleteNotifMut({ data: { id } }), refreshNotifs)}
      onBroadcastNotification={(data) => runMutation(() => broadcastNotifMut({ data }), refreshNotifs)}
      searchItems={searchItems}
      onQuickAction={handleQuickAction}
    >
      <div className="transition-opacity duration-200">
        {/* 1. DOMAIN: DASHBOARD (Command Center) */}
        {activeDomainId === "dashboard" && activeTabId === "overview" && (
          overviewLoading && !overviewData ? (
            <AdminTabSkeleton type="overview" cardCount={4} />
          ) : (
            <AdminDashboardOverview
              overviewData={{
                totalMembers: overviewData?.totalMembers ?? 0,
                livingMembers: overviewData?.livingMembers ?? 0,
                deceasedMembers: overviewData?.deceasedMembers ?? 0,
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
          )
        )}

        {/* 2. DOMAIN: FAMILY & LINEAGE */}
        {activeDomainId === "family" && activeTabId === "members" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <FamilyMembersTable
              members={(familyData?.members ?? []) as any}
              branches={(familyData?.branches ?? []) as any}
              places={(familyData?.places ?? []) as any}
              onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
              onDeleteMember={(id) => runMutation(() => delMemberMut({ data: { id } }), refreshFamily)}
              onBulkAction={(data) => runMutation(() => bulkMembersMut({ data }), refreshFamily)}
              onOpenRelationships={(memberId) => {
                setSelectedRelMemberId(memberId);
                handleSelectTab("family", "relationships");
              }}
              onOpenImportExport={() => setImportExportOpen(true)}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "tree" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="overview" cardCount={0} />
          ) : (
            <FamilyTreeViewer
              members={(familyData?.members ?? []) as any}
              branches={(familyData?.branches ?? []) as any}
              relationships={(familyData?.relationships ?? []) as any}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "branches" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="grid" cardCount={2} />
          ) : (
            <FamilyBranchesManager
              branches={(familyData?.branches ?? []) as any}
              onSaveBranch={(data) => runMutation(() => saveBranchMut({ data }), refreshFamily)}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "relationships" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="table" cardCount={2} />
          ) : (
            <FamilyRelationshipsManager
              members={(familyData?.members ?? []) as any}
              relationships={(familyData?.relationships ?? []) as any}
              filterMemberId={selectedRelMemberId}
              onSaveRelationship={(data) => runMutation(() => saveRelMut({ data }), refreshFamily)}
              onDeleteRelationship={(id) => runMutation(() => delRelMut({ data: { id } }), refreshFamily)}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "history" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="table" cardCount={2} />
          ) : (
            <FamilyHistoryManager
              historyItems={(familyData?.history ?? []) as any}
              places={(familyData?.places ?? []) as any}
              onSaveHistory={(data) => runMutation(() => saveHistMut({ data }), refreshFamily)}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "places" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="grid" cardCount={2} />
          ) : (
            <PlacesManager
              places={(familyData?.places ?? []) as any}
              onSavePlace={(data) => runMutation(() => savePlaceMut({ data }), refreshFamily)}
            />
          )
        )}

        {activeDomainId === "family" && activeTabId === "privacy" && (
          familyLoading && !familyData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <FamilyMembersTable
              members={(familyData?.members ?? []) as any}
              branches={(familyData?.branches ?? []) as any}
              places={(familyData?.places ?? []) as any}
              onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
              onDeleteMember={(id) => runMutation(() => delMemberMut({ data: { id } }), refreshFamily)}
              onBulkAction={(data) => runMutation(() => bulkMembersMut({ data }), refreshFamily)}
              onOpenRelationships={(memberId) => {
                setSelectedRelMemberId(memberId);
                handleSelectTab("family", "relationships");
              }}
              onOpenImportExport={() => setImportExportOpen(true)}
            />
          )
        )}

        {/* 3. DOMAIN: CONTENT & CMS */}
        {activeDomainId === "content" && activeTabId === "homepage" && (
          settingsLoading && !settingsData ? (
            <AdminTabSkeleton type="form" cardCount={0} />
          ) : (
            <HomepageManager
              initialSettings={(settingsData ?? []) as any}
              onSaveSettings={(data) =>
                runMutation(() => saveSettingMut({ data }), () =>
                  queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
                )
              }
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "pages" && (
          pagesLoading && !pagesData ? (
            <AdminTabSkeleton type="table" cardCount={3} />
          ) : (
            <PagesManager
              pages={(pagesData?.pages ?? []) as any}
              sections={(pagesData?.sections ?? []) as any}
              revisions={(pagesData?.revisions ?? []) as any}
              onSavePage={(data) => runMutation(() => savePageMut({ data }), refreshPages)}
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "articles" && (
          articlesLoading && !articlesData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <ArticlesManager
              articles={(articlesData?.articles ?? []) as any}
              categories={(articlesData?.categories ?? []) as any}
              onSaveArticle={(data) => runMutation(() => saveArtMut({ data }), refreshArticles)}
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "announcements" && (
          announcementsLoading && !announcementsData ? (
            <AdminTabSkeleton type="table" cardCount={2} />
          ) : (
            <AnnouncementsManager
              announcements={(announcementsData ?? []) as any}
              onSaveAnnouncement={(data) => runMutation(() => saveAnnMut({ data }), refreshAnnouncements)}
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "events" && (
          eventsLoading && !eventsData ? (
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
              onDeleteRegistration={(id) => runMutation(() => delRegMut({ data: { id } }), refreshEvents)}
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "navigation" && (
          navigationLoading && !navigationData ? (
            <AdminTabSkeleton type="form" cardCount={0} />
          ) : (
            <NavigationManager
              menus={(navigationData?.menus ?? []) as any}
              items={(navigationData?.items ?? []) as any}
              onSaveMenu={(data) => runMutation(() => saveNavMenuMut({ data }), refreshNavigation)}
              onSaveItem={(data) => runMutation(() => saveNavItemMut({ data }), refreshNavigation)}
              onDeleteItem={(id) => runMutation(() => delNavItemMut({ data: { id } }), refreshNavigation)}
            />
          )
        )}

        {activeDomainId === "content" && activeTabId === "dna" && (
          dnaLoading && !dnaData ? (
            <AdminTabSkeleton type="form" cardCount={3} />
          ) : (
            <DnaStudiesManager
              initialData={(dnaData as any) ?? null}
              onSaveData={(data) => runMutation(() => saveDnaMut({ data }), refreshDna)}
            />
          )
        )}

        {/* 4. DOMAIN: MEDIA & ARCHIVE */}
        {activeDomainId === "media" && activeTabId === "media_library" && (
          mediaLoading && !mediaData ? (
            <AdminTabSkeleton type="grid" cardCount={3} />
          ) : (
            <MediaLibrary
              mediaAssets={(mediaData?.media ?? []) as any}
              onRegisterMedia={(data) => runMutation(() => saveMediaMut({ data }), refreshMedia)}
            />
          )
        )}

        {activeDomainId === "media" && activeTabId === "library_items" && (
          libraryLoading && !libraryData ? (
            <AdminTabSkeleton type="table" cardCount={3} />
          ) : (
            <LibraryItemsManager
              libraryItems={(libraryData ?? []) as any}
              onSaveLibraryItem={(data) => runMutation(() => saveLibMut({ data }), refreshLibrary)}
              onDeleteLibraryItem={(id) => runMutation(() => delLibMut({ data: { id } }), refreshLibrary)}
            />
          )
        )}

        {/* 5. DOMAIN: COMMUNITY & INQUIRIES */}
        {activeDomainId === "community" && activeTabId === "inquiries" && (
          inquiriesLoading && !inquiriesData ? (
            <AdminTabSkeleton type="table" cardCount={3} />
          ) : (
            <InquiriesManager
              inquiries={(inquiriesData?.inquiries ?? []) as any}
              notes={(inquiriesData?.notes ?? []) as any}
              onUpdateStatus={(id, status, sourceTable) =>
                sourceTable === "contact_messages"
                  ? runMutation(() => updateContactStatusMut({ data: { id, status: status as any } }), refreshInquiries)
                  : runMutation(() => updateInqStatusMut({ data: { id, status: status as any } }), refreshInquiries)
              }
              onAddNote={(inquiry_id, note) =>
                runMutation(() => addNoteMut({ data: { inquiry_id, note } }), refreshInquiries)
              }
            />
          )
        )}

        {activeDomainId === "community" && activeTabId === "directory" && (
          directoryLoading && !directoryData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <DirectoryManager
              businesses={(directoryData?.businesses ?? []) as any}
              membershipRequests={(directoryData?.membershipRequests ?? []) as any}
              onSaveBusiness={(data) => runMutation(() => saveBizMut({ data }), refreshDirectory)}
              onDeleteBusiness={(id) => runMutation(() => delBizMut({ data: { id } }), refreshDirectory)}
              onReviewRequest={(data) => runMutation(() => reviewReqMut({ data }), refreshDirectory)}
            />
          )
        )}

        {activeDomainId === "community" && activeTabId === "verification" && (
          directoryLoading && !directoryData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <DirectoryManager
              businesses={(directoryData?.businesses ?? []) as any}
              membershipRequests={(directoryData?.membershipRequests ?? []) as any}
              defaultTab="requests"
              onSaveBusiness={(data) => runMutation(() => saveBizMut({ data }), refreshDirectory)}
              onDeleteBusiness={(id) => runMutation(() => delBizMut({ data: { id } }), refreshDirectory)}
              onReviewRequest={(data) => runMutation(() => reviewReqMut({ data }), refreshDirectory)}
            />
          )
        )}

        {/* 6. DOMAIN: TREASURY & INITIATIVES */}
        {activeDomainId === "treasury" && activeTabId === "treasury_ledger" && (
          treasuryLoading && !treasuryData ? (
            <AdminTabSkeleton type="table" cardCount={4} />
          ) : (
            <TreasuryManager
              contributions={(treasuryData?.contributions ?? []) as any}
              verifiedTotal={treasuryData?.verifiedTotal ?? 0}
              pendingTotal={treasuryData?.pendingTotal ?? 0}
              onReviewContribution={(data) => runMutation(() => reviewTreasuryMut({ data }), refreshTreasury)}
            />
          )
        )}

        {activeDomainId === "treasury" && activeTabId === "initiatives" && (
          initiativesLoading && !initiativesData ? (
            <AdminTabSkeleton type="grid" cardCount={3} />
          ) : (
            <InitiativesManager
              initiatives={(initiativesData ?? []) as any}
              onSaveInitiative={(data) => runMutation(() => saveInitMut({ data }), refreshInitiatives)}
              onDeleteInitiative={(id) => runMutation(() => delInitMut({ data: { id } }), refreshInitiatives)}
            />
          )
        )}

        {activeDomainId === "treasury" && activeTabId === "achievers" && (
          achieversLoading && !achieversData ? (
            <AdminTabSkeleton type="grid" cardCount={3} />
          ) : (
            <AchieversManager
              achievers={(achieversData ?? []) as any}
              onSaveAchiever={(data) => runMutation(() => saveAchMut({ data }), refreshAchievers)}
              onDeleteAchiever={(id) => runMutation(() => delAchMut({ data: { id } }), refreshAchievers)}
            />
          )
        )}

        {/* 7. DOMAIN: SYSTEM, SECURITY & GOVERNANCE */}
        {activeDomainId === "system" && activeTabId === "users" && (
          usersLoading && !usersData ? (
            <AdminTabSkeleton type="table" cardCount={3} />
          ) : (
            <UsersManager
              profiles={(usersData?.profiles ?? []) as any}
              userRoles={(usersData?.userRoles ?? []) as any}
              onAssignRole={(user_id, role) => runMutation(() => assignRoleMut({ data: { user_id, role } }), refreshUsers)}
              onRemoveRole={(user_id, role) => runMutation(() => removeRoleMut({ data: { user_id, role } }), refreshUsers)}
            />
          )
        )}

        {activeDomainId === "system" && activeTabId === "roles_matrix" && (
          <RolesPermissionMatrix />
        )}

        {activeDomainId === "system" && activeTabId === "audit_logs" && (
          auditLoading && !auditData ? (
            <AdminTabSkeleton type="table" cardCount={0} />
          ) : (
            <AuditLogsViewer auditLogs={(auditData ?? []) as any} />
          )
        )}

        {activeDomainId === "system" && activeTabId === "site_settings" && (
          settingsLoading && !settingsData ? (
            <AdminTabSkeleton type="form" cardCount={0} />
          ) : (
            <SiteSettingsManager
              settings={(settingsData ?? []) as any}
              onSaveSetting={(data) =>
                runMutation(() => saveSettingMut({ data }), () =>
                  queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
                )
              }
            />
          )
        )}
      </div>

      {/* CSV/JSON Import & Export Modal */}
      <FamilyImportExportDialog
        open={importExportOpen}
        onOpenChange={setImportExportOpen}
        members={(familyData?.members ?? []) as any}
        onImportMembers={(importedList) =>
          runMutation(async () => {
            for (const member of importedList) {
              await saveMemberMut({ data: member });
            }
          }, refreshFamily)
        }
      />
    </AdminConsoleLayout>
    </ConfirmProvider>
  );
}
