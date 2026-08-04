import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

import '@/styles/global.css';

const grotesk = Space_Grotesk({
  subsets: ['latin'],
  weight: ['400', '500', '700'],
  variable: '--font-space-grotesk',
  display: 'swap',
});

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

export const metadata: Metadata = {
  title: '404 — QORV Studio',
  robots: { index: false, follow: false },
};

/**
 * 404 tingkat root.
 *
 * ── Kenapa file ini harus ada ────────────────────────────────────────────────
 * `not-found.tsx` di dalam `[locale]` hanya menangani `notFound()` yang dilempar
 * dari halaman di segmen itu. URL yang tidak cocok dengan rute manapun — misal
 * `/id/halaman-yang-tidak-ada` atau `/apa-saja` — tidak pernah masuk ke segmen
 * tersebut, jadi Next jatuh ke root. Selama file ini belum ada, yang tampil
 * adalah 404 bawaan Next: layar putih polos bertuliskan "This page could not be
 * found", tanpa sepotong pun desain situs ini.
 *
 * ── Kenapa ia membawa <html> dan <body> sendiri ──────────────────────────────
 * Proyek ini punya dua root layout lewat route group, `(site)` dan `(admin)`,
 * dan tidak punya layout di `app/`. Ketika root layout lebih dari satu, Next
 * tidak bisa memilih salah satunya untuk membungkus halaman ini — jadi ia harus
 * membawa kerangka dokumennya sendiri, termasuk font dan stylesheet.
 *
 * ── Kenapa tidak ada terjemahan ──────────────────────────────────────────────
 * Halaman ini berada di luar segmen `[locale]`, jadi tidak ada locale yang bisa
 * dibaca dan `DictionaryProvider` tidak tersedia. Judulnya ditulis dua bahasa
 * sekaligus, dan tautannya menunjuk ke `/id` — `proxy.ts` yang akan mengarahkan
 * ulang bila bahasa pengunjung ternyata Inggris.
 */
export default function RootNotFound(): ReactNode {
  return (
    <html lang="id" className={`${grotesk.variable} ${jakarta.variable}`}>
      <body>
        <main className="mx-auto flex min-h-dvh w-full max-w-[1560px] items-center px-4 py-20 md:px-8 lg:px-12">
          <div className="grid w-full items-center gap-8 md:grid-cols-[auto_1fr] md:gap-12">
            <p
              aria-hidden
              className="display tabular flex items-center justify-center border-3 border-ink bg-acid px-8 py-6 text-[clamp(4rem,12vw,9rem)] leading-none shadow-[16px_16px_0_var(--color-ink)]"
            >
              404
            </p>

            <div className="grid gap-5">
              <h1 className="display rank-2 max-w-[16ch]">
                Halaman tidak ditemukan
                <span className="mt-2 block text-ink-soft">Page not found</span>
              </h1>
              <p className="max-w-[48ch] text-[15.5px] leading-relaxed">
                Alamat ini tidak ada. Mungkin sudah dipindahkan, atau memang tidak pernah
                diterbitkan.
                <span className="mt-2 block text-ink-soft">
                  This route does not exist. It may have moved, or it never shipped.
                </span>
              </p>
              <Link
                href="/id"
                className="label inline-flex h-14 items-center justify-center justify-self-start border-3 border-ink bg-acid px-7 text-ink shadow-[5px_5px_0_var(--color-ink)] transition-[transform,box-shadow] duration-100 ease-linear hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_var(--color-ink)] focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
              >
                Kembali ke beranda
              </Link>
            </div>
          </div>
        </main>
      </body>
    </html>
  );
}
