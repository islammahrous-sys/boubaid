import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState, useMemo } from "react";
import { toast } from "sonner";
import { useLang } from "@/i18n/LanguageProvider";
import { useAuth } from "@/hooks/useAuth";
import { AdminConsoleLayout } from "@/components/console/layout/AdminConsoleLayout";
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

export const Route = createFileRoute("/_authenticated/admin")({
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
  const { isAdmin, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();

  const [activeDomainId, setActiveDomainId] = useState<string>("dashboard");
  const [activeTabId, setActiveTabId] = useState<string>("overview");
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

  // Queries
  const { data: overviewData } = useQuery({
    queryKey: ["admin-overview"],
    queryFn: () => fetchOverview(),
    enabled: isAdmin,
  });

  const { data: familyData } = useQuery({
    queryKey: ["family-hub-data"],
    queryFn: () => fetchFamily(),
    enabled: isAdmin,
  });

  const { data: pagesData } = useQuery({
    queryKey: ["cms-pages-data"],
    queryFn: () => fetchPages(),
    enabled: isAdmin,
  });

  const { data: articlesData } = useQuery({
    queryKey: ["cms-articles-data"],
    queryFn: () => fetchArticles(),
    enabled: isAdmin,
  });

  const { data: eventsData } = useQuery({
    queryKey: ["events-data"],
    queryFn: () => fetchEvents(),
    enabled: isAdmin,
  });

  const { data: announcementsData } = useQuery({
    queryKey: ["announcements-data"],
    queryFn: () => fetchAnnouncements(),
    enabled: isAdmin,
  });

  const { data: mediaData } = useQuery({
    queryKey: ["media-data"],
    queryFn: () => fetchMedia(),
    enabled: isAdmin,
  });

  const { data: inquiriesData } = useQuery({
    queryKey: ["inquiries-data"],
    queryFn: () => fetchInquiries(),
    enabled: isAdmin,
  });

  const { data: usersData } = useQuery({
    queryKey: ["users-data"],
    queryFn: () => fetchUsers(),
    enabled: isAdmin,
  });

  const { data: auditData } = useQuery({
    queryKey: ["audit-data"],
    queryFn: () => fetchAudit(),
    enabled: isAdmin,
  });

  const { data: settingsData } = useQuery({
    queryKey: ["site-settings-data"],
    queryFn: () => fetchSettings(),
    enabled: isAdmin,
  });

  const { data: directoryData } = useQuery({
    queryKey: ["directory-management-data"],
    queryFn: () => fetchDirectory(),
    enabled: isAdmin,
  });

  const { data: treasuryData } = useQuery({
    queryKey: ["treasury-management-data"],
    queryFn: () => fetchTreasury(),
    enabled: isAdmin,
  });

  const { data: initiativesData } = useQuery({
    queryKey: ["initiatives-management-data"],
    queryFn: () => fetchInitiatives(),
    enabled: isAdmin,
  });

  const { data: achieversData } = useQuery({
    queryKey: ["achievers-management-data"],
    queryFn: () => fetchAchievers(),
    enabled: isAdmin,
  });

  const { data: libraryData } = useQuery({
    queryKey: ["library-management-data"],
    queryFn: () => fetchLibrary(),
    enabled: isAdmin,
  });

  const { data: navigationData } = useQuery({
    queryKey: ["navigation-management-data"],
    queryFn: () => fetchNavigation(),
    enabled: isAdmin,
  });

  const { data: dnaData } = useQuery({
    queryKey: ["dna-studies-data"],
    queryFn: () => fetchDna(),
    enabled: isAdmin,
  });

  const { data: notificationsData } = useQuery({
    queryKey: ["admin-notifications"],
    queryFn: () => fetchNotifs(),
    enabled: isAdmin,
    refetchInterval: 15000,
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
  const runMutation = async (action: () => Promise<unknown>, onSuccess: () => void) => {
    try {
      await action();
      onSuccess();
    } catch (err: any) {
      toast.error(
        err?.message || (isAr ? "حدث خطأ أثناء الحفظ. حاول مرة أخرى." : "Something went wrong. Please try again."),
      );
    }
  };

  // Badge counts calculation
  const badgeCounts = useMemo(() => {
    const pendingInquiries = overviewData?.pendingInquiries ?? 0;
    const pendingReceipts = (treasuryData?.contributions ?? []).filter((c) => c.status === "pending").length;
    const pendingVerifications = (directoryData?.membershipRequests ?? []).filter((r) => r.status === "pending").length;
    const draftArticles = (articlesData?.articles ?? []).filter((a) => a.status === "draft").length;
    return {
      pendingInquiries,
      pendingReceipts,
      pendingVerifications,
      draftArticles,
    };
  }, [overviewData, treasuryData, directoryData, articlesData]);

  // Search items index
  const searchItems = useMemo(() => {
    const list: any[] = [];
    (familyData?.members ?? []).forEach((m) => {
      list.push({
        id: `member-${m.id}`,
        title: `${m.first_name_ar} ${m.last_name_ar}`,
        subtitle: m.occupation_ar || m.slug,
        category: "family",
        onSelect: () => {
          setActiveDomainId("family");
          setActiveTabId("members");
        },
      });
    });
    (directoryData?.businesses ?? []).forEach((b) => {
      list.push({
        id: `biz-${b.id}`,
        title: b.name_ar,
        subtitle: b.category_ar,
        category: "directory",
        onSelect: () => {
          setActiveDomainId("community");
          setActiveTabId("directory");
        },
      });
    });
    (pagesData?.pages ?? []).forEach((p) => {
      list.push({
        id: `page-${p.id}`,
        title: p.title_ar,
        subtitle: `/${p.slug}`,
        category: "content",
        onSelect: () => {
          setActiveDomainId("content");
          setActiveTabId("pages");
        },
      });
    });
    (articlesData?.articles ?? []).forEach((a) => {
      list.push({
        id: `article-${a.id}`,
        title: a.title_ar,
        subtitle: a.slug,
        category: "articles",
        onSelect: () => {
          setActiveDomainId("content");
          setActiveTabId("articles");
        },
      });
    });
    (eventsData?.events ?? []).forEach((e) => {
      list.push({
        id: `event-${e.id}`,
        title: e.title_ar,
        subtitle: e.slug,
        category: "events",
        onSelect: () => {
          setActiveDomainId("content");
          setActiveTabId("events");
        },
      });
    });
    return list;
  }, [familyData, directoryData, pagesData, articlesData, eventsData]);

  const handleSelectTab = (domainId: string, tabId: string) => {
    setActiveDomainId(domainId);
    setActiveTabId(tabId);
  };

  const handleQuickAction = (actionId: string) => {
    if (actionId === "add_member") {
      setActiveDomainId("family");
      setActiveTabId("members");
    } else if (actionId === "add_article") {
      setActiveDomainId("content");
      setActiveTabId("articles");
    } else if (actionId === "add_event") {
      setActiveDomainId("content");
      setActiveTabId("events");
    }
  };

  if (authLoading) {
    return (
      <div className="container-page py-24 text-sm text-muted-foreground">
        {isAr ? "جارٍ التحقق…" : "Checking access…"}
      </div>
    );
  }

  if (!isAdmin) {
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
      {/* 1. DOMAIN: DASHBOARD (Command Center) */}
      {activeDomainId === "dashboard" && activeTabId === "overview" && (
        <AdminDashboardOverview
          overviewData={{
            totalMembers: overviewData?.totalMembers ?? 0,
            livingMembers: overviewData?.livingMembers ?? 0,
            deceasedMembers: overviewData?.deceasedMembers ?? 0,
            pendingInquiries: overviewData?.pendingInquiries ?? 0,
            publishedArticles: overviewData?.totalArticles ?? 0,
            draftArticles: (articlesData?.articles ?? []).filter((a) => a.status === "draft").length,
            upcomingEvents: overviewData?.totalEvents ?? 0,
            recentActivity: overviewData?.recentActivity ?? [],
          }}
          treasuryData={treasuryData}
          directoryData={directoryData}
          articlesData={articlesData}
          eventsData={eventsData}
          initiativesData={initiativesData}
          achieversData={achieversData}
          onNavigateTab={handleSelectTab}
          onQuickAction={handleQuickAction}
        />
      )}

      {/* 2. DOMAIN: FAMILY & LINEAGE */}
      {activeDomainId === "family" && activeTabId === "members" && (
        <FamilyMembersTable
          members={(familyData?.members ?? []) as any}
          branches={(familyData?.branches ?? []) as any}
          places={(familyData?.places ?? []) as any}
          onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
          onDeleteMember={(id) => runMutation(() => delMemberMut({ data: { id } }), refreshFamily)}
          onBulkAction={(data) => runMutation(() => bulkMembersMut({ data }), refreshFamily)}
          onOpenRelationships={(memberId) => {
            setSelectedRelMemberId(memberId);
            setActiveDomainId("family");
            setActiveTabId("relationships");
          }}
          onOpenImportExport={() => setImportExportOpen(true)}
        />
      )}

      {activeDomainId === "family" && activeTabId === "tree" && (
        <FamilyTreeViewer
          members={(familyData?.members ?? []) as any}
          branches={(familyData?.branches ?? []) as any}
          relationships={(familyData?.relationships ?? []) as any}
        />
      )}

      {activeDomainId === "family" && activeTabId === "branches" && (
        <FamilyBranchesManager
          branches={(familyData?.branches ?? []) as any}
          onSaveBranch={(data) => runMutation(() => saveBranchMut({ data }), refreshFamily)}
        />
      )}

      {activeDomainId === "family" && activeTabId === "relationships" && (
        <FamilyRelationshipsManager
          members={(familyData?.members ?? []) as any}
          relationships={(familyData?.relationships ?? []) as any}
          filterMemberId={selectedRelMemberId}
          onSaveRelationship={(data) => runMutation(() => saveRelMut({ data }), refreshFamily)}
          onDeleteRelationship={(id) => runMutation(() => delRelMut({ data: { id } }), refreshFamily)}
        />
      )}

      {activeDomainId === "family" && activeTabId === "history" && (
        <FamilyHistoryManager
          historyItems={(familyData?.history ?? []) as any}
          places={(familyData?.places ?? []) as any}
          onSaveHistory={(data) => runMutation(() => saveHistMut({ data }), refreshFamily)}
        />
      )}

      {activeDomainId === "family" && activeTabId === "places" && (
        <PlacesManager
          places={(familyData?.places ?? []) as any}
          onSavePlace={(data) => runMutation(() => savePlaceMut({ data }), refreshFamily)}
        />
      )}

      {activeDomainId === "family" && activeTabId === "privacy" && (
        <FamilyMembersTable
          members={(familyData?.members ?? []) as any}
          branches={(familyData?.branches ?? []) as any}
          places={(familyData?.places ?? []) as any}
          onSaveMember={(data) => runMutation(() => saveMemberMut({ data }), refreshFamily)}
          onDeleteMember={(id) => runMutation(() => delMemberMut({ data: { id } }), refreshFamily)}
          onBulkAction={(data) => runMutation(() => bulkMembersMut({ data }), refreshFamily)}
          onOpenRelationships={(memberId) => {
            setSelectedRelMemberId(memberId);
            setActiveDomainId("family");
            setActiveTabId("relationships");
          }}
          onOpenImportExport={() => setImportExportOpen(true)}
        />
      )}

      {/* 3. DOMAIN: CONTENT & CMS */}
      {activeDomainId === "content" && activeTabId === "homepage" && (
        <HomepageManager
          initialSettings={(settingsData ?? []) as any}
          onSaveSettings={(data) =>
            runMutation(() => saveSettingMut({ data }), () =>
              queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
            )
          }
        />
      )}

      {activeDomainId === "content" && activeTabId === "pages" && (
        <PagesManager
          pages={(pagesData?.pages ?? []) as any}
          sections={(pagesData?.sections ?? []) as any}
          revisions={(pagesData?.revisions ?? []) as any}
          onSavePage={(data) => runMutation(() => savePageMut({ data }), refreshPages)}
        />
      )}

      {activeDomainId === "content" && activeTabId === "articles" && (
        <ArticlesManager
          articles={(articlesData?.articles ?? []) as any}
          categories={(articlesData?.categories ?? []) as any}
          onSaveArticle={(data) => runMutation(() => saveArtMut({ data }), refreshArticles)}
        />
      )}

      {activeDomainId === "content" && activeTabId === "announcements" && (
        <AnnouncementsManager
          announcements={(announcementsData ?? []) as any}
          onSaveAnnouncement={(data) => runMutation(() => saveAnnMut({ data }), refreshAnnouncements)}
        />
      )}

      {activeDomainId === "content" && activeTabId === "events" && (
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
      )}

      {activeDomainId === "content" && activeTabId === "navigation" && (
        <NavigationManager
          menus={(navigationData?.menus ?? []) as any}
          items={(navigationData?.items ?? []) as any}
          onSaveMenu={(data) => runMutation(() => saveNavMenuMut({ data }), refreshNavigation)}
          onSaveItem={(data) => runMutation(() => saveNavItemMut({ data }), refreshNavigation)}
          onDeleteItem={(id) => runMutation(() => delNavItemMut({ data: { id } }), refreshNavigation)}
        />
      )}

      {activeDomainId === "content" && activeTabId === "dna" && (
        <DnaStudiesManager
          initialData={(dnaData as any) ?? null}
          onSaveData={(data) => runMutation(() => saveDnaMut({ data }), refreshDna)}
        />
      )}

      {/* 4. DOMAIN: MEDIA & ARCHIVE */}
      {activeDomainId === "media" && activeTabId === "media_library" && (
        <MediaLibrary
          mediaAssets={(mediaData?.media ?? []) as any}
          onRegisterMedia={(data) => runMutation(() => saveMediaMut({ data }), refreshMedia)}
        />
      )}

      {activeDomainId === "media" && activeTabId === "library_items" && (
        <LibraryItemsManager
          libraryItems={(libraryData ?? []) as any}
          onSaveLibraryItem={(data) => runMutation(() => saveLibMut({ data }), refreshLibrary)}
          onDeleteLibraryItem={(id) => runMutation(() => delLibMut({ data: { id } }), refreshLibrary)}
        />
      )}

      {/* 5. DOMAIN: COMMUNITY & INQUIRIES */}
      {activeDomainId === "community" && activeTabId === "inquiries" && (
        <InquiriesManager
          inquiries={(inquiriesData?.inquiries ?? []) as any}
          notes={(inquiriesData?.notes ?? []) as any}
          onUpdateStatus={(id, status) => runMutation(() => updateInqStatusMut({ data: { id, status } }), refreshInquiries)}
          onAddNote={(inquiry_id, note) =>
            runMutation(() => addNoteMut({ data: { inquiry_id, note } }), refreshInquiries)
          }
        />
      )}

      {activeDomainId === "community" && activeTabId === "directory" && (
        <DirectoryManager
          businesses={(directoryData?.businesses ?? []) as any}
          membershipRequests={(directoryData?.membershipRequests ?? []) as any}
          onSaveBusiness={(data) => runMutation(() => saveBizMut({ data }), refreshDirectory)}
          onDeleteBusiness={(id) => runMutation(() => delBizMut({ data: { id } }), refreshDirectory)}
          onReviewRequest={(data) => runMutation(() => reviewReqMut({ data }), refreshDirectory)}
        />
      )}

      {activeDomainId === "community" && activeTabId === "verification" && (
        <DirectoryManager
          businesses={(directoryData?.businesses ?? []) as any}
          membershipRequests={(directoryData?.membershipRequests ?? []) as any}
          defaultTab="requests"
          onSaveBusiness={(data) => runMutation(() => saveBizMut({ data }), refreshDirectory)}
          onDeleteBusiness={(id) => runMutation(() => delBizMut({ data: { id } }), refreshDirectory)}
          onReviewRequest={(data) => runMutation(() => reviewReqMut({ data }), refreshDirectory)}
        />
      )}

      {/* 6. DOMAIN: TREASURY & INITIATIVES */}
      {activeDomainId === "treasury" && activeTabId === "treasury_ledger" && (
        <TreasuryManager
          contributions={(treasuryData?.contributions ?? []) as any}
          verifiedTotal={treasuryData?.verifiedTotal ?? 0}
          pendingTotal={treasuryData?.pendingTotal ?? 0}
          onReviewContribution={(data) => runMutation(() => reviewTreasuryMut({ data }), refreshTreasury)}
        />
      )}

      {activeDomainId === "treasury" && activeTabId === "initiatives" && (
        <InitiativesManager
          initiatives={(initiativesData ?? []) as any}
          onSaveInitiative={(data) => runMutation(() => saveInitMut({ data }), refreshInitiatives)}
          onDeleteInitiative={(id) => runMutation(() => delInitMut({ data: { id } }), refreshInitiatives)}
        />
      )}

      {activeDomainId === "treasury" && activeTabId === "achievers" && (
        <AchieversManager
          achievers={(achieversData ?? []) as any}
          onSaveAchiever={(data) => runMutation(() => saveAchMut({ data }), refreshAchievers)}
          onDeleteAchiever={(id) => runMutation(() => delAchMut({ data: { id } }), refreshAchievers)}
        />
      )}

      {/* 7. DOMAIN: SYSTEM, SECURITY & GOVERNANCE */}
      {activeDomainId === "system" && activeTabId === "users" && (
        <UsersManager
          profiles={(usersData?.profiles ?? []) as any}
          userRoles={(usersData?.userRoles ?? []) as any}
          onAssignRole={(user_id, role) => runMutation(() => assignRoleMut({ data: { user_id, role } }), refreshUsers)}
          onRemoveRole={(user_id, role) => runMutation(() => removeRoleMut({ data: { user_id, role } }), refreshUsers)}
        />
      )}

      {activeDomainId === "system" && activeTabId === "roles_matrix" && (
        <RolesPermissionMatrix />
      )}

      {activeDomainId === "system" && activeTabId === "audit_logs" && (
        <AuditLogsViewer auditLogs={(auditData ?? []) as any} />
      )}

      {activeDomainId === "system" && activeTabId === "site_settings" && (
        <SiteSettingsManager
          settings={(settingsData ?? []) as any}
          onSaveSetting={(data) =>
            runMutation(() => saveSettingMut({ data }), () =>
              queryClient.invalidateQueries({ queryKey: ["site-settings-data"] }),
            )
          }
        />
      )}

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
  );
}
