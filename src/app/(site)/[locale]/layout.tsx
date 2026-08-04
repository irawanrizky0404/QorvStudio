import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';
import { Plus_Jakarta_Sans, Space_Grotesk } from 'next/font/google';

import '@/styles/global.css';

import { LOCALES, isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { DictionaryProvider } from '@/lib/i18n/dictionary-provider';
import { SmoothScroll } from '@/components/motion/smooth-scroll';
import { settingsRepo } from '@/lib/repo';
import { Nav } from '@/components/layout/nav';
import { Footer } from '@/components/layout/footer';
import { Toaster } from '@/components/ui/toaster';
import type { Locale } from '@/types/content';
import { siteUrl } from '@/lib/site-url';

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

const SITE_URL = siteUrl();

export function generateStaticParams(): Array<{ locale: string }> {
  return LOCALES.map((locale) => ({ locale }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);

  return {
    metadataBase: new URL(SITE_URL),
    title: { default: t.meta.defaultTitle, template: `%s / ${t.meta.siteName}` },
    description: t.meta.defaultDescription,
    alternates: {
      canonical: `/${locale}`,
      languages: { en: '/en', id: '/id' },
    },
    openGraph: {
      type: 'website',
      siteName: t.meta.siteName,
      title: t.meta.defaultTitle,
      description: t.meta.defaultDescription,
      locale: locale === 'id' ? 'id_ID' : 'en_US',
    },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!isLocale(locale)) notFound();

  const typed: Locale = locale;
  const dictionary = await getDictionary(typed);
  const settings = await settingsRepo.get();

  return (
    <html lang={typed} className={`${grotesk.variable} ${jakarta.variable}`}>
      <body className="antialiased">
        <DictionaryProvider dictionary={dictionary} locale={typed}>
          <SmoothScroll>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:fixed focus:left-6 focus:top-6 focus:z-[200] focus:focus:bg-acid focus:px-5 focus:py-3 focus:text-sm focus:text-void"
            >
              {dictionary.nav.skipToContent}
            </a>
            <Nav locale={typed} />
            <main id="main">{children}</main>
            <Footer locale={typed} settings={settings} />
            <Toaster />
          </SmoothScroll>
        </DictionaryProvider>
      </body>
    </html>
  );
}
