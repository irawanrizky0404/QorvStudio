'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ReactNode } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, X } from 'lucide-react';

import { pickLocale } from '@/lib/i18n/pick-locale';
import type { Locale, MediaRef } from '@/types/content';
import { Media } from '@/components/ui/media';

/**
 * Galeri yang bisa dibuka.
 *
 * Sebelumnya gambar galeri hanya ditampilkan — tidak bisa diklik, tidak bisa
 * dilihat lebih besar. Di halaman studi kasus itu kehilangan yang mahal: karya
 * visual dinilai dari detailnya, dan detail 4:3 selebar 45% kolom tidak cukup
 * untuk menilai apa pun.
 *
 * Dibuat sendiri, bukan memakai Radix Dialog seperti sisa situs ini. Alasannya
 * satu: Radix Dialog memasang focus trap dan mengunci scroll body, dan keduanya
 * berkelahi dengan Lenis yang menggulir dokumen. Yang dibutuhkan di sini cuma
 * lapisan penuh, tombol tutup, dan panah — bukan seluruh mesin dialog.
 *
 * Papan ketik ditangani: Escape menutup, panah kiri/kanan berpindah. Tanpa itu
 * lapisan penuh jadi perangkap bagi yang tidak memakai tetikus.
 */
export function GalleryLightbox({
  items,
  locale,
  label,
}: {
  items: MediaRef[];
  locale: Locale;
  label: string;
}): ReactNode {
  const [open, setOpen] = useState<number | null>(null);

  const close = useCallback(() => setOpen(null), []);
  const step = useCallback(
    (delta: number) => setOpen((at) => (at === null ? null : (at + delta + items.length) % items.length)),
    [items.length],
  );

  useEffect(() => {
    if (open === null) return;

    const onKey = (event: KeyboardEvent): void => {
      if (event.key === 'Escape') close();
      if (event.key === 'ArrowRight') step(1);
      if (event.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);

    /* Kunci gulir dokumen selama lapisan terbuka, lalu kembalikan persis seperti
       semula — bukan disetel ke 'auto', karena nilai sebelumnya belum tentu itu. */
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = previous;
    };
  }, [open, close, step]);

  const current = open === null ? null : items[open];

  return (
    <>
      <div className="mt-12 grid gap-[3px] border-3 border-ink ruled sm:grid-cols-2">
        {items.map((media, i) => (
          <button
            key={i}
            type="button"
            onClick={() => setOpen(i)}
            aria-label={`${label} ${i + 1} — buka besar`}
            className="group block w-full bg-paper text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
          >
            <Media
              media={media}
              locale={locale}
              aspect="aspect-[4/3]"
              sizes="(max-width: 640px) 100vw, 45vw"
              slotLabel={`${label} ${i + 1}`}
              rounded="rounded-none"
            />
          </button>
        ))}
      </div>

      {current ? (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={label}
          className="fixed inset-0 z-[120] flex flex-col bg-ink/95 p-4 md:p-8"
          onClick={close}
        >
          <div className="flex shrink-0 items-center justify-between gap-4">
            <span className="label text-paper">
              {open! + 1} / {items.length}
            </span>
            <button
              type="button"
              onClick={close}
              aria-label="Tutup"
              className="flex size-11 items-center justify-center border-3 border-paper text-paper transition-colors duration-150 hover:bg-acid hover:border-ink hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid"
            >
              <X className="size-5" aria-hidden strokeWidth={2} />
            </button>
          </div>

          {/* `stopPropagation` supaya klik pada gambarnya sendiri tidak menutup. */}
          <div
            className="relative mt-4 min-h-0 flex-1"
            onClick={(event) => event.stopPropagation()}
          >
            <Image
              src={current.url}
              alt={pickLocale(current.alt, locale)}
              fill
              sizes="100vw"
              quality={92}
              className="object-contain"
            />
          </div>

          {items.length > 1 ? (
            <div
              className="mt-4 flex shrink-0 justify-center gap-3"
              onClick={(event) => event.stopPropagation()}
            >
              {[
                { icon: ChevronLeft, delta: -1, label: 'Sebelumnya' },
                { icon: ChevronRight, delta: 1, label: 'Berikutnya' },
              ].map(({ icon: Icon, delta, label: aria }) => (
                <button
                  key={aria}
                  type="button"
                  onClick={() => step(delta)}
                  aria-label={aria}
                  className="flex size-11 items-center justify-center border-3 border-paper text-paper transition-colors duration-150 hover:border-ink hover:bg-acid hover:text-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-acid"
                >
                  <Icon className="size-5" aria-hidden strokeWidth={2} />
                </button>
              ))}
            </div>
          ) : null}
        </div>
      ) : null}
    </>
  );
}
