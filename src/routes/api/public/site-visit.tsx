import { createFileRoute } from "@tanstack/react-router";

type WeatherPayload = {
  temperature: number;
  label_ar: string;
  label_en: string;
};

let cachedWeather: { expiresAt: number; value: WeatherPayload | null } | null = null;
let lastSuccessfulWeather: WeatherPayload | null = null;

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

function weatherLabel(type: string, englishDescription?: string) {
  const labels: Record<string, { label_ar: string; label_en: string }> = {
    CLEAR: { label_ar: "صافٍ", label_en: "Clear" },
    MOSTLY_CLEAR: { label_ar: "صافٍ غالباً", label_en: "Mostly clear" },
    PARTLY_CLOUDY: { label_ar: "غائم جزئياً", label_en: "Partly cloudy" },
    MOSTLY_CLOUDY: { label_ar: "غائم غالباً", label_en: "Mostly cloudy" },
    CLOUDY: { label_ar: "غائم", label_en: "Cloudy" },
    FOG: { label_ar: "ضباب", label_en: "Fog" },
    LIGHT_RAIN: { label_ar: "أمطار خفيفة", label_en: "Light rain" },
    RAIN: { label_ar: "أمطار", label_en: "Rain" },
    HEAVY_RAIN: { label_ar: "أمطار غزيرة", label_en: "Heavy rain" },
    THUNDERSTORM: { label_ar: "عواصف رعدية", label_en: "Thunderstorms" },
  };
  return labels[type] ?? { label_ar: "مستقر", label_en: englishDescription || "Stable" };
}

async function getEasternProvinceWeather(): Promise<WeatherPayload | null> {
  const now = Date.now();
  if (cachedWeather && cachedWeather.expiresAt > now) return cachedWeather.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 5000);
  try {
    const lovableApiKey = process.env['LOVABLE_API_KEY'];
    const googleMapsApiKey = process.env['GOOGLE_MAPS_API_KEY'];
    if (!lovableApiKey || !googleMapsApiKey) throw new Error("weather_credentials_missing");

    const params = new URLSearchParams({
      "location.latitude": "26.4207",
      "location.longitude": "50.0888",
      unitsSystem: "METRIC",
      languageCode: "en",
    });
    const response = await fetch(
      `https://connector-gateway.lovable.dev/google_maps/weather/v1/currentConditions:lookup?${params}`,
      {
        signal: controller.signal,
        headers: {
          Authorization: `Bearer ${lovableApiKey}`,
          "X-Connection-Api-Key": googleMapsApiKey,
        },
      },
    );
    if (!response.ok) {
      const body = await response.text();
      console.error(`[site-visit] Google weather failed [${response.status}]: ${body}`);
      throw new Error(`weather_status_${response.status}`);
    }
    const payload = (await response.json()) as {
      temperature?: { degrees?: number };
      weatherCondition?: { type?: string; description?: { text?: string } };
    };
    const temperature = payload.temperature?.degrees;
    const condition = payload.weatherCondition;
    const value =
      typeof temperature === "number"
        ? { temperature, ...weatherLabel(condition?.type ?? "", condition?.description?.text) }
        : null;
    if (value) lastSuccessfulWeather = value;
    cachedWeather = { expiresAt: now + 10 * 60 * 1000, value };
    return value;
  } catch (error) {
    console.error("[site-visit] weather lookup failed", error);
    cachedWeather = { expiresAt: now + 2 * 60 * 1000, value: lastSuccessfulWeather };
    return lastSuccessfulWeather;
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