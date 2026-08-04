# PROJECT_MEMORY.MD — The AI Journal

> Living document. Update it **during** work, not after.
> Anything decided in chat but not written here does not exist.

**Last updated:** 2026-08-03

---

## 1. Active Context

**Current phase:** Phase 4 complete except the browser-based checks (4.1, 4.2, 4.3, 4.8)
**Last completed:** Phases 0–3 built and verified: typecheck clean, ESLint clean, 19/19 unit tests pass, production build generates 51 static pages
**Next action:** Run the browser checks — axe/keyboard audit, Lighthouse, and a Vercel preview deploy — then Phase 5 (Vercel KV)
**Entities:** `Project` · `Product` · `Service` · `Inquiry` (+ `Settings` singleton)
**Public routes:** `/` `/work` `/work/[slug]` `/services` `/services/[slug]` `/products` `/products/[slug]` `/pricing` `/about` `/contact` — all under `/[locale]`
**Next action:** Task 0.1 — scaffold Next.js 16 + TypeScript strict + Tailwind v4

**Repo state:** Next.js 16 app in `src/`. Public site (EN/ID) + admin panel, all against the mock repository. Not a git repository yet.

**Verify everything:** `npm run verify` (typecheck → lint → test → build)
**Admin login:** `/admin/login` — `studio@qorv.id` / `qorv` (mock auth, Phase 5 replaces it)

---

## 2. Decisions Made

| # | Decision | Rationale | Date |
|---|----------|-----------|------|
| D-01 | `brand_guidelines.html` overrides `Blueprint.md` §8 for all visual decisions | Blueprint specified Inter + rounded + shadows; the brand is Space Grotesk/Mono, 1px hairlines, radius 0, no shadows. The brand is the real constraint | 2026-08-03 |
| D-02 | Vercel KV replaces PostgreSQL + Prisma | User requirement. Dataset is small, single-writer, read-heavy, serverless deployment | 2026-08-03 |
| D-03 | Frontend-first with a mock repository, backend later | Design is the risk; backend is well understood. Lets the whole site be reviewed before infra exists | 2026-08-03 |
| D-04 | `Repository<T, TInput>` interface as the mock↔KV seam | The one abstraction built up front, because there really are two implementations. Makes Phase 5 a backend-only diff | 2026-08-03 |
| D-05 | Blueprint's 18 SaaS features cut to the actual scope | Billing, chat, maps, calendar, multi-tenancy, CMS, audit logging are irrelevant to an agency site | 2026-08-03 |
| D-06 | No payment gateway, no checkout, no cart | User requirement — deals close over email and WhatsApp. Pricing tiers are informational; every CTA opens an inquiry | 2026-08-03 |
| D-07 | Portfolio = `Project` (client work); `Product` = apps QORV sells | Clarified by the user. Two separate entities with separate index pages | 2026-08-03 |
| D-08 | Bilingual `en` (default) + `id` with a locale toggle | User requirement (superseded the earlier English-only reading) | 2026-08-03 |
| D-09 | Hand-rolled i18n, no package | 2 locales, mostly Server Components. Typed dictionaries give build-time completeness checking without a dependency | 2026-08-03 |
| D-10 | Admin panel is English-only | Internal single-operator tool. Translating it doubles the work for zero user benefit | 2026-08-03 |
| D-11 | Localized content stored inline as `{ en, id }` on the entity | KV has no joins; one read serves both locales. `en` required, `id` falls back | 2026-08-03 |
| D-12 | Single admin, JWT in an HTTP-only cookie, credentials from env | One operator, no public registration. An auth framework would be pure overhead | 2026-08-03 |
| D-13 | Nested collections edited via the parent `PATCH` | `features` / `pricing` / `faqs` / `changelog` / service `packages` / `process` have no independent lifecycle and live inside the parent document in KV | 2026-08-03 |
| D-14 | `Service` promoted to a first-class entity with index + detail pages | Was missing entirely — originally just `string[]` tags on `Project`. Visitors search by capability, and each capability needs its own scope, process, and price. ADR-009 | 2026-08-03 |
| D-15 | `Project.services` → `Project.serviceIds` (real reference) | Lets service detail surface the projects that prove the capability. Cost: manual FK cleanup on delete, since KV has none | 2026-08-03 |
| D-16 | `/pricing` is an aggregate view that owns no data | A hand-maintained pricing page always drifts from the entity it describes. One price, one home. ADR-010 | 2026-08-03 |
| D-17 | `Service.startingPrice` is derived server-side from `packages`, never hand-entered | A denormalized field that anyone can edit is a field that will disagree with its source | 2026-08-03 |
| D-18 | `PriceDisplay` shared everywhere; `PricingTierCard` and `PackageEditor` are service-only | Price *formatting* genuinely repeats and is shared. The tier *card* does not — forcing products into it would be an abstraction with one real user | 2026-08-03 |
| D-19 | **Services have packages (`PricingTier[]`); products have one indicative price (`PriceInfo`)** | User correction: tiers apply to services only. Products are not sold in plans — one "starting from" figure and an inquiry | 2026-08-03 |
| ~~D-20~~ | ~~Free-form package names~~ — **superseded by D-21** | — | 2026-08-03 |
| D-21 | Service packages use a fixed **Basic / Gold / Premium** ladder | User decision | 2026-08-03 |
| D-22 | `tier` is the package identity; labels live in the i18n dictionary, not the entity. Dropped package `id`, `name`, `ctaLabel`, `highlighted` | The ladder is identical across every service, so storing the name per-service invites drift and forces the admin to type it (twice, once per locale) every time. Order derives from `TIER_RANK`; Gold is always emphasized. ADR-011 | 2026-08-03 |
| D-23 | `Inquiry.sourceTierId` → `sourceTier: Tier \| null` | The tier key *is* the reference; no id to carry | 2026-08-03 |
| D-24 | Lenis + GSAP ScrollTrigger as the motion layer | User requirement: scroll depth, agency-studio reveals, edgy feel. The brand bans shadows, so depth must come from layering and motion. ADR-012 | 2026-08-03 |
| D-25 | Mock images from `picsum.photos` seeded + `?grayscale`, behind `lib/mock-data/images.ts` | Deterministic (same seed = same photo, so the site does not reshuffle on refresh), no API key, and grayscale suits the vantablack/chrome palette. Hand-written Unsplash photo IDs could not be verified from here and would break site-wide if wrong | 2026-08-03 |
| D-26 | npm with exact pinned versions; no pnpm on this machine | Matches the "pin dependencies" standard; pnpm is not installed | 2026-08-03 |
| D-27 | Two root layouts via top-level route groups: `(site)` and `(admin)` | The admin panel sits outside `[locale]` because it is English-only. Next allows one root layout per top-level group, which is cleaner than forcing the admin under a locale segment | 2026-08-03 |
| D-28 | Mock store lives on the **server**; admin mutations go through Server Actions + `revalidatePath` | A client-side mock would mean the admin writes to browser memory while public Server Components read server memory — two sources of truth that never meet, and the Phase 3 gate would be unachievable. This is also the exact shape Phase 5 uses | 2026-08-03 |
| D-29 | `middleware.ts` → `proxy.ts` | Next 16 renamed the convention; the old name only warns today but is deprecated | 2026-08-03 |
| D-30 | GSAP and Lenis dynamically imported inside effects, never at module scope | Keeps ~50kb of animation library off the critical path and out of the bundle entirely for reduced-motion visitors. Centralised in `useGsapEffect` so no motion component can regress it | 2026-08-03 |
| D-31 | Node's built-in test runner + `tsx`, no test framework | 19 assertions over the pure logic that actually carries risk. Jest/Vitest config is more surface than the tests themselves at this size | 2026-08-03 |
| D-32 | `useReducedMotion` built on `useSyncExternalStore` | matchMedia *is* an external store; the useState+useEffect version caused a setState-in-effect cascade that React's lint rules correctly rejected | 2026-08-03 |

---

## 3. Deliberate Simplifications (known ceilings)

| Simplification | Ceiling | Upgrade path |
|----------------|---------|--------------|
| Search = substring scan over a cached index array | Fine to ~500 items; degrades past that | Swap the repo implementation for a search index (Typesense/Meilisearch) or Postgres |
| KV secondary indexes maintained by hand in a pipeline | A missed index update silently corrupts listings | The write protocol lives in exactly one function (`DATABASE_SCHEMA.md` §7) — never inline it at a call site |
| No cross-entity transactions | Deleting a product orphans its inquiries | Inquiries keep `sourceId` and render "product deleted"; acceptable |
| Sorting limited to indexed scores | Arbitrary-field sort loads the index cache and sorts in memory | Fine at this scale; revisit with the search upgrade |
| Third locale would require a schema migration | `{ en, id }` is a fixed shape | Out of scope; would become `Record<Locale, string>` |
| Mock repo state is per-session, not persisted | Refresh resets Phase 1 data | Intentional — Phase 5 provides persistence |
| Service↔Project link maintained by hand in the repository, not atomically | A mid-pipeline failure can leave one dangling `serviceId` | Reads filter dangling ids; an integrity check script can re-sync (task 5.14) |
| `/pricing` loads all published services and products | Fine at this scale; degrades if either collection reaches the high hundreds | Add a dedicated pricing projection key in KV |
| Two price shapes (`PricingTier` for services, `PriceInfo` for products) | Slightly more surface than one shared type | Deliberate — the offerings are not comparable. Reuse lives in `PriceDisplay`, where the repetition actually is |
| Product has no tiers at all | If a product later needs plans, the schema has nowhere to put them | New ADR + add a tier array deliberately. Do not smuggle one in |

---

## 4. Known Issues / Open Questions

| # | Item | Status |
|---|------|--------|
| Q-01 | Default locale is `en` with `id` as the toggle — brand copy in `brand_guidelines.html` is Indonesian. Confirm `en` is the right default | **Open** |
| Q-02 | Product pricing currency default is `IDR`. Confirm, given products may be sold internationally | **Open** |
| Q-03 | Product `type` list (`web-app`, `mobile-app`, `desktop-app`, `tool`, `template`) is assumed — needs confirmation against real products | **Open** |
| Q-04 | Project categories assumed from the brand's service split (web/app, 3d-animation, packaging, branding) | **Open** |
| Q-05 | Real content (project and product copy, images) not yet available — Phase 1 ships with realistic seed data | Expected |
| Q-06 | Chat channel assumed to be WhatsApp. Confirm vs Telegram/other | **Open** |
| Q-07 | Service list — ~6 capabilities from the brand's own split (web/app development, 3D & animation, packaging, branding, UI/UX, motion) | **Confirmed correct** |
| Q-08 | `/pricing` shows "starting from" figures, not exact fixed rates | **Confirmed** |
| Q-09 | Package naming — fixed Basic / Gold / Premium ladder | **Confirmed** (D-21) |
| ~~Q-10~~ | ~~Unnamed packages?~~ Resolved by the fixed ladder | **Closed** |
| Q-11 | Gold is emphasized by convention. Confirm that is the intended "recommended" tier rather than Premium | **Open, low impact** — one-line change |
| Q-12 | **Bundle budget.** `ARCHITECTURE.md` sets a 150kb gzipped landing budget, but the Next 16 + React 19 shared runtime alone measures ~168kb gzipped. Next 16's Turbopack build no longer prints per-route First Load, so this needs a real Lighthouse run before the budget is either met or rewritten | **Open — budget currently unmet** |
| Q-13 | Accessibility and Lighthouse audits (tasks 4.1–4.3) need a browser; only static checks have been run so far | **Open** |
| Q-14 | Mock media uses picsum URLs entered as text. Phase 5 replaces `MediaInput` with a Vercel Blob uploader | Expected |

None of these block Phase 0.

---

## 5. Conventions Quick Reference

- Tokens: `--color-void #050505` · `--color-graphite #1A1A1A` · `--color-chrome #D9D9D9` · `--color-acid #D4FF00`
- Radius `0`. Shadows `none`. Borders `1px` hairline. Grid cell `40px`.
- Display = Space Grotesk 900 + tracking `-0.05em`. Body/UI = Space Mono.
- Acid is functional only (hover/focus/active/current), never large decorative fills.
- Public routes: `app/[locale]/…` · Admin routes: `app/admin/…` (untranslated)
- IDs: `proj_` / `prod_` / `svc_` / `inq_` / `med_` + nanoid(12)
- Prices live on the entity only. Never in a dictionary, never on `/pricing`, never duplicated into a card.
- Service → `packages: PricingTier[]` keyed by `tier` (basic/gold/premium), 0–3, unique, ladder-ordered, Gold emphasized, + derived `startingPrice`. Product → `price: PriceInfo` (single figure), no tiers.
- Tier labels come from the dictionary (`t.pricing.tier[tier]`) — never stored, never hardcoded in a component.
- No "Buy" anywhere. Every CTA is inquire / request / discuss.
- Data access: **always** through `lib/repo`, never `fetch` in a component

---

## 6. Change Log

| Date | Change |
|------|--------|
| 2026-08-03 | Read `Blueprint.md` + `brand_guidelines.html`; identified the design-system conflict |
| 2026-08-03 | Scope confirmed with the user: Project vs Product, no checkout, full admin panel, Vercel KV |
| 2026-08-03 | Initially documented as English-only; corrected to bilingual EN/ID with a locale toggle |
| 2026-08-03 | Wrote AGENT, BRS, ARCHITECTURE, DATABASE_SCHEMA, API_CONTRACTS, TASKS, PROJECT_MEMORY |
| 2026-08-03 | User flagged missing Services and Pricing. Added the `Service` entity (index + detail), the `/pricing` aggregate page, `PricingTier`, and the Service↔Project reverse index across all 7 docs |
| 2026-08-03 | Briefly modelled pricing as one shared shape for both entities, then corrected: **tiers are service-only**. Products moved to a single `PriceInfo` (D-19) |
| 2026-08-03 | Package naming settled as a fixed **Basic / Gold / Premium** ladder. Reduced the package to `tier` + price + inclusions; labels moved to the dictionary (D-21…D-23, ADR-011) |
| 2026-08-03 | Motion layer added: Lenis + GSAP ScrollTrigger, parallax, pinned sections, line reveals, marquee (D-24, ADR-012) |
| 2026-08-03 | **Phase 0 built** — Next 16, Tailwind v4 tokens from the brand guideline, i18n core, types, Zod schemas, repository seam, mock repo, seed data (8 projects / 6 services / 5 products / 12 inquiries, all EN+ID, all with imagery) |
| 2026-08-03 | **Phases 1–2 built** — UI kit and the full public site in both locales, with SEO, sitemap, robots, and the motion pass |
| 2026-08-03 | **Phase 3 built** — admin panel: mock auth, dashboard, full CRUD for all three entities, inquiry workflow, settings |
| 2026-08-03 | **Phase 4 partial** — extracted `lib/pricing.ts` (killed three copies of the price rules), 19 unit tests, ESLint clean, typecheck clean, build clean. Browser-based checks still outstanding (Q-12, Q-13) |
