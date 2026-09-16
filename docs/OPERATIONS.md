# Operations

This document covers three things that were previously undocumented: how to
turn on crash monitoring and analytics once real keys exist, how to back up
and restore the Supabase project, and which deployment target this app is
actually configured for.

## 1. Crash monitoring and analytics

Both are opt-in via environment variables. With neither var set, the app's
behavior is unchanged from before this document existed.

### Crash monitoring (external error monitor)

- Code: `src/lib/external-error-reporter.ts`, wired into
  `src/lib/error-capture.ts` (server-side SSR errors) and
  `src/lib/lovable-error-reporting.ts` (client-side React error boundary).
- Env var: `VITE_SENTRY_DSN` (see `.env.example`).
- When unset: reporting is a no-op. Errors are still logged to the console /
  server logs exactly as before (this was already working and is unrelated
  to this var).
- When set: the app does a best-effort `fetch` POST of a minimal event to
  Sentry's classic per-project store endpoint, derived from the DSN. This is
  **not** the official `@sentry/*` SDK — there's no breadcrumb trail, replay,
  release tracking, batching, or retry logic. It exists so errors aren't
  silently dropped once you have a real DSN, without pulling in an unreviewed
  dependency. If you later want full Sentry SDK features, install `@sentry/*`
  properly (with source maps, tracing config, etc.) as its own reviewed change
  and replace this scaffold's call sites.
- To configure: create a project in Sentry (or a compatible self-hosted
  instance), copy its DSN, set `VITE_SENTRY_DSN` in your deployment
  environment (Cloudflare Pages / Vercel project settings — see §3), redeploy.

### Analytics (GA4)

- Code: `src/routes/__root.tsx`, `gaMeasurementId` / `gaInitScript`.
- Env var: `VITE_GA_MEASUREMENT_ID` (see `.env.example`).
- When unset: no `<script>` tag is injected at all — no network request to
  Google, no cookie, nothing.
- When set: `gtag.js` is loaded from Google's CDN and initialized with that
  measurement ID in the document `<head>`.
- To configure: create a GA4 property, copy its Measurement ID
  (`G-XXXXXXXXXX`), set `VITE_GA_MEASUREMENT_ID` in your deployment
  environment, redeploy. Consider whether a cookie-consent banner is required
  for your audience before enabling this in production — none exists in this
  codebase today.

## 2. Supabase backup and restore

Project ref: `ywsvittlswbbyqhahorh`.

### Built-in backups (no setup required)

Supabase automatically backs up every project:

- **Paid plans (Pro and above):** daily backups, retained per your plan's
  window, plus **Point-in-Time Recovery (PITR)** if enabled, which lets you
  restore to any point within the retention window (not just daily
  snapshots).
- **Free plan:** backups are not guaranteed/available the same way — do not
  rely on the dashboard alone if this project is on the Free tier.

To restore from the dashboard: **Supabase Dashboard → Project → Database →
Backups**, pick a backup or a PITR timestamp, and follow the restore flow.
Restoring is a destructive, project-wide operation — it replaces the current
database state. Always confirm the target project and timestamp before
proceeding, and note that a restore takes the project offline briefly.

This built-in mechanism is sufficient for disaster recovery in most cases,
but it is dashboard-only (no self-service export you control) and tied to
Supabase's retention window. The manual dump below is a supplement for
off-platform, long-term, or pre-migration backups.

### Manual dump (external, schedulable)

Run this from a machine with the Supabase CLI or `pg_dump` installed and
network access to the project's connection string (found in **Dashboard →
Project Settings → Database → Connection string**; use the pooler connection
for external tools, and never commit the password).

Using the Supabase CLI (recommended — handles auth via the CLI's own login):

```sh
supabase link --project-ref ywsvittlswbbyqhahorh
supabase db dump --file "backup-$(date +%Y%m%d-%H%M%S).sql"
```

Using `pg_dump` directly against the connection string:

```sh
pg_dump "postgresql://postgres:<password>@<pooler-host>:5432/postgres" \
  --no-owner --no-privileges \
  --file "backup-$(date +%Y%m%d-%H%M%S).sql"
```

To restore a manual dump into a (new or emptied) Postgres database:

```sh
psql "postgresql://postgres:<password>@<host>:5432/postgres" \
  --file "backup-YYYYMMDD-HHMMSS.sql"
```

**Scheduling:** this repo has no built-in job runner for this. Run the dump
command above on a schedule using whatever's available to you — a cron job /
Windows Task Scheduler entry on a machine you control, or a scheduled GitHub
Actions workflow that runs `supabase db dump` and uploads the artifact to
storage you control (e.g. S3, a private bucket). Store dumps somewhere
encrypted at rest and separate from the Supabase project itself; a dump
contains full data, so treat it like the production database.

## 3. Deployment target: Vercel

The application is deployed on **Vercel** (`https://alboabid-heritage-hub.vercel.app`).

### Build Configuration (`vercel.json`)

The build is configured in `vercel.json`:

```json
{
  "framework": null,
  "buildCommand": "NITRO_PRESET=vercel npm run build"
}
```

Nitro compiles the TanStack Start application to `.vercel/output`, ready for Vercel Serverless & Static delivery.

### Environment Variables on Vercel

Set these in **Vercel Dashboard → Project Settings → Environment Variables**:

- `SUPABASE_URL`
- `SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_SERVICE_ROLE_KEY` (Server only - sensitive)
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `VITE_SITE_URL` (e.g., `https://alboabid-heritage-hub.vercel.app` or custom domain)
- `SITE_URL` (e.g., `https://alboabid-heritage-hub.vercel.app` or custom domain)
- (Optional) `VITE_TURNSTILE_SITE_KEY` & `TURNSTILE_SECRET_KEY`
- (Optional) `VITE_SENTRY_DSN`
- (Optional) `VITE_GA_MEASUREMENT_ID`
