# Fix and enhance the family membership card

## Outcome

The family card will use the **Official Heritage** identity and every output will be reliable and limited to **one landscape page containing the front and back together**.

## Changes

1. **Fix PNG saving**
   - Replace the current two-download behaviour with one combined high-resolution PNG.
   - Place the front and back side-by-side on a clean landscape sheet so mobile and desktop browsers only need to approve one download.
   - Preserve the member photo, bilingual names, branch, member number, QR verification, issue date, and official licence number.

2. **Fix printing**
   - Stop printing the whole account page, which currently causes the three-page result.
   - Build a dedicated print sheet containing only the front and back card faces.
   - Force landscape orientation, exact colours, fixed card proportions, and a single printed page.

3. **Align PDF output**
   - Change the PDF from two separate pages to one landscape page with both faces side-by-side.
   - Keep each card face at the official ID-1 proportion and suitable print resolution.

4. **Official Heritage redesign**
   - Use the approved brand palette: cream base, deep brown text and framing, restrained gold seal/details, and heritage-green verification accents.
   - Replace the heavy dark gradient and dotted effect with a more formal certificate-like composition.
   - Use the official calligraphic mark as the primary identity signal, improve hierarchy and spacing, and keep Arabic/English names legible.
   - Give the QR code a clear verification area and keep the membership status visually distinct without overpowering the card.
   - Apply the same composition to the on-screen card and exported files so members see what they receive.

5. **Verification**
   - Test PNG, PDF, and Print from an approved signed-in member account.
   - Confirm each produces exactly one file or one page, both faces are visible, the QR remains scannable, Arabic and English text fit, and the result works at desktop and phone widths.
   - Check the preview build and browser console for errors.

## Technical notes

- Keep generation browser-side; no new member data or database changes are needed.
- Use one shared card renderer for PNG, PDF, and print to prevent visual differences between formats.
- Use a single user-triggered download for PNG to avoid browser blocking of the second automatic download.
