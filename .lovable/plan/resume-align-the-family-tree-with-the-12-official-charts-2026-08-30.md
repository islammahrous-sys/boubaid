# Resume: align the family tree with the 12 official charts

## Where things stand (verified now)

- The 12-chart PDF is still available in the uploads (`ilovepdf_merged.pdf`), along with the extracted names spreadsheet.
- The earlier transcription files lived in a temporary folder and are **gone** — charts 1-4 must be re-read. Nothing was ever written into the project, so no code or database change has happened yet.
- Database is still unseeded for this work: `family_members` = 22 rows, `family_relationships` = 0 rows, `branches` = 7 rows.
- The public tree still has three unreconciled sources: the static `public/family-tree-data.js`, the hardcoded `src/content/family-tree.ts` seed, and the database via `getPublicFamilyTreeData()`.

## Plan

### 1. Re-transcribe the charts, this time into the repo

Render all 12 A0 pages at high resolution and read every node and connector visually (the PDF has no extractable text). Write the result to a committed file under `src/content/tree/` — one record per person with father link, generation, and source chart — so the work can never be lost to a temp folder again. Cross-check against the family spreadsheet; the official chart wins every conflict. Produce a short report: names per chart, total unique people, and every illegible or suspect label flagged rather than guessed (e.g. the two labels already flagged: `فزر`, `عبدالعرير`).

### 2. Seed the database as the single source of truth

SQL migrations with literal INSERTs:

- `branches` rebuilt from the chart titles exactly, sub-charts nested under their parent branch.
- `family_members` seeded from the transcription (Arabic name parts, slug, generation, sort order, branch, public visibility), replacing the 22 stray rows.
- `family_relationships` seeded with a real parent/child edge for every link on the charts.
  Includes the required GRANTs; existing RLS and `family_member_privacy` behaviour preserved.

### 3. Serve the public tree from the database

- `getPublicFamilyTreeData()` becomes the only source for both the interactive chart and the name list.
- Retire the hardcoded `src/content/family-tree.ts` seed (folding in the bilingual English names/bios the charts don't carry).
- `public/family-tree-data.js` becomes a generated artefact from the database; the invented grouping nodes (`عند الجذع مباشرة`, `مجموعة ١/٢`) are deleted.
- Keep the existing mobile UX untouched: vertical layout, pinch-zoom, search into collapsed branches, lineage bottom sheet.

### 4. Console round-trip check

Verify creating a person, assigning a father, moving a branch, and archiving all round-trip through `FamilyMembersTable`, `FamilyMemberFormDialog`, `FamilyRelationshipsManager`, `FamilyBranchesManager`, and `FamilyTreeViewer` and show up on the public tree. Fix branch-slug mismatches so `branchPortraits` and `/branches` keep resolving.

### 5. Publish the charts

Add the 12 charts as viewable/downloadable official documents on the family-tree page, each labelled with its own title and carrying the sheets' "for audit, not final" notice.

### 6. Verify

Re-check the tree on desktop and mobile in the preview, run the database linter over the new policies, and report node counts per branch against the charts.

## Technical notes

- Transcription is manual-accuracy work across 12 very large sheets; it is the bulk of the effort and will take several passes.
- Chart page images go to `public/images/tree-charts/`; the PDF is registered as a library/document item.
- Public reads stay on the publishable-key server client; private members remain hidden by RLS.
