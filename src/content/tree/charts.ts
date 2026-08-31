/**
 * The 12 official verified branch charts (المشجرات المعتمدة) supplied by the
 * family documentation committee. These are the source of truth behind the
 * canonical dataset in `canonical.json` and the seeded Supabase tables.
 *
 * Images are rendered from `public/docs/al-bu-obaid-official-charts.pdf`.
 */
export interface OfficialChart {
  chart: number;
  titleAr: string;
  people: number;
  image: string;
}

export const officialCharts: OfficialChart[] = [
  { chart: 1, titleAr: "مشجرة أبناء يوسف بن أحمد بن عبدالله آل بوعبيد", people: 48, image: "/images/tree-charts/chart-01.jpg" },
  { chart: 2, titleAr: "مشجرة أبناء عبدالعزيز بن أحمد بن عبدالله آل بوعبيد", people: 37, image: "/images/tree-charts/chart-02.jpg" },
  { chart: 3, titleAr: "مشجرة أبناء عبدالله بن صالح بن عبدالرحمن بن أحمد بن عبدالله آل بوعبيد", people: 45, image: "/images/tree-charts/chart-03.jpg" },
  { chart: 4, titleAr: "مشجرة أبناء علي بن صالح بن عبدالرحمن بن أحمد بن عبدالله آل بوعبيد", people: 81, image: "/images/tree-charts/chart-04.jpg" },
  { chart: 5, titleAr: "مشجرة أبناء محمـد بن أحمد بن عبدالله آل بوعبيد", people: 11, image: "/images/tree-charts/chart-05.jpg" },
  { chart: 6, titleAr: "مشجرة أبناء سعد بن أحمد بن عبدالله آل بوعبيد", people: 48, image: "/images/tree-charts/chart-06.jpg" },
  { chart: 7, titleAr: "مشجرة أبناء عبداللطيف بن أحمد بن عبدالله آل بوعبيد", people: 50, image: "/images/tree-charts/chart-07.jpg" },
  { chart: 8, titleAr: "مشجرة أبناء عبدالله بن صالح بن عبدالله آل بوعبيد", people: 89, image: "/images/tree-charts/chart-08.jpg" },
  { chart: 9, titleAr: "مشجرة أبناء محمـد بن أحمد بن عبدالله آل بوعبيد", people: 7, image: "/images/tree-charts/chart-09.jpg" },
  { chart: 10, titleAr: "مشجرة أبناء محمد بن صالح بن عبدالرحمن بن أحمد بن عبدالله آل بوعبيد", people: 42, image: "/images/tree-charts/chart-10.jpg" },
  { chart: 11, titleAr: "مشجرة أبناء إبراهيم بن صالح بن عبدالرحمن بن أحمد بن عبدالله آل بوعبيد", people: 74, image: "/images/tree-charts/chart-11.jpg" },
  { chart: 12, titleAr: "مشجرة أبناء أحمد بن عبدالرحمن بن أحمد بن عبدالله آل بوعبيد", people: 47, image: "/images/tree-charts/chart-12.jpg" },
];

export const officialChartsPdf = "/docs/al-bu-obaid-official-charts.pdf";
