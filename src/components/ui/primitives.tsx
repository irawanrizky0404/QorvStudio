import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

/**
 * Primitif tata letak dan permukaan.
 *
 * Semua komponen di sini dulunya diukur dari dua template referensi: panel
 * membulat `rounded-3xl`, kartu bergradien dengan bidang titik, ikon di dalam
 * cincin ganda, pil untuk metadata. Bentuk-bentuk itu milik template tersebut,
 * bukan milik sistem ini.
 *
 * Ditulis ulang ke bahasa yang sama dengan seluruh situs: kertas, garis tinta
 * 3px, sudut siku, bayangan padat sebagai penanda tinggi. Ketiga halaman detail
 * masih memanggil komponen-komponen ini, jadi mengubah di sini mengubah semuanya
 * sekaligus tanpa menyentuh halamannya.
 */

export function Container({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <div className={cn('mx-auto w-full max-w-[1560px] px-4 md:px-8 lg:px-12', className)}>
      {children}
    </div>
  );
}

export function Section({
  children,
  className,
  bordered = false,
  id,
}: {
  children: ReactNode;
  className?: string;
  bordered?: boolean;
  id?: string;
}): ReactNode {
  return (
    <section id={id} className={cn('band', bordered && 'border-t-3 border-ink', className)}>
      {children}
    </section>
  );
}

/**
 * Pembuka section rata kiri.
 *
 * Dulu rata tengah dengan judul dua warna — separuh kalimat disetel 45% abu,
 * yang di atas kertas terbaca seperti teks setengah termuat. Sekarang satu
 * warna, satu arah baca.
 */
export function SectionIntro({
  lead,
  trail,
  body,
  align = 'left',
  className,
}: {
  lead: string;
  trail?: string;
  body?: string;
  align?: 'left' | 'center';
  className?: string;
}): ReactNode {
  return (
    <div className={cn(align === 'center' ? 'mx-auto max-w-3xl text-center' : 'max-w-3xl', className)}>
      <h2 className="display rank-2">
        {lead}
        {trail ? ` ${trail}` : null}
      </h2>
      {body ? <p className="mt-5 max-w-2xl text-[15.5px] leading-relaxed">{body}</p> : null}
    </div>
  );
}

/**
 * Pembuka halaman.
 *
 * Panel membulat setinggi 340px dengan judul di tengah sudah dibuang — bentuk,
 * tinggi, dan susunannya identik di delapan halaman, jadi delapan halaman
 * berbeda terbaca sebagai satu halaman yang diulang.
 *
 * Halaman baru memakai `PageHead` di `system.tsx`. Ini tinggal sebagai jalur
 * kompatibilitas untuk halaman detail yang belum dimigrasi, dan dirender dengan
 * bahasa yang sama: rata kiri, pendek, tanpa kotak.
 */
export function PageBanner({
  lead,
  trail,
  body,
  className,
}: {
  lead: string;
  trail?: string;
  body?: string;
  className?: string;
}): ReactNode {
  return (
    <Container className={cn('band', className)}>
      <h1 className="display rank-1 max-w-[16ch]">
        {lead}
        {trail ? ` ${trail}` : null}
      </h1>
      {body ? <p className="mt-6 max-w-2xl text-[16px] leading-relaxed">{body}</p> : null}
    </Container>
  );
}

/** Blok kertas bergaris tinta. Satu-satunya "kartu" di situs ini. */
export function Card({
  children,
  className,
  interactive = false,
  padded = true,
  textured: _textured,
}: {
  children: ReactNode;
  className?: string;
  interactive?: boolean;
  padded?: boolean;
  /** Diterima dan diabaikan: bidang titik dari template referensi sudah dibuang. */
  textured?: boolean;
}): ReactNode {
  return (
    <div
      className={cn(
        'border-3 border-ink bg-paper shadow-[9px_9px_0_var(--color-ink)]',
        padded && 'p-7 md:p-8',
        interactive &&
          'transition-[transform,box-shadow] duration-150 ease-out hover:-translate-x-1 hover:-translate-y-1 hover:shadow-[16px_16px_0_var(--color-ink)]',
        className,
      )}
    >
      {children}
    </div>
  );
}

/**
 * Penanda ikon.
 *
 * Cincin konsentris dan pil membulat dari template referensi diganti kotak
 * padat. Di sistem tanpa satupun kurva, lingkaran adalah bentuk asing — dan
 * cincin ganda tidak pernah menerangkan apa-apa tentang isinya.
 */
export function RingIcon({
  children,
  className,
  tone = 'chrome',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'chrome' | 'acid';
}): ReactNode {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-12 shrink-0 items-center justify-center border-3 border-ink',
        tone === 'acid' ? 'bg-acid text-ink' : 'bg-paper text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}

export function TileIcon({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <span
      aria-hidden
      className={cn(
        'inline-flex size-12 items-center justify-center border-3 border-ink bg-acid text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Penanda metadata. Bersegi, bukan pil. */
export function Tag({
  children,
  className,
  tone = 'neutral',
}: {
  children: ReactNode;
  className?: string;
  tone?: 'neutral' | 'acid';
}): ReactNode {
  return (
    <span
      className={cn(
        'label inline-flex items-center border-3 border-ink px-3 py-1.5',
        tone === 'acid' ? 'bg-acid text-ink' : 'bg-paper text-ink',
        className,
      )}
    >
      {children}
    </span>
  );
}

/** Grid bersel: sel kertas dipisah garis tinta, dibingkai penuh. */
export function RuledGrid({
  children,
  columns = 4,
  className,
}: {
  children: ReactNode;
  columns?: 2 | 3 | 4;
  className?: string;
}): ReactNode {
  const cols =
    columns === 2
      ? 'sm:grid-cols-2'
      : columns === 3
        ? 'sm:grid-cols-2 lg:grid-cols-3'
        : 'sm:grid-cols-2 lg:grid-cols-4';

  return (
    <div className={cn('grid gap-[3px] border-3 border-ink bg-ink', cols, className)}>{children}</div>
  );
}

export function RuledCell({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return <div className={cn('bg-paper p-7', className)}>{children}</div>;
}
