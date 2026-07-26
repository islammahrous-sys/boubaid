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
import { LanguageProvider } from "@/i18n/LanguageProvider";
import { ThemeProvider, THEME_STORAGE_KEY } from "@/lib/ThemeProvider";
import { Header } from "@/components/site/Header";
import { Footer } from "@/components/site/Footer";
import { MobileNav } from "@/components/site/MobileNav";
import { Toaster } from "@/components/ui/sonner";

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
      { title: "آل بوعبيد — Al Bu Obaid Family" },
      {
        name: "description",
        content:
          "الموقع الرسمي لأسرة آل بوعبيد وصندوق التنمية العائلية — أسرة من فرع العبادل من بني تميم، مقرها الأحساء. Official website of the Al Bu Obaid family and its Family Development Fund.",
      },
      { name: "author", content: "Al Bu Obaid Family" },
      { property: "og:site_name", content: "آل بوعبيد — Al Bu Obaid" },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "icon", href: "/favicon.ico", type: "image/x-icon" },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      {
        // El Messiri, Reem Kufi, Amiri, and Aref Ruqaa provide prestigious calligraphic hierarchy.
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Amiri:wght@400;700&family=El+Messiri:wght@400;500;600;700&family=Reem+Kufi:wght@400;500;600;700&family=Aref+Ruqaa:wght@400;700&family=IBM+Plex+Sans+Arabic:wght@400;500;600&family=IBM+Plex+Mono:wght@400;600&family=Cormorant+Garamond:wght@400;600&family=Inter:wght@400;500;600&display=swap",
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

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="ar" dir="rtl">
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <HeadContent />
      </head>
      <body>
        {children}
        <Scripts />
      </body>
    </html>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();

  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <LanguageProvider>
          <div className="flex min-h-screen flex-col pb-16 md:pb-0">
            <Header />
            <main className="flex-1">
              <Outlet />
            </main>
            <Footer />
            <MobileNav />
          </div>
          <Toaster richColors position="top-center" />
        </LanguageProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}
