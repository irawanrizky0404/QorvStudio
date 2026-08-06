'use client';

import { useEffect } from 'react';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useDictionary } from '@/lib/i18n/dictionary-provider';
import { LOCALES, LOCALE_LABELS } from '@/lib/i18n/config';
import { routes, swapLocale } from '@/lib/routes';
import { useUiStore } from '@/stores/ui-store';
import { cn } from '@/lib/utils';
import type { Locale } from '@/types/content';
import { Button } from '@/components/ui/button';

/**
 * Header.
 *
 * Menempel, bukan mengambang. Versi sebelumnya `fixed` dengan latar transparan
 * yang berubah saat digulir — di atas kertas terang itu berarti judul lewat di
 * belakangnya dan keduanya sama-sama tidak terbaca. Di sini ia bagian dari
 * halaman: kertas padat, ditutup satu garis tinta 3px.
 *
 * Toggle bahasa dulunya pill membulat dengan lingkaran acid di dalamnya —
 * dua bentuk melengkung di sistem yang tidak punya satupun kurva. Kini dua sel
 * bersegi dipisah garis tinta; yang aktif memakai blok acid.
 */
export function Nav({ locale }: { locale: Locale }): ReactNode {
  const { dictionary: t } = useDictionary();
  const pathname = usePathname();
  const open = useUiStore((s) => s.mobileNavOpen);
  const setOpen = useUiStore((s) => s.setMobileNavOpen);

  const links = [
    { href: routes.work(locale), label: t.nav.work },
    { href: routes.services(locale), label: t.nav.services },
    { href: routes.products(locale), label: t.nav.products },
    { href: routes.pricing(locale), label: t.nav.pricing },
    { href: routes.about(locale), label: t.nav.about },
  ];

  useEffect(() => {
    setOpen(false);
  }, [pathname, setOpen]);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const isActive = (href: string): boolean => pathname === href || pathname.startsWith(`${href}/`);

  return (
    <header className="sticky top-0 z-50 border-b-3 border-ink bg-paper">
      <div className="mx-auto flex w-full max-w-[1560px] items-center justify-between gap-6 px-4 py-3 md:px-8 lg:px-12">
        <Link
          href={routes.home(locale)}
          className="wordmark flex items-center text-xl text-ink focus-visible:outline-3 focus-visible:outline-offset-3 focus-visible:outline-ink"
        >
          QORV
          <span aria-hidden className="ml-1.5 size-2 bg-acid" />
        </Link>

        <nav aria-label="Main navigation" className="hidden items-center gap-1 lg:flex">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'label px-3 py-2 transition-colors duration-150',
                'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink',
                isActive(link.href) ? 'bg-acid text-ink' : 'text-ink-soft hover:bg-acid hover:text-ink',
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <LocaleSwitch locale={locale} label={t.nav.switchLanguage} pathname={pathname} />

          <Button asChild size="sm" className="hidden sm:inline-flex">
            <Link href={routes.contact(locale)}>{t.nav.contact}</Link>
          </Button>

          <button
            type="button"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-controls="mobile-nav"
            aria-label={open ? t.nav.closeMenu : t.nav.openMenu}
            className="flex size-11 items-center justify-center border-3 border-ink bg-paper text-ink transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink lg:hidden"
          >
            {open ? <X className="size-4" aria-hidden /> : <Menu className="size-4" aria-hidden />}
          </button>
        </div>
      </div>

      <div id="mobile-nav" hidden={!open} className="border-t-3 border-ink bg-paper lg:hidden">
        <div className="mx-auto flex w-full max-w-[1560px] flex-col px-4 py-3 md:px-8">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              aria-current={isActive(link.href) ? 'page' : undefined}
              className={cn(
                'display rank-4 border-b-3 border-ink py-4 last:border-0',
                isActive(link.href) && 'text-ink-soft',
              )}
            >
              {link.label}
            </Link>
          ))}
          <Button asChild size="lg" className="mt-5 w-full">
            <Link href={routes.contact(locale)}>{t.nav.contact}</Link>
          </Button>
        </div>
      </div>
    </header>
  );
}

/**
 * Pemilih bahasa.
 *
 * Tanpa kotak. Dua percobaan sebelumnya membungkusnya dulu sebagai pill
 * membulat, lalu sebagai dua sel berbingkai tinta 3px — dan keduanya salah
 * karena alasan yang sama: pemilih bahasa dibuat setebal tombol Kontak di
 * sebelahnya, jadi tiga kotak berat berdempetan di satu sudut dan semuanya
 * berteriak sama kerasnya. Mengganti warnanya tidak memperbaiki itu; yang
 * salah bentuknya.
 *
 * Di sistem ini bingkai dan bayangan berarti "benda ini terangkat". Toggle
 * bahasa tidak terangkat — ia dua kata. Jadi ia dua kata, dipisah garis
 * miring, dan yang aktif ditandai satu kotak acid kecil: penanda yang sama
 * dipakai titik logotype, dengan bobot yang sama.
 */
function LocaleSwitch({
  locale,
  label,
  pathname,
}: {
  locale: Locale;
  label: string;
  pathname: string;
}): ReactNode {
  return (
    <div role="group" aria-label={label} className="flex items-center gap-2">
      {LOCALES.map((option, index) => (
        <span key={option} className="flex items-center gap-2">
          {index > 0 ? (
            <span aria-hidden className="label text-ink-soft/50">
              /
            </span>
          ) : null}
          <Link
            href={swapLocale(pathname, option)}
            hrefLang={option}
            aria-current={option === locale ? 'true' : undefined}
            className={cn(
              /* `pointer-coarse:` menaikkan area sentuhnya ke sekitar 44px tanpa
               * mengubah apa pun di layar bermouse. Pada ponsel, EN/ID cuma
               * 19x27 px — lebih kecil dari ujung jari. */
              'label inline-flex items-center gap-1.5 py-2 transition-colors duration-150',
              'pointer-coarse:min-h-11 pointer-coarse:px-2 pointer-coarse:py-3',
              'focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink',
              option === locale ? 'text-ink' : 'text-ink-soft hover:text-ink',
            )}
          >
            {option === locale ? <span aria-hidden className="size-1.5 bg-acid" /> : null}
            {LOCALE_LABELS[option]}
          </Link>
        </span>
      ))}
    </div>
  );
}
