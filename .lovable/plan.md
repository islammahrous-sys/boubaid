# Align the family tree with the 12 official charts (website + database)

The upload is 12 official A0 charts, each titled `مشجرة أبناء … آل بوعبيد` and each rooted on عبدالله ← أحمد, with the آل بوعبيد lineage note (بني تميم / العبادل) repeated on every sheet and the note that they are audit drafts, not final drawings.

## What the audit already found

- The public interactive tree is served from the static file `public/family-tree-data.js` (2,368 lines) rendered inside `public/interactive-tree.html`, embedded as an iframe by `src/routes/family-tree.tsx`.
- That static data is **not real parentage**. Its own header says the wall chart "does not show fatherhood for every name", so names were bucketed into invented containers such as `عند الجذع مباشرة (جيل مبكر)` and `مجموعة ١` / `مجموعة ٢`. Those groups do not exist in the family and must go.
- There are three unreconciled sources today: the static D3 file, a hardcoded seed array `src/content/family-tree.ts` (`familyMembersData`), and the database. The `/family-tree` page merges the seed array with `getPublicFamilyTreeData()` rows (dedup by id, DB never overrides the seed), while the embedded D3 chart reads only the static file — so a member added in the console appears in the text list but never in the chart.
- Its trunk is `محمد ← عبدالله ← أحمد / صالح`. The 12 charts all read upward as `عبدالله ← أحمد ← …`, so the trunk labelling has to be re-derived from the charts.
- The database is nearly empty and disconnected: `family_members` has 22 rows, `family_relationships` has **0** rows, so nothing in the console can reproduce the tree. `branches` holds 7 rows whose slugs only partly match the chart titles (`al-abdullah-salih`, `al-mohammed-ahmed`, …).
- The chart titles are at two different depths: direct sons of أحمد بن عبدالله (يوسف، سعد، عبداللطيف، عبدالرحمن، …) plus deeper sub-charts (عبدالله / علي / محمد / إبراهيم بن صالح بن عبدالرحمن). Branch structure will follow the charts exactly, so the deeper sheets nest under their parent branch rather than becoming top-level branches.

## Plan

### 1. Transcribe the charts into one canonical dataset
Render each of the 12 A0 pages at high resolution, read every node and connector, and produce a reviewed source file of people with a real `father` link, generation depth, and which chart/page each name came from. Cross-check against the existing 472-name extraction and the spreadsheet already in the project; every conflict is resolved in favour of the official chart. Produce a short transcription report: names per chart, total unique people, and any node that is illegible or ambiguous (flagged, never invented).

### 2. Make the database the source of truth
- Seed `family_members` from the transcription (Arabic name parts, display name, slug, generation, sort order, branch link, public visibility) and seed `family_relationships` with a real `father`/`child` edge for every parent link — replacing the 22 stray rows and the empty relationship table.
- Rebuild `branches` from the chart titles exactly (slug, `name_ar`, `elder_ar`, description, sort order), with the sub-charts recorded as nested branches of their parent.
- All of this ships as SQL migrations with literal `INSERT` statements plus the required `GRANT`s, so the data exists on a fresh deploy.

### 3. Serve the public tree from the database
- Extend the public tree server function so the interactive tree is built from `family_members` + `family_relationships` instead of the hand-written static file.
- `public/family-tree-data.js` becomes a generated artefact (build/script output from the database) so it can never drift again; the invented grouping nodes are removed.
- Keep the current interactive-tree UX intact: mobile vertical layout, pinch-zoom, search into collapsed branches, lineage bottom sheet.

### 4. Fix the console so editors can maintain it
- Verify `FamilyMembersTable`, `FamilyMemberFormDialog`, `FamilyRelationshipsManager`, `FamilyBranchesManager`, and `FamilyTreeViewer` against the seeded data: creating a person, assigning a father, moving a branch, and archiving must all round-trip and appear on the public tree.
- Fix the branch-slug mismatch so `branchPortraits` in `src/content/images.ts` and `/branches` keep resolving.

### 5. Publish the official charts
Add the 12 charts as viewable/downloadable official documents on the family-tree page (high-resolution page images plus the source PDF), labelled with each chart's own title and carrying the sheets' "for audit, not final" notice.

### 6. Verify
Re-check the tree on desktop and mobile in the preview, confirm every seeded branch renders with real parentage, run the database linter over the new tables/policies, and report node counts per branch against the charts.

## Technical notes

- Data: SQL migrations for `branches`, `family_members`, `family_relationships`; grants for `anon` (published/public rows only), `authenticated`, and `service_role`.
- Public read stays through the existing public tree server function with the publishable client; private members remain hidden by RLS.
- Chart page images go to storage or `public/images/tree-charts/`, the PDF is registered as a library/document item.
- Transcription is manual-accuracy work over 12 very large sheets: names that cannot be read with confidence are reported, not guessed.
