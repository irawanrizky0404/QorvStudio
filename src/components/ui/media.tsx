import type { ReactNode } from 'react';
import Image from 'next/image';
import type { Locale, MediaRef } from '@/types/content';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { BLUR_DATA_URL } from '@/lib/mock-data/images';
import { cn } from '@/lib/utils';

/**
 * Setiap gambar lewat sini.
 *
 * Bingkainya bersegi dan bergaris tinta 3px, bukan `rounded-2xl` dengan cincin
 * tipis seperti versi template. Prop `rounded` masih diterima supaya delapan
 * call site lama tetap ter-compile, tapi diabaikan — tidak ada sudut membulat
 * di sistem ini, dan membiarkannya berarti mengizinkan satu halaman diam-diam
 * keluar dari sistem.
 *
 * Grayscale tetap ada dan berkurang saat pointer mendekat: di atas kertas
 * terang, foto berwarna penuh mengalahkan acid, dan acid harus tetap jadi satu
 * satunya warna yang menarik perhatian.
 */
export function Media({
  media,
  locale,
  className,
  imageClassName,
  sizes = '(max-width: 768px) 100vw, 50vw',
  priority = false,
  aspect = 'aspect-[16/10]',
  slotLabel,
  rounded: _rounded,
}: {
  media: MediaRef;
  locale: Locale;
  className?: string;
  imageClassName?: string;
  sizes?: string;
  priority?: boolean;
  aspect?: string;
  slotLabel?: string;
  rounded?: string;
}): ReactNode {
  const alt = pickLocale(media.alt, locale);
  const hasImage = media.url.trim().length > 0;

  return (
    <div
      className={cn('relative overflow-hidden border-3 border-ink bg-paper-dim', aspect, className)}
    >
      {hasImage ? (
        <Image
          src={media.url}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          placeholder="blur"
          blurDataURL={BLUR_DATA_URL}
          className={cn(
            'object-cover grayscale-[0.45] transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] group-hover:scale-[1.04] group-hover:grayscale-0',
            imageClassName,
          )}
        />
      ) : (
        <Placeholder width={media.width} height={media.height} label={slotLabel ?? alt} />
      )}
    </div>
  );
}

function ratio(width: number, height: number): string {
  const gcd = (a: number, b: number): number => (b === 0 ? a : gcd(b, a % b));
  if (!width || !height) return '';
  const d = gcd(width, height);
  return `${width / d}:${height / d}`;
}

function Placeholder({
  width,
  height,
  label,
}: {
  width: number;
  height: number;
  label?: string;
}): ReactNode {
  return (
    <div
      role="img"
      aria-label={label ? `Image placeholder: ${label}` : 'Image placeholder'}
      className="flex h-full w-full flex-col justify-between p-5"
    >
      <div
        aria-hidden
        className="absolute inset-0 opacity-[0.06]"
        style={{
          backgroundImage:
            'repeating-linear-gradient(135deg, var(--color-chrome) 0 1px, transparent 1px 10px)',
        }}
      />
      <span className="relative font-mono text-[11px] text-chrome/35">{ratio(width, height)}</span>
      {label ? (
        <span className="relative truncate font-mono text-[11px] text-chrome/30">{label}</span>
      ) : null}
    </div>
  );
}
