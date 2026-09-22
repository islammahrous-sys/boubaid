import { createFileRoute } from "@tanstack/react-router";

type WeatherPayload = {
  temperature: number;
  high: number | null;
  low: number | null;
  condition: string;
  label_ar: string;
  label_en: string;
  /** Al Ahsa, fixed — never derived from the visitor's IP or device. */
  location_ar: string;
  location_en: string;
  /** true when served from the last successful reading rather than a fresh call. */
  stale: boolean;
  updated_at: string;
};

// Al Ahsa (Al-Hofuf), Eastern Province, Saudi Arabia — fixed coordinates.
const AL_AHSA = { latitude: 25.3833, longitude: 49.5833 } as const;

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
    WINDY: { label_ar: "عاصف", label_en: "Windy" },
    HAZE: { label_ar: "غبار خفيف", label_en: "Haze" },
    DUST: { label_ar: "غبار", label_en: "Dust" },
    SANDSTORM: { label_ar: "عاصفة رملية", label_en: "Sandstorm" },
    FOG: { label_ar: "ضباب", label_en: "Fog" },
    LIGHT_RAIN: { label_ar: "أمطار خفيفة", label_en: "Light rain" },
    RAIN: { label_ar: "أمطار", label_en: "Rain" },
    HEAVY_RAIN: { label_ar: "أمطار غزيرة", label_en: "Heavy rain" },
    RAIN_SHOWERS: { label_ar: "زخات مطر", label_en: "Rain showers" },
    THUNDERSTORM: { label_ar: "عواصف رعدية", label_en: "Thunderstorms" },
  };
  return labels[type] ?? { label_ar: "مستقر", label_en: englishDescription || "Stable" };
}

/** Map an Open-Meteo WMO weathercode to the same bilingual labels used for
 *  Google's condition types, so both providers render identically. */
function openMeteoLabel(code: number) {
  if (code === 0) return weatherLabel("CLEAR");
  if (code === 1) return weatherLabel("MOSTLY_CLEAR");
  if (code === 2) return weatherLabel("PARTLY_CLOUDY");
  if (code === 3) return weatherLabel("CLOUDY");
  if (code === 45 || code === 48) return weatherLabel("FOG");
  if (code >= 51 && code <= 57) return weatherLabel("LIGHT_RAIN");
  if ((code >= 61 && code <= 67) || (code >= 80 && code <= 82)) return weatherLabel("RAIN");
  if (code >= 95) return weatherLabel("THUNDERSTORM");
  return weatherLabel("");
}

/** Key-free fallback so deployments without the Google Maps connector
 *  credentials (e.g. the Vercel mirror) still show live Al Ahsa weather. */
async function openMeteoWeather(signal: AbortSignal): Promise<WeatherPayload> {
  const params = new URLSearchParams({
    latitude: String(AL_AHSA.latitude),
    longitude: String(AL_AHSA.longitude),
    current: "temperature_2m,weather_code",
    daily: "temperature_2m_max,temperature_2m_min",
    timezone: "Asia/Riyadh",
    forecast_days: "1",
  });
  const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`, { signal });
  if (!response.ok) throw new Error(`open_meteo_status_${response.status}`);
  const data = (await response.json()) as {
    current?: { temperature_2m?: number; weather_code?: number };
    daily?: { temperature_2m_max?: number[]; temperature_2m_min?: number[] };
  };
  const temperature = data.current?.temperature_2m;
  if (typeof temperature !== "number") throw new Error("open_meteo_empty_response");
  const code = data.current?.weather_code ?? -1;
  return {
    temperature,
    high: typeof data.daily?.temperature_2m_max?.[0] === "number" ? data.daily.temperature_2m_max[0] : null,
    low: typeof data.daily?.temperature_2m_min?.[0] === "number" ? data.daily.temperature_2m_min[0] : null,
    condition: "OPEN_METEO",
    ...openMeteoLabel(code),
    location_ar: "الأحساء",
    location_en: "Al Ahsa",
    stale: false,
    updated_at: new Date().toISOString(),
  };
}

async function gatewayLookup(path: string, params: URLSearchParams, signal: AbortSignal) {
  const lovableApiKey = process.env['LOVABLE_API_KEY'];
  const googleMapsApiKey = process.env['GOOGLE_MAPS_API_KEY'];
  if (!lovableApiKey || !googleMapsApiKey) throw new Error("weather_credentials_missing");

  const response = await fetch(
    `https://connector-gateway.lovable.dev/google_maps/weather/v1/${path}?${params}`,
    {
      signal,
      headers: {
        Authorization: `Bearer ${lovableApiKey}`,
        "X-Connection-Api-Key": googleMapsApiKey,
      },
    },
  );
  if (!response.ok) {
    const body = await response.text();
    console.error(`[site-visit] Google weather ${path} failed [${response.status}]: ${body}`);
    throw new Error(`weather_status_${response.status}`);
  }
  return response.json();
}

async function getAlAhsaWeather(): Promise<WeatherPayload | null> {
  const now = Date.now();
  if (cachedWeather && cachedWeather.expiresAt > now) return cachedWeather.value;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 6000);
  try {
    const base = {
      "location.latitude": String(AL_AHSA.latitude),
      "location.longitude": String(AL_AHSA.longitude),
      unitsSystem: "METRIC",
      languageCode: "en",
    };

    const [current, forecast] = await Promise.all([
      gatewayLookup("currentConditions:lookup", new URLSearchParams(base), controller.signal) as Promise<{
        temperature?: { degrees?: number };
        weatherCondition?: { type?: string; description?: { text?: string } };
      }>,
      gatewayLookup(
        "forecast/days:lookup",
        new URLSearchParams({ ...base, days: "1" }),
        controller.signal,
      ).catch(() => null) as Promise<{
        forecastDays?: {
          maxTemperature?: { degrees?: number };
          minTemperature?: { degrees?: number };
        }[];
      } | null>,
    ]);

    const temperature = current.temperature?.degrees;
    if (typeof temperature !== "number") throw new Error("weather_empty_response");

    const day = forecast?.forecastDays?.[0];
    const condition = current.weatherCondition;
    const value: WeatherPayload = {
      temperature,
      high: typeof day?.maxTemperature?.degrees === "number" ? day.maxTemperature.degrees : null,
      low: typeof day?.minTemperature?.degrees === "number" ? day.minTemperature.degrees : null,
      condition: condition?.type ?? "",
      ...weatherLabel(condition?.type ?? "", condition?.description?.text),
      location_ar: "الأحساء",
      location_en: "Al Ahsa",
      stale: false,
      updated_at: new Date().toISOString(),
    };

    lastSuccessfulWeather = value;
    cachedWeather = { expiresAt: now + 10 * 60 * 1000, value };
    return value;
  } catch (error) {
    console.error("[site-visit] Google weather lookup failed, trying fallback", error);
    // Fresh controller: the original may already be aborted by the timeout.
    const fallbackController = new AbortController();
    const fallbackTimeout = setTimeout(() => fallbackController.abort(), 6000);
    try {
      const value = await openMeteoWeather(fallbackController.signal);
      lastSuccessfulWeather = value;
      cachedWeather = { expiresAt: now + 10 * 60 * 1000, value };
      return value;
    } catch (fallbackError) {
      console.error("[site-visit] fallback weather lookup failed", fallbackError);
    } finally {
      clearTimeout(fallbackTimeout);
    }
    const fallback = lastSuccessfulWeather ? { ...lastSuccessfulWeather, stale: true } : null;
    // Short negative cache so a transient failure retries soon, but repeated
    // failures don't hammer the provider on every page view.
    cachedWeather = { expiresAt: now + 60 * 1000, value: fallback };
    return fallback;
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
          weather: await getAlAhsaWeather(),
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