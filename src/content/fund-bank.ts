import type { BankAccountConfig } from "@/lib/contributions.schemas";

/**
 * The fund's official bank record, transcribed from the bank's account
 * certificate. It is deliberately public (shown on /contribute for transfers).
 *
 * This is the fallback only: the live values come from the treasury console
 * (`site_settings.treasury_config.bank_account`), and any field left blank
 * there falls back to the value here.
 */
export const OFFICIAL_BANK_ACCOUNT: BankAccountConfig = {
  bank_name_ar: "بنك البلاد",
  bank_name_en: "Bank Albilad",
  beneficiary_name_ar: "صندوق التنمية العائلية",
  beneficiary_name_en: "Family Development Fund",
  customer_number: "7001473102",
  account_number: "999146092730006",
  iban: "SA1915000999146092730006",
  notes_ar:
    "الحساب البنكي الرسمي المعتمد لصندوق التنمية العائلية (آل بوعبيد) الخاضع للترخيص والإشراف المالي من المركز الوطني لتنمية القطاع غير الربحي (NCNP).",
  notes_en:
    "The official bank account of Al-Boabid Family Fund subject to NCNP licensing and audit.",
};

/** Field-by-field merge: blank or missing saved values fall back to the official record. */
export function resolveBankAccount(
  saved: Partial<BankAccountConfig> | null | undefined,
): BankAccountConfig {
  const out = { ...OFFICIAL_BANK_ACCOUNT };
  for (const key of Object.keys(out) as (keyof BankAccountConfig)[]) {
    const v = saved?.[key];
    if (typeof v === "string" && v.trim()) (out as Record<string, string>)[key] = v.trim();
  }
  return out;
}
