/**
 * Canonical family-tree builder.
 *
 * Input : src/content/tree/charts/chart01..12.json (manual transcription of the
 *         12 official A0 charts — the only authoritative source).
 * Output: src/content/tree/canonical.json  (flat people list, real parentage)
 *         public/family-tree-data.js       (D3 nested data for the public chart)
 *         scripts/seed-family-tree.sql     (literal INSERTs for the migration)
 *
 * Run: bun scripts/build-family-tree.ts
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { createHash } from "node:crypto";

type ChartPerson = {
  name: string;
  father: string | null;
  key?: string;
  uncertain?: boolean;
};
type Chart = { chart: number; title_ar: string; people: ChartPerson[]; flags: string[] };

const CHART_DIR = join(process.cwd(), "src/content/tree/charts");

const BRANCH_BY_CHART: Record<number, { slug: string; elder_ar: string }> = {
  1: { slug: "al-yousef", elder_ar: "يوسف بن أحمد بن عبدالله" },
  2: { slug: "al-abdulaziz", elder_ar: "عبدالعزيز بن أحمد بن عبدالله" },
  3: { slug: "al-abdullah-salih", elder_ar: "عبدالله بن صالح بن عبدالرحمن" },
  4: { slug: "al-ali-salih", elder_ar: "علي بن صالح بن عبدالرحمن" },
  5: { slug: "al-mohammed-ahmed", elder_ar: "محمد بن أحمد بن عبدالله" },
  6: { slug: "al-saad", elder_ar: "سعد بن أحمد بن عبدالله" },
  7: { slug: "al-abdullatif", elder_ar: "عبداللطيف بن أحمد بن عبدالله" },
  8: { slug: "al-abdullah-salih-abdullah", elder_ar: "عبدالله بن صالح بن عبدالله" },
  9: { slug: "al-abdulaziz-abdulrahman", elder_ar: "عبدالعزيز بن عبدالرحمن بن أحمد" },
  10: { slug: "al-mohammed-salih", elder_ar: "محمد بن صالح بن عبدالرحمن" },
  11: { slug: "al-ibrahim-salih", elder_ar: "إبراهيم بن صالح بن عبدالرحمن" },
  12: { slug: "al-ahmed-abdulrahman", elder_ar: "أحمد بن عبدالرحمن بن أحمد" },
};

type Node = {
  id: string;
  name: string;
  path: string[]; // names from root -> this person
  generation: number;
  parent: Node | null;
  children: Node[];
  charts: number[];
  uncertain: boolean;
  branchSlug: string | null;
  seq: number;
};

const root: Node[] = [];
let SEQ = 0;
const warnings: string[] = [];

function pathKey(p: string[]) {
  return p.join(" / ");
}
const byPath = new Map<string, Node>();

function stableId(p: string[]) {
  const h = createHash("sha1").update(pathKey(p)).digest("hex");
  return [h.slice(0, 8), h.slice(8, 12), "4" + h.slice(13, 16), "8" + h.slice(17, 20), h.slice(20, 32)].join("-");
}

function ensureNode(parent: Node | null, name: string, chart: number, uncertain: boolean): Node {
  const path = parent ? [...parent.path, name] : [name];
  const key = pathKey(path);
  const existing = byPath.get(key);
  if (existing) {
    if (!existing.charts.includes(chart)) existing.charts.push(chart);
    return existing;
  }
  const node: Node = {
    id: stableId(path),
    name,
    path,
    generation: path.length,
    parent,
    children: [],
    charts: [chart],
    uncertain,
    branchSlug: null,
    seq: SEQ++,
  };
  byPath.set(key, node);
  if (parent) parent.children.push(node);
  else root.push(node);
  return node;
}

/** Resolve a chart-local father reference to an already-created node. */
function resolveFather(ref: string, chart: number, local: Map<string, Node[]>, keyed: Map<string, Node>): Node {
  if (keyed.has(ref)) return keyed.get(ref)!;

  const parts = ref.split(" بن ").map((s) => s.trim()).filter(Boolean);
  const [head, ...ancestors] = parts;
  let candidates = local.get(head) ?? [];
  if (candidates.length === 0) throw new Error(`chart ${chart}: unknown father "${ref}"`);

  // "X بن Y بن Z" = X's father is Y, Y's father is Z (consecutive ancestry).
  candidates = candidates.filter((c) => {
    let cur = c.parent;
    for (const anc of ancestors) {
      if (!cur || cur.name !== anc) return false;
      cur = cur.parent;
    }
    return true;
  });
  if (candidates.length === 1) return candidates[0];
  if (candidates.length === 0) throw new Error(`chart ${chart}: father "${ref}" not resolvable`);
  // Ambiguous: the charts are transcribed top-down, so the most recently
  // introduced matching person is the intended one.
  const chosen = candidates.reduce((a, b) => (b.seq > a.seq ? b : a));
  warnings.push(
    `المشجرة ${chart}: مرجع الأب «${ref}» ينطبق على ${candidates.length} أشخاص — تم اختيار «${chosen.path.slice().reverse().join(" بن ")}».`,
  );
  return chosen;
}

const charts: Chart[] = readdirSync(CHART_DIR)
  .filter((f) => f.endsWith(".json"))
  .sort()
  .map((f) => JSON.parse(readFileSync(join(CHART_DIR, f), "utf8")) as Chart);

for (const chart of charts) {
  const local = new Map<string, Node[]>(); // name -> nodes created in this chart
  const keyed = new Map<string, Node>();

  const remember = (n: Node, key?: string) => {
    const arr = local.get(n.name) ?? [];
    arr.push(n);
    local.set(n.name, arr);
    if (key) keyed.set(key, n);
  };

  for (const p of chart.people) {
    const parent = p.father ? resolveFather(p.father, chart.chart, local, keyed) : null;
    const node = ensureNode(parent, p.name, chart.chart, Boolean(p.uncertain));
    if (p.uncertain) node.uncertain = true;
    remember(node, p.key);
  }

  // Branch tagging: the chart's deepest "title" person is the branch elder; tag
  // that subtree with the branch slug (first chart wins).
  const branch = BRANCH_BY_CHART[chart.chart];
  if (branch) {
    // elder = the node from this chart with the most descendants at the shallowest depth
    const chartNodes = [...byPath.values()].filter((n) => n.charts.includes(chart.chart));
    const elder = chartNodes
      .filter((n) => n.generation >= 3)
      .sort((a, b) => a.generation - b.generation || b.children.length - a.children.length)[0];
    if (elder) {
      const stack = [elder];
      while (stack.length) {
        const n = stack.pop()!;
        if (!n.branchSlug) n.branchSlug = branch.slug;
        stack.push(...n.children);
      }
    }
  }
}

const all = [...byPath.values()].sort((a, b) => a.generation - b.generation || a.name.localeCompare(b.name, "ar"));

// ---------- canonical.json ----------
const canonical = {
  generated_from: "12 official A0 charts (ilovepdf_merged.pdf)",
  people: all.map((n) => ({
    id: n.id,
    name_ar: n.name,
    display_name_ar: n.path.slice().reverse().join(" بن "),
    father_id: n.parent?.id ?? null,
    generation: n.generation,
    branch_slug: n.branchSlug,
    charts: n.charts,
    uncertain: n.uncertain || undefined,
  })),
  branches: Object.entries(BRANCH_BY_CHART).map(([chart, b]) => ({
    ...b,
    chart: Number(chart),
    title_ar: charts.find((c) => c.chart === Number(chart))!.title_ar,
  })),
  flags: charts.flatMap((c) => c.flags.map((f) => `المشجرة ${c.chart}: ${f}`)).slice(),
  resolution_notes: [...new Set(warnings)],
};
writeFileSync(join(process.cwd(), "src/content/tree/canonical.json"), JSON.stringify(canonical, null, 2) + "\n");

// ---------- public/family-tree-data.js ----------
function toD3(n: Node): any {
  const o: any = { name: n.name, id: n.id };
  const full = n.path.slice().reverse().join(" بن ");
  o.title = full;
  if (n.branchSlug && n.generation <= 3) o.isBranch = true;
  if (n.generation <= 2) o.isRoot = true;
  if (n.children.length) o.children = n.children.map(toD3);
  return o;
}
const treeRoot = root.length === 1 ? toD3(root[0]) : { name: "آل بوعبيد", isRoot: true, children: root.map(toD3) };
writeFileSync(
  join(process.cwd(), "public/family-tree-data.js"),
  `/**
 * شجرة أسرة آل بوعبيد — من العبادل من بني تميم
 * ملف مُولَّد آليًا من المشجرات الرسمية الاثنتي عشرة (لا يُحرَّر يدويًا).
 * المصدر: src/content/tree/charts/*.json  —  المُولِّد: scripts/build-family-tree.ts
 * إجمالي الأسماء: ${all.length}
 */
window.AL_BU_OBAID_TREE = ${JSON.stringify(treeRoot, null, 2)};
`,
);

// ---------- seed SQL ----------
const esc = (s: string | null) => (s === null ? "NULL" : `'${s.replace(/'/g, "''")}'`);
const lines: string[] = [];
lines.push("-- Generated by scripts/build-family-tree.ts — do not edit by hand.");
canonical.branches.forEach((b, i) => {
  const first = b.elder_ar.split(" بن ")[0];
  lines.push(
    `INSERT INTO public.branches (slug, name_ar, elder_ar, description_ar, is_published, sort_order) VALUES (${esc(b.slug)}, ${esc("آل " + first)}, ${esc(b.elder_ar)}, ${esc(b.title_ar)}, true, ${i + 1}) ON CONFLICT (slug) DO UPDATE SET elder_ar = EXCLUDED.elder_ar, description_ar = EXCLUDED.description_ar, sort_order = EXCLUDED.sort_order, is_published = true;`,
  );
});
lines.push(
  "CREATE TEMP TABLE tmp_tree (id uuid, nm text, father uuid, gen int, ord int, branch text) ON COMMIT DROP;",
);
const rows = all.map(
  (n, i) =>
    `(${esc(n.id)}::uuid,${esc(n.name)},${n.parent ? `${esc(n.parent.id)}::uuid` : "NULL"},${n.generation},${i + 1},${esc(n.branchSlug)})`,
);
for (let i = 0; i < rows.length; i += 100) {
  lines.push(`INSERT INTO tmp_tree VALUES\n${rows.slice(i, i + 100).join(",\n")};`);
}
lines.push("DELETE FROM public.family_relationships;");
lines.push("DELETE FROM public.family_member_privacy;");
lines.push("DELETE FROM public.family_members;");
lines.push(`WITH RECURSIVE chain AS (
  SELECT id, nm::text AS disp FROM tmp_tree WHERE father IS NULL
  UNION ALL
  SELECT t.id, t.nm || ' بن ' || c.disp FROM tmp_tree t JOIN chain c ON t.father = c.id
)
INSERT INTO public.family_members (id, first_name_ar, last_name_ar, display_name_ar, slug, gender, is_living, generation, sort_order, visibility, status, branch_id)
SELECT t.id, t.nm, 'آل بوعبيد', ch.disp || ' آل بوعبيد', 'm-' || left(t.id::text, 8), 'male', true, t.gen, t.ord, 'public', 'published', b.id
FROM tmp_tree t JOIN chain ch ON ch.id = t.id LEFT JOIN public.branches b ON b.slug = t.branch;`);
lines.push(`INSERT INTO public.family_relationships (person_id, related_person_id, relationship_type)
SELECT father, id, 'parent'::relationship_type FROM tmp_tree WHERE father IS NOT NULL
UNION ALL
SELECT id, father, 'child'::relationship_type FROM tmp_tree WHERE father IS NOT NULL;`);
writeFileSync(join(process.cwd(), "scripts/seed-family-tree.sql"), lines.join("\n") + "\n");

console.log(`people: ${all.length}, roots: ${root.length}, max generation: ${Math.max(...all.map((n) => n.generation))}`);
console.log(`branch-tagged: ${all.filter((n) => n.branchSlug).length}`);
console.log(`flags: ${canonical.flags.length}`);
warnings.slice(0, 10).forEach((w) => console.log("WARN " + w));
