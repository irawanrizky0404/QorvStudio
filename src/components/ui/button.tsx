'use client';

import { forwardRef } from 'react';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { Slot, Slottable } from '@radix-ui/react-slot';
import { Loader2 } from 'lucide-react';
import { cn } from '@/lib/utils';

type Variant = 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
type Size = 'sm' | 'md' | 'lg';

/**
 * Button.
 *
 * Satu benda yang benar-benar bergerak. Diam, ia berdiri 5px di atas kertas;
 * ditekan, bayangannya habis dan ia bergeser tepat sejauh bayangan yang hilang,
 * jadi ia terbaca turun menyentuh kertas — bukan menyusut atau berkedip.
 *
 * Ini kebalikan dari gerak masuk di seluruh situs (`.place`), tempat benda
 * mendarat dan bayangannya tumbuh. Satu fisika, dua arah.
 *
 * Tiga versi sebelumnya dan kenapa gagal, supaya tidak diulang:
 *   1. Dua sel dipisah garis 1px — label tidak pernah center di dalam kontrol,
 *      dan pemisahnya membuat tombol terlihat seperti dua elemen ditempel.
 *   2. Pill dengan panah — benar, dan sepenuhnya anonim.
 *   3. Fill acid dengan halo yang menyebar — warnanya terlihat bocor keluar.
 *
 * `Slottable` menjaga isi tetap utuh di bawah `asChild`; tanpa itu Radix
 * menyerahkan children langsung ke elemen anak dan lapisannya hilang.
 */

const SKINS: Record<Variant, string> = {
  primary: 'bg-acid text-ink',
  secondary: 'bg-ink text-paper',
  outline: 'bg-paper text-ink',
  // Satu-satunya kontrol tanpa bingkai. Untuk baris rapat, tempat bayangan
  // offset akan jadi kebisingan.
  ghost: 'border-transparent shadow-none bg-transparent text-ink-soft hover:bg-acid hover:text-ink',
  danger: 'bg-danger text-paper',
};

const SIZES: Record<Size, string> = {
  sm: 'h-9 px-3.5 text-[11px] gap-1.5',
  md: 'h-11 px-5 text-[12px] gap-2',
  lg: 'h-14 px-7 text-[13px] gap-2.5',
};

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  asChild?: boolean;
  /**
   * Dipertahankan untuk kompatibilitas call site lama, tempat prop ini dulu
   * membuang glyph panah. Tidak ada glyph lagi — panah pada setiap tombol
   * adalah kebisingan, dan label yang benar tidak membutuhkannya.
   */
  bare?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    asChild = false,
    bare: _bare,
    disabled,
    children,
    ...props
  },
  ref,
): ReactNode {
  const Component = asChild ? Slot : 'button';

  return (
    <Component
      ref={ref}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={cn(
        'inline-flex select-none items-center justify-center whitespace-nowrap',
        'border-3 border-ink shadow-[5px_5px_0_var(--color-ink)]',
        'font-body font-extrabold uppercase leading-none tracking-[0.14em]',
        // Transform dan box-shadow bergerak bersama: jarak geser selalu sama
        // dengan bayangan yang hilang, atau benda ini terbaca melayang.
        'transition-[transform,box-shadow,background-color] duration-100 ease-linear',
        'hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[3px_3px_0_var(--color-ink)]',
        'active:translate-x-[5px] active:translate-y-[5px] active:shadow-none',
        'focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink',
        'disabled:pointer-events-none disabled:opacity-40',
        SIZES[size],
        SKINS[variant],
        className,
      )}
      {...props}
    >
      {loading ? <Loader2 className="size-4 animate-spin" aria-hidden /> : null}
      <Slottable>{children}</Slottable>
    </Component>
  );
});
