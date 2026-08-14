# Audit: what is still mock or placeholder

I checked the content files, the routes, and the live database. Nothing is faked at the plumbing level — every form, login, review queue and ledger writes to and reads from the real database. What remains is placeholder *data*, plus two integrations that need something only you can supply.

## 1. Demo rows sitting in the live database

These were seeded so the admin guide screenshots wouldn't show empty screens:

- 2 contact messages (fahad.demo@example.com, sara.demo@example.com)
- 2 membership requests
- 2 contributions
- 2 newsletter subscribers
- 2 demo admin profiles/accounts (`admin.demo@…`, `admin.demo2@albuobaid-demo.com`) holding all four roles

Fix: delete the demo messages, requests, contributions and subscribers. Keep or remove the demo admin account — your call; it's the login used in the PDF guide.

## 2. Placeholder contact details (src/content/site.ts)

Clearly invented values that appear across the site:

- Main phone `+966 13 580 0000`, email `contact@albouabidfamily.com`
- WhatsApp / Instagram / YouTube links to `albouabidfamily` handles that may not exist
- Branch contact numbers ending `1111`, `2222`, `3333`, `4444`, `5555` on the branches page
- Loan contributors listed anonymously as "المساهم 1…8"

Fix: replace with the real numbers, addresses and social links once you provide them. The anonymised shareholder labels are probably intentional — confirm.

## 3. Public content lives in code, not the console

News, initiatives, achievers, library items and branches are currently served entirely from the static files in `src/content/`, because those five database tables are empty. The pages merge database rows over the static ones, so the admin console works — but until real rows are entered, the secretariat cannot edit any of the visible content without a developer.

Fix (one of two):
- **Migrate**: move the existing news/initiatives/achievers/library/branches entries into the database as published rows, then trim the static fallback to nothing. Best long-term — the council owns its content.
- **Leave as is**: static content stays the canonical source and the console is used only for new items.

## 4. Real but unverifiable content

The historical narrative, DNA findings (J-Z20773 / J-Z20777 / J-BY37877, sample counts), 2025 financials (land at SAR 1,140,741, SAR 470,000 outstanding, SAR 480,000 gap), licence and national numbers all came from your research documents. They are not invented — but they should get a factual review pass by the secretariat before launch.

## 5. Missing integrations (blocked on you)

- **Email notifications** — no sender domain is connected, so approvals, contribution receipts and contact replies send nothing. Needs a domain you own.
- **Online card / mada payments** — giving is bank transfer plus receipt upload only. Needs merchant onboarding with a Saudi gateway.

## Suggested order

1. Purge the demo rows from the database.
2. Swap in real contact details and social links.
3. Decide on the content migration (option A or B) and execute.
4. Connect a sending domain for email; leave payments until merchant onboarding.

Tell me which of these to act on and I'll do them — steps 1 and 3 I can do immediately; step 2 needs the real values from you.
