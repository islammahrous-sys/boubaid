# Rebuild the Roll of Honor

## Scope

- Keep all Projects and initiatives functionality unchanged.
- Replace only the existing Roll of Honor at `/achievers` and its admin-managed data.

## Public page

- Rebuild the page around exactly two sections:
  1. `كفاءات افراد الاسرة` / `Family Members’ Competencies`, visible with a clean empty state and zero records.
  2. `جائزة التميز` / `Excellence Award`, grouped explicitly by Hijri year.
- Show the supplied 22 recipients in the authoritative order and distribution: 1444ه (7), 1445ه (5), 1446 (4), 1447ه (6).
- Use the existing page header, colors, typography, spacing, nomination workflow, and responsive design.
- Present four ordered columns on wide screens in the source’s RTL order, and readable stacked year groups on smaller screens.
- Mirror the same names, years, order, and achievement meaning in professional English.

## Data and CMS

- Extend the existing `achievers` table rather than creating a parallel content system:
  - record section/type: family competency or excellence award
  - explicit Hijri award year
- Preserve existing permissions, audit logging, publishing controls, and nomination workflow.
- Replace obsolete database rows with the authoritative 22 award records and leave competency records empty.
- Update the existing Roll of Honor manager so editors can choose the section and year, add future years, and edit bilingual names and achievements.
- Remove the old static achiever fallback so deleted or outdated records cannot reappear if the database is unavailable.

## Consistency cleanup

- Update the public loader and shared record types to use the explicit section/year fields.
- Remove obsolete category/filter/table presentation code tied to the previous Roll of Honor structure.
- Keep navigation, Requests Hub links, global search, homepage links, dashboard counts, and the `/achievers` route working against the single new implementation.
- Do not remove or modify Projects routes, records, navigation, CMS tools, or database structures.

## Validation

- Verify the database contains exactly 22 published excellence-award records and zero family-competency records.
- Verify each year count, name, achievement, and ordering against the supplied mapping.
- Test Arabic RTL and English LTR on desktop, tablet, and mobile with no overlap or horizontal scrolling.
- Test direct navigation, refresh, desktop/mobile menus, nomination flow entry, and authenticated admin editing where an authenticated session is available.
- Run a final project-wide search to confirm no obsolete static Roll of Honor data or duplicate implementation remains.
