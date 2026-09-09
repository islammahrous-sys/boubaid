import type { BiText } from "@/i18n/LanguageProvider";

import frame1Medium from "@/assets/tree-frames/01_Family_Tree_Frame_1_Medium_Size_260_SAR.png.asset.json";
import frame1Small from "@/assets/tree-frames/02_Family_Tree_Frame_1_Small_size_220_SAR.png.asset.json";
import frame1Large from "@/assets/tree-frames/03_Family_Tree_Frame_1_Big_Size_SAR_275.png.asset.json";
import frame1XLarge from "@/assets/tree-frames/04_Family_Tree_Frame_1_Very_Big_Size_SAR_320.png.asset.json";
import frame2Large from "@/assets/tree-frames/05_Family_Tree_Frame_2_Big_Size_SAR_330.png.asset.json";
import frame2XLarge from "@/assets/tree-frames/06_Family_Tree_Frame_2_Very_Big_Size_SAR_395.png.asset.json";
import frameCustom from "@/assets/tree-frames/07_Family_Tree_Special_Frame.png.asset.json";

/**
 * The framed editions of the official illustrated family tree, transcribed
 * verbatim from the council's approved product sheet. Prices and dimensions
 * are authoritative — never round or estimate them.
 */
export interface TreeFrameProduct {
  id: string;
  image: string;
  name: BiText;
  frameNo: BiText;
  sizeName: BiText;
  width: BiText;
  length: BiText;
  /** Fixed retail price in SAR. `null` for the made-to-order frame. */
  price: number | null;
  /** Direct product link in the family's Salla storefront. */
  storeUrl?: string;
}

export const treeFrameProducts: TreeFrameProduct[] = [
  {
    id: "frame-2-xlarge",
    image: frame2XLarge.url,
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
    image: frame2Large.url,
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
    image: frame1XLarge.url,
    name: {
      ar: "شجرة الأسرة فريم رقم 1 مقاس كبير جداً",
      en: "Family Tree Frame No. 1 — Extra Large",
    },
    frameNo: { ar: "فريم رقم (1)", en: "Frame No. 1" },
    sizeName: { ar: "مقاس كبير جداً", en: "Extra large" },
    width: { ar: "90 سم", en: "90 cm" },
    length: { ar: "125 سم", en: "125 cm" },
    price: 320,
  },
  {
    id: "frame-1-large",
    image: frame1Large.url,
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
    id: "frame-1-medium",
    image: frame1Medium.url,
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
  {
    id: "frame-1-small",
    image: frame1Small.url,
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
];

/** Made-to-order frame — the price is agreed after the order is placed. */
export const treeFrameCustom: TreeFrameProduct = {
  id: "frame-custom",
  image: frameCustom.url,
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
