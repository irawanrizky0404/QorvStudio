import type { ReactNode } from 'react';
import Link from 'next/link';
import { cn } from '@/lib/utils';
import { Container } from './primitives';

/**
 * Section system.
 *
 * Dua hal yang membedakannya dari versi sebelumnya, dan keduanya struktural
 * bukan kosmetik:
 *
 *   1. Opener rata kiri, tidak lagi di tengah. Sembilan band yang semuanya
 *      center adalah alasan utama halaman lama terbaca datar — tidak ada arah
 *      baca, jadi tidak ada hirarki.
 *   2. `Block` tidak lagi memaksakan grid isinya. Setiap section memilih
 *      strukturnya sendiri (kolom lengket, rel horizontal, baris berselang),
 *      karena satu grid diulang lima kali adalah bentuk lain dari "basic".
 */

/** Eyebrow. Blok tinta padat dengan teks acid — bidang, bukan teks berwarna. */
export function Eyebrow({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}): ReactNode {
  return (
    <span
      className={cn(
        'label inline-flex items-center bg-ink px-3 py-2 text-acid',
        className,
      )}
    >
      {children}
    </span>
  );
}

/**
 * Judul yang tercetak dari bawah, satu baris satu mask.
 *
 * Dipisah per baris di markup, bukan dipecah otomatis dari string, supaya
 * pemenggalannya adalah keputusan penulisnya — bukan hasil pengukuran DOM yang
 * berubah setiap kali lebar viewport bergeser.
 */
export function Printed({
  lines,
  className,
}: {
  lines: ReadonlyArray<string>;
  className?: string;
}): ReactNode {
  return (
    <>
      {lines.map((line) => (
        <span key={line} className={cn('line-mask', className)}>
          <span>{line}</span>
        </span>
      ))}
    </>
  );
}

/**
 * Pembuka halaman dalam.
 *
 * Menggantikan `PageBanner` lama — panel membulat setinggi 340px dengan judul
 * di tengah, dipakai sama persis di delapan halaman. Panel itu punya tinggi,
 * bentuk, dan susunan yang identik di mana-mana, jadi delapan halaman berbeda
 * terbaca sebagai satu halaman yang diulang, dan ia mendorong isi sebenarnya
 * ke bawah lipatan untuk mengatakan hal yang sudah tertulis di judul tab.
 *
 * Penggantinya rata kiri dan pendek: judul, satu kalimat, lalu fakta-fakta
 * dalam strip bersel yang sama dengan strip angka di hero. Isi halaman mulai
 * tepat di bawahnya.
 */
export function PageHead({
  label,
  title,
  body,
  actions,
}: {
  label: string;
  title: string;
  body?: string;
  actions?: ReactNode;
}): ReactNode {
  return (
    <header className="border-b-3 border-ink py-12 md:py-16">
      <Container>
        <div className="grid gap-5">
          <Eyebrow className="justify-self-start">{label}</Eyebrow>
          <h1 className="display rank-1 max-w-[16ch]">{title}</h1>
          {body ? <p className="max-w-2xl text-[16px] leading-relaxed">{body}</p> : null}
          {actions ? <div className="justify-self-start pt-2">{actions}</div> : null}
        </div>
      </Container>
    </header>
  );
}

/**
 * Baris penyaring. Sel bersambung dipisah garis tinta, bukan pil mengambang —
 * pil membulat adalah bentuk yang tidak ada di sistem ini, dan versi lamanya
 * memakai `bg-ink text-muted` yang setelah palet berubah jadi hitam di atas
 * hitam.
 */
export function FilterBar({
  items,
  ariaLabel,
}: {
  items: ReadonlyArray<{ href: string; label: string; active: boolean }>;
  ariaLabel: string;
}): ReactNode {
  return (
    <nav aria-label={ariaLabel} className="flex flex-wrap gap-[3px] border-3 border-ink bg-ink">
      {items.map((item) => (
        <Link
          key={item.href}
          href={item.href}
          aria-current={item.active ? 'page' : undefined}
          className={cn(
            'label flex min-h-11 flex-1 items-center justify-center px-5 transition-colors duration-150',
            'focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink',
            item.active ? 'bg-acid text-ink' : 'bg-paper text-ink-soft hover:bg-paper-dim',
          )}
        >
          {item.label}
        </Link>
      ))}
    </nav>
  );
}

/** Section dengan opener rata kiri. Isinya bebas menentukan strukturnya. */
export function Block({
  label,
  title,
  body,
  aside,
  children,
  className,
  wide = false,
  id,
}: {
  label: string;
  /** Dipecah manual per baris; setiap baris punya mask sendiri. */
  title?: ReadonlyArray<string>;
  body?: string;
  aside?: ReactNode;
  children?: ReactNode;
  className?: string;
  wide?: boolean;
  id?: string;
}): ReactNode {
  return (
    <section id={id} className={cn(wide ? 'band-lg' : 'band', className)}>
      <Container>
        <div className="grid max-w-4xl gap-5">
          <Eyebrow className="rise justify-self-start">{label}</Eyebrow>
          {title ? (
            <h2 className="display rank-2">
              <Printed lines={title} />
            </h2>
          ) : null}
          {body ? (
            <p className="rise max-w-2xl text-[15.5px] leading-relaxed">{body}</p>
          ) : null}
          {aside ? <div className="rise mt-2 justify-self-start">{aside}</div> : null}
        </div>

        {children ? <div className="mt-12 md:mt-16">{children}</div> : null}
      </Container>
    </section>
  );
}

/**
 * Baris kunci/nilai. Pemisahnya garis tinta penuh, bukan gradien redup —
 * konsisten dengan aturan bahwa hitam hanya hadir sebagai garis.
 */
export function Spec({
  label,
  value,
  className,
}: {
  label: string;
  value: string;
  className?: string;
}): ReactNode {
  return (
    <div
      className={cn(
        'flex items-baseline justify-between gap-4 border-t-3 border-ink py-3',
        className,
      )}
    >
      <span className="label">{label}</span>
      <span className="tabular text-[13px] font-extrabold text-ink">{value}</span>
    </div>
  );
}
