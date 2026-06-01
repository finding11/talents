# Finding11 — Soccer talent marketplace

Talents showcase profiles for **free**. Recruiters browse for **free** and pay **per unlock** (€50 default, tiered pricing) to access contact details.

## Stack

- **Next.js 15** (App Router) + TypeScript + Tailwind
- **PostgreSQL** + Prisma
- **NextAuth** (credentials)
- **Stripe Checkout** (test/live guarded)
- **Cloudflare** Pages, Stream, R2, Turnstile (configured via env)
- **next-intl** (English; ready for more locales)

## Quick start (local)

1. Copy `.env.example` to `.env` and set `DATABASE_URL` (Neon/Supabase/local Postgres).
2. Generate `NEXTAUTH_SECRET`: `openssl rand -base64 32`
3. Add Stripe **test** keys (`STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`).
4. Install and migrate:

```bash
npm install
npx prisma db push
npm run db:seed
npm run dev
```

Open http://localhost:3000

### Demo accounts (after seed)

| Email | Password | Role |
|-------|----------|------|
| admin@finding11.com | demo12345 | ADMIN |
| recruiter@finding11.com | demo12345 | RECRUITER |
| talent@finding11.com | demo12345 | TALENT |

## Cloudflare Pages deploy

**Build settings:**

- Framework: Next.js
- Build command: `npm install && npm run build`
- Output: `.next` (or use Cloudflare’s Next.js preset)

**Required environment variables** (Pages → Settings → Environment variables):

| Variable | Notes |
|----------|--------|
| `DATABASE_URL` | Neon/Supabase Postgres connection string |
| `NEXTAUTH_SECRET` | Random secret |
| `NEXTAUTH_URL` | `https://staging.finding11.com` |
| `NEXT_PUBLIC_APP_URL` | Same as above |
| `STRIPEPUBLICKEY` / `STRIPE_SECRET_KEY` | Test keys on staging |
| `STRIPESECRETKEY` / `STRIPE_SECRET_KEY` | Test secret on staging |
| `STRIPEWEBHOOKSECRET` | From Stripe webhook endpoint |
| `TURNSTILESITEKEY` / `TURNSTILESECRETKEY` | Cloudflare Turnstile |
| `SUPPORTEMAIL` | talents@finding11.com |
| `REFUNDDAYS` | 3 |

**Stripe webhook:** `https://staging.finding11.com/api/stripe/webhook`  
Events: `checkout.session.completed`, `charge.refunded`

**Database:** Cloudflare Pages needs an external Postgres (e.g. [Neon](https://neon.tech) free tier). Run `npx prisma db push` against that URL once.

## Features

- Talent profiles with soccer fields, media, privacy controls
- Pay-per-access contact unlock (tiers A/B/C + custom)
- Guardian consent flow for minors
- Recruiter dashboard (unlocks, payments)
- Admin panel (pricing, consents, moderation list)
- 3-day refund window (revokes access grant on refund webhook)
- TEST MODE banner when using Stripe test keys

## Company

**Finding11** · 1611 Seneca Cir, El Dorado Hills, CA 95762 · talents@finding11.com
