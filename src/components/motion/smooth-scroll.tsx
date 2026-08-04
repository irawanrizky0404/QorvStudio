'use client';

import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';
import { usePathname } from 'next/navigation';
import type Lenis from 'lenis';
import { useReducedMotion } from '@/hooks/use-reduced-motion';

/**
 * Satu instance Lenis untuk seluruh situs.
 *
 * ── Kenapa GSAP dicabut dari sini ────────────────────────────────────────────
 * Versi sebelumnya memakai `gsap.ticker` untuk memutar `lenis.raf()` dan
 * meneruskan setiap event scroll ke `ScrollTrigger.update`. Alasannya dulu masuk
 * akal: beberapa komponen memakai ScrollTrigger, dan satu RAF loop bersama lebih
 * baik daripada dua.
 *
 * Alasan itu sudah tidak ada. `depth.tsx` dihapus, dan `Reveal` sekarang memakai
 * `IntersectionObserver`, jadi tidak ada satupun ScrollTrigger yang tersisa di
 * situs ini. Yang tertinggal hanyalah **~50kb GSAP diunduh setiap pengunjung,
 * semata-mata untuk menyediakan sebuah pemanggil `requestAnimationFrame`** —
 * yang sudah ada di setiap browser.
 *
 * Sekarang loop-nya rAF biasa. GSAP tidak lagi masuk bundel situs publik sama
 * sekali.
 *
 * Lenis tetap dipakai karena ia menggulir dokumen secara normal, jadi
 * `position: sticky` dan anchor tetap bekerja.
 */
export function SmoothScroll({ children }: { children: ReactNode }): ReactNode {
  const reduced = useReducedMotion();
  const pathname = usePathname();
  const lenisRef = useRef<Lenis | null>(null);

  useEffect(() => {
    if (reduced) return;

    let cancelled = false;
    let frame = 0;
    let cleanup: (() => void) | undefined;

    void (async () => {
      const { default: Ctor } = await import('lenis');
      if (cancelled) return;

      /*
       * `lerp` alih-alih `duration`: durasi tetap memulai ulang easing-nya pada
       * setiap tick roda, yang terbaca sebagai tersendat saat menggulir cepat.
       * Lerp rendah mengejar targetnya terus-menerus.
       */
      const lenis = new Ctor({
        lerp: 0.085,
        smoothWheel: true,
        wheelMultiplier: 0.9,
        touchMultiplier: 1.6,
        syncTouch: true,
      });
      lenisRef.current = lenis;

      const tick = (time: number): void => {
        lenis.raf(time);
        frame = requestAnimationFrame(tick);
      };
      frame = requestAnimationFrame(tick);

      cleanup = () => {
        cancelAnimationFrame(frame);
        lenis.destroy();
        lenisRef.current = null;
      };
    })();

    return () => {
      cancelled = true;
      cancelAnimationFrame(frame);
      cleanup?.();
    };
  }, [reduced]);

  // Perpindahan rute mengganti dokumen; posisi gulir harus kembali ke atas.
  useEffect(() => {
    lenisRef.current?.scrollTo(0, { immediate: true });
  }, [pathname]);

  return <>{children}</>;
}
