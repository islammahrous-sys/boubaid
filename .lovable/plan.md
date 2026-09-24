# Full production audit and fix pass — Al Bu Obaid website

## What the first review already found (checked)

**Security (from the latest security scan)**
1. Any signed-in family member can read the whole `permissions` and `role_permissions` lists (flagged as errors). These should be visible to admins only.
2. The `content` file storage lets anyone download every file in it (flagged as an error). Need to confirm whether everything there is meant to be public; lock down anything private.
3. The event attendee spreadsheet export can be abused: a visitor can type a formula into their name or phone, and it runs when an admin opens the file. Fix: neutralise values that start with = + - @.
4. Public forms (contact, requests, event and initiative registration, newsletter) accept any row with no limits. They are meant to be public, so keep them open, but confirm every one goes through the existing length checks and spam/rate limits.
5. Several public storage folders (media, galleries, avatars, family photos, site media, public documents) let anyone list every file, not just open links. Remove the listing rule and keep direct links working.
6. Leaked-password protection is still off. You have to switch it on in the sign-in settings; it can't be done from code.

**Search engines**
7. `robots.txt` points search engines to `albouabidfamily.com/sitemap.xml`. That is the store's address, not this website's, so it's wrong. Point it at the real public address (or your custom domain once it's connected).
8. The sitemap lists 30 hand-written addresses. Check it against the real pages: remove the ones that only redirect (for example /foundation) and add any that are missing.

**Leftover items in the task list**
9. Several tasks are still marked "in progress": View/Download actions on the live site, splitting Services into family and establishment services, service documents, and a final bilingual desktop/mobile check.
10. The committee-request item was cut off at step "5. Committee request flow…". I'll confirm what it covered.

## Phase 2 — End-to-end walkthrough (to find what isn't known yet)

A scripted walkthrough of every public page, in Arabic and English, on desktop and mobile:
- The page loads without errors or broken images, text stays inside its boxes, and no labels are missing a translation.
- Every link and button leads somewhere real (nothing points to a removed section).
- Every View and Download works (PDF, image, PPTX/DOCX).
- Each type of request form is submitted once and shows up in the admin inbox. Then a check of the admin area: sign-in, content editing, library upload, inbox.
- Each page has a correct title, description, share preview and canonical address.
- Basic accessibility: buttons have names, contrast is readable, there is one main area per page.
- Server logs: no repeating errors after the family-statistics fix.

The results go into a short report file listing each problem as fixed, still open, or waiting on you.

## Phase 3 — Fix
- Fix items 1–5, 7 and 8 above, plus everything Phase 2 finds that is clearly a bug. These are small, targeted changes with no redesign.
- Anything that means a structural change (like merging the two news systems or removing duplicate built-in content) goes on the list as a recommendation. It won't be done without your OK.

## Things only you can do
- Turn on leaked-password protection.
- Connect the custom domain if you want one, and redeploy the Vercel copy after these changes.
- Replace any content I made up as a placeholder (phone numbers, emails, office hours), if Phase 2 finds some.

## Technical details
- Security fixes: migration to restrict SELECT on `permissions` and `role_permissions` to `has_role(auth.uid(),'admin')`. First check that no signed-in user flow reads them through the client. Drop the broad SELECT policies on public storage buckets where the code only uses public URLs. Change `content_public_read` after listing which objects the site reads.
- CSV fix: an `escapeCsvCell` helper in `EventsManager.tsx` that quotes values and prefixes `'` on a leading `=+-@\t\r`. Apply it to every other admin CSV export too.
- Walkthrough: Playwright under /tmp/browser with a minted admin session for the console checks. The report goes to /mnt/documents/production-audit-2026-09-24.md.
- Update `roadmap.md` open items.
