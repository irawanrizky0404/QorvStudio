# API_CONTRACTS.MD — The Bridge

> Phase 2 surface. In Phase 1 the mock repository implements these exact signatures
> and shapes in memory, so the frontend never learns which one it is talking to.

---

## 1. Conventions

| Aspect | Standard |
|--------|----------|
| Base | `/api/v1` |
| Transport | HTTPS, `application/json` |
| Auth | Admin routes require the `qorv_session` HTTP-only cookie |
| Public routes | `GET` of published content + `POST /inquiries` only |
| Validation | Zod on every request body and query — parse, never trust |
| Casing | camelCase in JSON, kebab-case in paths |
| Pagination | `?page` + `?perPage` (default 12, max 50) |
| Locale | Responses return **both locales**; the client picks. Localized fields stay `{ en, id }` |
| Tier labels | Never returned by the API. `tier` is a key; "Basic"/"Gold"/"Premium" come from the client dictionary |

### Response envelope

```jsonc
// success
{ "success": true, "data": { }, "meta": { "page": 1, "perPage": 12, "total": 34, "hasMore": true } }

// error
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Human-readable description.",
    "details": [{ "field": "title.en", "message": "Required", "code": "invalid_type" }],
    "requestId": "req_9f2c1a"
  }
}
```

| Status | Code | When |
|--------|------|------|
| 400 | `VALIDATION_ERROR` | Zod parse failed |
| 401 | `UNAUTHORIZED` | Missing or invalid session |
| 403 | `FORBIDDEN` | Authenticated but not permitted |
| 404 | `NOT_FOUND` | No such id or slug |
| 409 | `CONFLICT` | Slug already taken |
| 429 | `RATE_LIMITED` | Inquiry or login throttle tripped |
| 500 | `INTERNAL_ERROR` | Unexpected; details never leaked to the client |

---

## 2. Public Endpoints

### `GET /api/v1/projects`
Query: `category`, `search`, `year`, `sort` (`recent|oldest|title|manual`, default `manual`), `page`, `perPage`, `featured`.
Returns published projects only. `data` = `Project[]`, `meta` = pagination.

### `GET /api/v1/projects/:slug`
Returns one published `Project`. 404 when draft or missing. Follows `redirect:{oldSlug}` and responds `308` with the new location.

### `GET /api/v1/services`
Query: `search`, `sort`, `page`, `perPage`, `featured`.
Returns published services. Card-level payload — omits `process`, `faqs`, and `description`, but **keeps `startingPrice` and `currency`** so cards can show a price without a second request.

### `GET /api/v1/services/:slug`
Full `Service` including `packages`, `process`, `deliverables`, `tools`, `faqs`, resolved `relatedServices` (card-level), and `relatedProjects` (card-level, resolved from `service:{id}:projects`).

### `GET /api/v1/pricing`
Composed response for the `/pricing` page. Owns no data — it reads services and products.

```jsonc
{
  "success": true,
  "data": {
    "services": [ { "id", "slug", "name", "tagline", "icon", "currency", "packages": [ /* PricingTier[] */ ] } ],
    "products": [ { "id", "slug", "name", "tagline", "productStatus", "price": { /* PriceInfo */ } } ]
  }
}
```

Published entities only. The two shapes differ on purpose: **services carry a package array, products carry one indicative price.** A service with zero packages is still returned with an empty array — the UI renders a "request a quote" card rather than hiding the offering.

### `GET /api/v1/products`
Query: `type`, `productStatus`, `search`, `sort`, `page`, `perPage`, `featured`.
Returns published products. Card-level payload — omits `changelog`, `faqs`, and `description` to keep the index light, but keeps `price` so cards can show it without a second request.

### `GET /api/v1/products/:slug`
Full `Product` including `features`, `price`, `platforms`, `techStack`, `integrations`, `requirements`, `faqs`, `changelog`, and resolved `relatedProducts` (card-level).

### `POST /api/v1/inquiries`
The only public write. Rate limited to **3 per IP per 10 minutes**.

```ts
export const inquiryInputSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.string().email(),
  company: z.string().max(120).nullable().default(null),
  phone: z.string().max(30).nullable().default(null),
  subject: z.string().min(3).max(140),
  message: z.string().min(10).max(4000),
  budgetRange: z.enum(['<10m', '10-50m', '50-200m', '200m+', 'undecided']).nullable().default(null),
  sourceType: z.enum(['contact', 'project', 'product', 'service', 'pricing']),
  sourceId: z.string().nullable().default(null),      // project | product | service id
  sourceTier: tierSchema.nullable().default(null),    // basic | gold | premium — the budget signal.
                                                      // Always null for product/contact sources
  locale: z.enum(['en', 'id']),
  // anti-spam — both server-checked, never shown to the user
  website: z.string().max(0),                 // honeypot: must be empty
  elapsedMs: z.number().int().min(2000),      // sub-2s submits are bots
});
```

Response `201` → `{ id, createdAt }`. Side effects: notification email to the studio, auto-reply to the sender in the submitted locale.
**No payment, checkout, or order is ever created by this endpoint.**

### `GET /api/v1/settings`
Public subset: studio name, tagline, email, whatsapp, socials, SEO defaults.

---

## 3. Admin Endpoints

All under `/api/v1/admin`, all require a valid session, all `Cache-Control: no-store`.

### Auth
| Method | Path | Body / Notes |
|--------|------|--------------|
| `POST` | `/auth/login` | `{ email, password }` → sets `qorv_session`. Rate limited 5 / 15 min per IP |
| `POST` | `/auth/logout` | Clears the cookie |
| `GET` | `/auth/session` | `{ authenticated: boolean, email? }` |

### Projects
| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/projects` | Includes drafts. Same query params, plus `status` |
| `GET` | `/projects/:id` | By id, not slug |
| `POST` | `/projects` | `projectInputSchema` → `201` |
| `PATCH` | `/projects/:id` | `projectInputSchema.partial()` |
| `DELETE` | `/projects/:id` | `204`. Removes entity, slug pointer, and every index membership |
| `PATCH` | `/projects/:id/status` | `{ status: 'draft' \| 'published' }` |
| `PATCH` | `/projects/reorder` | `{ ids: string[] }` — full ordered list |

### Services
Identical set under `/services` (`GET` list incl. drafts, `GET :id`, `POST`, `PATCH`, `DELETE`, `PATCH :id/status`, `PATCH reorder`).

- `DELETE /services/:id` also strips the id from `serviceIds` on every referencing project (`DATABASE_SCHEMA.md` §7). The response reports how many projects were touched: `{ "unlinkedProjects": 4 }` — the admin UI must warn about this count in the confirm dialog **before** deleting.
- `startingPrice` is recomputed server-side on every write. A client-supplied value is ignored, not rejected.
- `packages`, `process`, and `faqs` are edited through the parent `PATCH` — no sub-resources.

### Products
Identical set under `/products`, plus:
| Method | Path | Notes |
|--------|------|-------|
| `PATCH` | `/products/:id/status` | `{ status }` (publish state) and/or `{ productStatus }` (available/beta/coming-soon) |

Nested collections (`features`, `faqs`, `changelog`, and a service's `packages` / `process`) are **edited as part of the parent `PATCH`**, not via sub-resources — they have no independent lifecycle and KV stores them inside the parent document.

### Inquiries
| Method | Path | Notes |
|--------|------|-------|
| `GET` | `/inquiries` | Query `status`, `sourceType`, `search`, `page` |
| `GET` | `/inquiries/:id` | Marks `read` on first fetch |
| `PATCH` | `/inquiries/:id` | `{ status }` |
| `DELETE` | `/inquiries/:id` | `204` |

### Media
| Method | Path | Notes |
|--------|------|-------|
| `POST` | `/media/upload` | multipart. Max 8MB. `image/jpeg\|png\|webp\|avif` only — validated by magic bytes, not by the declared MIME type. Returns `MediaRef` |
| `GET` | `/media` | Paginated list |
| `DELETE` | `/media/:id` | Deletes the blob and the index entry |

### Settings
`GET /settings` · `PATCH /settings`

---

## 4. Shared Zod Schemas

`lib/schemas/*` is imported by both the form (via `zodResolver`) and the Route Handler. One definition, two consumers — a field can never validate differently on the client and the server.

```ts
// lib/schemas/shared.ts
export const localizedSchema = z.object({
  en: z.string().min(1, 'English text is required'),
  id: z.string().default(''),          // optional; falls back to en at render
});

export const localizedOptionalSchema = z.object({
  en: z.string().default(''),
  id: z.string().default(''),
});

export const mediaRefSchema = z.object({
  url: z.string().url(),
  alt: localizedOptionalSchema,
  width: z.number().int().positive(),
  height: z.number().int().positive(),
  caption: localizedOptionalSchema.optional(),
});

export const slugSchema = z.string()
  .min(2).max(80)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'Lowercase letters, numbers, and hyphens only');

export const faqItemSchema = z.object({
  id: z.string(),
  question: localizedSchema,
  answer: localizedSchema,
});

export const TIER_RANK = { basic: 0, gold: 1, premium: 2 } as const;
export const tierSchema = z.enum(['basic', 'gold', 'premium']);

/**
 * SERVICE ONLY. Products have no tiers — they use priceInfoSchema below.
 * `tier` is the identity: no id, no stored name. Labels live in the i18n dictionary.
 * Carries no payment identifier; every CTA opens an inquiry.
 */
export const pricingTierSchema = z.object({
  tier: tierSchema,
  price: z.number().nonnegative().nullable(),          // null → "Contact us"
  currency: z.enum(['IDR', 'USD']).default('IDR'),
  period: z.enum(['one-time', 'monthly', 'yearly', 'project']).default('one-time'),
  description: localizedOptionalSchema,
  includes: z.array(localizedSchema).max(20).default([]),
});

/** 0–3 packages, one per tier. Stored and returned in ladder order. */
export const pricingTiersSchema = z.array(pricingTierSchema).max(3).default([])
  .refine(t => new Set(t.map(x => x.tier)).size === t.length, 'Each tier may appear only once')
  .transform(t => [...t].sort((a, b) => TIER_RANK[a.tier] - TIER_RANK[b.tier]));

/** PRODUCT ONLY. One indicative price, no tiers. */
export const priceInfoSchema = z.object({
  startingPrice: z.number().nonnegative().nullable(),  // null → "Contact us"
  currency: z.enum(['IDR', 'USD']).default('IDR'),
  unit: z.enum(['project', 'month', 'year', 'license', 'day']).default('license'),
  note: localizedOptionalSchema,
});
```

```ts
// lib/schemas/project.ts
export const projectInputSchema = z.object({
  slug: slugSchema,
  title: localizedSchema,
  client: z.string().min(1).max(120),
  category: z.enum(['web-app', 'mobile-app', '3d-animation', 'packaging', 'branding']),
  year: z.number().int().min(2000).max(2100),
  summary: localizedSchema.refine(v => v.en.length <= 200, 'Max 200 characters'),
  cover: mediaRefSchema,
  gallery: z.array(mediaRefSchema).max(24).default([]),
  challenge: localizedSchema,
  solution: localizedSchema,
  outcome: localizedSchema,
  results: z.array(z.object({ label: localizedSchema, value: z.string().max(24) })).max(6).default([]),
  serviceIds: z.array(z.string()).max(12).default([]),
  stack: z.array(z.string()).max(20).default([]),
  role: localizedOptionalSchema,
  durationMonths: z.number().int().positive().nullable().default(null),
  liveUrl: z.string().url().nullable().default(null),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  seo: z.object({
    title: localizedOptionalSchema,
    description: localizedOptionalSchema,
    ogImage: z.string().url().nullable().default(null),
  }).default({ title: { en: '', id: '' }, description: { en: '', id: '' }, ogImage: null }),
});

export type ProjectInput = z.infer<typeof projectInputSchema>;
```

```ts
// lib/schemas/service.ts
export const processStepSchema = z.object({
  id: z.string(),
  step: z.number().int().positive(),
  title: localizedSchema,
  description: localizedSchema,
  durationLabel: localizedOptionalSchema,
});

export const serviceInputSchema = z.object({
  slug: slugSchema,
  name: localizedSchema,
  tagline: localizedSchema.refine(v => v.en.length <= 100, 'Max 100 characters'),
  icon: z.string(),                       // validated against the lucide allowlist
  cover: mediaRefSchema,
  gallery: z.array(mediaRefSchema).max(24).default([]),
  description: localizedSchema,
  deliverables: z.array(localizedSchema).max(20).default([]),
  process: z.array(processStepSchema).max(12).default([])
    .refine(
      steps => steps.every((s, i) => s.step === i + 1),
      'Process steps must be numbered contiguously from 1',
    ),
  tools: z.array(z.string()).max(20).default([]),
  packages: pricingTiersSchema,           // service-only — see lib/schemas/shared.ts
  currency: z.enum(['IDR', 'USD']).default('IDR'),
  timelineLabel: localizedOptionalSchema,
  faqs: z.array(faqItemSchema).max(20).default([]),
  relatedServiceIds: z.array(z.string()).max(6).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  seo: projectInputSchema.shape.seo,
});
// NOTE: `startingPrice` is intentionally absent — it is derived server-side
// from `packages` on every write. See DATABASE_SCHEMA.md §4a.

export type ServiceInput = z.infer<typeof serviceInputSchema>;
```

```ts
// lib/schemas/product.ts — pricing carries no payment identifiers by design
export const productInputSchema = z.object({
  slug: slugSchema,
  name: localizedSchema,
  tagline: localizedSchema,
  type: z.enum(['web-app', 'mobile-app', 'desktop-app', 'tool', 'template']),
  productStatus: z.enum(['available', 'beta', 'coming-soon']).default('available'),
  cover: mediaRefSchema,
  gallery: z.array(mediaRefSchema).max(24).default([]),
  demoVideoUrl: z.string().url().nullable().default(null),
  description: localizedSchema,
  features: z.array(z.object({
    id: z.string(),
    icon: z.string(),                 // validated against the lucide allowlist
    title: localizedSchema,
    description: localizedSchema,
  })).max(24).default([]),
  platforms: z.array(z.string()).max(10).default([]),
  techStack: z.array(z.string()).max(20).default([]),
  integrations: z.array(z.string()).max(20).default([]),
  requirements: z.array(localizedSchema).max(12).default([]),
  price: priceInfoSchema,               // single price — products have NO tiers
  faqs: z.array(faqItemSchema).max(20).default([]),
  changelog: z.array(z.object({
    version: z.string().regex(/^\d+\.\d+\.\d+$/),
    date: z.string().datetime(),
    notes: localizedSchema,
  })).max(50).default([]),
  currentVersion: z.string().regex(/^\d+\.\d+\.\d+$/).nullable().default(null),
  demoUrl: z.string().url().nullable().default(null),
  docsUrl: z.string().url().nullable().default(null),
  relatedProductIds: z.array(z.string()).max(6).default([]),
  status: z.enum(['draft', 'published']).default('draft'),
  featured: z.boolean().default(false),
  seo: projectInputSchema.shape.seo,
});
```

---

## 5. Rate Limits

| Endpoint | Limit | Key |
|----------|-------|-----|
| `POST /inquiries` | 3 / 10 min | IP |
| `POST /auth/login` | 5 / 15 min | IP |
| Public `GET` | 120 / min | IP |
| Admin (authenticated) | 600 / min | session |

Implemented with a KV counter plus TTL. Responses carry `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`.

---

## 6. Security Notes

- Session cookie: `HttpOnly`, `Secure`, `SameSite=Strict`, 7-day expiry, rotated on login.
- Admin mutations are same-site only; the `SameSite=Strict` cookie is the CSRF control.
- Uploads are validated by magic bytes and re-encoded before storage; the original filename is never used as a storage key.
- Markdown fields are sanitized on render — no raw HTML passthrough, ever.
- `INTERNAL_ERROR` responses log the full context server-side and return only `requestId` to the client.
- No endpoint accepts, stores, or returns payment data. If a future request needs one, it is a new ADR, not a patch.
