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
 * tidak terbaca, dan yang terlihat hanya "ada aplikasi". Tangkapan layar tetap
 * dipakai, tapi di galeri, tempat ukurannya cukup besar untuk benar-benar
 * dilihat.
 *
 * ── Kenapa tiap cover punya komposisi sendiri ───────────────────────────────
 *
 * Versi pertama memakai satu tata letak untuk keempatnya — pita aksen, nama
 * besar, satu kalimat — dan hanya paletnya yang berbeda. Hasilnya persis seperti
 * yang dikhawatirkan: berjajar di kisi beranda, Commerce dan Wakaf RW terbaca
 * sebagai kartu yang sama dengan tulisan berbeda. Warna saja tidak cukup untuk
 * membedakan, apalagi pada ukuran kartu di mana yang lebih dulu tertangkap mata
 * adalah bentuk, bukan rona.
 *
 * Sekarang tiap cover memakai motif antarmuka aplikasinya sendiri: kartu produk
 * berharga untuk Commerce, timeline berklip untuk Clipper, daftar menu bertitik
 * untuk Catering, dan tabel setoran untuk Wakaf RW. Bentuknya berbeda bahkan
 * saat dikecilkan sampai tidak terbaca satu hurufnya pun.
 *
 * Paletnya bukan tebakan: warna diambil dari piksel tombol utama di tiap
 * aplikasi yang berjalan, bukan dari variabel CSS yang sebagian besar masih
 * bawaan shadcn.
 *
 * Satu-satunya bobot huruf yang tersedia adalah Space Grotesk 700, jadi hierarki
 * dibangun lewat ukuran dan opasitas, bukan lewat berat.
 */

const FONT = path.join(process.cwd(), 'src', 'app', '_brand', 'space-grotesk-700.ttf');
const OUT = path.join(process.cwd(), 'public', 'images', 'products');

/* 4:3, persis rasio yang dipakai kartu beranda, kartu halaman produk, dan hero
   halaman detail. Rasio yang tidak sama membuat `object-cover` memangkas, dan
   yang terpangkas selalu tepinya — tempat pita aksen dan awal baris teks. */
const W = 1600;
const H = 1200;

const PAD = 88;

interface Palette {
  bg: string;
  ink: string;
  accent: string;
  onAccent: string;
  /** Bidang sekunder: kartu, baris tabel, blok timeline. */
  panel: string;
  /** Garis pemisah dan tepi. */
  line: string;
}

/** Kerangka bersama: latar, pita aksen, badge studio, nama, satu kalimat. */
function frame(
  c: Palette,
  name: string,
  line: string,
  motif: ReactElement,
): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        background: c.bg,
        color: c.ink,
        padding: PAD,
        fontFamily: 'Space Grotesk',
      }}
    >
      <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, bottom: 0, width: 22, background: c.accent }} />

      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', background: c.accent, color: c.onAccent, padding: '11px 20px', fontSize: 24, letterSpacing: '0.16em' }}>
          QORV STUDIO
        </div>
      </div>

      {/* Motif mengambil sisa ruang, jadi tinggi blok bawah tetap sama di
          keempat cover walau isi motifnya berbeda tinggi. */}
      <div style={{ display: 'flex', flex: 1, alignItems: 'center', paddingTop: 42, paddingBottom: 42 }}>
        {motif}
      </div>

      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <div style={{ display: 'flex', fontSize: 104, lineHeight: 1.05, letterSpacing: '-0.045em' }}>{name}</div>
        <div style={{ display: 'flex', maxWidth: 1180, marginTop: 20, fontSize: 32, lineHeight: 1.35, opacity: 0.66 }}>{line}</div>
      </div>
    </div>
  );
}

/* ── Commerce: kartu produk berharga ──────────────────────────────────────── */

const COMMERCE: Palette = {
  bg: '#f7f8fa',
  ink: '#0f172a',
  accent: '#3972d7',
  onAccent: '#ffffff',
  panel: '#ffffff',
  line: '#dbe1ea',
};

function commerceMotif(): ReactElement {
  const cards = [
    { tint: '#cddcf5', price: 'Rp 3.500', off: '-15%' },
    { tint: '#f5d9cd', price: 'Rp 28.000', off: null },
    { tint: '#d5ecd8', price: 'Rp 45.000', off: '-10%' },
  ];

  return (
    <div style={{ display: 'flex', width: '100%', gap: 26 }}>
      {cards.map((card) => (
        <div
          key={card.price}
          style={{
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            background: COMMERCE.panel,
            border: `3px solid ${COMMERCE.line}`,
            borderRadius: 18,
            overflow: 'hidden',
          }}
        >
          <div style={{ display: 'flex', height: 300, background: card.tint, alignItems: 'flex-start', padding: 16 }}>
            {card.off ? (
              <div style={{ display: 'flex', background: '#e5484d', color: '#ffffff', borderRadius: 999, padding: '6px 14px', fontSize: 20 }}>
                {card.off}
              </div>
            ) : null}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', padding: 26, gap: 14 }}>
            <div style={{ display: 'flex', height: 14, width: '82%', borderRadius: 999, background: COMMERCE.line }} />
            <div style={{ display: 'flex', height: 14, width: '54%', borderRadius: 999, background: COMMERCE.line }} />
            <div style={{ display: 'flex', marginTop: 8, fontSize: 30, color: COMMERCE.accent }}>{card.price}</div>
          </div>
        </div>
      ))}
    </div>
  );
}

/* ── Clipper: timeline berklip ────────────────────────────────────────────── */

const CLIPPER: Palette = {
  bg: '#0b0b0b',
  ink: '#f2f2ef',
  accent: '#d4ff00',
  onAccent: '#0b0b0b',
  panel: '#1a1a18',
  line: '#2e2e2b',
};

function clipperMotif(): ReactElement {
  const tracks = [
    [
      { w: 26, fill: CLIPPER.accent },
      { w: 18, fill: CLIPPER.panel },
      { w: 32, fill: CLIPPER.accent },
      { w: 14, fill: CLIPPER.panel },
    ],
    [
      { w: 16, fill: CLIPPER.panel },
      { w: 38, fill: '#6b7f00' },
      { w: 22, fill: CLIPPER.panel },
      { w: 14, fill: '#6b7f00' },
    ],
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 14, position: 'relative' }}>
      {/* Penggaris: deretan tik pendek, cukup untuk membaca ini sebagai timeline. */}
      <div style={{ display: 'flex', width: '100%', height: 36, alignItems: 'flex-end', gap: 0 }}>
        {Array.from({ length: 40 }).map((_, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              flex: 1,
              height: i % 5 === 0 ? 30 : 15,
              borderLeft: `2px solid ${i % 5 === 0 ? '#5c5c57' : CLIPPER.line}`,
            }}
          />
        ))}
      </div>

      {tracks.map((track, ti) => (
        <div key={ti} style={{ display: 'flex', width: '100%', height: 140, gap: 9 }}>
          {track.map((clip, ci) => (
            <div
              key={ci}
              style={{
                display: 'flex',
                width: `${clip.w}%`,
                background: clip.fill,
                border: `2px solid ${CLIPPER.line}`,
                borderRadius: 8,
              }}
            />
          ))}
        </div>
      ))}

      {/* Playhead: garis tegak yang memotong kedua track. */}
      <div style={{ display: 'flex', position: 'absolute', left: '47%', top: 0, bottom: 0, width: 4, background: '#ff4d4d' }} />
    </div>
  );
}

/* ── Catering: daftar menu bertitik ───────────────────────────────────────── */

const CATERING: Palette = {
  bg: '#110d0a',
  ink: '#f5ede6',
  accent: '#a25017',
  onAccent: '#ffffff',
  panel: '#1c1511',
  line: '#3a2c22',
};

function cateringMotif(): ReactElement {
  const items = [
    { name: 'Nasi Tumpeng Mini Nusantara', price: 'Rp 35.000' },
    { name: 'Ayam Bakar Madu Kecap Premium', price: 'Rp 28.000' },
    { name: 'Sate Lilit Bali & Nasi Campur', price: 'Rp 45.000' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%', gap: 56 }}>
      {items.map((item) => (
        <div key={item.name} style={{ display: 'flex', width: '100%', alignItems: 'flex-end', gap: 18 }}>
          <div style={{ display: 'flex', fontSize: 40, opacity: 0.92 }}>{item.name}</div>
          {/* Garis putus penghubung, seperti daftar menu cetak. `dashed`, bukan
              `dotted`: satori cuma menerima `solid` dan `dashed`. */}
          <div style={{ display: 'flex', flex: 1, height: 2, borderBottom: `3px dashed ${CATERING.line}`, marginBottom: 10 }} />
          <div style={{ display: 'flex', fontSize: 40, color: CATERING.accent }}>{item.price}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Wakaf RW: tabel setoran ──────────────────────────────────────────────── */

const WAKAF: Palette = {
  bg: '#0b2644',
  ink: '#eef4fb',
  accent: '#1c5399',
  onAccent: '#ffffff',
  panel: '#123156',
  line: '#1e4470',
};

function wakafMotif(): ReactElement {
  const rows = [
    { kk: 'KK-0142', rt: 'RT 03', status: 'Terverifikasi', amount: 'Rp 120.000', done: true },
    { kk: 'KK-0187', rt: 'RT 01', status: 'Menunggu', amount: 'Rp 120.000', done: false },
    { kk: 'KK-0203', rt: 'RT 05', status: 'Terverifikasi', amount: 'Rp 240.000', done: true },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', width: '100%' }}>
      <div style={{ display: 'flex', width: '100%', paddingBottom: 14, fontSize: 21, letterSpacing: '0.12em', opacity: 0.5 }}>
        <div style={{ display: 'flex', width: '24%' }}>KK</div>
        <div style={{ display: 'flex', width: '18%' }}>RT</div>
        <div style={{ display: 'flex', width: '34%' }}>STATUS</div>
        <div style={{ display: 'flex', width: '24%', justifyContent: 'flex-end' }}>NOMINAL</div>
      </div>

      {rows.map((row) => (
        <div
          key={row.kk}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            padding: '34px 0',
            borderTop: `2px solid ${WAKAF.line}`,
            fontSize: 33,
          }}
        >
          <div style={{ display: 'flex', width: '24%' }}>{row.kk}</div>
          <div style={{ display: 'flex', width: '18%', opacity: 0.66 }}>{row.rt}</div>
          <div style={{ display: 'flex', width: '34%' }}>
            <div
              style={{
                display: 'flex',
                background: row.done ? '#1f7a4d' : WAKAF.panel,
                border: `2px solid ${row.done ? '#1f7a4d' : WAKAF.line}`,
                borderRadius: 999,
                padding: '7px 20px',
                fontSize: 24,
              }}
            >
              {row.status}
            </div>
          </div>
          <div style={{ display: 'flex', width: '24%', justifyContent: 'flex-end' }}>{row.amount}</div>
        </div>
      ))}
    </div>
  );
}

/* ── Perakitan ────────────────────────────────────────────────────────────── */

const COVERS: Array<{ slug: string; card: ReactElement }> = [
  {
    slug: 'qorv-commerce',
    card: frame(
      COMMERCE,
      'QORV COMMERCE',
      'E-commerce white-label. Satu toko, satu basis data, tanpa komisi.',
      commerceMotif(),
    ),
  },
  {
    slug: 'clipper-studio',
    card: frame(
      CLIPPER,
      'CLIPPER STUDIO',
      'Editor video bertimeline. Subtitle dan voiceover AI berjalan lokal.',
      clipperMotif(),
    ),
  },
  {
    slug: 'qorv-catering',
    card: frame(
      CATERING,
      'QORV CATERING',
      'Katalog menu display-only. Pesanan langsung ke WhatsApp.',
      cateringMotif(),
    ),
  },
  {
    slug: 'wakaf-rw',
    card: frame(
      WAKAF,
      'WAKAF RW',
      'Pencatatan iuran wakaf satu RW. Setiap rupiah bisa ditelusuri.',
      wakafMotif(),
    ),
  },
];

const fontData = Uint8Array.from(await readFile(FONT)).buffer as ArrayBuffer;
const fonts = [{ name: 'Space Grotesk', data: fontData, weight: 700 as const, style: 'normal' as const }];

/*
 * Manifes dibaca dulu, bukan ditulis dari nol.
 *
 * Galeri ditulis oleh `capture-product-shots.ts` ke berkas yang sama. Menulis
 * ulang penuh di sini berarti menjalankan skrip cover menghapus seluruh entri
 * galeri, sementara berkas gambarnya tetap ada di disk — dan halaman produknya
 * kehilangan galeri tanpa satu pun pesan.
 */
const MEDIA = path.join(process.cwd(), 'src', 'lib', 'mock-data', 'product-media.ts');
const { PRODUCT_MEDIA } = (await import('file://' + MEDIA.replace(/\\/g, '/'))) as {
  PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>>;
};

const manifest: Record<string, Record<string, [number, number]>> = {};
for (const [slug, entries] of Object.entries(PRODUCT_MEDIA)) {
  manifest[slug] = Object.fromEntries(
    Object.entries(entries).map(([key, size]) => [key, [...size] as [number, number]]),
  );
}

for (const { slug, card } of COVERS) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });

  const png = Buffer.from(await new ImageResponse(card, { width: W, height: H, fonts }).arrayBuffer());
  const { data, info } = await sharp(png).webp({ quality: 88 }).toBuffer({ resolveWithObject: true });
  await writeFile(path.join(dir, 'cover.webp'), data);

  (manifest[slug] ??= {}).cover = [info.width, info.height];
  console.log(`  ${slug.padEnd(16)} ${info.width}x${info.height}  ${Math.round(data.length / 1024)}KB`);
}

await writeFile(
  MEDIA,
  [
    '/* DIHASILKAN oleh scripts/make-product-covers.tsx dan capture-product-shots.ts. */',
    'export const PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>> =',
    JSON.stringify(manifest, null, 2) + ';',
    '',
  ].join('\n'),
);
console.log('\nManifes: src/lib/mock-data/product-media.ts');
