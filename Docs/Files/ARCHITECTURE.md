# ARCHITECTURE.MD — The System Foundation

> How we build it. Supersedes `Blueprint.md` §2 and §3 where they disagree.

---

## 1. Tech Stack

| Layer | Choice | Why |
|-------|--------|-----|
| Framework | Next.js 16, App Router, RSC | SSG/ISR for the public site, Route Handlers for the API, one deployment |
| Language | TypeScript strict | No `any`, explicit return types |
| Styling | Tailwind CSS v4, CSS-first `@theme` | Tokens map 1:1 to `AGENT.md` §2 |
| Primitives | Radix UI headless, fully restyled | A11y for free, zero default look |
| Icons | lucide-react | Tree-shakeable, consistent stroke |
| Client state | Zustand | Modals, toasts, filters, admin sidebar only |
| Server state | SWR, via the repository layer | Cache + revalidate without hand-rolling |
| Forms | React Hook Form + Zod resolver | One schema shared by form and API |
| i18n | Hand-rolled typed dictionaries + `Intl.*` | 2 locales; a package is not worth the weight |
| Smooth scroll | `lenis` 1.3.25 | ~3kb; drives the ScrollTrigger ticker |
| Scroll animation | `gsap` 3.15 + ScrollTrigger | Pinning, scrub, parallax, staggered reveals |
| **Data** | **Upstash Redis (Vercel Marketplace)** | Serverless, no connection pooling, matches the traffic shape |
| Media (Phase 2) | Vercel Blob | KV cannot hold binaries |
| Email (Phase 2) | Resend | Inquiry notification + auto-reply |
| Auth (Phase 2) | `jose` JWT in an HTTP-only cookie | Single admin; no auth framework needed |
| Hosting | Vercel | KV and Blob are first-party |

**Dropped from `Blueprint.md`:** PostgreSQL, Prisma, PgBouncer, Stripe, Redis-as-separate-service, PostHog, Sentry, OpenTelemetry, Meilisearch. Not needed at this scale; re-add only with an entry in `PROJECT_MEMORY.md`.

---

## 2. Project Structure

```text
src/
├── app/
│   ├── [locale]/                 # public site — en | id
│   │   ├── layout.tsx            # html lang, fonts, DictionaryProvider, nav, footer
│   │   ├── page.tsx              # home
│   │   ├── work/page.tsx         # project index
│   │   ├── work/[slug]/page.tsx  # case study
│   │   ├── services/page.tsx     # service index
│   │   ├── services/[slug]/page.tsx  # service detail + packages
│   │   ├── products/page.tsx
│   │   ├── products/[slug]/page.tsx
│   │   ├── pricing/page.tsx      # aggregate view — reads services + products
│   │   ├── about/page.tsx
│   │   ├── contact/page.tsx
│   │   ├── not-found.tsx
│   │   └── error.tsx
│   ├── admin/                    # English only, outside [locale]
│   │   ├── layout.tsx            # shell + auth guard
│   │   ├── page.tsx              # dashboard
│   │   ├── login/page.tsx
│   │   ├── projects/{page,new,[id]/edit}
│   │   ├── products/{page,new,[id]/edit}
│   │   ├── services/{page,new,[id]/edit}
│   │   ├── inquiries/{page,[id]}
│   │   ├── media/page.tsx
│   │   └── settings/page.tsx
│   ├── api/v1/                   # Phase 2 Route Handlers
│   ├── sitemap.ts
│   └── robots.ts
├── components/
│   ├── ui/                       # Button, Input, Dialog, Toast, DataTable, Skeleton…
│   ├── layout/                   # Nav, Footer, LocaleToggle, GridBackground, SkipLink
│   ├── motion/                   # SmoothScrollProvider (Lenis), Reveal, RevealLines,
│   │                             #   Parallax, PinnedSection, MarqueeStrip
│   ├── work/                     # ProjectCard, ProjectGrid, ProjectFilter, CaseStudy*
│   ├── service/                  # ServiceCard, ServiceGrid, ProcessSteps, DeliverableList
│   ├── product/                  # ProductCard, SpecTable, FeatureList, ChangelogList
│   ├── pricing/                  # PriceDisplay (shared everywhere), PricingTierCard
│   │                             #   (service-only), PricingGroup, EngagementFaq
│   ├── inquiry/                  # InquiryForm, InquiryDialog
│   └── admin/                    # AdminShell, EntityTable, LocalizedField, ImagePicker
├── lib/
│   ├── repo/
│   │   ├── types.ts              # Repository<T> contract — the seam
│   │   ├── driver.ts             # where data lives: Upstash Redis or memory
│   │   ├── mock/                 # collections, entities, users over the driver
│   │   └── index.ts              # the only module the app imports
│   ├── i18n/
│   │   ├── config.ts             # locales, defaultLocale
│   │   ├── dictionaries/{en,id}.ts
│   │   ├── get-dictionary.ts     # server
│   │   ├── dictionary-provider.tsx  # client
│   │   └── pick-locale.ts        # localized-field fallback
│   ├── schemas/                  # Zod — shared, project, product, service, inquiry, settings
│   ├── mock-data/                # seed projects, products, inquiries (EN + ID)
│   ├── auth.ts                   # Phase 2
│   ├── slug.ts  ├── format.ts  └── logger.ts
├── hooks/                        # useProjects, useProduct, useServices, useToast, useReducedMotion
├── stores/                       # ui-store.ts (Zustand)
├── styles/                       # tokens.css, global.css
└── types/
middleware.ts                     # locale redirect + /admin guard
```

---

## 3. The Repository Seam (the single most important decision)

```ts
// lib/repo/types.ts
export interface ListQuery {
  search?: string;
  category?: string;
  status?: string;
  sort?: 'recent' | 'oldest' | 'title' | 'manual';
  page?: number;
  perPage?: number;
}

export interface Paginated<T> {
  items: T[];
  total: number;
  page: number;
  perPage: number;
  hasMore: boolean;
}

export interface Repository<T, TInput> {
  list(query?: ListQuery): Promise<Paginated<T>>;
  getBySlug(slug: string): Promise<T | null>;
  getById(id: string): Promise<T | null>;
  create(input: TInput): Promise<T>;
  update(id: string, input: Partial<TInput>): Promise<T>;
  remove(id: string): Promise<void>;
  reorder(ids: string[]): Promise<void>;
}
```

- `mock/` implements this over collections seeded from `lib/mock-data/`, plus a deterministic failure hook so error states are demonstrable.
- `driver.ts` decides where those collections are stored: **Upstash Redis** when `UPSTASH_REDIS_REST_URL` and `UPSTASH_REDIS_REST_TOKEN` are present, process memory otherwise. Running in production without them throws — a panel that looks like it saves but does not is worse than a boot error.
- The driver is chosen on first use, not at module evaluation, so `next build` does not need credentials.
- One collection is stored as one JSON value, not one key per record. The data is tens of records, and that shape keeps all existing filtering, sorting, and pagination working over a plain array.
- **Components import from `lib/repo`, never from `mock/` or `driver.ts`.** This is what keeps a storage change a storage-only diff.

---

## 4. Architecture Decision Records

### ADR-001 — Next.js 16 App Router + RSC
**Context:** Content-heavy public site plus an interactive admin panel in one codebase.
**Decision:** App Router; public pages are Server Components with ISR, admin is Client Components behind a guard.
**Consequences:** Minimal client JS on marketing pages; `'use client'` discipline required; Route Handlers colocate the Phase 2 API.

### ADR-002 — Brand guidelines override the blueprint design system
**Context:** `Blueprint.md` §8 specifies Inter, rounded radii, and shadow tokens. `brand_guidelines.html` specifies Space Grotesk/Space Mono, 1px hairlines, no shadows.
**Decision:** The brand guidelines win. `--radius: 0`, `--shadow: none`, Space Mono as the body font.
**Consequences:** Every Radix/shadcn-derived primitive must be restyled from scratch; no component library default may ship as-is.

### ADR-003 — Redis instead of PostgreSQL + Prisma
**Context:** Dataset is dozens-to-hundreds of projects and products, single-writer, read-heavy. Serverless deployment.
**Decision:** Upstash Redis via the Vercel Marketplace as the primary store. One collection per key, stored as a single JSON value — no secondary indexes.
**Consequences:**
- Every read pulls the whole collection, so all filtering, sorting, and pagination stay plain array work. That is what let the storage swap stay inside `lib/repo` instead of rewriting every query as SQL.
- Every write is read → modify → write the whole collection. **Ceiling: no locking, so two simultaneous edits mean last-write-wins.** The panel has one operator; beyond that this needs per-record keys with an index, or Postgres.
- Search is a substring scan. **Ceiling: fine to ~500 items.** The repository seam is the migration path.
- Trade-off accepted knowingly: no joins, no cross-entity transactions, no `ORDER BY` on arbitrary fields.
- `@vercel/kv` was sunset as a first-party product; Upstash via Marketplace is the replacement, and the client is `@upstash/redis`.

### ADR-004 — Frontend-first with a mock repository
**Context:** Design and UX are the risk; the backend is well understood.
**Decision:** Ship the entire UI against an in-memory store behind `Repository<T>`, then put real storage behind the same interface.
**Consequences:** UI can be validated before any infrastructure exists; seed data must be production-realistic; the interface must be designed for the store's constraints from day one, not retrofitted. This paid off: adding Redis touched only `lib/repo` plus five call sites that had to start awaiting.

### ADR-005 — Hand-rolled i18n, two locales
**Context:** `en` + `id` only; most public pages are Server Components.
**Decision:** Typed dictionary objects, `getDictionary()` on the server, a context provider on the client, `[locale]` route segment, middleware redirect.
**Consequences:** No dependency, full type safety (missing `id` key = build error). Cost: no ICU pluralization or message extraction tooling — acceptable for this surface area. Admin is not translated.

### ADR-006 — Localized content stored per-locale on the entity
**Context:** Project and product copy needs both languages; KV has no join.
**Decision:** Translatable fields are `{ en: string; id: string }` on the entity. `en` required, `id` optional with fallback.
**Consequences:** One read serves both locales; the admin editor needs EN/ID tabs. Adding a third locale would mean a schema migration — accepted, since a third locale is out of scope.

### ADR-007 — Inquiry instead of checkout
**Context:** No payment gateway; deals close over email and chat.
**Decision:** Pricing tiers are informational. Every CTA opens an inquiry form pre-filled with product and plan context, plus a direct chat link.
**Consequences:** No PCI scope, no billing state. The inquiry endpoint needs rate limiting and spam protection (honeypot + time-to-submit check), since it is the only public write path.

### ADR-008 — Single-admin JWT auth
**Context:** One operator, no public registration.
**Decision:** Credentials in env, verified server-side, `jose`-signed JWT in an HTTP-only `SameSite=Strict` cookie; `middleware.ts` guards `/admin` and `/api/v1/admin/*`.
**Consequences:** No auth framework, no user table. Rate-limit login. Rotating the password means changing an env var and redeploying — acceptable for one user.

### ADR-009 — Service is a first-class entity, not a tag on Project
**Context:** Services were initially modelled as `string[]` on `Project`. But visitors arrive looking for a capability ("I need packaging design"), not for a specific past project — and each capability needs its own scope, process, and price.
**Decision:** `Service` becomes the third content entity with an index and a detail page. `Project.services: string[]` becomes `Project.serviceIds: string[]`, a real reference.
**Consequences:**
- Service detail can surface the projects delivered under it, turning the portfolio into evidence for the pitch.
- Deleting a service must clean `serviceIds` on every referencing project, or listings render dangling ids. KV has no foreign keys — the repository owns this cleanup explicitly.
- Cost: one more entity, one more admin CRUD screen. Justified because it is the primary conversion path for hire-work.

### ADR-010 — `/pricing` is a view, not a store
**Context:** Prices exist on service packages and on products. A dedicated pricing page is a third place they could be written down.
**Decision:** `/pricing` composes `serviceRepo.list()` + `productRepo.list()`. It holds no prices of its own.
**Services and products model price differently, on purpose:**
- `Service.packages: PricingTier[]` — a fixed **Basic / Gold / Premium** ladder, keyed by `tier`, 0–3 entries, unique.
- `Product.price: PriceInfo` — one indicative "starting from" figure. Products are not sold in plans.

**Consequences:**
- A price changes in exactly one place; the entity is the single source of truth. No divergence between a detail page and the pricing page — the classic failure of a hand-maintained pricing page.
- Two price shapes instead of one forced abstraction. Reuse happens at the component that actually repeats: `PriceDisplay` (formatting + the `null → "Contact us"` rule) is shared by everything; `PricingTierCard` is service-only.
- `Service.startingPrice` is derived from `packages` server-side, so a card can show a price without loading the packages, and can never disagree with them.
- Prices must never be written into an i18n dictionary — only labels are translated; amounts come from the entity and format via `Intl.NumberFormat`.
- If products ever need plans, that is a new ADR — not a tier array quietly added to the product schema.

### ADR-012 — Lenis + GSAP ScrollTrigger for scroll depth
**Context:** The brand forbids shadows and rounded geometry, so visual depth has to come from layering, overlap, and motion. The target is an agency-studio feel: scrubbed pinned sections, differential parallax, staggered reveals.
**Decision:** `lenis` for smooth scroll, `gsap` + `ScrollTrigger` for scroll-driven animation. Lenis drives GSAP's ticker so the two share one RAF loop.
**Alternatives rejected:**
- IntersectionObserver + CSS transitions — enough for fade-ins, but cannot scrub, pin, or parallax. Would be re-implemented badly at ~60% of GSAP's weight.
- CSS `animation-timeline: view()` — genuinely native and zero-JS, but Firefox support is still behind a flag, and it cannot pin. Revisit when support lands; the reveal hook is the seam.
- Motion/Framer — good for component transitions, weaker for scrubbed scroll timelines.
**Consequences:**
- ~40kb gzipped added to the public bundle. Acceptable against the 150kb landing budget because the pages are otherwise Server Components. **Must be verified at task 4.3, not assumed.**
- Both are client-only: the motion layer is a `'use client'` island; page content stays server-rendered and readable without it.
- `prefers-reduced-motion` disables Lenis entirely and resolves reveals to their end state — the reduced-motion path is a first-class path, not an afterthought.
- Every GSAP animation must be scoped in `gsap.context()` and reverted on unmount, or ScrollTriggers leak across client navigations.
- ScrollTrigger needs a refresh after image load and locale change, since both change layout height.

### ADR-011 — Tier is a key; the label is UI copy
**Context:** Service packages use a fixed Basic / Gold / Premium ladder, identical across every service.
**Decision:** Store `tier: 'basic' | 'gold' | 'premium'` as the package identity. The visible labels and CTA copy live in the i18n dictionary, not on the entity. Drop the package `id`, `name`, `ctaLabel`, and `highlighted` fields; derive display order from `TIER_RANK` and always emphasize Gold.
**Consequences:**
- The ladder cannot drift between services — there is no per-service field to type it into inconsistently.
- Renaming the ladder (or translating it) is a dictionary edit, not a data migration across every service.
- Both locales come free: the label is translated like any other UI string, instead of being a `Localized` field an admin must fill three times per service.
- Four fields removed from the write path, and two validation rules ("one highlighted", "unique id") collapse into one ("unique tier").
- Constraint accepted: a service cannot invent a fourth or custom-named package. If that is ever needed, it is a new ADR reintroducing a name field — deliberately.

---

## 5. Rendering & Caching

| Surface | Strategy |
|---------|----------|
| Home, About | Static, revalidate on publish |
| Work / Products / Services index | ISR, `revalidate: 300`, filters via URL search params |
| Work / Product / Service detail | `generateStaticParams` over published slugs, ISR |
| Pricing | ISR, revalidated by both the `services` and `products` tags — a package or price edit on either must refresh it |
| Admin | Fully dynamic, `no-store`, client-rendered behind the guard |
| Mutations | Revalidate the affected tag (`projects`, `products`) on write |

URL is the source of truth for filter, category, sort, and page — shareable and back-button correct.

---

## 6. Environment Variables

| Var | Phase | Purpose |
|-----|-------|---------|
| `NEXT_PUBLIC_SITE_URL` | 1 | Canonical URL, OG tags, sitemap. Local dev runs on **port 3030** — keep this in step with the `dev`/`start` scripts |
| `ADMIN_EMAIL` / `ADMIN_PASSWORD` | 2 | Seed the first `dev` user |
| `ADMIN_SECRET` | 2 | Signs the session cookie |
| `UPSTASH_REDIS_REST_URL` / `UPSTASH_REDIS_REST_TOKEN` | 5 | Repository storage. Required in production; auto-injected by the Vercel Marketplace integration |
| `BLOB_READ_WRITE_TOKEN` | 5 | Vercel Blob uploads. Without it uploads fall back to `public/uploads/`, which only works on a writable disk |

Contact details are no longer environment variables: studio name, email, WhatsApp, location, and founding year live in Settings and are edited in the panel.
| `ADMIN_EMAIL` / `ADMIN_PASSWORD_HASH` | 2 | Single admin credentials |
| `AUTH_SECRET` | 2 | JWT signing key |
| `RESEND_API_KEY` | 2 | Inquiry notification email |

Phase 1 runs with only the four `NEXT_PUBLIC_*` values. Nothing else is required to develop the entire frontend.

---

## 7. Deployment

Vercel, `main` = production, every PR gets a preview. Pipeline: `lint` → `typecheck` → `test` → `build` → deploy → smoke check.
Phase 1 deploys as a fully working mock site — shareable for review before any backend exists.
