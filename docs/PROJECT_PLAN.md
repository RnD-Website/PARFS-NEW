# GASENOS — Design Analysis, Architecture & Roadmap

## Status (build 1)

**Built and tested:** every page and journey in the roadmap — homepage (all Figma sections plus Newsletter & Perks), shop/category/deals/new listings with filters & sort, search with AI answers, product pages, cart & cart drawer, wishlist (device + account sync), checkout (COD, bKash, Nagad, cards via SSLCommerz; test mode until credentials), order confirmation & email, guest/account order tracking, registration/login/password reset, account dashboard (orders, addresses, profile), GASENOS AI (panel, full page, search answers; mock provider + Claude provider), About, Contact, FAQ, Help, Membership, policy pages, 404/error, sitemap/robots/manifest/JSON-LD, Netlify config. 25 Playwright end-to-end tests pass on desktop and mobile against a production build.

**Decisions applied:** market Bangladesh / BDT; payments COD + bKash + Nagad + cards via SSLCommerz; custom backend PostgreSQL + Prisma behind a swappable `CommerceProvider`; icons = Hugeicons Stroke Rounded (the Figma icon family, free set — no Lucide needed); footer payment marks show only accepted methods (Visa, Mastercard, Amex logos + bKash, Nagad, COD).

**Still needed from GASENOS (placeholders in place):**
- Real BDT prices — design USD prices were converted at a placeholder ৳120 = $1 (`src/data/catalog.ts`).
- Delivery fees, free-delivery threshold (placeholder ৳6,000 from "$50"), coverage areas (`storePolicy` in `src/content/site.ts`).
- Contact details, social links, legal company name (`src/content/site.ts`).
- Product descriptions/specs, stock levels (placeholder 10 per variant), colour names for Aero Runner X swatches other than "Volt Orange" (named Black / Grey / Off-white from the swatch colours).
- Policy texts (privacy, terms, returns conditions), help-topic texts (gift vouchers, gift cards, click & collect, instalments), About story.
- SSLCommerz store ID/password; Anthropic API key (optional); email provider key + sender domain.
- Official bKash / Nagad logo files if you want logos instead of text marks.
- Animation specification.

**Not in scope yet (suggested next):** admin dashboard for order status updates/inventory (today: via database), discount codes, product reviews submitted by customers, SMS notifications, analytics.

---


Source: Figma file `E-commerce` (`A0MwpEtCMoLbTP640cMrzL`), frame `8:2` "GASENOS — Landing Page (Desktop 1600)", plus the **Components** page (`4:2`).
The **Moodboard** page contains third-party reference sites only — used for inspiration context, never copied.

---

## 1. Design analysis

### 1.1 Design tokens (from Figma variables)

| Token | Value | Use |
|---|---|---|
| `brand/orange` | `#FF4D1A` | Hero, AI panel, sale, reviews backgrounds; accent buttons |
| `brand/orange-soft` | `#FF7A4D` | Secondary accent |
| `brand/orange-text` | `#C2390C` | Eyebrows / orange text on light (AA contrast) |
| `ai/violet` | `#6B4EFF` | Everything AI (buttons, sparkles, links) |
| `ai/violet-soft` | `#ECE8FF` | AI chips, AI badges |
| `ink/primary` | `#1C1A17` | Main text, primary buttons |
| `ink/secondary` | `#4A433B` | Body text |
| `ink/muted` | `#6E6356` | Captions, meta |
| `ink/faint` | `#8C8173` | Old prices, placeholders |
| `surface/cream` | `#F2ECE2` | Page background |
| `surface/card` | `#FBF8F3` | Cards |
| `surface/muted` | `#EFE7DA` | Image wells |
| `surface/image` | `#E6DCCB` | Icon circles |
| `surface/white` | `#FFFFFF` | |
| `line/default` | `#D9CFC0` | Borders, dividers |
| `dark/bg` | `#1F1D1B` | Footer, newsletter form |
| `dark/raised` | `#2A2724` | Inputs on dark |
| `dark/text-muted` | `#B8AE9F` | Muted text on dark |

**Type** — Archivo (headings, ExtraBold/Bold, tight negative tracking) + Inter (UI/body, Medium/SemiBold/Bold). Both free on Google Fonts → loaded via `next/font` (self-hosted, no layout shift).

| Style | Font | Size / LH / Tracking |
|---|---|---|
| H1 | Archivo 800 | 56 / 1.0 / -3 |
| H2 | Archivo 800 | 40 / 1.05 / -2.5 |
| H3 | Archivo 700 | 28 / 1.15 / -2 |
| H4 | Archivo 700 | 20 / 1.2 / -1 |
| Body Large | Inter 500 | 18 / 1.55 |
| Body | Inter 500 | 16 / 1.55 |
| Body Small | Inter 500 | 14 / 1.5 |
| Caption | Inter 500 | 12 / 1.4 |
| Label Title | Inter 600 | 16 / 1.3 |
| Label Price | Inter 700 | 18 / 1.2 |
| Label Button | Inter 600 | 15 / 1.0 |
| Eyebrow | Inter 600 | 13 / 1.0 / +4, uppercase, wrapped in `( … )` |

Shape language: pills (`999px`) for buttons/chips, `20px` radius for cards/images, `28px` for big panels. Desktop grid: 1600 frame, 80px side margins, 1440 content width.

### 1.2 Homepage sections (top → bottom)

| # | Section | Key content | Interactions |
|---|---|---|---|
| 1 | **Header** | Logo, nav (Shop, Categories, Deals, New in, Help), AI search bar, Wishlist / Cart / Account icon buttons | Search submit + voice icon, nav links, cart drawer, wishlist & account |
| 2 | **Hero** (orange) | Giant "GASENOS" wordmark, sneaker cut-out overlapping it, headline, 2 CTAs, "Not sure what to buy?" AI card with 2 prompt chips, floating product card (Studio Max Headphones $249) | CTAs → shop / collections; chips open AI with prompt; product card → PDP |
| 3 | **Category ticker** | Electronics · Fashion · Home · Beauty · Audio · Footwear | Links to categories (marquee candidate — awaiting animation spec) |
| 4 | **About** | Lifestyle photo, 2-tone statement, "Read more about us" | → /about |
| 5 | **Shop by category** | 6 tiles: Electronics, Fashion, Home & Living, Beauty, Footwear, Audio + "All categories →" | → category pages |
| 6 | **AI Shopping Assistant** (orange panel) | Pitch, AI search bar, 4 prompt chips, "Try BRAND AI", mock chat (user + AI bubbles, 3 suggestion cards, one-tap checkout), 5 AI feature tiles | Live: becomes a real working assistant demo |
| 7 | **Best sellers** | Tabs (All/Electronics/Fashion/Home/Beauty), 8 product cards (badges: -20%, AI pick, New), "See all products →" | Tab filtering, wishlist toggle, quick add-to-cart |
| 8 | **Sale promo** | Campaign card "Save up to 40%…", 2 product photos, 4 big category links | → sale listing / categories |
| 9 | **Featured product** | Gallery (main + 3 thumbs), Aero Runner X, rating, price $129 / ~~$159~~, 4 colour swatches, EU sizes 39–44, AI fit check, benefits, Add to cart / Buy now | Fully interactive mini-PDP |
| 10 | **Reviews "The receipts don't lie"** | Horizontal row: 4 customer photo cards + 4 receipt-style review cards (name, rating, product, quote, barcode, verified buyer), prev/next pager | Carousel (scroll-snap + buttons). **No video/mute icons** per your decision |
| 11 | **FAQ** | 5 accordion items (first open) | Accordion |
| 12 | **Newsletter** *(hidden in Figma → will be shown)* | "Join the list. Shop first.", 10%-off pill, dark form (name, email, consent, Subscribe) | Validated form → /api/newsletter |
| 13 | **Perks** *(hidden in Figma → will be shown)* | Free delivery · 30-day returns · Secure payment · 24/7 support | Static strip |
| 14 | **Services** | "We bring the best quality to every doorstep", 5 cards (gift vouchers, gift card, click & collect, instalments, express delivery) | Each links to an info/policy page |
| 15 | **Footer** (dark) | Contact (placeholders), Shop, Help, Social columns, © line, 12 payment-method logos, giant wordmark | All links functional |
| — | **Floating "Ask AI"** | Fixed bottom-right pill | Opens assistant panel anywhere on site |

### 1.3 Component inventory (Figma Components page → code)

| Figma component | Variants | Code component |
|---|---|---|
| Button | Primary, Outline, Accent, Light, AI | `ui/Button` (+ loading, disabled, sizes, `asChild` for links) |
| Icon Button | Light, Dark, Outline, Accent | `ui/IconButton` |
| Eyebrow | Light, Dark, AI | `ui/Eyebrow` |
| Chip / Tab | Active, Default | `ui/Chip` |
| Badge | Sale, New, AI pick | `ui/Badge` |
| Image Placeholder | 4 tones | `ui/ImageFrame` (real images; placeholder only as fallback) |
| Product Card | badge, old price toggles | `commerce/ProductCard` |
| Category Tile | — | `commerce/CategoryTile` |
| Perk Item | — | `marketing/PerkItem` |
| FAQ Item | Closed, Open | `ui/Accordion` |
| Colour Swatch | Default, Selected | `commerce/ColorSwatch` |
| Size Pill | Default, Selected | `commerce/SizePill` |
| AI Search Bar | — | `ai/AISearchBar` |
| AI Prompt Chip | — | `ai/PromptChip` |
| AI Chat Bubble | User, AI | `ai/ChatBubble` |
| AI Suggestion Card | — | `ai/SuggestionCard` |
| AI Feature | — | `ai/AIFeature` |
| Ask AI Button | — | `ai/FloatingAskAI` |
| Service Card | — | `marketing/ServiceCard` |
| Review Receipt | — | `marketing/ReviewReceipt` |
| Customer Photo Card | — | `marketing/CustomerPhotoCard` (static image, no media controls) |

States missing in Figma (to be designed consistently by me): hover, focus-visible, pressed, disabled, loading, error, empty states, skeletons, toasts, drawers/modals.

### 1.4 Assets

- **Icons** — 23 Hugeicons Pro icons in Figma: sparkles, mic-01, arrow-right-02, arrow-left-02, arrow-up-right-01, favourite, shopping-bag-02, user, image-01, add-01, minus-sign, search-01, ruler, git-compare, notification-01, gift, star, tick-02, delivery-truck-01, return-request, lock, customer-support (+ service-card icons). Exported SVGs will be used; Lucide fills any gap (menu, close, filter, trash, etc.) at matched stroke/size.
- **Photos** (~35): hero sneaker cut-out (needs transparent PNG), headphones, about lifestyle, 6 category tiles, 8 best sellers, 3 AI suggestion shoes, sale campaign + earbuds + egg chair, featured product main + 3 thumbs, 4 customer photos + 4 review product thumbs.
- **Payment logos** (12): Amex, Apple Pay, Bancontact(?), Google Pay, iDEAL(?), Visa, Klarna, Maestro, Mastercard, PayPal, Shop Pay, UnionPay.
- Images will be exported at 2× and served through `next/image` (AVIF/WebP, responsive `sizes`, `object-fit: cover` within design aspect ratios — never stretched).

### 1.5 Issues found in the design (need your input or I'll handle as noted)

1. **Payment methods contradict each other** — footer shows European/global logos (Klarna, iDEAL, Bancontact…), the hidden Perks section says "Cards, bKash, COD" (Bangladesh), and the contact placeholder is `+880`. → Needs a market decision (see §5).
2. **Currency** — all prices are in `$`. If the market is Bangladesh, prices should likely be BDT (৳).
3. **Category names differ** between sections ("Home" / "Home & Living" / "Home & living"; "Beauty" / "Beauty & care"). → I'll use one canonical taxonomy (Electronics, Fashion, Home & Living, Beauty, Footwear, Audio) and keep the short display labels where the design uses them.
4. **Product content gaps** — design has names, prices, ratings and images for ~12 products, but no descriptions, specs, stock, variants (except the Aero Runner X). → Fields will exist in the data model and be marked `TODO` — I will not invent descriptions.
5. **FAQ** — only the first answer is written. Other answers are needed. Policy pages (shipping, returns, privacy, terms) have no copy. → Pages built with clearly marked placeholder blocks until you send text.
6. **Text says "BRAND" / "BRAND AI"** throughout → replaced with GASENOS / GASENOS AI.
7. Only **desktop** exists → I'll design tablet (768–1279) and mobile (<768) layouts (details §2.4).

---

## 2. Site map & pages

| Route | Page | Notes |
|---|---|---|
| `/` | Home | All sections in §1.2 |
| `/shop` | All products | Filters, sort, pagination / load-more |
| `/shop/[category]` | Category listing | Same template, pre-filtered |
| `/deals` | Sale items | Listing filtered by `compareAtPrice` |
| `/new` | New in | Listing filtered by `isNew` |
| `/products/[slug]` | Product detail | Built from the Featured-product design |
| `/search?q=` | Search results | Text search + "Ask GASENOS AI" fallback |
| `/cart` | Cart page | Also a slide-in cart drawer from header |
| `/wishlist` | Wishlist | Works logged-out (local) and syncs when logged in |
| `/checkout` | Checkout | Contact → Shipping → Delivery → Payment → Review |
| `/checkout/success/[orderId]` | Confirmation | |
| `/account/login`, `/account/register`, `/account/forgot-password` | Auth | |
| `/account` | Dashboard | Overview, recent orders |
| `/account/orders`, `/account/orders/[id]` | Order history & detail | With tracking timeline |
| `/account/addresses`, `/account/profile` | Settings | |
| `/track-order` | Guest order tracking | Order number + email |
| `/assistant` | Full-page GASENOS AI | Also available as panel on every page |
| `/membership` | Perks / membership | Built from Perks + Services content |
| `/about`, `/contact`, `/faq` | Content | Contact form → API |
| `/policies/[slug]` | Shipping, Returns, Privacy, Terms, Warranty | Markdown content |
| `not-found`, `error` | 404 / 500 | Branded |

### 2.4 Responsive strategy (my UX decisions)

- **Breakpoints:** mobile < 768, tablet 768–1279, desktop ≥ 1280 (design reference 1440 content @1600).
- **Header (mobile/tablet):** logo + search icon + cart; hamburger opens a full-height drawer with nav, categories, account, wishlist. Search expands to a full-width overlay with AI chips. Sticky, compact on scroll.
- **Mobile bottom tab bar:** Home · Shop · Ask AI · Wishlist · Account (replaces the floating Ask AI pill on mobile to avoid covering content).
- **Hero:** wordmark scales with viewport (`clamp`), sneaker stays centred, copy stacks below; AI hint card + floating product card become a horizontal swipe row.
- **Product grids:** 4 cols desktop → 3 tablet → 2 mobile (compact card: smaller type, 36px add button, wishlist stays tappable at 44px hit area).
- **Category tiles / AI features / services / reviews:** horizontal scroll-snap rows on mobile with visible next-card peek.
- **Tabs & filters:** tabs scroll horizontally; filters move into a bottom sheet with "Show N results" button.
- **PDP:** swipeable gallery with dots; sticky bottom "Add to cart / Buy now" bar on mobile.
- **Typography:** fluid `clamp()` scale between mobile and desktop sizes; minimum body 15px, inputs 16px (prevents iOS zoom).
- **Touch:** all targets ≥ 44px; hover effects only under `@media (hover:hover)`.

---

## 3. Architecture

### 3.1 Stack

| Concern | Choice |
|---|---|
| Framework | **Next.js (App Router) + React + TypeScript (strict)** |
| Styling | **Tailwind CSS** with Figma tokens as CSS variables + Tailwind theme |
| Fonts | `next/font/google` — Archivo, Inter |
| Icons | Exported Figma SVGs as React components (SVGR) + `lucide-react` fallback |
| UI behaviour | Radix UI primitives (dialog, accordion, tabs, popover) for accessibility |
| Client state | Zustand (cart, wishlist, UI) with persistence |
| Forms & validation | React Hook Form + Zod (shared schemas client/server) |
| Data | **Commerce provider interface** — local adapter first, Shopify/CMS/API adapters later |
| Database | PostgreSQL + Prisma (users, orders, addresses, wishlist, newsletter) — *see decision §5* |
| Auth | Auth.js (credentials + optional Google), secure cookies |
| AI | Provider-agnostic AI layer; mock provider now, Claude (Anthropic) recommended for production, streaming + tool calling |
| Payments | Payment provider interface — mock/COD now, real gateway per market decision |
| Email | Provider interface (order confirmation, password reset, newsletter) — e.g. Resend |
| Testing | Vitest + Testing Library (unit), Playwright (E2E user journeys + responsive), axe (a11y) |
| Quality | ESLint, Prettier, TypeScript checks, Lighthouse CI |
| Hosting | Netlify (Next.js runtime), `netlify.toml`, env vars per context |

### 3.2 Folder structure

```
gasenos/
├─ docs/                         # this plan, decisions, content TODOs
├─ public/
│  ├─ images/{products,categories,marketing,reviews}/
│  └─ payment/                   # payment logos
├─ src/
│  ├─ app/
│  │  ├─ (store)/                # header/footer layout
│  │  │  ├─ page.tsx             # home
│  │  │  ├─ shop/[[...category]]/
│  │  │  ├─ products/[slug]/
│  │  │  ├─ search/  deals/  new/  cart/  wishlist/
│  │  │  ├─ about/  contact/  faq/  membership/  policies/[slug]/
│  │  │  ├─ track-order/  assistant/
│  │  │  └─ account/(auth)/… account/(dashboard)/…
│  │  ├─ (checkout)/checkout/    # minimal distraction-free layout
│  │  ├─ api/
│  │  │  ├─ ai/chat/route.ts     # streaming assistant endpoint
│  │  │  ├─ newsletter/  contact/  orders/  auth/[...nextauth]/
│  │  ├─ sitemap.ts  robots.ts  manifest.ts  not-found.tsx  error.tsx
│  ├─ components/
│  │  ├─ ui/                     # Button, IconButton, Chip, Badge, Eyebrow, Input, Checkbox,
│  │  │                          # Accordion, Drawer, Dialog, Toast, Skeleton, Price, Rating
│  │  ├─ layout/                 # Header, MobileNav, BottomTabBar, Footer, Container, Section
│  │  ├─ commerce/               # ProductCard, ProductGrid, Filters, Sort, Gallery, ColorSwatch,
│  │  │                          # SizePill, AddToCart, WishlistButton, CartDrawer, CartLine
│  │  ├─ ai/                     # AISearchBar, PromptChip, ChatBubble, SuggestionCard,
│  │  │                          # AssistantPanel, FloatingAskAI, AIFeature
│  │  ├─ marketing/              # ReviewReceipt, CustomerPhotoCard, ServiceCard, PerkItem, Newsletter
│  │  └─ sections/home/          # one file per homepage section
│  ├─ lib/
│  │  ├─ commerce/
│  │  │  ├─ types.ts             # Product, Variant, Category, Cart, Order, Customer
│  │  │  ├─ provider.ts          # CommerceProvider interface
│  │  │  └─ adapters/{local,shopify}/
│  │  ├─ ai/
│  │  │  ├─ provider.ts          # AIProvider interface
│  │  │  ├─ providers/{mock,anthropic}.ts
│  │  │  ├─ tools.ts             # searchProducts, getProduct, compareProducts,
│  │  │  │                       # recommend, getPolicy, getOrderStatus, addToCart
│  │  │  └─ system-prompt.ts
│  │  ├─ payments/  email/  auth/  db/  seo/  analytics/
│  │  └─ utils/                  # formatPrice, cn, slugify…
│  ├─ content/
│  │  ├─ site.ts                 # brand, nav, contact PLACEHOLDERS, social PLACEHOLDERS
│  │  ├─ faq.ts  services.ts  perks.ts  reviews.ts
│  │  └─ policies/*.md
│  ├─ data/                      # products.ts, categories.ts (seed catalogue from Figma)
│  ├─ stores/                    # cart.ts, wishlist.ts, ui.ts (Zustand)
│  └─ styles/globals.css         # tokens as CSS variables
├─ prisma/schema.prisma
├─ tests/{unit,e2e}/
├─ netlify.toml  .env.example  README.md
```

### 3.3 Product data model (Shopify-compatible shape)

```ts
type Product = {
  id: string; slug: string; name: string;
  description?: string;          // TODO — not in design
  categoryIds: string[]; tags: string[];
  price: Money; compareAtPrice?: Money;
  rating?: { average: number; count: number };
  badges?: ('sale' | 'new' | 'ai-pick')[];
  images: { src: string; alt: string; width: number; height: number }[];
  options?: { name: 'Color' | 'Size'; values: { label: string; value: string; swatch?: string }[] }[];
  variants: { id: string; sku?: string; options: Record<string, string>; price: Money; inStock: boolean }[];
  attributes?: Record<string, string>;   // used by AI compare
  seo?: { title?: string; description?: string };
};
```
Every page reads data only through `CommerceProvider` (`getProducts`, `getProduct`, `search`, `getCategories`, `createOrder`…). Swapping to Shopify/CMS = a new adapter, no UI changes.

### 3.4 AI assistant architecture

```
UI (panel / page / search bar / chips / PDP "Ask about this product")
   → POST /api/ai/chat  (streamed response, conversation + page context)
      → AIProvider (mock | anthropic)  ← selected by env AI_PROVIDER
          ↳ tools → CommerceProvider (search, get, compare, recommend)
                  → content (shipping/returns policies, FAQ)
                  → orders (status, only for signed-in user / verified order+email)
   ← text + structured product cards + actions (add to cart, view, compare)
```
- **Mock provider** (default, no keys): intent matching over the real catalogue (budget, category, size, "compare"), so the demo works end-to-end with real products.
- **Real provider**: set `AI_PROVIDER=anthropic` + `ANTHROPIC_API_KEY` — same tools, no UI change.
- Guardrails: rate limiting, input length limits, never invents products (only returns catalogue items), no order data without authorisation, conversation stored client-side.

### 3.5 Quality targets

- Lighthouse ≥ 90 performance, ≥ 95 accessibility / SEO / best practices on mobile.
- WCAG 2.2 AA: keyboard navigation, focus rings, labels, contrast (orange text uses `brand/orange-text`), `prefers-reduced-motion`.
- SEO: per-page metadata, Open Graph, `sitemap.xml`, `robots.txt`, JSON-LD (`Product`, `BreadcrumbList`, `Organization`, `FAQPage`).
- Performance: server components by default, images via `next/image` with explicit sizes, fonts self-hosted, minimal client JS.

### 3.6 Environment variables (`.env.example`)

```
NEXT_PUBLIC_SITE_URL=
DATABASE_URL=
AUTH_SECRET=
COMMERCE_PROVIDER=local          # local | shopify
SHOPIFY_STORE_DOMAIN=            # later
SHOPIFY_STOREFRONT_TOKEN=        # later
AI_PROVIDER=mock                 # mock | anthropic
ANTHROPIC_API_KEY=
PAYMENT_PROVIDER=mock            # mock | stripe | sslcommerz | …
PAYMENT_SECRET_KEY=
EMAIL_PROVIDER=console           # console | resend
EMAIL_API_KEY=
```

---

## 4. Roadmap

| Phase | Scope | Output / done when |
|---|---|---|
| **0. Setup** | Next.js + TS + Tailwind scaffold, tokens, fonts, lint/format, folder structure, Netlify config, `.env.example`, asset export from Figma | App runs, tokens match Figma, assets in `/public` |
| **1. Design system** | All UI primitives + states (hover/focus/active/disabled/loading), icons, layout shell: Header (desktop + mobile drawer), Footer, bottom tab bar, floating Ask AI | Component preview page matches Figma components |
| **2. Homepage** | All 15 sections pixel-matched at 1440/1600, responsive tablet + mobile, Newsletter + Perks integrated | Visual check vs Figma screenshots at desktop; tablet/mobile reviewed |
| **3. Catalogue** | Data model + local adapter seeded from Figma products, Shop/Category/Deals/New listings, filters (category, price, rating, colour, size, in-stock), sort, Search, PDP (from Featured product design), related products | Browse → filter → PDP journey works |
| **4. Cart & wishlist** | Cart drawer + page (qty, remove, totals, free-delivery progress), wishlist page, persistence, toasts | Add/update/remove journeys pass |
| **5. Accounts** | Register, login, logout, forgot password, dashboard, profile, addresses, order history, order detail with tracking timeline, guest tracking | Auth journeys pass |
| **6. Checkout & orders** | Multi-step checkout, address validation, delivery options, payment provider (mock → real), order creation, confirmation page + email | Guest & logged-in checkout journeys pass |
| **7. GASENOS AI** | Panel, full page, streaming API, tools, mock provider over real catalogue, Claude provider ready, add-to-cart from chat, PDP fit-check entry point | Q&A, recommend, compare, policy and order-status flows work on mock |
| **8. Content pages** | About, Contact (form), FAQ, Membership/Perks, policies, 404/500 | All footer & nav links resolve |
| **9. Motion & polish** | Your animation spec, micro-interactions, skeletons, reduced-motion support | Animation review with you |
| **10. QA & launch prep** | Playwright E2E for all major journeys on desktop/tablet/mobile, axe, Lighthouse, SEO checks, Netlify deploy preview | Test report + live preview URL |

Phases 0–4 and 7–8 can start immediately with mock data. Phases 5–6 need the backend/payment decisions below before they go beyond mock adapters.

---

## 5. Open decisions & inputs needed

**Blocking now**
- [ ] **Figma asset access** — allow `www.figma.com` in the cloud environment's network settings (or send an export of all images/icons).

**Needed before Phase 5–6 (accounts, checkout)**
- [ ] **Target market & currency** — USD (as designed) or Bangladesh/BDT (suggested by `+880`, bKash, COD)?
- [ ] **Payment methods** — which ones you will actually accept (cards, bKash, Nagad, COD, PayPal…) and which gateway/merchant account (Stripe, SSLCommerz, …). Footer logos will be matched to this.
- [ ] **Backend** — recommended: own backend (PostgreSQL + Prisma on Netlify-compatible hosting such as Neon) behind the commerce interface, or Shopify headless from the start.
- [ ] **Email sender** for order emails (domain + provider).

**Content (can arrive later — placeholders used meanwhile)**
- [ ] Product descriptions/specs/stock/variants for each product
- [ ] Remaining FAQ answers, policy texts, About page copy
- [ ] Contact details, social links, legal company name
- [ ] Animation specification
