/**
 * Applies src/content/tree/canonical.json (generated from the 12 official charts)
 * to Supabase: branches, family_members, family_relationships.
 *
 * Run: SUPABASE_SERVICE_ROLE_KEY=... bun scripts/apply-family-tree.ts
 * The equivalent pure-SQL version lives in scripts/seed-family-tree.sql.
 */
import { createClient } from "@supabase/supabase-js";
import canonical from "../src/content/tree/canonical.json";

const url = process.env.SUPABASE_URL || "https://ywsvittlswbbyqhahorh.supabase.co";
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!key) {
  console.error("Missing SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}
const db = createClient(url, key, { auth: { persistSession: false } });

const chunk = <T>(arr: T[], n: number) =>
  Array.from({ length: Math.ceil(arr.length / n) }, (_, i) => arr.slice(i * n, i * n + n));

async function main() {
  // 1. branches
  for (const [i, b] of canonical.branches.entries()) {
    const { error } = await db.from("branches").upsert(
      {
        slug: b.slug,
        name_ar: "آل " + b.elder_ar.split(" بن ")[0],
        elder_ar: b.elder_ar,
        description_ar: b.title_ar,
        is_published: true,
        sort_order: i + 1,
      },
      { onConflict: "slug" },
    );
    if (error) throw error;
  }
  const { data: branchRows, error: bErr } = await db.from("branches").select("id, slug");
  if (bErr) throw bErr;
  const branchId = new Map((branchRows ?? []).map((r) => [r.slug, r.id]));

  // 2. wipe the old, unsourced rows
  for (const table of ["family_relationships", "family_member_privacy", "family_members"] as const) {
    const { error } = await db.from(table).delete().not("id", "is", null);
    if (error && table !== "family_member_privacy") throw error;
  }

  // 3. members
  const members = canonical.people.map((p, i) => ({
    id: p.id,
    first_name_ar: p.name_ar,
    last_name_ar: "آل بوعبيد",
    display_name_ar: `${p.display_name_ar} آل بوعبيد`,
    slug: "m-" + p.id.slice(0, 8),
    gender: "male" as const,
    is_living: true,
    generation: p.generation,
    sort_order: i + 1,
    visibility: "public" as const,
    status: "published" as const,
    branch_id: p.branch_slug ? (branchId.get(p.branch_slug) ?? null) : null,
  }));
  for (const part of chunk(members, 200)) {
    const { error } = await db.from("family_members").insert(part);
    if (error) throw error;
  }

  // 4. relationships (both directions, as the console expects)
  const rels = canonical.people
    .filter((p) => p.father_id)
    .flatMap((p) => [
      { person_id: p.father_id!, related_person_id: p.id, relationship_type: "parent" as const },
      { person_id: p.id, related_person_id: p.father_id!, relationship_type: "child" as const },
    ]);
  for (const part of chunk(rels, 400)) {
    const { error } = await db.from("family_relationships").insert(part);
    if (error) throw error;
  }

  const counts = await Promise.all(
    ["family_members", "family_relationships", "branches"].map(async (t) => {
      const { count } = await db.from(t).select("*", { count: "exact", head: true });
      return `${t}: ${count}`;
    }),
  );
  console.log("applied ->", counts.join(", "));
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
