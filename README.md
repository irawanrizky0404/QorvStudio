<div align="center">

# QORV Studio

**Digital & physical architecture.**

Situs dan panel admin untuk QORV Studio — studio desain yang mengerjakan
web, 3D, brand identity, kemasan, UI/UX, dan konsultasi teknis.

[![Next.js](https://img.shields.io/badge/Next.js-16-0b0b0b?style=flat-square)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19-0b0b0b?style=flat-square)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-0b0b0b?style=flat-square)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-v4-0b0b0b?style=flat-square)](https://tailwindcss.com)

</div>

---

## Apa ini

Satu aplikasi Next.js memuat dua permukaan:

- **Situs publik** — dua bahasa (`id`/`en`), 54 halaman ter-generate, berisi profil studio, karya, layanan, produk, dan harga.
- **Panel admin** — di balik sesi, tempat operator menyunting semua konten di atas tanpa menyentuh kode.

Keduanya berbagi satu lapisan data, jadi apa yang disunting operator langsung
jadi apa yang dibaca pengunjung. Tidak ada langkah build ulang di antaranya.

## Layanan yang ditampilkan

| Layanan | Slug |
| --- | --- |
| Web & App Development | `web-app-development` |
| 3D & Animation | `3d-animation` |
| Brand Identity | `brand-identity` |
| Packaging Design | `packaging-design` |
| UI/UX Design | `ui-ux-design` |
| Technical Consulting | `technical-consulting` |

Tiap layanan punya halaman detailnya sendiri, tiga paket harga, deliverables,
proses kerja, dan karya terkait.

---

## Menjalankan

```bash
npm install
cp .env.example .env.local   # isi ADMIN_SECRET dan kredensial bootstrap
npm run dev                  # http://localhost:3030
```

| Perintah | Kegunaan |
| --- | --- |
| `npm run dev` | Server pengembangan (port 3030, Turbopack) |
| `npm run build` | Build produksi |
| `npm start` | Menjalankan hasil build |
| `npm run lint` | ESLint |
| `npm run typecheck` | `tsc --noEmit` |
| `npm test` | Tes unit (runner bawaan Node) |
| `npm run verify` | Keempatnya berurutan — jalankan sebelum commit |

## Tumpukan

Next.js 16 (App Router) · React 19 · TypeScript strict · Tailwind CSS v4
(konfigurasi `@theme` di CSS) · Zod · React Hook Form · Zustand · Lenis ·
Radix UI · lucide-react

Penyimpanan dipilih dari environment, lewat satu berkas — `src/lib/repo/driver.ts`:

| | Lokal | Produksi |
| --- | --- | --- |
| Data | Memori proses | Upstash Redis |
| Unggahan | `public/uploads/` | Vercel Blob |

Tanpa kredensial, `npm run dev` jalan apa adanya. Dengan kredensial, kode yang
sama menulis ke penyimpanan sungguhan — tidak ada cabang lain di aplikasi.
Menjalankan produksi tanpa Redis akan gagal keras, bukan diam-diam memakai
memori: panel yang kelihatan menyimpan padahal datanya hilang jauh lebih mahal
daripada error saat boot.

Tanpa GSAP di bundel situs publik. Reveal memakai `IntersectionObserver`, dan
Lenis diputar oleh `requestAnimationFrame` biasa.

---

## Struktur berkas

```
.
├── Docs/
│   ├── brand_guidelines.html      Identitas perusahaan (kemasan, 3D, cetak)
│   ├── web_design_system.html     Sistem desain situs ini — palet, tipografi,
│   │                              tangga bayangan, komponen, motion, peta halaman
│   └── Files/                     Dokumen proyek: arsitektur, kontrak API, skema,
│                                  BRS, blueprint, daftar tugas
│
├── public/
│   ├── docs/                      Salinan kedua HTML di atas, supaya bisa dibuka
│   │                              lewat URL dari panel admin
│   ├── images/ · logos/           Aset statis
│   └── uploads/                   Gambar yang diunggah operator (tidak di-commit)
│
├── src/
│   ├── app/
│   │   ├── (site)/[locale]/       Situs publik. Segmen `[locale]` = `id` | `en`
│   │   │   ├── page.tsx           Beranda
│   │   │   ├── work/              Karya — indeks dan studi kasus `[slug]`
│   │   │   ├── services/          Layanan — indeks dan detail `[slug]`
│   │   │   ├── products/          Produk — indeks dan detail `[slug]`
│   │   │   ├── pricing/           Harga
│   │   │   ├── about/ · contact/  Studio dan formulir kontak
│   │   │   └── layout.tsx         Nav, footer, smooth scroll, kamus i18n
│   │   │
│   │   ├── (admin)/admin/
│   │   │   ├── login/             Masuk dengan email + password
│   │   │   └── (panel)/           Semua di sini ada di balik sesi
│   │   │       ├── page.tsx       Dasbor — muat satu layar, tanpa gulir
│   │   │       ├── projects/ · services/ · products/
│   │   │       ├── inquiries/     Pesan masuk dari formulir kontak
│   │   │       ├── users/         Manajemen pengguna (hanya peran `dev`)
│   │   │       └── settings/      Identitas studio, kontak, sosial
│   │   │
│   │   ├── actions/               Server Action
│   │   │   ├── auth.ts            Masuk, keluar, pembatasan laju per-email
│   │   │   ├── content.ts         Simpan/hapus proyek, layanan, produk, setelan
│   │   │   ├── inquiry.ts         Kiriman formulir kontak publik
│   │   │   ├── upload.ts          Unggah gambar (tipe dideteksi dari signature)
│   │   │   └── users.ts           CRUD pengguna, digerbang `requireRole('dev')`
│   │   │
│   │   ├── not-found.tsx · robots.ts · sitemap.ts
│   │   └── (tidak ada `app/layout.tsx`) — dua root layout, satu per route group
│   │
│   ├── components/
│   │   ├── ui/                    Primitif bersama: tombol, kolom isian, kartu,
│   │   │                          dialog, akordeon, toaster, grid bergaris
│   │   ├── layout/                Nav, footer, container
│   │   ├── admin/                 Kerangka panel, tabel entitas, kit formulir,
│   │   │                          formulir proyek/layanan/produk/pengguna/setelan
│   │   ├── motion/                Reveal (IntersectionObserver), smooth scroll
│   │   └── inquiry/ · pricing/ · product/ · service/
│   │
│   ├── lib/
│   │   ├── repo/                  Lapisan repositori — satu-satunya pintu ke data
│   │   │   ├── mock/              Penyimpanan di memori + pengisian awal
│   │   │   └── types.ts           Antarmuka yang harus dipenuhi backend mana pun
│   │   ├── mock-data/             Data isian awal: proyek, layanan, produk, dll.
│   │   ├── schemas/               Skema Zod — dipakai formulir *dan* server action
│   │   ├── i18n/                  Kamus `id`/`en`, provider, pemilih locale
│   │   ├── auth.ts                Sesi bertanda HMAC; peran dibaca ulang tiap
│   │   │                          permintaan, bukan disimpan di cookie
│   │   ├── password.ts            Hash scrypt (`node:crypto`, tanpa dependensi)
│   │   └── pricing.ts · format.ts · routes.ts · utils.ts
│   │
│   ├── styles/global.css          Token warna, tangga bayangan, kelas motion
│   ├── types/                     Tipe konten dan masukan
│   ├── stores/ui-store.ts         Toast dan keadaan UI sementara
│   ├── hooks/
│   └── proxy.ts                   Middleware (dinamai ulang di Next 16) —
│                                  pengalihan locale dan penjaga rute admin
│
└── tests/                         Tes unit (tidak di-commit)
```

---

## Panel admin

Yang bisa disunting tanpa menyentuh kode: proyek, layanan, produk, setelan
studio, dan pengguna panel. Pesan dari formulir kontak masuk ke tab tersendiri
dengan status yang bisa diubah.

Gambar bisa diunggah langsung dari formulir, atau diisi dengan path/URL. Tipe
berkas ditentukan dari **byte pertama berkas**, bukan dari `file.type` atau nama
berkas — dua-duanya datang dari klien dan bisa dikarang. SVG tidak diterima:
itu XML yang bisa memuat skrip, dan disajikan dari domain sendiri berarti XSS.

### Peran dan akses

| Peran | Bisa |
| --- | --- |
| `dev` | Semuanya, termasuk manajemen pengguna |
| `admin` | Konten saja — proyek, layanan, produk, pesan masuk, setelan |

Gerbangnya ada di server action, bukan di menu. Menyembunyikan menu hanya
mencegah tampilan; server action punya URL dan bisa dipanggil langsung.

Empat pengaman mencegah panel terkunci: pengguna `dev` aktif terakhir tidak bisa
diturunkan perannya, dinonaktifkan, atau dihapus, dan tidak ada yang bisa
menghapus akunnya sendiri.

Password di-hash dengan scrypt dari `node:crypto` — tanpa dependensi tambahan.
Sesi memakai cookie bertanda HMAC yang **tidak memuat peran**; peran dibaca ulang
dari penyimpanan tiap permintaan, jadi pencabutan akses berlaku seketika.

---

## Arah visual

Neo-brutalis terang: dasar kertas, garis tinta 3px, satu bidang aksen acid,
sudut siku, hierarki lewat panjang bayangan.

```
--color-paper     #E9E9E3      dasar
--color-ink       #0B0B0B      garis dan teks
--color-ink-soft  #5F5F58      teks sekunder
--color-acid      #D4FF00      aksen — bidang saja
--color-danger    #D92D20      destruktif
```

Satu aturan yang paling sering dilanggar: **acid tidak pernah jadi foreground** —
bukan teks, bukan ikon, bukan cincin fokus. Kontrasnya di atas kertas hanya
1,2:1. Acid selalu jadi bidang dengan teks tinta di atasnya.

Selengkapnya di `Docs/web_design_system.html` — palet, tipografi, tangga
bayangan, komponen, motion, dan peta tiap halaman.

`Docs/brand_guidelines.html` adalah dokumen berbeda: identitas perusahaan untuk
kemasan, 3D, dan cetak. Bukan spesifikasi situs.

---

## Deploy

```bash
vercel login                        # akun pemilik proyek
vercel link
vercel integration add upstash      # → UPSTASH_REDIS_REST_URL + _TOKEN
```

Lalu buat store Blob di dashboard (**Storage › Create › Blob**) supaya
`BLOB_READ_WRITE_TOKEN` ikut terpasang, dan set `ADMIN_EMAIL`, `ADMIN_PASSWORD`,
`ADMIN_SECRET`, serta `NEXT_PUBLIC_SITE_URL` di project settings. Terakhir:

```bash
vercel env pull .env.local          # supaya lokal memakai store yang sama
vercel deploy                       # preview
vercel deploy --prod
```

Halaman publik di-generate saat build. Suntingan di panel memanggil
`revalidatePath`, jadi halaman terkait dibangun ulang saat permintaan berikutnya
— tanpa deploy ulang.

## Yang belum beres

- Data isian awal masih fiktif — nama proyek, klien, dan angka harga belum nyata
- Audit aksesibilitas dan Lighthouse belum dijalankan
- Penulisan tanpa penguncian: dua penyuntingan bersamaan, yang terakhir menang.
  Panel ini dipakai satu operator, jadi batasnya belum terasa
- Pencarian berupa pemindaian substring — cukup sampai sekitar 500 record

---

<div align="center">

**QORV Studio** · Indonesia · sejak 2018

</div>
