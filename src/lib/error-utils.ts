/**
 * Standardized Error Handling & Message Extraction Utilities
 */

export function getErrorMessage(error: unknown, fallback = "حدث خطأ غير متوقع"): string {
  if (!error) return fallback;
  if (typeof error === "string") return error;
  if (error instanceof Error) {
    if (error.message && error.message.trim().length > 0) {
      return error.message;
    }
  }
  if (typeof error === "object" && error !== null) {
    if ("message" in error && typeof (error as any).message === "string") {
      return (error as any).message;
    }
    if ("error" in error && typeof (error as any).error === "string") {
      return (error as any).error;
    }
  }
  return fallback;
}

export function isNetworkError(error: unknown): boolean {
  if (!error) return false;
  const msg = getErrorMessage(error).toLowerCase();
  return (
    msg.includes("failed to fetch") ||
    msg.includes("network error") ||
    msg.includes("networkrequestfailed") ||
    msg.includes("timeout") ||
    msg.includes("connection refused")
  );
}

const COMMON_ERROR_TRANSLATIONS: Record<string, { ar: string; en: string }> = {
  not_signed_in: {
    ar: "يجب تسجيل الدخول أولاً لإتمام هذا الإجراء.",
    en: "You must sign in first to perform this action.",
  },
  unauthorized: {
    ar: "ليس لديك الصلاحية الكافية لإتمام هذا الإجراء.",
    en: "You do not have sufficient permissions for this action.",
  },
  rate_limited: {
    ar: "تم تجاوز الحد المسموح من الطلبات. يرجى الانتظار قليلاً ثم المحاولة مرة أخرى.",
    en: "Too many requests. Please wait a moment and try again.",
  },
  invalid_amount: {
    ar: "يرجى إدخال مبلغ صحيح (ريال واحد فأكثر).",
    en: "Please enter a valid amount (1 SAR or more).",
  },
  verification_failed: {
    ar: "فشل التحقق الأمني (Turnstile). يرجى إعادة المحاولة.",
    en: "Security verification failed. Please try again.",
  },
  network_error: {
    ar: "تعذر الاتصال بالخادم. يرجى التحقق من اتصال الإنترنت.",
    en: "Could not connect to server. Please check your internet connection.",
  },
};

export function toUserFriendlyError(
  error: unknown,
  lang: "ar" | "en" = "ar",
  fallback?: string,
): string {
  const raw = getErrorMessage(error);
  if (COMMON_ERROR_TRANSLATIONS[raw]) {
    return COMMON_ERROR_TRANSLATIONS[raw][lang];
  }
  if (isNetworkError(error)) {
    return COMMON_ERROR_TRANSLATIONS.network_error[lang];
  }
  return fallback || raw;
}
