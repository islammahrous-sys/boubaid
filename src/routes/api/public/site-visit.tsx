import { createFileRoute } from "@tanstack/react-router";

type WeatherPayload = {
  temperature: number;
  label_ar: string;
  label_en: string;
};

let cachedWeather: { expiresAt: number; value: WeatherPayload | null } | null = null;

function parseCookie(header: string, name: string): string | null {
  const pair = header
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${name}=`));
  return pair ? decodeURIComponent(pair.slice(name.length + 1)) : null;
}

function createVisitKey() {
  return (
    globalThis.crypto?.randomUUID?.() ??
    `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 14)}`
  );
}

function weatherLabel(code: number): { label_ar: string; label_en: string } {
  if (code === 0) return { label_ar: "صافٍ", label_en: "Clear" };
  if ([1, 2, 3].includes(code)) return { label_ar: "غائم جزئياً", label_en: "Partly cloudy" };
  if ([45, 48].includes(code)) return { label_ar: "ضباب", label_en: "Fog" };
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82].includes(code)) {
    return { label_ar: "أمطار", label_en: "Rain" };
  }
  if ([95, 96, 99].includes(code)) return { label_ar: "عواصف رعدية", label_en: "Thunderstorms" };
  return { label_ar: "مستقر", label_en: "Stable" };
}

async function getEasternProvinceWeather(): Promise<WeatherPayload | null> {
  const now = Date.now();
  if (cachedWeather && cachedWeather.expiresAt > now) return cachedWeather.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 3000);
  try {
    const response = await fetch(
      "https://api.open-meteo.com/v1/forecast?latitude=26.4207&longitude=50.0888&current=temperature_2m,weather_code&timezone=Asia%2FRiyadh",
      { signal: controller.signal },
    );
    if (!response.ok) throw new Error(`weather_status_${response.status}`);
    const payload = (await response.json()) as {
      current?: { temperature_2m?: number; weather_code?: number };
    };
    const temperature = payload.current?.temperature_2m;
    const code = payload.current?.weather_code ?? 0;
    const value =
      typeof temperature === "number" ? { temperature, ...weatherLabel(Number(code)) } : null;
    cachedWeather = { expiresAt: now + 10 * 60 * 1000, value };
    return value;
  } catch (error) {
    console.error("[site-visit] weather lookup failed", error);
    cachedWeather = { expiresAt: now + 2 * 60 * 1000, value: null };
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export const Route = createFileRoute("/api/public/site-visit")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const cookieName = "abf_visit_key";
        const cookieHeader = request.headers.get("cookie") ?? "";
        const existingKey = parseCookie(cookieHeader, cookieName);
        const visitKey =
          existingKey && /^[a-zA-Z0-9_-]{16,80}$/.test(existingKey)
            ? existingKey
            : createVisitKey();

        let visits: number | null = null;
        try {
          const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
          const { data, error } = await supabaseAdmin.rpc("record_site_visit", {
            p_visit_key: visitKey,
          });
          if (error) {
            console.error("[site-visit] counter failed", error.code, error.message);
          } else if (typeof data === "number") {
            visits = data;
          }
        } catch (error) {
          console.error("[site-visit] counter caught error", error);
        }

        const response = Response.json({
          visits,
          now: new Date().toISOString(),
          weather: await getEasternProvinceWeather(),
        });

        if (visitKey !== existingKey) {
          const secure = url.protocol === "https:" ? "; Secure" : "";
          response.headers.append(
            "set-cookie",
            `${cookieName}=${encodeURIComponent(visitKey)}; Path=/; Max-Age=1800; HttpOnly; SameSite=Lax${secure}`,
          );
        }

        return response;
      },
    },
  },
});