import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
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

import { Toaster } from "@/components/ui/sonner";
import { getCanonicalUrl } from "@/lib/seo";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
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
      { name: "viewport", content: "width=device-width, initial-scale=1" },
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
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", type: "image/png", href: "/favicon.png" },
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
            <script
              async
              src={`https://www.googletagmanager.com/gtag/js?id=${gaMeasurementId}`}
            />
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

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const router = useRouter();
  const pathname = router.state.location.pathname;
  const isConsole = pathname.startsWith("/admin") || pathname.startsWith("/treasury") || pathname.startsWith("/content");

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <LanguageProvider>
            <div className={`flex min-h-screen flex-col ${isConsole ? "pb-0" : "pb-16 md:pb-0"}`}>
              <a href="#main" className="skip-link">
                تخطَّ إلى المحتوى — Skip to content
              </a>
              {!isConsole && <AnnouncementTicker />}
              {!isConsole && <Header />}
              <main id="main" className="flex-1">
                <PageTransition>
                  <Outlet />
                </PageTransition>
              </main>

              {!isConsole && <Footer />}
              {!isConsole && <MobileNav />}
              <ScrollReveal />
            </div>
            <Toaster richColors position="top-center" />
          </LanguageProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
