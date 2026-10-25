# Privacy, Consent & Access — Operations Guide

For the council secretariat and whoever maintains www.boubaid.com.
Last updated: 25 October 2026 · Terms/Privacy version in force: **1.0** (`src/content/legal.ts`).

> **Before declaring the project complete:** the Terms of Use and the Privacy Policy
> (`/terms`, `/privacy`) must be reviewed by a qualified Saudi lawyer. The privacy
> policy promises that requests are handled as soon as reasonably possible —
> this guide is how the secretariat does that.

---

## 1. Where things are

| What | Where |
|---|---|
| Privacy Policy & Terms of Use | `/terms` — footer of every page |
| Privacy Policy and Personal Data Protection | `/privacy` — footer of every page |
| Membership requests (approve / reject) | Console → **Registration → Membership requests** |
| Who sees which page; council & committee chairs | Console → **Registration → Page access** |
| Consent evidence (CSV export) | Console → **Registration → Consent records** |
| Report-content and data requests (arrive as messages) | Console → **Community → Inbox**, subjects “Report content” / “Personal data request” |
| A member's own agreements & optional consents | `/account` → Security tab → “My agreements & consents” |

## 2. Required server setting

Production (Vercel → Settings → Environment Variables) **must** have
`SUPABASE_SERVICE_ROLE_KEY` set (Supabase → Project Settings → API → service_role).
Without it, new registrations and approvals fail. Never put it in client code,
chat or email; never prefix it with `VITE_`.

## 3. Existing members and consent

Accounts created before 24 October 2026 have **no consent on record**.

- When such a member opens `/account` → Security, the “My agreements” card shows
  *“No acceptance of the current terms is on record”* with a button to accept
  version 1.0. Accepting records version, date/time, IP and browser.
- The console's Membership requests list marks each applicant with
  **“Terms v1.0”** or **“No terms acceptance on record”**.
- Recommended: send existing members one message (WhatsApp channel / email)
  asking them to sign in and accept the updated terms. Re-check monthly in
  Consent records; nothing is blocked while they have not accepted.
- **When the documents change:** edit `src/content/legal.ts`, bump
  `LEGAL_VERSION` and the effective date. Every member is then shown the
  “newer version — please accept” prompt automatically; their old acceptance
  stays in the evidence log.

## 4. Privacy requests (access, correction, deletion, withdrawing consent)

Requests arrive in **Inbox** with subject “Personal data request”, or by the
official email. Reply as soon as reasonably possible (no fixed deadline —
this is a family council, not a company).

1. **Log it.** Note the date received; mark the message *in progress*.
2. **Verify identity.** Reply only to the email address on the account, or
   ask the requester to send the request from inside their signed-in account
   (Contact page while signed in). Never send data to a different address.
3. **Act:**
   - *Access / copy:* export their profile (Console → Users), their membership
     request(s), and their consent records (Consent records → search email →
     CSV). Send as one attachment to the account email.
   - *Correction:* edit in Console → Users, or ask them to edit `/account`.
   - *Withdraw newsletter / photo consent:* they can do it themselves in
     `/account`; or record it for them via an Inbox reply and switch it off.
   - *Deletion:* see section 5.
4. **Close.** Reply with what was done; mark the message resolved. Keep the
   message thread as evidence.

## 5. Account deletion

Done by an administrator in the Supabase dashboard (until a console button exists):

1. **First** delete their membership request(s) — these are NOT removed
   automatically (the database only blanks the account link and keeps name,
   email and phone). Supabase → SQL editor:
   `DELETE FROM public.membership_requests WHERE lower(email) = lower('<their email>');`
2. Supabase → Authentication → Users → find the email → **Delete user**.
   The login, profile, roles and in-app notifications are removed by the
   database's cascade rules.
3. Remove any photos they uploaded that are not needed for a legal reason
   (Console → Media / Archive). Contact messages and Requests Hub inquiries
   they sent are also kept by default — delete those in Console → Inbox.
4. **Keep** the consent-evidence rows (`audit_logs`, entity `legal_consent`) and
   any financial/contribution records for the statutory period — the policy
   says so; they are not visible publicly.
5. Unsubscribe the email from the newsletter (Console → newsletter list, or
   `newsletter_subscribers.is_active = false`).
6. Reply to confirm deletion.

## 6. Reported content (copyright, privacy, images without permission)

1. Report arrives in Inbox (“Report content”).
2. Same day: if the issue is clear (identifiable person/minor without consent,
   personal data, obvious copyright), **unpublish** the item as a precaution.
3. Review within 7 days; contact the uploader if needed; decide keep / remove.
4. If removed or made private: update it in the console, then request removal
   from Google (Search Console → Removals) and wait for the noindex to apply.
5. Reply to the reporter with the outcome.

## 7. Page access (council decision)

| Page | Who |
|---|---|
| Home, History & Roots, Requests Hub, Media Center, Award, Services, Committees, Family Tree, Al-Ahsa Councils | Public |
| Archive (`/library`), Family Development Fund (`/fund`, `/fund-financials`, `/fund-certificates`) | Approved family members |
| Visual Identity (`/templates`) | Admins + council chair and committee chairs listed in Registration → Page access |

Enforced in three layers: the page (access screen), the website's data
functions (refuse non-members), and the database policies
(`supabase/migrations/20261025120000_members_only_archive_and_fund.sql`). Restricted
pages send `X-Robots-Tag: noindex` and are not in the sitemap.

## 8. Database access policies (applied 25 October 2026)

The migration below was dry-run on the live database inside a transaction,
verified and rolled back, then applied with the owner's approval on 25 October
2026. Keep these steps for future policy changes, or to roll back.

1. Read `supabase/migrations/20261025120000_members_only_archive_and_fund.sql` in full.
2. Supabase → SQL editor: run the **pre-flight** queries (section 0) and save the output.
3. Run the migration body (BEGIN … COMMIT).
4. Run the **verification** queries (section 7) — anonymous sees only committee
   rows; members see archive/fund; leaders see visual identity.
5. Browse `/committees` signed out (must still show documents) and `/library`
   signed in as a member (must show the archive).
6. If anything is wrong: run the **rollback** (section 8). It restores the previous behaviour exactly.
7. Move the file into `supabase/migrations/` so the history matches the database.

**Still open:** files in *public* storage buckets remain downloadable by anyone
who has the exact file URL. Fix = private bucket + signed URLs (separate task).

## 9. Testing registration end to end

With the service-role key in the local `.env` only:

```
node scripts/qa-registration-e2e.mjs https://www.boubaid.com
```

It creates a temporary admin and two disposable applicants (random passwords
kept in memory), approves one and rejects one with a reason in the real
Registration desk, verifies roles, notifications, emails and member page access,
then deletes everything. Results are written to `qa-e2e-<stamp>-results.json`.
