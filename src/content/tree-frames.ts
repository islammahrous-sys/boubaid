import type { BiText } from "@/i18n/LanguageProvider";

/**
 * The framed editions of the official illustrated family tree, transcribed
 * verbatim from the council's approved product sheet. Prices and dimensions
 * are authoritative — never round or estimate them.
 */
export interface TreeFrameProduct {
  id: string;
  name: BiText;
  frameNo: BiText;
  sizeName: BiText;
  width: BiText;
  length: BiText;
  /** Fixed retail price in SAR. `null` for the made-to-order frame. */
  price: number | null;
}

export const treeFrameProducts: TreeFrameProduct[] = [
  {
    id: "frame-2-xlarge",
    name: {
      ar: "شجرة العائلة فريم رقم 2 مقاس كبير جداً",
      en: "Family Tree Frame No. 2 — Extra Large",
    },
    frameNo: { ar: "فريم رقم (2)", en: "Frame No. 2" },
    sizeName: { ar: "مقاس كبير جداً", en: "Extra large" },
    width: { ar: "90 سم", en: "90 cm" },
    length: { ar: "125 سم", en: "125 cm" },
    price: 390,
  },
  {
    id: "frame-2-large",
    name: {
      ar: "شجرة العائلة فريم رقم 2 مقاس كبير",
      en: "Family Tree Frame No. 2 — Large",
    },
    frameNo: { ar: "فريم رقم (2)", en: "Frame No. 2" },
    sizeName: { ar: "مقاس كبير", en: "Large" },
    width: { ar: "75 سم", en: "75 cm" },
    length: { ar: "105 سم", en: "105 cm" },
    price: 330,
  },
  {
    id: "frame-1-xlarge",
    name: {
      ar: "شجرة الأسرة فريم رقم 1 مقاس كبير جداً",
      en: "Family Tree Frame No. 1 — Extra Large",
    },
    frameNo: { ar: "فريم رقم (1)", en: "Frame No. 1" },
    sizeName: { ar: "مقاس كبير جداً", en: "Extra large" },
    width: { ar: "90 سم", en: "90 cm" },
    length: { ar: "125 سم", en: "125 cm" },
    price: 330,
  },
  {
    id: "frame-1-large",
    name: {
      ar: "شجرة العائلة فريم رقم 1 مقاس كبير",
      en: "Family Tree Frame No. 1 — Large",
    },
    frameNo: { ar: "فريم رقم (1)", en: "Frame No. 1" },
    sizeName: { ar: "مقاس كبير", en: "Large" },
    width: { ar: "75 سم", en: "75 cm" },
    length: { ar: "105 سم", en: "105 cm" },
    price: 275,
  },
  {
    id: "frame-1-small",
    name: {
      ar: "شجرة العائلة فريم رقم 1 مقاس صغير",
      en: "Family Tree Frame No. 1 — Small",
    },
    frameNo: { ar: "فريم رقم (1)", en: "Frame No. 1" },
    sizeName: { ar: "مقاس صغير", en: "Small" },
    width: { ar: "55 سم", en: "55 cm" },
    length: { ar: "75 سم", en: "75 cm" },
    price: 220,
  },
  {
    id: "frame-1-medium",
    name: {
      ar: "شجرة العائلة فريم رقم 1 مقاس متوسط",
      en: "Family Tree Frame No. 1 — Medium",
    },
    frameNo: { ar: "فريم رقم (1)", en: "Frame No. 1" },
    sizeName: { ar: "مقاس متوسط", en: "Medium" },
    width: { ar: "65 سم", en: "65 cm" },
    length: { ar: "60 سم", en: "60 cm" },
    price: 260,
  },
];

/** Made-to-order frame — the price is agreed after the order is placed. */
export const treeFrameCustom: TreeFrameProduct = {
  id: "frame-custom",
  name: { ar: "فريم خاص", en: "Custom Frame" },
  frameNo: { ar: "فريم خاص", en: "Custom frame" },
  sizeName: { ar: "مقاس حسب الطلب", en: "Custom size" },
  width: { ar: "حسب الطلب", en: "Custom" },
  length: { ar: "حسب الطلب", en: "Custom" },
  price: null,
};

export const treeFrameCustomColour: BiText = { ar: "حسب الطلب", en: "Custom" };

export const treeFrameCustomPriceNote: BiText = {
  ar: "* يتم تحديد السعر لاحقاً بعد الطلب",
  en: "* Price will be determined after the order is placed.",
};
