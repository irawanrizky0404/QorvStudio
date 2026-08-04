import type { ReactNode } from 'react';
import Image from 'next/image';

import { cn } from '@/lib/utils';

/**
 * Media frame.
 *
 * Aturan sistemnya: bingkai rata, isi berdimensi. Bingkainya grafis dan keras —
 * garis tinta 3px, sudut siku, bayangan offset padat. Kedalaman datang dari apa
 * yang ada DI DALAMNYA: foto dan render, bukan dari efek pada bingkainya.
 *
 * Itu sebabnya tidak ada radius, gradien, rim, atau glow di sini. Setiap kali
 * bingkainya diberi efek, ia mulai bersaing dengan karyanya sendiri.
 *
 * Isinya mendarat lebih lambat dari bingkai (`.settle`), yang membuatnya
 * terbaca berada di dalam ruang alih-alih tertempel pada permukaannya.
 *
 * Tanpa client JavaScript sama sekali — ini render di server.
 */
export function Plate({
  src,
  alt,
  index,
  caption,
  meta,
  aspect = 'aspect-4/3',
  sizes = '(max-width: 1024px) 100vw, 50vw',
  priority = false,
  /** Sisi tempat garis pemisah bingkai jatuh, saat frame dipakai berdampingan. */
  divide = 'bottom',
  className,
}: {
  src: string;
  alt: string;
  index?: string;
  caption?: string;
  meta?: string;
  aspect?: string;
  sizes?: string;
  priority?: boolean;
  divide?: 'bottom' | 'right' | 'left' | 'none';
  className?: string;
}): ReactNode {
  return (
    <figure className={cn('relative', className)}>
      <div
        className={cn(
          'relative overflow-hidden bg-paper-dim',
          divide === 'bottom' && 'border-b-3 border-ink',
          divide === 'right' && 'border-r-3 border-ink',
          divide === 'left' && 'border-l-3 border-ink',
          aspect,
        )}
      >
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="settle object-cover"
        />

        {index ? (
          <span className="tabular absolute left-0 top-0 z-10 border-b-3 border-r-3 border-ink bg-acid px-3 py-1.5 text-[11px] font-extrabold tracking-[0.14em] text-ink">
            {index}
          </span>
        ) : null}
      </div>

      {caption || meta ? (
        <figcaption className="flex items-baseline justify-between gap-5 px-5 py-4">
          {caption ? (
            <span className="display rank-5 text-ink">{caption}</span>
          ) : null}
          {meta ? <span className="label">{meta}</span> : null}
        </figcaption>
      ) : null}
    </figure>
  );
}
