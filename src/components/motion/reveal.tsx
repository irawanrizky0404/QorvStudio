'use client';

import { useEffect, useRef } from 'react';
import type { ElementType, ReactNode } from 'react';

import { cn } from '@/lib/utils';

/**
 * Scroll reveal.
 *
 * Menandai subtree dengan `data-in` sekali saat masuk viewport, lalu berhenti
 * mengamati. Seluruh koreografi hidup di CSS (`.place`, `.rise`, `.line-mask`,
 * `.settle` di `global.css`), jadi komponen ini tidak menyentuh gaya sama
 * sekali — ia hanya memberi tahu "sudah terlihat".
 *
 * ── Kenapa GSAP dan ScrollTrigger dilepas dari sini ──────────────────────────
 * Versi sebelumnya membuat `gsap.context()` dan satu ScrollTrigger per
 * instance, untuk gerak yang tidak satupun terikat posisi scroll — semuanya
 * sekali jalan lalu selesai. Itu memuat ~50kb dan satu observer tambahan untuk
 * pekerjaan yang sudah dilakukan `IntersectionObserver` secara native.
 *
 * GSAP tetap layak untuk timeline yang benar-benar perlu di-scrub. Tidak ada di
 * situs ini yang seperti itu, jadi ia tidak diimpor di sini.
 *
 * `once` bersifat mutlak: begitu terlihat, konten tidak pernah disembunyikan
 * kembali. Konten tidak boleh bergantung pada animasi untuk tetap terbaca.
 */
export function Reveal({
  children,
  className,
  as: Tag = 'div',
  /** Tunda mulai, dalam milidetik. */
  delay = 0,
  /**
   * Diterima dan diabaikan. Halaman lama masih meneruskan `variant` dan
   * `stagger` dari implementasi GSAP. Keduanya sekarang keputusan CSS —
   * `.place` / `.rise` memilih geraknya, `.d-1`..`.d-3` memilih urutannya —
   * jadi meneruskannya di sini tidak lagi berarti apa-apa. Prop-nya tetap
   * diterima supaya sembilan halaman itu tetap ter-compile sampai dimigrasi,
   * dan dihapus bersama halaman terakhir.
   */
  variant: _variant,
  stagger: _stagger,
  ...rest
}: {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  delay?: number;
  variant?: string;
  stagger?: number;
  id?: string;
}): ReactNode {
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Di bawah reduced motion, CSS sudah memaksa keadaan akhir. Menandai
    // langsung menghindari satu observer yang tidak berguna.
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      el.setAttribute('data-in', '');
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          entry.target.setAttribute('data-in', '');
          io.unobserve(entry.target);
        }
      },
      { rootMargin: '0px 0px -12% 0px', threshold: 0.08 },
    );

    io.observe(el);
    return () => io.disconnect();
  }, []);

  return (
    <Tag
      ref={ref as React.Ref<never>}
      className={cn(className)}
      style={delay ? ({ transitionDelay: `${delay}ms` } as React.CSSProperties) : undefined}
      {...rest}
    >
      {children}
    </Tag>
  );
}

/**
 * Dipertahankan untuk call site lama di halaman detail karya.
 *
 * Isinya sengaja kosong: parallax adalah gerak yang terikat posisi scroll, dan
 * bahasa visual ini tidak punya tempat untuknya — bidangnya rata, dan benda
 * yang bergerak melawan gulir akan melawan bayangan padat yang membawa
 * hirarki. Wrapper-nya tinggal sampai halaman itu dimigrasi.
 */
export function Parallax({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
  speed?: number;
}): ReactNode {
  return <div className={cn(className)}>{children}</div>;
}
