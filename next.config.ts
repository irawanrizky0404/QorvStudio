import type { NextConfig } from 'next';

/**
 * Header keamanan.
 *
 * CSP-nya nyata, tapi `script-src` memakai `'unsafe-inline'` dan bukan nonce —
 * dan itu keputusan, bukan kelalaian:
 *
 * CSP ber-nonce di Next mengharuskan tiap permintaan melewati proxy untuk
 * membuat nonce-nya, dan itu **mematikan seluruh cache statis**: 54 halaman yang
 * sekarang disajikan sebagai HTML pra-render berubah jadi render per permintaan.
 * Membayar itu untuk situs yang tidak punya satupun masukan pengguna yang
 * dirender sebagai HTML — tidak ada komentar, tidak ada profil, tidak ada
 * `dangerouslySetInnerHTML` di seluruh basis kode — adalah menukar hal yang
 * pasti (kecepatan) dengan hal yang belum ada permukaannya (injeksi skrip).
 *
 * Sisanya tetap ketat: `object-src 'none'`, `frame-ancestors 'none'`,
 * `base-uri 'self'`, dan `form-action 'self'` — empat arahan yang menutup
 * clickjacking, pembajakan base URL, plugin, dan pengiriman form ke luar,
 * tanpa biaya apa pun.
 *
 * ponytail: `unsafe-inline` pada script-src. Naikkan ke nonce kalau nanti ada
 * konten dari pengguna yang dirender sebagai HTML.
 */
const csp = [
  "default-src 'self'",
  // Next menyisipkan skrip hidrasi inline; lihat catatan di atas.
  "script-src 'self' 'unsafe-inline'",
  // next/font menulis @font-face inline, dan Tailwind memakai style atribut.
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data:",
  "media-src 'self' https:",
  "connect-src 'self' https:",
  "frame-ancestors 'none'",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  'upgrade-insecure-requests',
].join('; ');

const securityHeaders = [
  { key: 'Content-Security-Policy', value: csp },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-Frame-Options', value: 'DENY' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
  },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }];
  },
  images: {
    /*
     * Host jarak jauh untuk imaji seed. Unggahan operator masuk ke Vercel Blob,
     * yang menyajikannya dari `*.public.blob.vercel-storage.com` — tanpa pola itu
     * `next/image` menolak URL-nya dan gambar yang baru diunggah tidak tampil.
     */
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.public.blob.vercel-storage.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Off deliberately: every public href is locale-prefixed and built at runtime
  // (`/${locale}/work/${slug}`), which typedRoutes cannot narrow without casts
  // at each call site. The `href()` helper in lib/routes.ts is the guard instead.
  typedRoutes: false,
};

export default nextConfig;
