# BRS.MD — Business Requirements Specification

> What we are building, and for whom.

---

## 1. Product Identity

**QORV Studio** builds digital and physical architecture — from code to packaging.
The public site is bilingual (**English default, Indonesian toggle**); the admin panel is English-only.
The site is two products in one deployment:

1. **Public site** — a portfolio-led agency site that sells credibility and generates inquiries.
2. **Admin panel** — a complete internal tool for QORV to manage projects, products, and incoming inquiries without a developer.

Positioning: engineered, not decorated. Industrial minimalism — cold, brutal, high precision. The site should read like a technical instrument, not a template.

**No payment gateway.** Every commercial intent converts into an inquiry: email or direct chat (WhatsApp).

---

## 2. Target Audience

| Segment | Need | Primary surface |
|---------|------|-----------------|
| Startup founders / product owners | Vet QORV's capability before hiring | Work (projects), Services |
| Marketing & brand managers | 3D, animation, packaging capability | Services, Work filtered by category |
| Buyers comparing scope and budget | Understand what a service includes and what it costs before making contact | Service detail, Pricing |
| Buyers of QORV's own apps | Understand what the product does, whether it fits, how to get it | Products + product detail |
| QORV internal team | Publish and maintain content | Admin panel |

---

## 3. Core Entities

### 3.1 Project (portfolio / client work)
Case studies of work delivered for clients. Categories follow the brand's own service split:
`web-app` · `mobile-app` · `3d-animation` · `packaging` · `branding`.

A project answers: who was the client, what was the problem, what did QORV build, what was the result.

### 3.2 Product (software QORV sells)
Apps built and owned by QORV, offered to customers. **Requires a deep detail page**, because this is where the buying decision happens.

A product detail page must carry:
- Hero: name, tagline, availability status, primary CTA
- Screenshot gallery / visual walkthrough
- Long-form description
- Feature list (title + description + icon)
- Technical specs: platforms, tech stack, integrations, requirements
- Price — **one indicative "starting from" figure, not a tier table.** Products are not sold in plans. `null` shows "Contact us". The CTA opens the inquiry form pre-filled with the product, alongside a direct chat link
- FAQ
- Version / changelog and last-updated
- Demo and documentation links (when available)
- Related products

Product status: `available` · `beta` · `coming-soon`. Status drives the CTA label and badge.

### 3.3 Service (what QORV does for hire)
The capabilities QORV sells as work-for-hire — the bridge between a visitor's problem and the portfolio that proves QORV can solve it. **Requires its own index and detail page.**

A service detail page must carry:
- Hero: name, tagline, icon, starting price, typical timeline, primary CTA
- Long-form description of the capability
- Deliverables — what the client actually receives
- Process — numbered steps with title, description, and duration
- Tools and technologies used
- **Packages** — a fixed **Basic / Gold / Premium** ladder, each with its own price and inclusions. Gold is the emphasized option. A service may offer any subset; zero packages shows a single "request a quote" CTA. **No checkout** — every package CTA opens the inquiry form pre-filled with service + tier
- Related projects — portfolio pieces delivered under this service, proving the capability
- FAQ
- Related services

Services are the join between Project and Product: a project records which services delivered it, and a service page surfaces those projects as evidence.

### 3.4 Pricing (aggregate view, not an entity)
A dedicated `/pricing` page that gathers every service package and every product price into one surface, so a visitor evaluating budget does not have to open six pages.

- Groups packages by service, with a link through to each service detail
- Lists products with their single "starting from" price and a link through to each product detail
- The two sections look different on purpose — services and products are not comparable offerings, so they are not forced into one table
- Carries the engagement FAQ (payment terms, revisions, timelines) and a closing CTA
- **Owns no data.** It reads from the service and product repositories. A price exists in exactly one place — the entity — and is never duplicated here or into a dictionary file.

### 3.5 Inquiry
Captured from: the contact page, a project "start a project" CTA, a **service package CTA**, and a product plan CTA. Stored and managed in the admin panel with a status workflow. Also delivered by email notification. The inquiry carries which service/product and which package the visitor came from, so the studio knows the budget context before replying.

---

## 4. User Roles & Permissions

| Role | Access |
|------|--------|
| **Visitor** (public, unauthenticated) | Read published projects and products; submit inquiries |
| **Admin** (single authenticated operator) | Full CRUD on projects, products, services, media; read/manage inquiries; publish & unpublish; reorder; edit packages and prices |

Phase 1: mock login with a fake session. Phase 2: single admin account, credentials from env, JWT in an HTTP-only cookie.
No public registration. No multi-tenancy. No per-user roles matrix — one admin is the entire back office.

---

## 5. Feature List

### 5.1 Public site
- [ ] Home — hero, capability statement, **services overview section**, featured projects, featured products, **pricing teaser**, CTA
- [ ] Work — project index with category filter, search, sort; grid-breaking editorial layout
- [ ] Work detail — case study: overview, challenge, solution, gallery, stack, **linked services**, result, next project
- [ ] **Services** — service index
- [ ] **Service detail** — full capability sheet per §3.3, including packages and related projects
- [ ] Products — product index with status filter
- [ ] **Product detail** — full spec sheet per §3.2
- [ ] **Pricing** — aggregate of all service packages and product prices per §3.4, with engagement FAQ
- [ ] About — studio persona, capabilities, process
- [ ] Contact — inquiry form + direct email and chat links
- [ ] Global: sharp 1px nav with scroll state, footer, 404, error boundary, SEO metadata + Open Graph
- [ ] **Locale toggle EN/ID** in nav and footer — preserves the current path, persists in a cookie, emits `hreflang` alternates
- [ ] Accessibility: keyboard nav, skip link, reduced motion

### 5.2 Admin panel
- [ ] Login (mock in Phase 1) and route protection
- [ ] Dashboard — counts, recent inquiries, recently edited, quick actions
- [ ] Projects: list (search, filter, sort, paginate) · create · edit · delete (confirm) · draft/publish toggle · featured toggle · manual reorder · link to services
- [ ] Products: same operations, plus a single price field, features, specs, and FAQ sub-editors (no tier editor — products have none)
- [ ] Services: same operations, plus **packages** — one optional card per fixed tier (Basic / Gold / Premium) with price, period, and inclusions — plus process steps, deliverables, and FAQ sub-editors. `startingPrice` shown read-only (derived)
- [ ] Localized content editing: EN/ID tabs on every translatable field, with an indicator when the `id` translation is missing
- [ ] Inquiries: list, detail, status (`new` → `read` → `replied` → `archived`), delete, mailto reply
- [ ] Media: upload, browse, copy URL, delete (Phase 1 mock; Phase 2 blob storage)
- [ ] Settings: studio contact details, social links, SEO defaults
- [ ] Every mutation confirms via toast; every destructive action confirms via dialog

### 5.3 Explicitly out of scope
Payment gateway, checkout, cart, billing, subscriptions, multi-tenancy, real-time chat, calendar, maps, CMS page builder, audit logging, A/B testing.
Locales beyond `en` and `id`.
(Overrides `Blueprint.md` §6 — those 18 features do not apply to this project.)

---

## 6. Success Criteria

- A visitor can go home → work → project detail → contact and submit an inquiry, with zero dead ends, in either locale.
- Switching EN↔ID on any page keeps the user on that same page, and no untranslated English leaks into the Indonesian UI chrome.
- A visitor can go home → products → product detail → plan CTA → inquiry, with the product and plan carried through.
- A visitor can go home → services → service detail → package CTA → inquiry, with the service and package carried through.
- An admin can create, edit, publish, reorder, and delete a project, a product, and a service — including changing a price — without touching code.
- Changing a package price in the admin panel updates the service detail page **and** `/pricing` simultaneously, because there is only one copy of it.
- The site does not look like a Tailwind/shadcn template — it matches `brand_guidelines.html` on colour, type, geometry, and tone.
- Swapping the Phase 1 mock repository for the Phase 2 KV backend changes no component file.
