"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useDictionary } from "@/lib/i18n/dictionary-provider";
import { pickLocale } from "@/lib/i18n/pick-locale";
import { routes } from "@/lib/routes";
import type { Locale, Settings } from "@/types/content";
import { Container } from "@/components/ui/primitives";

/**
 * Footer.
 *
 * ── Kenapa lima versi sebelumnya gagal ───────────────────────────────────────
 * Semuanya dicari dari konvensi footer, bukan dari sistem situs ini. Blok brand
 * plus dua kolom tautan plus bar hak cipta adalah footer paling standar yang
 * ada; membungkus isinya dengan pill, lalu bingkai 3px, lalu wordmark raksasa,
 * hanya mengganti kulit dari bentuk yang sama.
 *
 * ── Bentuknya sekarang ───────────────────────────────────────────────────────
 * Dibangun dari kosakata yang sudah dipakai di seluruh halaman: sel kertas
 * berukuran sama, dipisah garis tinta 3px, melebar dari tepi ke tepi. Persis
 * konstruksi yang sama dengan strip angka di hero — jadi footer terbaca sebagai
 * bagian dari situs ini, bukan sebagai wilayah dengan aturannya sendiri.
 *
 * Delapan sel, empat kolom, dua baris. Simetris dan genap.
 *
 * Baris atas mengulang penomoran section halaman (01..04), jadi footer berfungsi
 * sebagai indeks yang sebenarnya. Baris bawah membawa studio, kontak, dan
 * kanal — dengan sel terakhir sebagai satu-satunya bidang acid, tempat ajakan
 * utamanya duduk.
 *
 * `gap-[3px]` di atas latar tinta menggambar garisnya. Trik itu pernah rusak
 * ketika dipakai pada grid selebar konten — sel tidak melar dan latar tinta
 * menyembul. Di grid berkolom sama rata seperti ini, tiap sel mengisi penuh
 * jalurnya, jadi garisnya jatuh tepat.
 */
export function Footer({
  locale,
  settings,
}: {
  locale: Locale;
  settings: Settings;
}): ReactNode {
  const { dictionary: t } = useDictionary();
  /* Semua dari `settingsRepo`, bukan dari variabel lingkungan atau daftar
     literal. Sebelumnya footer memakai `NEXT_PUBLIC_*` dengan fallback
     hardcoded dan array `SOCIALS` sendiri, sementara halaman kontak membaca
     `settingsRepo` — jadi mengubah nomor WhatsApp di panel memperbarui satu
     halaman dan meninggalkan footer memuat nomor lama. */
  const email = settings.email;
  const whatsapp = settings.whatsapp;

  const index = [
    { href: routes.work(locale), label: t.nav.work },
    { href: routes.services(locale), label: t.nav.services },
    { href: routes.products(locale), label: t.nav.products },
    { href: routes.pricing(locale), label: t.nav.pricing },
  ];

  return (
    <footer className="border-t-3 border-ink">
      {/* Lebar yang sama dengan seluruh halaman.
          Versi sebelumnya membentang penuh dari tepi ke tepi, jadi kolom footer
          tidak sejajar dengan satupun kolom di atasnya dan footer terbaca lebih
          lebar dari situsnya sendiri. Grid ini duduk di `Container` yang sama
          dengan hero, Karya, dan Produk. */}
      <Container className="py-14">
        <div className="grid grid-cols-2 gap-[3px] border-3 border-ink ruled md:grid-cols-4">
          {/* ── Baris 1 — indeks bernomor, sama dengan penomoran section ─────── */}
          {index.map((item, position) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex min-h-[9.5rem] flex-col justify-between bg-paper p-6 transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
            >
              <span className="label tabular">
                {String(position + 1).padStart(2, "0")}
              </span>
              <span className="display rank-4">{item.label}</span>
            </Link>
          ))}

          {/* ── Baris 2 — studio, kontak, kanal, ajakan ──────────────────────── */}
          <div className="flex min-h-[9.5rem] flex-col justify-between bg-paper p-6">
            <div className="wordmark flex items-center text-xl text-ink">
              QORV
              <span aria-hidden className="ml-1.5 size-2 bg-acid" />
            </div>
            <p className="text-sm leading-relaxed">{t.footer.tagline}</p>
          </div>

          <div className="flex min-h-[9.5rem] flex-col justify-between gap-4 bg-paper p-6">
            <span className="label">{t.nav.contact}</span>
            <div className="grid gap-2">
              <a
                href={`mailto:${email}`}
                className="inline-flex w-fit items-center text-sm text-ink underline decoration-ink decoration-[3px] underline-offset-4 transition-[text-decoration-thickness] duration-150 pointer-coarse:min-h-11 hover:decoration-[5px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                {email}
              </a>
              <a
                href={`https://wa.me/${whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-flex w-fit items-center text-sm text-ink underline decoration-ink decoration-[3px] underline-offset-4 transition-[text-decoration-thickness] duration-150 pointer-coarse:min-h-11 hover:decoration-[5px] focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
              >
                +{whatsapp}
              </a>
            </div>
          </div>

          <div className="flex min-h-[9.5rem] flex-col justify-between gap-4 bg-paper p-6">
            <span className="label">{t.footer.connect}</span>
            <ul className="grid gap-2">
              {settings.socials.map((social) => (
                <li key={social.platform}>
                  <a
                    href={social.url}
                    target="_blank"
                    rel="noreferrer noopener"
                    className="inline-flex w-fit items-center text-sm text-ink-soft transition-colors duration-150 pointer-coarse:min-h-11 hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                  >
                    {social.platform}
                  </a>
                </li>
              ))}
            </ul>
          </div>

          {/* Satu-satunya bidang acid di footer, dan ia membawa ajakan utamanya.
            *
            * `group-hover` pada anaknya, bukan hanya `hover:text-paper` pada
            * induknya: `.display` menetapkan `color` sendiri, jadi ia tidak ikut
            * mewarisi. Saat latar berbalik jadi tinta, teks utamanya tetap tinta
            * — hitam di atas hitam, dan ajakan yang paling penting di footer
            * justru menghilang tepat saat kursor menyentuhnya. */}
          <Link
            href={routes.contact(locale)}
            className="group col-span-2 flex min-h-[9.5rem] flex-col justify-between bg-acid p-6 transition-colors duration-150 hover:bg-ink hover:text-paper focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink md:col-span-1"
          >
            <span className="label">{t.home.faqLead}</span>
            <span className="display rank-4 transition-colors duration-150 group-hover:text-paper">
              {t.home.ctaButton}
            </span>
          </Link>
        </div>
      </Container>

      <div className="border-t-3 border-ink">
        <Container className="flex flex-col gap-2 py-5 md:flex-row md:justify-between">
          <p className="label">
            © {new Date().getFullYear()} QORV Studio. {t.footer.rights}.
          </p>
          <p className="label">
            {pickLocale(settings.location, locale)} — Est. {settings.foundedYear}
          </p>
        </Container>
      </div>
    </footer>
  );
}
