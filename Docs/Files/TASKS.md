# TASKS.MD — The Execution Tracker

> Follow this order. No jumping ahead, no random execution.
> Mark `[x]` only when the item actually works — not when the file exists.
> Log every deviation in `PROJECT_MEMORY.md`.

**Legend:** `[ ]` todo · `[~]` in progress · `[x]` done · `[!]` blocked

**Verify everything:** `npm run verify` → typecheck · lint · test · build

---

## STATUS — 7 Agustus 2026

Live di **https://qorv-studio.vercel.app** dengan penyimpanan sungguhan
(Upstash Redis + Vercel Blob). Fase 0–3 selesai. Fase 5 selesai dengan bentuk
yang berbeda dari rencana — lihat catatannya di sana.

**Satu hal menahan peluncuran, dan itu bukan kode:** seluruh isi situs masih
data fiktif. Nama proyek, klien, testimoni, angka hasil, dan **semua harga**
dikarang saat membangun. Harganya bahkan bertentangan dengan arahan
("terjangkau, bukan puluhan juta") — matriks harga menampilkan Rp 18–210 juta.
Ganti lewat panel sebelum situsnya dibagikan. Lihat 6.4.

**Belum diverifikasi siapa pun:** sunting record lalu refresh keras untuk
membuktikan Redis menyimpan, unggah gambar untuk membuktikan Blob jalan, dan
laporan "notif gagal padahal sukses" pada add user dan delete content —
penyebabnya untuk login sudah ditemukan dan diperbaiki, dua sisanya belum
pernah dapat teks error persisnya.

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
- [x] 0.10 Repository: in-memory store + `forceFailure()` hook. **Latensi buatan 500–1500ms dicabut** saat penyimpanan sungguhan masuk — dengan Redis latensinya sudah nyata, dan menambah satu detik lagi ke setiap pembacaan hanya membuat situs terasa rusak.
- [x] 0.11 Seed data — 8 projects, 6 services, 5 products, 12 inquiries, all EN+ID, all with imagery; includes a draft project, a draft product, a draft service, a quote-only service, a partial ladder, and a null-priced product
- [x] 0.12 `lib/repo/index.ts` sebagai satu-satunya pintu data. **`NEXT_PUBLIC_DATA_SOURCE` dibuang**; `lib/repo/driver.ts` memilih penyimpanan dari ada-tidaknya kredensial Redis, dan gagal keras kalau dijalankan di produksi tanpa itu.
- [x] 0.13 `.env.example` — situs, admin, dan penyimpanan; detail kontak pindah ke Settings
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
- [x] 3.13 Unggah media — `MediaField` punya tombol unggah di samping kolom path/URL. Tipe ditentukan dari byte pertama berkas, bukan `file.type` atau nama berkas; SVG ditolak. Vercel Blob di produksi, `public/uploads/` saat lokal.

**Gate:** ✅ create → edit → publish → reorder → delete works for all three entities via Server Actions, with `revalidatePath` so the public site reflects it immediately.

---

## PHASE 4 — Quality Gate

- [~] 4.1 Audit aksesibilitas — **struktur dan kontras bersih dan terukur.**
      Kontras: 10 halaman, 950 simpul teks, nol kegagalan WCAG AA.
      Struktur: 12 halaman diperiksa untuk alt gambar, nama kontrol, label
      field, lompatan heading, jumlah `h1`, landmark `main`, atribut `lang`,
      dan `tabindex` positif — **satu temuan**, halaman 404 tanpa skip link.
      Fokus keyboard: ada aturan global `:focus-visible { outline: 3px solid
      ink }`, jadi setiap elemen fokusabel punya penanda, bukan hanya yang
      membawa utilitas per komponen.
      Sasaran sentuh dinaikkan ke 44px lewat `pointer-coarse`.
      **Belum:** pembaca layar sungguhan, urutan Tab yang dijalani manual,
      dan verifikasi reduced-motion. Ketiganya butuh orang, bukan skrip.
- [ ] 4.2 Lighthouse — LCP < 2.5s, CLS < 0.1, INP < 200ms **(belum dijalankan)**
- [~] 4.3 Bundle check — **sudah diukur**, dari build produksi lewat
      `performance.getEntriesByType('resource')` di beranda:

      | | Terkirim (terkompresi) | Anggaran |
      | --- | --- | --- |
      | JS (14 berkas) | **175 KB** | 150 KB |
      | CSS | 22 KB | 30 KB |
      | Font | 48 KB | — |

      CSS lolos. JS **17% di atas anggaran**. Potongan terbesarnya 69 KB
      (runtime React + Next), sisanya pecahan 7–29 KB — tidak ada satu
      dependensi yang bisa dibuang untuk menutup selisihnya. Anggaran 150 KB
      ditulis sebelum framework-nya dipilih. Pilihannya jujur ada dua: tulis
      ulang anggarannya, atau potong Radix/RHF/Zod dari jalur bersama. Belum
      diputuskan.
- [x] 4.4 Kamus `id.ts` lengkap (ditegakkan tipe); tidak ada string publik hardcoded
- [x] 4.5 Tes unit — 26 assertion: `pickLocale`, turunan `startingPrice`, urutan tier, `formatPrice` null-vs-nol, slug, plus 7 tes `Collection` di atas driver memori (penyemaian, konflik slug, reorder, draft, NOT_FOUND). **Catatan: `tests/` di-gitignore atas permintaan, jadi suite-nya tidak ikut di repo.**
- [ ] 4.6 Playwright end-to-end — **belum ditulis**
- [x] 4.7 Self-audit terhadap `AGENT.md` §6
- [x] 4.8 Deploy — langsung ke produksi, bukan preview

**Gate:** situsnya sudah live; yang tersisa adalah audit aksesibilitas penuh dan
pengukuran performa.

---

## PHASE 5 — Backend: penyimpanan sungguhan ✅

Selesai, tapi **bentuknya berbeda dari rencana**. Rencana ini ditulis untuk
Vercel KV dengan indeks sekunder eksplisit. Dua hal berubah:

1. **`@vercel/kv` dan `@vercel/postgres` sudah tidak ada** sebagai produk
   first-party Vercel. Penggantinya Upstash Redis lewat Marketplace, kliennya
   `@upstash/redis`.
2. **Tidak ada indeks sekunder.** Satu koleksi disimpan sebagai satu nilai JSON,
   jadi seluruh penyaringan, pengurutan, dan paginasi yang sudah ada tetap
   bekerja apa adanya di atas array biasa. Itulah yang membuat pergantian
   penyimpanan tidak menyentuh satu pun halaman.

- [x] 5.1 Upstash Redis lewat Vercel Marketplace. Integrasinya menyuntikkan nama warisan `KV_REST_API_*`; driver menerima itu maupun `UPSTASH_REDIS_REST_*`.
- [!] 5.2 Key map — **tidak berlaku.** Enam kunci total, semuanya berawalan `qorv:`.
- [!] 5.3 Protokol tulis berpipa — **tidak berlaku.** Tidak ada indeks yang perlu dijaga konsisten. Ceiling-nya dicatat: baca-ubah-tulis seluruh koleksi tanpa penguncian, dua penyuntingan bersamaan berarti yang terakhir menang.
- [x] 5.4 Penyemaian — otomatis pada pembacaan pertama lewat `loadOrSeed` dengan `nx`, bukan skrip terpisah
- [!] 5.5 Route Handler publik — **tidak dibuat, dan tidak dibutuhkan.** Server Component membaca repositori langsung; menyisipkan lapisan HTTP di antaranya hanya menambah perjalanan jaringan tanpa satu pun pemanggil di luar.
- [x] 5.6 Kiriman formulir kontak — Zod, honeypot, dan **pembatas laju di Redis**. Dua penghitung `Map` di memori proses diganti `lib/rate-limit.ts`: jendela tetap lewat `INCR` + `EXPIRE`, dipakai bersama login. Di serverless, penghitung per instance berarti batasnya tidak benar-benar ada — 6 percobaan per 15 menit menjadi 6 dikali berapa pun instance yang hidup.
- [x] 5.7 Auth — bukan `jose` JWT: cookie bertanda HMAC + scrypt dari `node:crypto`, tanpa dependensi baru. Peran dibaca ulang tiap permintaan, bukan disimpan di cookie, jadi pencabutan akses berlaku seketika.
- [!] 5.8 Route Handler admin — **tidak dibuat.** Server Action, alasan yang sama dengan 5.5.
- [x] 5.8a Penulisan lintas entitas — menghapus layanan melepas `serviceIds` dari tiap proyek dan `relatedServiceIds`; `startingPrice` dihitung ulang di server
- [x] 5.9 Unggah Vercel Blob dengan validasi magic-byte (menutup 3.13)
- [ ] 5.10 Resend — notifikasi studio + balasan otomatis **belum**
- [x] 5.11 Driver penyimpanan di balik `Repository<T>`; dipilih dari environment, bukan flag
- [x] 5.12 **Seam-nya bertahan.** Perubahan menyentuh `lib/repo`, `upload.ts`, dan lima call site yang harus mulai `await` karena pembacaan lintas entitas jadi async. Tidak ada halaman yang perlu ditulis ulang.
- [x] 5.13 `revalidatePath` pada tiap penulisan; halaman publik SSG dibangun ulang pada permintaan berikutnya
- [!] 5.14 Tes integritas indeks — **tidak berlaku**, tidak ada indeks

**Gate:** ✅ perilaku sama dengan Phase 1, dengan persistensi nyata.

---

## PHASE 5b — Di luar rencana

Pekerjaan yang tidak ada di tracker ini, tapi dikerjakan dan sudah live:

- [x] Redesign visual penuh — neo-brutalis terang: kertas, garis tinta 3px, acid sebagai bidang, hierarki lewat panjang bayangan. GSAP dicabut seluruhnya dari bundel publik (~50kb).
- [x] Manajemen pengguna — peran `dev`/`admin`, scrypt, empat pengaman anti-terkunci. Akun bootstrap dimiliki environment dan dibangun ulang saat `ADMIN_EMAIL`/`ADMIN_PASSWORD` berubah.
- [x] Favicon, apple icon, dan gambar Open Graph dirender dari logotype-nya
- [x] 16 varian berkas logo di `Docs/Logo/` (PNG + JPG), dihasilkan `npm run logos`
- [x] `Docs/web_design_system.html` — spesimen sistem desain, ditautkan dari dasbor admin
- [x] Pembenahan mobile — diaudit di 390px: mask yang memotong hurufnya sendiri, sasaran sentuh, `theme-color`, safe-area
- [x] Audit visual — kontras, perataan kartu harga lewat subgrid, kisi fitur, dan blok hitam di 20 kisi bergaris

---

## PHASE 6 — Production

- [x] 6.1 Header keamanan — CSP, HSTS, `X-Content-Type-Options`, `Referrer-Policy`,
      `X-Frame-Options`, `Permissions-Policy`. Diverifikasi: nol pelanggaran CSP
      di konsol.
      **`script-src` memakai `'unsafe-inline'`, bukan nonce** — dan itu keputusan:
      CSP ber-nonce menuntut tiap permintaan melewati proxy untuk membuat
      nonce-nya, yang mematikan cache statis 54 halaman. Situs ini tidak punya
      satupun masukan pengguna yang dirender sebagai HTML dan tidak ada
      `dangerouslySetInnerHTML` di seluruh basis kode, jadi permukaan yang
      dibayar itu belum ada. Sisanya tetap ketat: `object-src 'none'`,
      `frame-ancestors 'none'`, `base-uri 'self'`, `form-action 'self'`.
- [x] 6.2 GitHub Actions — `.github/workflows/verify.yml`: typecheck, lint, build.
      **`npm test` sengaja tidak dijalankan di CI**: `tests/` ada di `.gitignore`,
      jadi runner tidak punya berkas untuk dijalankan dan langkahnya akan selalu
      gagal karena alasan yang salah. Kembalikan `tests/` ke repo kalau mau
      CI ikut menjalankannya.
- [~] 6.3 Skrip backup/ekspor Redis — `npm run backup` mengekspor enam kunci ke
      `backups/`, `npm run backup -- --in <berkas>` memulihkannya. `backups/`
      masuk `.gitignore` karena hasilnya memuat hash password.
      **Belum pernah dijalankan terhadap Redis sungguhan** — kredensialnya
      ditandai Sensitive di Vercel dan tidak bisa dibaca balik. Yang sudah
      diverifikasi hanya jalur gagalnya: tanpa kredensial ia berhenti dengan
      pesan yang menyebutkan langkah berikutnya.
- [!] 6.4 **Isi sungguhan lewat panel — ini yang menahan peluncuran.**
      Seluruh isi situs masih fiktif: nama proyek, klien, testimoni, angka hasil.
      **Harganya bertentangan dengan arahan** — matriks menampilkan Rp 18–210 juta
      sementara arahannya "terjangkau, bukan puluhan juta". Urutan yang disarankan:
      Settings dulu (nama studio, email, WhatsApp, lokasi, tahun, sosial), lalu
      Services beserta paketnya, baru Projects dan Products. Mengisinya sekalian
      membuktikan Redis benar-benar menyimpan.
- [ ] 6.5 Domain sendiri, analytics, Lighthouse dan axe final.
      **Catatan:** `NEXT_PUBLIC_SITE_URL` sekarang `https://qorv-studio.vercel.app`.
      Begitu domainnya pindah, nilai itu harus ikut diganti dan di-deploy ulang —
      URL kanonik, Open Graph, dan sitemap semuanya mengikutinya.
- [x] 6.6 `README.md` — cara menjalankan, struktur berkas, peran, arah visual, langkah deploy
- [ ] 6.7 Ganti `ADMIN_SECRET` — nilainya sempat muncul di transkrip percakapan saat dibuat
