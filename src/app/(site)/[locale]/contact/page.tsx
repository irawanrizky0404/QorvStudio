import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { isLocale } from '@/lib/i18n/config';
import { getDictionary } from '@/lib/i18n/get-dictionary';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { settingsRepo } from '@/lib/repo';
import type { Locale } from '@/types/content';

import { Reveal } from '@/components/motion/reveal';
import { InquiryForm } from '@/components/inquiry/inquiry-form';
import { Container } from '@/components/ui/primitives';
import { PageHead } from '@/components/ui/system';

export const revalidate = 300;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  if (!isLocale(locale)) return {};
  const t = await getDictionary(locale);
  return {
    title: t.contact.title,
    description: t.contact.subtitle,
    alternates: {
      canonical: `/${locale}/contact`,
      languages: { en: '/en/contact', id: '/id/contact' },
    },
  };
}

/**
 * Contact.
 *
 * Kanal langsung dulu, formulir belakangan — sebagian orang tidak akan pernah
 * mengisi formulir, dan menaruh alamat di bawahnya berarti menyembunyikan jalur
 * tercepat di balik jalur terpanjang.
 *
 * Kanal dirender sebagai sel bersambung, bukan kartu ikon. Ikon dalam cincin
 * ganda di versi lama tidak menambah satupun informasi: label "Email" sudah
 * mengatakan apa yang dikatakan gambar amplop.
 */
export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactNode> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale: Locale = raw;
  const t = await getDictionary(locale);

  const settings = await settingsRepo.get();
  const address = settings.address ? pickLocale(settings.address, locale) : null;

  return (
    <>
      <PageHead label={t.nav.contact} title={t.contact.title} body={t.contact.subtitle} />

      {/* Kanal langsung sebagai strip selebar halaman.
        *
        * Sebelumnya empat kanal ini ditumpuk di kolom kiri selebar 5/12 di
        * sebelah formulir. Formulir jauh lebih tinggi dari empat baris teks,
        * jadi separuh halaman di bawah kolom kiri kosong — dan sel-selnya
        * berbeda tinggi satu sama lain karena isinya tidak sama panjang.
        *
        * Sebagai satu baris berisi empat sel setara, keduanya selesai: tidak ada
        * lubang, dan kanal terbaca lebih dulu — sebagian orang tidak akan pernah
        * mengisi formulir, dan menaruh alamat di bawahnya berarti menyembunyikan
        * jalur tercepat di balik jalur terpanjang.
        */}
      <Reveal as="section" className="band pt-0">
        <Container>
          <ul className="grid gap-[3px] border-3 border-ink bg-ink sm:grid-cols-2 lg:grid-cols-4">
            <li className="flex">
              <a
                href={`mailto:${settings.email}`}
                className="flex w-full flex-col justify-between gap-4 bg-paper p-6 transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
              >
                <span className="label">{t.contact.emailUs}</span>
                <span className="display rank-5 break-all normal-case">{settings.email}</span>
              </a>
            </li>
            <li className="flex">
              <a
                href={`https://wa.me/${settings.whatsapp}`}
                target="_blank"
                rel="noreferrer noopener"
                className="flex w-full flex-col justify-between gap-4 bg-paper p-6 transition-colors duration-150 hover:bg-acid focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink"
              >
                <span className="label">{t.contact.chatUs}</span>
                <span className="display rank-5 normal-case">+{settings.whatsapp}</span>
              </a>
            </li>
            <li className="flex flex-col justify-between gap-4 bg-paper p-6">
              <span className="label">{t.contact.directTitle}</span>
              <p className="text-[15px] leading-relaxed text-ink">{address ?? '—'}</p>
            </li>
            <li className="flex flex-col justify-between gap-4 bg-paper p-6">
              <span className="label">{t.footer.connect}</span>
              <ul className="flex flex-wrap gap-x-5 gap-y-2">
                {settings.socials.map((social) => (
                  <li key={social.platform}>
                    <a
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="text-sm text-ink underline decoration-acid decoration-[3px] underline-offset-4 transition-colors duration-150 hover:decoration-ink focus-visible:outline-3 focus-visible:outline-offset-2 focus-visible:outline-ink"
                    >
                      {social.platform}
                    </a>
                  </li>
                ))}
              </ul>
            </li>
          </ul>

          {/* Formulir selebar halaman. Judul dan penjelasannya di kiri, kolom
              isian di kanan — sehingga tajuknya tidak mengambang sendirian di
              atas bidang selebar 1560px. */}
          <div className="mt-8 grid gap-8 border-3 border-ink bg-paper p-7 md:p-10 lg:grid-cols-12">
            <div className="grid content-start gap-4 lg:col-span-4">
              <h2 className="display rank-3">{t.contact.formTitle}</h2>
              <p className="text-[15px] leading-relaxed">{t.inquiry.subtitle}</p>
            </div>
            <div className="lg:col-span-8">
              <InquiryForm sourceType="contact" />
            </div>
          </div>
        </Container>
      </Reveal>
    </>
  );
}
