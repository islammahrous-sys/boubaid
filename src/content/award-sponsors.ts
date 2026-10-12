import type { BiText } from "@/i18n/LanguageProvider";

export type SponsorRow = {
  year: string;
  participants: number;
  honoured: number;
  branches: BiText[];
  prize: BiText;
  fields: BiText[];
  sponsor: string;
};

export const SPONSOR_HEAD: BiText[] = [
  { ar: "العام", en: "Year" },
  { ar: "عدد المشاركين", en: "Participants" },
  { ar: "المكرمين", en: "Honoured" },
  { ar: "فروع المسابقة", en: "Competition branches" },
  { ar: "قيمة الجوائز", en: "Prize value" },
  { ar: "فروع الفائزين", en: "Winners' fields" },
  { ar: "الرعاة والداعمين", en: "Sponsors & supporters" },
];

const br = (main: number, sub: number): BiText[] => [
  { ar: `${main} فروع رئيسة`, en: `${main} main branches` },
  { ar: `${sub} فروع فرعية`, en: `${sub} sub-branches` },
];
const F = {
  sci: { ar: "تميز علمي", en: "Academic distinction" },
  pro: { ar: "تميز مهني", en: "Professional distinction" },
  prize: { ar: "حصول على جائزة", en: "Award received" },
};
const sar = (n: string): BiText => ({ ar: `${n} ريال`, en: `SAR ${n}` });

export const SPONSOR_ROWS: SponsorRow[] = [
  {
    year: "1444",
    participants: 19,
    honoured: 7,
    branches: br(4, 3),
    prize: sar("8000"),
    fields: [F.sci, F.pro],
    sponsor: "ماهر بن أحمد بن إبراهيم",
  },
  {
    year: "1445",
    participants: 17,
    honoured: 5,
    branches: br(4, 3),
    prize: sar("6000"),
    fields: [F.sci, F.pro],
    sponsor: "عادل بن سعد بن علي بن صالح",
  },
  {
    year: "1446",
    participants: 15,
    honoured: 4,
    branches: br(3, 3),
    prize: sar("5000"),
    fields: [F.sci],
    sponsor: "عادل بن سعد بن علي بن صالح",
  },
  {
    year: "1447",
    participants: 18,
    honoured: 6,
    branches: br(3, 3),
    prize: sar("7000"),
    fields: [F.sci, F.pro, F.prize],
    sponsor: "عادل بن سعد بن علي بن صالح",
  },
];
