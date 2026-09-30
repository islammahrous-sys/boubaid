import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, type ReactNode } from "react";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";
import { LanguageProvider, LANG_STORAGE_KEY } from "@/i18n/LanguageProvider";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/lib/ThemeProvider";
import { AuthProvider } from "@/hooks/useAuth";
import { Header } from "@/components/site/Header";
import { AnnouncementTicker } from "@/components/site/AnnouncementTicker";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { ScrollReveal } from "@/components/site/ScrollReveal";
import { PageTransition } from "@/components/site/PageTransition";
import { TopProgressBar } from "@/components/site/TopProgressBar";
import { NetworkStatusBanner } from "@/components/common/NetworkStatusBanner";
import { GlobalMediaViewer } from "@/components/site/GlobalMediaViewer";

import { Toaster } from "@/components/ui/sonner";
import { getCanonicalUrl } from "@/lib/seo";
import { cn } from "@/lib/utils";

const NOT_FOUND_TITLE = "الصفحة غير موجودة — Page not found | آل بوعبيد";

function NotFoundComponent() {
  // React 19 hoists the <meta> below to <head> so a missing page is never
  // indexed. TanStack keeps ownership of <title> (its route `head` doesn't
  // run for the not-found component), so correct the tab title imperatively
  // once mounted rather than leaving the homepage title on a 404.
  useEffect(() => {
    const previous = document.title;
    document.title = NOT_FOUND_TITLE;
    return () => {
      document.title = previous;
    };
  }, []);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <title>{NOT_FOUND_TITLE}</title>
      <meta name="robots" content="noindex, follow" />
      <div className="max-w-md">
        <p className="nums font-mono text-sm text-bronze">404</p>
        <h1 className="mt-3 text-2xl text-foreground">الصفحة غير موجودة — Page not found</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          الرابط المطلوب غير متاح أو تم نقله.
          <br />
          The page you're looking for doesn't exist or has been moved.
        </p>
        <div className="mt-7 border-t border-border pt-5">
          <Link
            to="/"
            className="inline-flex items-center border border-ink bg-ink px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            العودة للرئيسية — Go home
          </Link>
        </div>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  console.error(error);
  const router = useRouter();
  useEffect(() => {
    reportLovableError(error, { boundary: "tanstack_root_error_component" });
  }, [error]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <title>تعذر تحميل الصفحة — Something went wrong | آل بوعبيد</title>
      <meta name="robots" content="noindex, follow" />
      <div className="max-w-md">
        <h1 className="text-2xl text-foreground">تعذر تحميل الصفحة — This page didn't load</h1>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">
          حدث خطأ غير متوقع. يمكنك المحاولة مرة أخرى أو العودة للرئيسية.
          <br />
          Something went wrong on our end. Try again or head back home.
        </p>
        <div className="mt-7 flex flex-wrap gap-3 border-t border-border pt-5">
          <button
            onClick={() => {
              router.invalidate();
              reset();
            }}
            className="inline-flex items-center border border-ink bg-ink px-4 py-2 text-sm font-medium text-ivory transition-colors hover:bg-transparent hover:text-foreground dark:border-gold dark:bg-gold dark:text-ink dark:hover:bg-transparent dark:hover:text-gold"
          >
            إعادة المحاولة — Try again
          </button>
          <a
            href="/"
            className="inline-flex items-center border border-border px-4 py-2 text-sm font-medium text-foreground transition-colors hover:bg-secondary"
          >
            الرئيسية — Go home
          </a>
        </div>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1, viewport-fit=cover" },
      { title: "آل بوعبيد — صندوق التنمية العائلية | البوابة الرسمية" },
      {
        name: "description",
        content:
          "الموقع الرسمي لأسرة آل بوعبيد وصندوق التنمية العائلية — أسرة من فرع العبادل من بني تميم، مقرها الأحساء. Official website of the Al Bu Obaid family and its Family Development Fund.",
      },
      { name: "author", content: "Al Bu Obaid Family" },
      { property: "og:site_name", content: "آل بوعبيد — Al Bu Obaid" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      {
        property: "og:title",
        content: "صندوق التنمية العائلية (آل بوعبيد) — البوابة الرسمية | Al Bu Obaid Family",
      },
      {
        name: "twitter:title",
        content: "صندوق التنمية العائلية (آل بوعبيد) — البوابة الرسمية | Al Bu Obaid Family",
      },
      {
        property: "og:description",
        content:
          "الموقع الرسمي لأسرة آل بوعبيد وصندوق التنمية العائلية — أسرة من فرع العبادل من بني تميم، مقرها الأحساء. Official website of the Al Bu Obaid family and its Family Development Fund.",
      },
      {
        name: "twitter:description",
        content:
          "الموقع الرسمي لأسرة آل بوعبيد وصندوق التنمية العائلية — أسرة من فرع العبادل من بني تميم، مقرها الأحساء. Official website of the Al Bu Obaid family and its Family Development Fund.",
      },
      {
        property: "og:image",
        content: getCanonicalUrl("/images/family_majlis.png"),
      },
      {
        name: "twitter:image",
        content: getCanonicalUrl("/images/family_majlis.png"),
      },
      { name: "theme-color", content: "#121614" },
      { name: "mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-capable", content: "yes" },
      { name: "apple-mobile-web-app-status-bar-style", content: "black-translucent" },
      { name: "apple-mobile-web-app-title", content: "آل بوعبيد" },
    ],
    links: [
      { rel: "manifest", href: "/site.webmanifest" },
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
      { rel: "apple-touch-icon", href: "/favicon.png" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        // Amiri is the Arabic display face and carries every heading in the
        // site's primary language — it is not optional decoration.
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap",
      },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

/**
 * Runs synchronously before first paint so the `dark` class is already
 * correct when the stylesheet applies — without it, every page would flash
 * light before React mounts and ThemeProvider corrects it.
 */
const themeInitScript = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(THEME_STORAGE_KEY)});
    var dark = stored === "dark" || (stored !== "light" && window.matchMedia("(prefers-color-scheme: dark)").matches);
    document.documentElement.classList.toggle("dark", dark);
  } catch (e) {}
})();`;

/**
 * Runs synchronously before first paint, same reasoning as `themeInitScript`:
 * without it, a returning visitor who chose English sees the whole page
 * render in Arabic/RTL for a moment before `LanguageProvider` corrects it.
 */
const langInitScript = `(function () {
  try {
    var stored = localStorage.getItem(${JSON.stringify(LANG_STORAGE_KEY)});
    var lang = stored === "en" ? "en" : "ar";
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === "ar" ? "rtl" : "ltr";
  } catch (e) {}
})();`;

// Optional GA4 analytics loader. Only injects gtag.js when a measurement ID
// is configured (see VITE_GA_MEASUREMENT_ID in .env.example) — with no env
// var set, nothing is rendered and behavior is unchanged.
const gaMeasurementId = import.meta.env.VITE_GA_MEASUREMENT_ID as string | undefined;
const gaInitScript = gaMeasurementId
  ? `window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());
gtag('config', ${JSON.stringify(gaMeasurementId)});`
  : undefined;

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <script dangerouslySetInnerHTML={{ __html: langInitScript }} />
        {gaMeasurementId && gaInitScript && (
          <>
            <script async src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`} />
            <script dangerouslySetInnerHTML={{ __html: gaInitScript }} />
          </>
        )}
        <HeadContent />
      </head>
      <body className="paper-texture" suppressHydrationWarning>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

/**
 * Supabase appends the recovery/confirmation payload to the URL *fragment*
 * (`#access_token=…&type=recovery` on success, `#error_code=otp_expired` on a
 * dead link). It targets whatever `redirect_to` resolved to — and if the exact
 * URL isn't in the project's Redirect URLs allow-list, Supabase silently drops
 * the path and sends the user to the bare Site URL instead. That lands a
 * password-reset on the home page, which has no handler, so the member is
 * quietly signed in (or just stranded on an error hash) and never sees the
 * form. Forward any such landing to `/reset-password`, hash intact, so the flow
 * still completes regardless of the allow-list configuration.
 */
function useRecoveryHashRedirect(pathname: string) {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (pathname === "/reset-password") return;
    const hash = window.location.hash.slice(1);
    if (!hash) return;
    const p = new URLSearchParams(hash);
    const isRecovery = p.get("type") === "recovery";
    const isAuthError = p.has("error_code") || p.has("error");
    if (isRecovery || isAuthError) {
      window.location.replace(`/reset-password${window.location.hash}`);
    }
  }, [pathname]);
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  useRecoveryHashRedirect(pathname);
  const isConsole =
    pathname.startsWith("/admin") ||
    pathname.startsWith("/treasury") ||
    pathname.startsWith("/content");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <div
              className={`flex min-h-screen w-full flex-col overflow-x-clip ${isConsole ? "pb-0" : "pb-[calc(4.5rem+env(safe-area-inset-bottom))] md:pb-0"}`}
            >
              <TopProgressBar />
              <a href="#main" className="skip-link">
                تخطَّ إلى المحتوى — Skip to content
              </a>
              <div className={cn(isConsole && "hidden")}>
                <AnnouncementTicker />
                <Header />
              </div>
              <main id="main" className="flex-1">
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </main>

              <div className={cn(isConsole && "hidden")}>
                <Footer />
                <MobileNav />
              </div>
              <ScrollReveal />
            </div>
            <NetworkStatusBanner />
            <GlobalMediaViewer />
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
