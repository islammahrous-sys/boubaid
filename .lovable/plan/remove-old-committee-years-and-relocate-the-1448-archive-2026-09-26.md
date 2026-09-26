# Remove old committee years and relocate the 1448 archive

## Changes
- Remove the 1445 AH and 1444 AH sections from the Committees page, including their section-navigation entries and archived links.
- Keep the 1448 AH planned-activities area on the Committees page unchanged.
- Remove the 1448 AH committee archive area from the Committees page.
- Add that same CMS-driven 1448 AH committee archive grid to the Archive page, immediately after the “الأرشيف التراثي المصور / Heritage Photo Archive” page heading and before the existing archive tabs.
- Preserve the six committee names, bilingual labels, CMS reference convention, files, View/Download behavior, and existing archive content.

## Verification
- Check Arabic and English Committees and Archive pages on desktop and mobile.
- Confirm 1445/1444 are absent, 1448 planned activities remain, and the moved archive grid appears only on the Archive page without horizontal overflow.

## Technical details
- Reuse `committee_charts` records beginning with `COMM-1448-ARCH-<committee-id>` from the existing Library data load.
- Keep file rendering type-aware: images/PDFs open in the viewer and other files download in their original format.