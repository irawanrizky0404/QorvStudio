# AGENT.MD — The Supreme Law

> Highest-priority document. When any other document, library default, or generated
> snippet conflicts with this file, **this file wins**.
> Visual authority: `Docs/brand_guidelines.html`. Scope authority: `Docs/BRS.md`.
> Execution order: `Docs/TASKS.md`.

---

## 0. Project Identity

| Key | Value |
|-----|-------|
| Product | QORV Studio — agency website + admin panel |
| Language | Bilingual public site: `en` (default) + `id`, locale toggle. Admin panel is English-only |
| Phase model | Phase 1 frontend + mock data → Phase 2 Vercel KV backend |
| Entities | `Project` (portfolio / client work), `Product` (apps QORV sells), `Service` (what QORV does for hire), `Inquiry` |
| Pricing | Services have packages; products have one indicative price. All of it is **informational** — every CTA is an inquiry. `/pricing` is an aggregate view that owns no data of its own |
| Commerce | **No payment gateway, no checkout, no cart.** Every buy/hire/plan CTA opens an inquiry form (email) or chat link |

---

## 1. Strict Directives

### 1.1 No Placeholders
- Forbidden: `// TODO`, `// implement later`, empty function bodies, `return null` as a stand-in.
- Every button, form, filter, sort, and link must execute real logic against the data layer.
- No dead links. If a page does not exist yet, create the route with real working content.

### 1.2 CRUD Must Actually Work
- Project, Product, and Service admin screens must support **create, read, update, delete** end to end in Phase 1, against the mock repository, with data persisting for the session.
- List views must support search, category filter, and sort.
- Delete requires a confirmation modal (never `window.confirm`).

### 1.3 Data Access Goes Through The Repository
- UI **never** touches `fetch`, `localStorage`, or a mock array directly.
- All reads/writes go through `lib/repo/*` (`projectRepo`, `productRepo`, `serviceRepo`, `inquiryRepo`).
- Phase 1 implementation = in-memory mock + artificial latency. Phase 2 swaps the implementation only. **A component file must not change when the backend lands.**

### 1.4 Four States, Always
Every data-driven surface renders all four:
`loading` (skeleton, brand-styled) · `success` · `error` (with retry action) · `empty` (with a next action).

### 1.5 Notifications
- Banned: `alert()`, `confirm()`, `prompt()`.
- One shared `Toast` system + one shared `ConfirmDialog`. Used for every save, delete, error, and warning across the entire app.

### 1.6 Zero Regression / Anti-Hallucination
- Only add what was asked. Do not silently refactor unrelated code.
- Never import a file, component, or package that does not exist in the repo.
- Prefer platform/native and already-installed deps over adding a new package.

### 1.7 Navigation Is Never Disabled
- Never comment out `router.push`, `redirect()`, or a form submit to "avoid errors". Let a 404 happen; then build the missing page.

### 1.8 Code Delivery
- First line of every code block = the file path.
- All imports at the top, complete.
- No hardcoded secrets. Env vars only, and state loudly when a new env var is required.

---

## 2. Design Tokens (derived from brand_guidelines.html — non-negotiable)

```css
/* styles/tokens.css */
:root {
  /* Color — the anti-generic palette */
  --color-void:      #050505;  /* primary base / page background */
  --color-graphite:  #1A1A1A;  /* alternating section surface */
  --color-chrome:    #D9D9D9;  /* typography & mesh */
  --color-acid:      #D4FF00;  /* kinetic accent — interactive only */
  --color-danger:    #EF4444;  /* destructive actions only */

  --border-hairline: rgba(217, 217, 217, 0.20);
  --border-active:   rgba(212, 255, 0, 0.50);
  --text-muted:      rgba(217, 217, 217, 0.70);
  --text-faint:      rgba(217, 217, 217, 0.40);

  /* Type */
  --font-display: 'Space Grotesk', sans-serif;  /* 400 / 700 / 900 */
  --font-mono:    'Space Mono', monospace;      /* 400 / 700 — body + UI */

  --tracking-logo:   -0.06em;
  --tracking-tight:  -0.05em;
  --tracking-widest:  0.25em;   /* uppercase labels */
  --leading-logo: 0.8;

  /* Geometry — industrial, not rounded */
  --radius: 0px;
  --border-width: 1px;
  --shadow: none;
  --grid-cell: 40px;

  /* Motion */
  --duration-fast:   150ms;
  --duration-normal: 300ms;
  --duration-slow:   500ms;
  --ease: cubic-bezier(0.16, 1, 0.3, 1);
}
```

### Hard visual rules
- **Radius is 0.** No rounded cards, no pill buttons. Overrides the generic radius scale in `Blueprint.md` §8.4.
- **No drop shadows.** Depth comes from 1px hairline borders, overlap, and the 40px grid background.
- **Acid Radium is functional, not decorative** — hover, focus, active, selection, current-state, and section index numbers. Never large filled areas of acid.
- **Uppercase + `--tracking-widest`** for all micro-labels, nav items, and metadata.
- **Space Grotesk 900 + `--tracking-tight`** for display headings; sizes may use `vw` for hero scale.
- **Space Mono is the body and UI font** — it carries the "software studio" identity. Do not substitute Inter (overrides `Blueprint.md` §8.3).
- Selection style: `selection:bg-acid selection:text-void`.
- Wireframe-first: reveal mesh/dashed/outline states before solid fills; dashed borders are a legitimate hover treatment.

### Motion & depth rules
Depth is the whole point — the brand has no shadows, so layering has to come from movement and overlap.

- **One Lenis instance**, created in the locale layout and exposed via context. Never a second instance, never one per page.
- **GSAP contexts are scoped and reverted.** Every animation lives in a `gsap.context()` tied to a ref, cleaned up on unmount. A leaked ScrollTrigger after client navigation is the failure mode here.
- Animate `transform` / `opacity` / `clip-path` only. Never animate `top`, `height`, `margin`, or `font-size`.
- **Depth vocabulary:** differential parallax speeds between layers, section pinning with scrubbed content, `clip-path` wipes on media, staggered line-by-line reveals on display type, and the 40px grid drifting slower than the content above it.
- Reveals trigger **once** (`toggleActions: 'play none none none'`) — content must not re-hide when scrolled back. Nothing important may depend on an animation to become readable.
- Text reveals split by **line, not character** — per-character splitting wrecks screen readers and text selection. Wrap lines in a masked container and translate.
- `will-change` only on elements currently animating; remove it after.
- No motion may block interaction: links and buttons stay clickable throughout, and no scroll-jacking that traps the user in a section.
- ScrollTrigger must be refreshed after locale change and after images load, or trigger positions drift.

### Pricing display rules
- **Services have packages (`PricingTier[]`). Products do not** — a product has one indicative `PriceInfo`. Never add a tier array to a product; if one is ever needed, that is a new decision, not a quiet field.
- Service packages use a **fixed three-step ladder: Basic → Gold → Premium.** `tier` is the identity; there is no id and no per-service package name.
- **Tier labels live in the i18n dictionary, never in the database.** A package renders its label via `t.pricing.tier[pkg.tier]`. Never hardcode "Basic"/"Gold"/"Premium" in a component, and never store them on the entity.
- Packages always render in ladder order via `TIER_RANK`, regardless of array order. **Gold is always the emphasized card** — there is no highlighted flag.
- A service may offer any subset of the three (Basic + Gold only is valid). Zero packages → a single "request a quote" CTA.
- `price: null` / `startingPrice: null` renders as "Contact us" — never "Free", never "0", never an empty cell.
- Prices render through `Intl.NumberFormat(locale, { currency })` — no manual string building, no hardcoded "Rp".
- Every CTA opens the inquiry dialog carrying `{ sourceType, sourceId, sourceTier }`. **Nothing may link to a checkout, cart, or payment URL.** There is no "Buy" label anywhere — the verb is inquire, request, or discuss.
- `/pricing` renders from `serviceRepo` and `productRepo`. It must not introduce a separate pricing store, and a price must never be duplicated into a dictionary file.
- `Service.startingPrice` is **derived** from `packages` — read-only in the admin UI.

---

## 3. Component Registry

Only these are allowed as dependencies. Anything else needs an explicit decision recorded in `PROJECT_MEMORY.md`.

| Concern | Choice |
|---------|--------|
| Framework | Next.js 16 (App Router), React Server Components |
| Language | TypeScript, `strict: true`, no `any` |
| Styling | Tailwind CSS v4, CSS-first `@theme` mapped to the tokens above |
| Primitives | Radix UI headless — **fully restyled**, zero shadcn default look |
| Icons | `lucide-react`, always `aria-hidden` when decorative, `strokeWidth={1.5}` |
| Client state | Zustand (UI only: modals, filters, toasts, sidebar) |
| Server state | SWR through the repository layer |
| Forms | React Hook Form + Zod resolver |
| Validation | Zod — shared schema between form and API |
| Fonts | `next/font/google` — Space Grotesk, Space Mono |
| i18n | Hand-rolled typed dictionaries + `Intl.*`. **No i18n package** |
| Smooth scroll | `lenis` — one instance, mounted once in the locale layout |
| Scroll animation | `gsap` + `ScrollTrigger` — pinning, scrub, parallax, staggered reveals |

Shared components that must exist exactly once and be reused everywhere:
`Button`, `Input`, `Textarea`, `Select`, `Checkbox`, `Switch`, `Tabs`, `Accordion`, `Dialog`, `ConfirmDialog`, `Toast`/`Toaster`, `DataTable`, `Badge`, `Skeleton`, `EmptyState`, `ErrorState`, `Pagination`, `FileDropzone`, `SectionHeading`, `GridBackground`, `PricingTierCard`, `PriceDisplay`, `ProcessSteps`.

`PriceDisplay` is written **once** and used by service packages, product cards, product detail, and `/pricing` — it owns the `Intl` formatting and the `null → "Contact us"` rule. `PricingTierCard` is service-only (service detail + `/pricing`). Duplicated price-formatting logic is the failure mode to avoid.

---

## 3a. Localization Law

- Locales: `en` (default) and `id`. Type: `type Locale = 'en' | 'id'`.
- **No i18n package.** Dictionaries are typed objects in `lib/i18n/dictionaries/{en,id}.ts`; `id.ts` must satisfy the type derived from `en.ts`, so a missing key is a build error.
- Public routes live under `app/[locale]/`. `middleware.ts` redirects `/` to the preferred locale (cookie → `Accept-Language` → `en`). The chosen locale is persisted in a cookie.
- Server components read copy via `getDictionary(locale)`. Client components read it via `useDictionary()` from a provider mounted in the locale layout. **Never import a dictionary file directly into a component.**
- Admin routes live under `app/admin/` — outside `[locale]`, English only. Do not translate admin UI.
- **Never hardcode a user-visible string in a public component.** Every string comes from the dictionary.
- Dynamic content (project/product titles, descriptions, etc.) is stored per-locale as `{ en: string; id: string }`. Read it with `pickLocale(field, locale)`, which falls back to `en` when the `id` value is empty. Admin editors expose EN/ID tabs per localized field; **`en` is required, `id` is optional**.
- Locale-correct output: dates via `Intl.DateTimeFormat(locale)`, numbers/prices via `Intl.NumberFormat`. No manual date string building.
- SEO: every public page emits `alternates.languages` for both locales plus `hreflang`, and `<html lang>` matches the active locale.
- The locale toggle must preserve the current path and query — switching language never dumps the user on the home page.

---

## 4. Code Quality

- Max function length 50 lines; max file length 300 lines. Split, don't stretch.
- Max 3 levels of nesting — use early returns.
- Named exports for components. No default exports except Next.js `page`/`layout`/`route` files.
- Explicit return types on exported functions.
- `const` over `let`. Never mutate props, state objects, or arrays in place.
- Import order: react/next → third-party → components → lib/hooks → types.
- No `console.log` in committed code; use `lib/logger.ts`.
- Every `catch` handles the error meaningfully — logs context **and** surfaces an actionable message. No silent failures.

---

## 5. Accessibility (WCAG 2.1 AA — not optional)

- Contrast: chrome `#D9D9D9` on void `#050505` passes AA. **Acid `#D4FF00` on void also passes, but chrome or void text on an acid fill must be void (`#050505`) only** — never chrome-on-acid.
- Focus ring: `2px solid var(--color-acid)` with `2px` offset, visible on every interactive element. Never `outline: none` without a replacement.
- Full keyboard operability; Radix handles focus trap in dialogs — do not bypass it.
- Semantic landmarks: `header` / `nav[aria-label]` / `main` / `footer`. Heading levels never skip.
- All images have `alt`; decorative images `alt=""`.
- Icon-only buttons require `aria-label`.
- Form errors linked via `aria-describedby`; invalid fields get `aria-invalid`.
- Touch targets ≥ 44×44px.
- Honour `prefers-reduced-motion`: **Lenis must not initialise at all** (native scroll), ScrollTrigger reveals resolve immediately to their final state, parallax and pinning are skipped. Keep opacity fades ≤ 150ms. A reduced-motion visitor must still see every element in its finished position — never stranded at `opacity: 0`.
- Skip-to-content link as the first focusable element.

---

## 6. Pre-Flight Audit (run before every response that ships code)

1. Any `// TODO`, stub, or empty handler left behind?
2. Any dead link, disabled `router.push`, or commented-out submit?
3. Does every data surface handle loading / error / empty?
4. Any native `alert`/`confirm`? Any raw `fetch` inside a component?
5. Any invented import or package not in the registry?
6. Rounded corners, drop shadows, or Inter sneaking in?
7. Focus states and `aria-label`s present?
8. Any hardcoded user-visible string in a public component instead of a dictionary key? Is `id.ts` still complete?
9. Any checkout, cart, or payment affordance implied by the UI? (There is none — CTAs are inquiries.)
10. New env var required — did I say so explicitly?
