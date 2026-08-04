import { ImageResponse } from 'next/og';
import { settingsRepo } from '@/lib/repo';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { ACID, INK, PAPER, fonts } from './_brand/mark';

export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';
export const alt = 'QORV Studio';

/**
 * Gambar Open Graph — yang muncul saat tautan situs ini ditempel di WhatsApp,
 * Slack, atau X.
 *
 * Di sini ruangnya cukup untuk wordmark utuh, jadi yang dipakai logotype-nya:
 * "QORV" tinta dengan titik acid, persis seperti di brand guidelines.
 *
 * Nama studio dan tagline dibaca dari Settings, bukan ditulis di sini. Mengubah
 * tagline lewat panel harus ikut mengubah gambar ini, bukan menyisakan versi
 * lama yang tertinggal di berkas kode.
 */
export default async function OpenGraphImage() {
  const settings = await settingsRepo.get();

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          background: PAPER,
          color: INK,
          border: `14px solid ${INK}`,
          padding: 72,
          fontFamily: 'Space Grotesk',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignSelf: 'flex-start',
            background: INK,
            color: ACID,
            padding: '10px 20px',
            fontSize: 24,
            letterSpacing: '0.14em',
          }}
        >
          {pickLocale(settings.location, 'en').toUpperCase()}
        </div>

        <div style={{ display: 'flex', alignItems: 'flex-end', fontSize: 190, letterSpacing: '-0.06em' }}>
          <span>{settings.studioName.replace(/\s*Studio$/i, '').toUpperCase()}</span>
          <span style={{ color: ACID }}>.</span>
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', fontSize: 30 }}>
          <span style={{ maxWidth: 760 }}>{pickLocale(settings.tagline, 'en')}</span>
          <span style={{ letterSpacing: '0.1em' }}>EST. {settings.foundedYear}</span>
        </div>
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
