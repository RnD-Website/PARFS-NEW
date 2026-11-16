# GASENOS — e-commerce storefront

A complete online store for **GASENOS** (Bangladesh, BDT ৳), built from the Figma design:
catalogue, search, cart, wishlist, checkout (COD, bKash, Nagad, cards via SSLCommerz),
customer accounts, order tracking, and **GASENOS AI**, a shopping assistant grounded in
the live product catalogue.

**Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind CSS 4, PostgreSQL + Prisma 7,
Zustand, React Hook Form + Zod, Radix UI, Hugeicons (the icon family used in Figma),
Anthropic Claude (optional), Playwright.

---

## Quick start (run on your computer)

Requirements: **Node.js 22+** (nodejs.org) and either **Docker Desktop** or a local **PostgreSQL 14+**.

```bash
# 1. Start a local database (skip if you already run PostgreSQL)
docker compose up -d

# 2. Configure
cp .env.example .env
#    then in .env set:
#    DATABASE_URL="postgresql://gasenos:gasenos@localhost:5432/gasenos?schema=public"
#    NEXT_PUBLIC_SITE_URL="http://localhost:3000"
#    AUTH_SECRET="any-long-random-text"

# 3. Install, create tables, load products
npm install
npx prisma migrate deploy
npm run db:seed

# 4. Run
npm run dev
```

Open **http://localhost:3000**. (On Windows PowerShell use `copy .env.example .env`.)

### Useful scripts

| Script | What it does |
|---|---|
| `npm run db:local` | Local PostgreSQL without Docker (PGlite on port 51214, data in `.pglite/`) — keep it running alongside `npm run dev` |
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / server |
| `npm run typecheck` / `npm run lint` | TypeScript / ESLint |
| `npm run db:migrate` | Create a new migration from `prisma/schema.prisma` (dev) |
| `npm run db:deploy` | Apply migrations (production) |
| `npm run db:seed` | Upsert categories & products from `src/data/catalog.ts` |
| `npm run test:e2e` | Playwright end-to-end tests (app must be running; set `E2E_BASE_URL` for another host) |

---

## What's where

```
src/
  app/
    (store)/            storefront pages (header/footer layout)
      page.tsx          homepage (all Figma sections + Newsletter & Perks)
      shop/ deals/ new/ categories/ search/ products/[slug]/
      cart/ wishlist/ assistant/ track-order/
      account/          login, register, password reset, dashboard, orders, addresses, profile
      about/ contact/ faq/ help/ membership/ policies/[slug]/
    (checkout)/         distraction-free checkout, success, payment-failed, test-payment
    api/                route handlers (auth, account, checkout, payments, AI, wishlist, …)
  components/           ui/ layout/ commerce/ catalog/ ai/ checkout/ account/ orders/ sections/home/
  content/              site.ts (brand, nav, contact PLACEHOLDERS, store policy), home.ts, faq.ts, policies.ts
  data/catalog.ts       seed catalogue (products, prices, images) — single source of initial data
  lib/
    commerce/           CommerceProvider interface + Prisma adapter (swap for Shopify later)
    ai/                 AIProvider interface, mock + Claude providers, grounded tools, system prompt
    payments/           PaymentProvider interface, SSLCommerz + test-mode provider
    orders/             pricing (server-side), order service, signed order links
    auth/               DB sessions (httpOnly cookie, hashed tokens), bcrypt, guards, schemas
  stores/               cart, wishlist, UI, session (Zustand, persisted where useful)
prisma/                 schema, migrations, seed
public/images/          assets exported from Figma (+ manifest.json)
tests/e2e/              Playwright journeys (desktop + mobile)
```

### Editing content

- **Contact details, social links, legal name:** `src/content/site.ts` (currently placeholders, as agreed).
- **Delivery fees, free-delivery threshold, payment methods:** `storePolicy` in `src/content/site.ts`.
- **Homepage copy:** `src/content/home.ts`. **FAQ:** `src/content/faq.ts`. **Policies & help topics:** `src/content/policies.ts`.
- **Products:** edit `src/data/catalog.ts` and run `npm run db:seed` (upserts by slug). Prices are
  stored in poisha (৳1 = 100). Pages marked with a dashed orange "pending" box need real copy.

### Swapping backends later

- **Catalogue:** implement `CommerceProvider` (`src/lib/commerce/provider.ts`) — e.g. a Shopify
  Storefront adapter — and select it with `COMMERCE_PROVIDER`. No page changes needed.
- **AI:** `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` switches from the rule-based mock to Claude.
  Both use the same tools (`src/lib/ai/tools.ts`), so answers stay grounded in the catalogue.
- **Payments:** `PAYMENT_PROVIDER=sslcommerz` + store ID/password. Until then online payments run in a
  clearly labelled **test mode** (no money moves).
- **Email:** `EMAIL_PROVIDER=resend` + `EMAIL_API_KEY` + `EMAIL_FROM`. Default logs emails to the console.

---

## Payments (SSLCommerz)

1. Checkout creates the order and reserves stock (atomic, server-priced).
2. COD orders are confirmed immediately. Online orders open an SSLCommerz session with the chosen
   method pre-selected (bKash / Nagad / cards).
3. SSLCommerz posts back to `/api/payments/sslcommerz/{success|fail|cancel|ipn}`.
   **Every success is re-validated** with the SSLCommerz Validation API (status, amount, currency)
   before the order is marked paid. Failed/cancelled payments cancel the order and release stock.

In the SSLCommerz merchant panel, set the IPN URL to `https://<your-domain>/api/payments/sslcommerz/ipn`.
Use `SSLCOMMERZ_SANDBOX=true` until you have tested with sandbox credentials.

---

## Deploying to Netlify

1. Push this repository to GitHub and import it in Netlify (Next.js is detected automatically;
   `netlify.toml` sets the build to `npm run build:netlify`, which generates the Prisma client,
   applies migrations and builds).
2. Create a PostgreSQL database (Neon, Supabase, RDS — or Netlify Database, whose `NETLIFY_DB_URL`
   is used automatically). For serverless, use the **pooled** connection string.
3. Add environment variables from `.env.example` (scopes: Builds + Functions). At minimum:
   `NEXT_PUBLIC_SITE_URL`, `DATABASE_URL`, `AUTH_SECRET`.
4. Give deploy previews their own `DATABASE_URL` so previews never migrate production.
5. After the first deploy, seed once from your machine: `DATABASE_URL=<prod url> npm run db:seed`.

Environment changes require a redeploy.

---

## Security notes

- Prices, stock and totals are always recomputed on the server; the browser cart is never trusted.
- Sessions: random tokens in httpOnly, SameSite=Lax cookies; only SHA-256 hashes are stored.
- Passwords: bcrypt (cost 12). Password-reset tokens are single-use, expire in 1 hour, and don't reveal
  whether an email exists.
- Mutating JSON endpoints require `application/json` and a same-origin `Origin` header (CSRF defence).
- Rate limits on sign-in, sign-up, checkout, AI chat, contact and newsletter (in-memory per instance —
  move to Redis/Upstash when scaling out).
- Guests can only view an order with an HMAC-signed link or order number + email.
- Security headers are set in `next.config.ts`.
