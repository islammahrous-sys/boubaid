# Temporary Vercel Auth Setup

Until the production domain is purchased and connected, treat this as the live site URL:

```text
https://alboabid-heritage-hub.vercel.app
```

## Supabase Auth

In Supabase Dashboard > Authentication > URL Configuration:

- Site URL: `https://alboabid-heritage-hub.vercel.app`
- Redirect URLs:
  - `https://alboabid-heritage-hub.vercel.app/auth`
  - `https://alboabid-heritage-hub.vercel.app/account`
  - `http://localhost:5173/**`

When the real website domain is connected later, add the new production URLs before removing the Vercel URL.

## Vercel Environment Variables

Set these for Production. Set the same public values for Preview if preview deployments need auth testing.

```text
SUPABASE_URL
SUPABASE_PUBLISHABLE_KEY
SUPABASE_SERVICE_ROLE_KEY
VITE_SUPABASE_URL
VITE_SUPABASE_PUBLISHABLE_KEY
VITE_SITE_URL=https://alboabid-heritage-hub.vercel.app
SITE_URL=https://alboabid-heritage-hub.vercel.app
LOVABLE_API_KEY
GOOGLE_MAPS_API_KEY
```

`LOVABLE_API_KEY` and `GOOGLE_MAPS_API_KEY` are required for the homepage
Al Ahsa weather card (Google Weather via the Lovable connector gateway).
Without them, `/api/public/site-visit` returns `weather: null` and the card
shows the friendly "weather unavailable" state. Copy both values from the
Lovable project secrets into Vercel Production (and Preview), then redeploy.

Never prefix the service role key with `VITE_`; it must stay server-only.

## Approval Flow

1. New user signs up with Supabase Auth.
2. Supabase email confirmation redirects to `/auth` on the Vercel domain.
3. User completes profile details and submits membership verification from `/account`.
4. Admin reviews the request from the admin console.
5. Approval atomically updates the request and grants the `member` role.
6. The member account refreshes automatically and unlocks the digital ID and member-only services.

The app now creates in-app notifications for admins and applicants. External admin email notifications are not enabled yet because no email delivery provider or sender identity is configured in this project.
