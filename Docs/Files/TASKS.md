# TASKS.MD — The Execution Tracker

> Follow this order. No jumping ahead, no random execution.
> Mark `[x]` only when the item actually works — not when the file exists.
> Log every deviation in `PROJECT_MEMORY.md`.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

**Verify everything:** `npm run verify` → typecheck · lint · test · build

---

## PHASE 0 — Foundation ✅

- [x] 0.1 Scaffold Next.js 16 + TypeScript strict + Tailwind v4 + ESLint/Prettier
- [x] 0.2 `styles/tokens.css` — every token from `AGENT.md` §2, mapped into Tailwind `@theme`
- [x] 0.3 Fonts via `next/font/google`: Space Grotesk (400/500/700), Space Mono (400/700)
- [x] 0.4 Grid background (40px hairline) + global base styles + acid selection + custom scrollbar
- [x] 0.5 i18n core: `lib/i18n/config.ts`, `dictionaries/{en,id}.ts`, `get-dictionary.ts`, `dictionary-provider.tsx`, `pick-locale.ts`
- [x] 0.6 `proxy.ts` — locale detection/redirect (cookie → Accept-Language → `en`) + admin guard
- [x] 0.7 `app/(site)/[locale]/layout.tsx` — `<html lang>`, provider, skip link
- [x] 0.8 Types + Zod schemas from `DATABASE_SCHEMA.md` and `API_CONTRACTS.md` §4
- [x] 0.9 `lib/repo/types.ts` — the `Repository<T, TInput>` contract
- [x] 0.10 Mock repository: in-memory store, 500–1500ms latency, `forceFailure()` hook for demoing error states
- [x] 0.11 Seed data — 8 projects, 6 services, 5 products, 12 inquiries, all EN+ID, all with imagery; includes a draft project, a draft product, a draft service, a quote-only service, a partial ladder, and a null-priced product
- [x] 0.12 `lib/repo/index.ts` switching on `NEXT_PUBLIC_DATA_SOURCE`
- [x] 0.13 `.env.example` with the four Phase 1 vars
- [x] 0.14 Verify: `tsc --noEmit` + `next build` clean

**Gate:** ✅ repository callable and returning seeded data in both locales.

---

## PHASE 1 — UI Kit ✅

- [x] 1.1 `Button` — variants `primary` / `outline` / `ghost` / `danger`; sizes sm/md/lg; loading disables and swaps the label; real focus ring
- [x] 1.2 `Input`, `Textarea`, `Select` — label, hint, error, `aria-describedby`, `aria-invalid`
- [x] 1.3 `Dialog` + `ConfirmDialog` (Radix, restyled, focus-trapped)
- [x] 1.4 `Toaster` + `toast` helper — success/error/info/warning, keyboard dismissible, `aria-live`; errors persist until dismissed
- [x] 1.5 `Skeleton`, `EmptyState`, `ErrorState` (with retry) — the three non-success states, once, reused everywhere
- [x] 1.6 `Badge`, `Accordion`, `SectionHeading`, `MediaFrame`, `FilterBar`
- [x] 1.6a `PriceDisplay` — `Intl.NumberFormat`, `null` → "Contact us", period/unit suffix, locale-correct
- [x] 1.6b `PricingTierCard` — service-only; label from the dictionary; Gold emphasized; CTA opens the inquiry dialog
- [x] 1.6c `ProcessSteps` — numbered stepper, hairline connectors, ordered list for assistive tech
- [x] 1.7 `EntityTable` — admin list with status, reorder, edit, delete + confirm
- [x] 1.8 `MediaInput` — URL + alt + dimensions + preview (Phase 5 replaces it with a real uploader)
- [x] 1.9 `useReducedMotion` — built on `useSyncExternalStore`
- [x] 1.9a `SmoothScrollProvider` — one Lenis instance driving the GSAP ticker; skipped entirely under reduced motion; dynamically imported
- [x] 1.9b `Reveal` / `RevealLines` — scoped `gsap.context()`, fires once, line-level splitting only
- [x] 1.9c `Parallax` + `PinnedSection` — differential speeds and scrubbed pinning; refresh on route change and image load
- [x] 1.9d Leak safety: every animation reverts its context on unmount (centralised in `useGsapEffect`)
- [ ] 1.10 Kit review page at `/dev/kit` showing every component in every state — **skipped**; the real pages exercise every component, and a second surface to maintain was not worth it. Add if the kit grows.

**Gate:** ✅ primitives keyboard-operable and brand-correct. Zero rounded corners, zero shadows (verified by grep).

---

## PHASE 2 — Public Site ✅

- [x] 2.1 `Nav` — 1px bottom hairline, scroll state, mobile drawer, active-route indicator in acid
- [x] 2.2 `LocaleToggle` — preserves path + query, writes the cookie, in nav and footer, Suspense-wrapped
- [x] 2.3 `Footer` — logo, nav, socials, contact, legal line
- [x] 2.4 Home — hero line reveal, capability marquee, services, pinned case study, more work, products, pricing teaser, CTA
- [x] 2.5 Work index — editorial grid (every third card spans), category filter, search, sort; filters in URL params
- [x] 2.6 Work detail — hero, meta strip, challenge → solution → outcome pinned against a parallax gallery, results, stack, linked services, next project
- [x] 2.6a Services index — capability cards with icon, tagline, starting price, timeline
- [x] 2.6b **Service detail** — hero with derived starting price, description, deliverables, process, packages, tools, related projects (reverse lookup), FAQ, related services
- [x] 2.6c **`/pricing`** — service packages grouped by service, product licensing rows, engagement FAQ, closing CTA; reads the repos, owns no prices
- [x] 2.7 Products index — cards with status badge, status filter
- [x] 2.8 **Product detail** — hero + single price + one CTA, gallery, description, feature grid, spec table, FAQ, changelog, related products
- [x] 2.9 About — persona, capabilities, principles, marquee
- [x] 2.10 Contact — direct channels first, then the inquiry form
- [x] 2.11 `InquiryDialog` — shared, carries `{ sourceType, sourceId, sourceTier }`, used from project, service package, product, and pricing CTAs
- [x] 2.12 `not-found.tsx` + `error.tsx`, both brand-styled and localized
- [x] 2.13 SEO — per-page metadata, OG tags, `alternates.languages`, `sitemap.ts`, `robots.ts`
- [x] 2.14 Responsive layout written mobile-first at every breakpoint — **visual check still pending in a browser (see 4.1)**
- [x] 2.15 Motion pass — hero line reveal, drifting grid, differential parallax, pinned scrub, `clip-path` wipes, marquee
- [x] 2.15a Reduced-motion path: Lenis never initialises, GSAP is never fetched, `[data-reveal]` CSS fallback guarantees final state

**Gate:** ✅ every public route builds and prerenders in both locales; no hardcoded public strings; every price traceable to one entity field.

---

## PHASE 3 — Admin Panel (English only) ✅

- [x] 3.1 `/admin/login` — mock auth, HTTP-only cookie, redirect on success, error state
- [x] 3.2 Route guard in `proxy.ts` for `/admin/*` (except `/admin/login`)
- [x] 3.3 `AdminShell` — sidebar, mobile drawer, active state, sign out, view site
- [x] 3.4 Dashboard — counts by entity with draft badges, recent inquiries, recently edited, quick actions
- [x] 3.5 Projects list — `EntityTable`, status, featured, reorder, edit, delete
- [x] 3.6 `LocalizedField` — EN/ID tabs on one field with a missing-translation marker
- [x] 3.7 Project create/edit — all fields, results/stack repeaters, service picker, media inputs, draft/publish
- [x] 3.8 Project delete — `ConfirmDialog` naming the record, toast on success
- [x] 3.9 Project reorder — keyboard-operable up/down controls
- [x] 3.9a Services list — with derived starting price shown
- [x] 3.9b Service create/edit — deliverables, process steps (auto-renumbered), `PackageEditor`, FAQ, related services; `startingPrice` read-only and derived
- [x] 3.9c Service delete — confirm dialog **states how many projects will be unlinked**
- [x] 3.9d Project form: multi-select service picker writing `serviceIds`
- [x] 3.10 Products list — with price and availability
- [x] 3.11 Product create/edit — single price group (no tier editor), features, specs, FAQ, changelog, related products
- [x] 3.12 Inquiries — list with status filters and counts, detail (auto-marks read once), status workflow, mailto reply, delete
- [x] 3.14 Settings — studio details, socials, SEO defaults
- [x] 3.15 Admin-wide: every mutation toasts, every destructive action confirms
- [ ] 3.13 Media library — **deferred to Phase 5.** There is no blob storage yet; a fake uploader that loses the file on refresh would be worse than the honest URL field `MediaInput` provides.

**Gate:** ✅ create → edit → publish → reorder → delete works for all three entities via Server Actions, with `revalidatePath` so the public site reflects it immediately.

---

## PHASE 4 — Quality Gate (before any backend work)

- [ ] 4.1 Accessibility audit — axe clean, full keyboard walkthrough, contrast verified, reduced motion verified **(needs a browser)**
- [ ] 4.2 Lighthouse — LCP < 2.5s, CLS < 0.1, INP < 200ms on Work and Product detail **(needs a browser)**
- [!] 4.3 Bundle check — **currently failing.** The Next 16 + React 19 shared runtime alone measures ~168kb gzipped against a 150kb budget. Next 16's Turbopack build no longer prints per-route First Load, so this needs a real Lighthouse measurement before the budget is either met or rewritten. See `PROJECT_MEMORY.md` Q-12.
- [x] 4.4 `id.ts` dictionary complete (enforced by the type system); no hardcoded public strings
- [x] 4.5 Unit tests — 19 assertions: `pickLocale` fallback, `startingPrice` derivation (incl. all-null and zero), tier ordering + immutability, `formatPrice` null-vs-zero, slug generation
- [ ] 4.6 Playwright end-to-end — **not written.** Needs a browser runner; the flows to cover are listed in `PROJECT_MEMORY.md`.
- [x] 4.7 Self-audit against `AGENT.md` §6 — no TODOs, no native alerts, no rounded corners, no shadows, no `console.log`, no component importing `lib/repo/mock` directly
- [ ] 4.8 Deploy the mock build to Vercel preview for review

**Gate:** stakeholder sign-off on the mock site. Do not start Phase 5 before this.

---

## PHASE 5 — Backend: Vercel KV

- [ ] 5.1 Provision Vercel KV; wire `KV_REST_API_URL` / `KV_REST_API_TOKEN`
- [ ] 5.2 `lib/repo/kv/keys.ts` — the key map from `DATABASE_SCHEMA.md` §7 as typed builders
- [ ] 5.3 Pipelined write protocol (entity + slug pointer + all index sets + search cache) — **one function owns it**
- [ ] 5.4 Seed script: migrate the Phase 1 mock data into KV
- [ ] 5.5 Public Route Handlers: projects, products, services, `/pricing`, settings
- [ ] 5.6 `POST /api/v1/inquiries` — Zod, honeypot, elapsed-time, KV rate limit replacing the in-memory one
- [ ] 5.7 Auth: `jose` JWT, HTTP-only cookie, login rate limit, replacing the mock in `app/actions/auth.ts`
- [ ] 5.8 Admin Route Handlers: projects, products, services, inquiries, settings, reorder, status
- [ ] 5.8a Cross-entity write logic: `service:{id}:projects` reverse index; service delete unlinks `serviceIds` and reports the count; `startingPrice` recomputed server-side
- [ ] 5.9 Vercel Blob upload endpoint with magic-byte validation, replacing `MediaInput` (closes 3.13)
- [ ] 5.10 Resend: studio notification + localized auto-reply
- [ ] 5.11 `lib/repo/kv/*` implementing `Repository<T>`; flip `NEXT_PUBLIC_DATA_SOURCE=kv`
- [ ] 5.12 **Verify no component file changed in this phase** — if one did, the seam leaked; fix the seam
- [ ] 5.13 Cache tags + revalidation on write; ISR verified
- [ ] 5.14 Index-integrity test: unpublish → confirm the item leaves every set; delete a service → confirm no project keeps a dangling `serviceId`

**Gate:** identical behaviour to Phase 1 with real persistence, and the diff touches only `lib/repo/kv/*`, `app/api/*`, `app/actions/auth.ts`, and `proxy.ts`.

---

## PHASE 6 — Production

- [ ] 6.1 Security headers: CSP with nonce, HSTS, `X-Content-Type-Options`, `Referrer-Policy`, `Permissions-Policy`
- [ ] 6.2 GitHub Actions: `npm run verify`
- [ ] 6.3 KV backup/export script
- [ ] 6.4 Real content entered through the admin panel
- [ ] 6.5 Custom domain, analytics, final Lighthouse and axe pass
- [ ] 6.6 `README.md` — setup, env vars, deployment, admin guide
