import { ImageResponse } from 'next/og';
import { ACID, INK, fonts } from './_brand/mark';

export const size = { width: 64, height: 64 };
export const contentType = 'image/png';

/**
 * Favicon: bidang acid penuh, huruf Q tinta.
 *
 * 64px, bukan 32: browser menurunkan skala dengan baik tapi tidak menaikkannya,
 * dan tab di layar rapat meminta ukuran yang lebih besar.
 *
 * Tanpa bingkai. Garis 3px yang jadi ciri sistem ini akan memakan glyph-nya pada
 * ukuran sekecil ini, dan yang tersisa cuma kotak.
 */
export default async function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: ACID,
          color: INK,
          fontFamily: 'Space Grotesk',
          fontSize: 52,
          letterSpacing: '-0.06em',
          // Space Grotesk memberi Q ekor di bawah baseline; tanpa ini ekornya terpotong.
          paddingBottom: 6,
        }}
      >
        Q
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
