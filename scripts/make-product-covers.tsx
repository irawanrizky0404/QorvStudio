import { ImageResponse } from 'next/og';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import type { ReactElement } from 'react';
import sharp from 'sharp';

/**
 * Cover produk yang dirancang, bukan tangkapan layar.
 *
 *   npm run product:covers
 *
 * Tangkapan layar buruk sebagai cover: pada ukuran kartu, seluruh antarmuka
 * mengecil jadi bubur abu-abu yang tidak menyampaikan apa pun — nama produknya
 * tidak terbaca, dan yang terlihat hanya "ada aplikasi". Cover ini justru
 * menuliskan nama dan satu kalimat isinya, dalam palet aplikasinya sendiri,
 * jadi produknya bisa dikenali sebelum dibuka.
 *
 * Tangkapan layar tetap dipakai — di galeri, tempat ukurannya cukup besar untuk
 * benar-benar dilihat.
 *
 * Paletnya bukan tebakan: warna diambil dari piksel tombol utama di tiap
 * aplikasi yang berjalan, bukan dari variabel CSS yang sebagian besar masih
 * bawaan shadcn.
 */

const FONT = path.join(process.cwd(), 'src', 'app', '_brand', 'space-grotesk-700.ttf');
const OUT = path.join(process.cwd(), 'public', 'images', 'products');

interface Cover {
  slug: string;
  name: string;
  line: string;
  bg: string;
  ink: string;
  accent: string;
  /** Teks di atas bidang aksen. */
  onAccent: string;
}

const COVERS: Cover[] = [
  {
    slug: 'qorv-commerce',
    name: 'QORV\nCOMMERCE',
    line: 'E-commerce white-label. Satu toko, satu basis data, tanpa komisi.',
    bg: '#f7f8fa',
    ink: '#0f172a',
    accent: '#3972d7',
    onAccent: '#ffffff',
  },
  {
    slug: 'clipper-studio',
    name: 'CLIPPER\nSTUDIO',
    line: 'Editor video bertimeline. Subtitle dan voiceover AI berjalan lokal.',
    bg: '#0b0b0b',
    ink: '#f2f2ef',
    accent: '#d4ff00',
    onAccent: '#0b0b0b',
  },
  {
    slug: 'qorv-catering',
    name: 'QORV\nCATERING',
    line: 'Katalog menu display-only. Pesanan langsung ke WhatsApp.',
    bg: '#110d0a',
    ink: '#f5ede6',
    accent: '#a25017',
    onAccent: '#ffffff',
  },
  {
    slug: 'wakaf-rw',
    name: 'WAKAF\nRW',
    line: 'Pencatatan iuran wakaf satu RW. Setiap rupiah bisa ditelusuri.',
    bg: '#0b2644',
    ink: '#eef4fb',
    accent: '#1c5399',
    onAccent: '#ffffff',
  },
];

/*
 * 4:3, persis rasio yang dipakai kartu produk dan hero halaman detail.
 *
 * Versi pertama 1600x1000 (1,6:1). Dengan `object-cover` di kotak 4:3, gambar
 * yang lebih lebar dipangkas kiri-kanan — dan yang dipangkas justru pita aksen
 * di tepi kiri dan awal setiap baris teks. Menyamakan rasionya membuat tidak ada
 * satu piksel pun yang hilang.
 */
const W = 1600;
const H = 1200;

function card(c: Cover): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'flex-end',
        gap: 56,
        background: c.bg,
        color: c.ink,
        padding: 96,
        fontFamily: 'Space Grotesk',
      }}
    >
      {/* Pita aksen di tepi kiri — satu bidang warna, cukup untuk mengenali
          produknya dari jauh tanpa mengandalkan teks. */}
      <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, bottom: 0, width: 24, background: c.accent }} />

      {/* Badge duduk tepat di atas nama, bukan terlempar ke ujung atas: dengan
          `space-between` dan hanya dua anak, seluruh tengah kanvas jadi rongga. */}
      <div style={{ display: 'flex', alignSelf: 'flex-start', background: c.accent, color: c.onAccent, padding: '12px 22px', fontSize: 26, letterSpacing: '0.16em' }}>
        QORV STUDIO
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
        <div style={{ display: 'flex', flexDirection: 'column', fontSize: 150, lineHeight: 1.02, letterSpacing: '-0.05em' }}>
          {c.name.split('\n').map((row) => (
            <span key={row}>{row}</span>
          ))}
        </div>
        <span style={{ display: 'flex', maxWidth: 1000, fontSize: 36, lineHeight: 1.4, opacity: 0.75 }}>{c.line}</span>
      </div>
    </div>
  );
}

const fontData = Uint8Array.from(await readFile(FONT)).buffer as ArrayBuffer;
const fonts = [{ name: 'Space Grotesk', data: fontData, weight: 700 as const, style: 'normal' as const }];

const manifest: Record<string, Record<string, [number, number]>> = {};

for (const c of COVERS) {
  const dir = path.join(OUT, c.slug);
  await mkdir(dir, { recursive: true });

  const png = Buffer.from(await new ImageResponse(card(c), { width: W, height: H, fonts }).arrayBuffer());
  const { data, info } = await sharp(png).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(dir, 'cover.webp'), data);

  manifest[c.slug] = { cover: [info.width, info.height] };
  console.log(`  ${c.slug.padEnd(16)} ${info.width}x${info.height}  ${Math.round(data.length / 1024)}KB`);
}

/* Manifes ditulis ulang penuh; galeri ditambahkan oleh skrip tangkapan layar. */
await writeFile(
  path.join(process.cwd(), 'src', 'lib', 'mock-data', 'product-media.ts'),
  [
    '/* DIHASILKAN oleh scripts/make-product-covers.tsx dan capture-product-shots.ts. */',
    'export const PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>> =',
    JSON.stringify(manifest, null, 2) + ';',
    '',
  ].join('\n'),
);
console.log('\nManifes: src/lib/mock-data/product-media.ts');
