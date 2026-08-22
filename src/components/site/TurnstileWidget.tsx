import { forwardRef, useEffect, useId, useImperativeHandle, useRef } from "react";

declare global {
  interface Window {
    turnstile?: {
      render: (container: HTMLElement, options: Record<string, unknown>) => string;
      remove: (widgetId: string) => void;
      reset: (widgetId: string) => void;
    };
  }
}

const TURNSTILE_SITE_KEY = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined;
const SCRIPT_SRC = "https://challenges.cloudflare.com/turnstile/v0/api.js";

/** True only when a Turnstile site key is configured for this build. */
export const isTurnstileConfigured = Boolean(TURNSTILE_SITE_KEY);

let scriptPromise: Promise<void> | null = null;
function loadTurnstileScript(): Promise<void> {
  if (typeof window === "undefined") return Promise.resolve();
  if (window.turnstile) return Promise.resolve();
  if (!scriptPromise) {
    scriptPromise = new Promise((resolve, reject) => {
      const existing = document.querySelector<HTMLScriptElement>(`script[src="${SCRIPT_SRC}"]`);
      if (existing) {
        existing.addEventListener("load", () => resolve());
        existing.addEventListener("error", () => reject(new Error("turnstile_script_failed")));
        return;
      }
      const script = document.createElement("script");
      script.src = SCRIPT_SRC;
      script.async = true;
      script.defer = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("turnstile_script_failed"));
      document.head.appendChild(script);
    });
  }
  return scriptPromise;
}

export type TurnstileWidgetHandle = { reset: () => void };

/**
 * Cloudflare Turnstile widget.
 *
 * Renders only when VITE_TURNSTILE_SITE_KEY is set at build time. With no
 * site key configured this renders nothing — callers can mount it
 * unconditionally and forms fall back to their existing honeypot-only
 * protection with no visual change and no broken build.
 */
export const TurnstileWidget = forwardRef<TurnstileWidgetHandle, { onToken: (token: string) => void }>(
  function TurnstileWidget({ onToken }, ref) {
    const containerRef = useRef<HTMLDivElement | null>(null);
    const widgetIdRef = useRef<string | null>(null);
    const onTokenRef = useRef(onToken);
    onTokenRef.current = onToken;
    const reactId = useId();

    useImperativeHandle(ref, () => ({
      reset: () => {
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.reset(widgetIdRef.current);
          } catch {
            /* noop */
          }
        }
      },
    }));

    useEffect(() => {
      if (!TURNSTILE_SITE_KEY) return;
      let cancelled = false;

      loadTurnstileScript()
        .then(() => {
          if (cancelled || !containerRef.current || !window.turnstile) return;
          widgetIdRef.current = window.turnstile.render(containerRef.current, {
            sitekey: TURNSTILE_SITE_KEY,
            callback: (token: string) => onTokenRef.current(token),
            "expired-callback": () => onTokenRef.current(""),
            "error-callback": () => onTokenRef.current(""),
          });
        })
        .catch((err) => {
          // Script blocked/offline — leave the rest of the form usable; the
          // server only enforces a token when TURNSTILE_SECRET_KEY is set.
          console.error("[turnstile] widget failed to load", err);
        });

      return () => {
        cancelled = true;
        if (widgetIdRef.current && window.turnstile) {
          try {
            window.turnstile.remove(widgetIdRef.current);
          } catch {
            /* noop */
          }
        }
      };
    }, []);

    if (!TURNSTILE_SITE_KEY) return null;

    return <div ref={containerRef} data-turnstile-id={reactId} className="cf-turnstile" />;
  },
);
