import { ImageResponse } from 'next/og';
import { ACID, INK, fonts } from './_brand/mark';

export const size = { width: 180, height: 180 };
export const contentType = 'image/png';

/**
 * Ikon layar utama iOS.
 *
 * Ukuran ini punya ruang untuk bingkai tinta, jadi bingkainya dipakai — iOS
 * memberi ikon sudut membulat sendiri, dan tanpa bingkai bidang acid-nya
 * terpotong begitu saja di tepi.
 */
export default async function AppleIcon() {
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
          border: `10px solid ${INK}`,
          fontFamily: 'Space Grotesk',
          fontSize: 118,
          letterSpacing: '-0.06em',
          paddingBottom: 14,
        }}
      >
        Q
      </div>
    ),
    { ...size, fonts: await fonts() },
  );
}
