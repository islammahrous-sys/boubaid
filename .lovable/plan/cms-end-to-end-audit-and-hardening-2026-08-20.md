# CMS end-to-end audit and hardening

I audited the content console (`/content`), the server functions behind it, the public pages that consume it, and the database (grants, unique constraints, row counts). The plumbing is sound: editor/admin permissions, drafts vs published, create/edit/publish/delete, and public reads all work, and the tables are correctly granted and RLS-protected. What is not fine is the last mile — images, files, and two sections that the console can edit but the site never reads.

## What is confirmed working

- Access control: only admin/editor see the console; other signed-in users get the "no permission" screen.
- Create, edit, publish/unpublish, delete for all five sections; slug collisions are caught (unique constraints exist on news, initiatives, branches) and shown as a friendly message.
- Public pages for news, news detail, initiatives, initiative detail, achievers and library read published rows and merge them ahead of the built-in static content.
- Anon SELECT is granted on all five content tables, so public reads work without a session.
- All five content tables are currently empty, so today the site shows only static content.

## Gaps to fix

1. **No way to attach an image or file.** Cover image, achiever photo and library file are plain text path fields, and the only storage bucket is the private receipts one. An editor has nothing valid to type. Fix: add a public `content` media bucket, and replace those fields with an upload control that stores the file and saves its URL.
2. **Cover images are ignored on the public side.** News list and news detail always use the built-in image chosen by slug, so a CMS article never shows its own cover. Fix: prefer the row's cover image and fall back to the built-in one.
3. **Achiever and library links can break.** The achiever photo is rendered as-is and the library document link is used as-is, so a storage path renders a broken image or a dead link. Fix: resolve stored paths to real URLs in the adapter, with a fallback.
4. **Branches are editable but never shown.** The console has a Branches tab and a published-branches reader exists, but the branches page is entirely static and never calls it. Fix: merge published branch rows into the branches page like the other sections.
5. **Home page never shows new content.** The homepage news and initiatives strips read static content only. Fix: load published rows in the homepage loader and merge them.
6. **Library mapping is lossy.** One "kind" field is reused as photo category and as video duration, and descriptions are dropped, so publications and media entries come out thin. Fix: map dedicated fields per collection and surface the description.
7. **No draft preview.** Editors can only see a draft inside the console. Fix: after saving, link the row to its public page (published) or state clearly that a draft is hidden until published.
8. **Only deletes are audited.** Create, edit and publish toggles write no audit row. Fix: log those too.

## Verification after the fixes

Sign in as the demo admin and, for each of the five sections, create an item with an uploaded image/file, publish it, confirm it appears on its public page and on the homepage where relevant, edit it, unpublish it and confirm it disappears from public view, then delete it. Also confirm a duplicate slug is rejected with the friendly message and that a member-only account still cannot reach the console.

## Technical notes

- New public storage bucket for content media, with insert/update restricted to admin/editor and public read.
- Upload happens from the browser through the existing Supabase client; the console stores the resulting object path, and `src/content/cms-adapt.ts` converts path to public URL at read time.
- `getPublishedBranches` is already implemented in `src/lib/cms.functions.ts`; only the branches route and a `mergeBranches` helper are missing.
- Homepage becomes a loader-backed route calling the existing published-news and published-initiatives readers (both are public, so SSR/prerender is safe).
- Audit entries reuse the existing `audit_log` write path in `deleteCmsRow`.
