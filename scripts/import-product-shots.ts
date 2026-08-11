/**
 * Memasukkan tangkapan layar dashboard yang diambil manual.
 *
 *   npm run product:import
 *
 * Halaman dashboard ada di balik login, jadi tidak bisa diambil otomatis oleh
 * `capture-product-shots.ts` — skrip itu tidak pernah mengisi form login.
 * Tangkapannya diambil sendiri oleh operator dan diletakkan di `SOURCE`.
 *
 * Berkasnya bernama waktu (`Screenshot 2026-08-11 183157.png`), yang tidak
 * menyimpan satu pun keterangan tentang aplikasi atau halamannya. Pemetaan di
 * bawah karena itu ditulis tangan sekali, setelah tiap berkas benar-benar
 * dilihat. Urutannya juga disengaja: yang paling kuat lebih dulu.
 *
 * Halaman publik hasil `capture-product-shots.ts` tetap dipakai dan ikut
 * dinomori ulang di sini, supaya satu galeri tidak punya dua sumber penomoran
 * yang saling menimpa.
 */
import { mkdir, readFile, readdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = process.env.SHOT_SOURCE ?? 'F:/';
const OUT = path.join(process.cwd(), 'public', 'images', 'products');
const PUBLIC_SHOTS = path.join(process.cwd(), 'assets', 'product-public-shots');
const MEDIA = path.join(process.cwd(), 'src', 'lib', 'mock-data', 'product-media.ts');

/*
 * Lebar dibatasi, tinggi mengikuti — tidak ada satu piksel pun yang dipotong.
 *
 * Versi pertama memaksa semuanya ke 2:1 tepat. Sumbernya berkisar 2,04 sampai
 * 2,12, jadi pemotongannya memang tipis — tapi yang tipis itu justru tepi kiri
 * dan kanan, tempat label sidebar dan tombol toolbar berada. Hasilnya "MEDIA &
 * ASET" terbaca "IA & ASET" dan tombol "Ekspor" terpenggal jadi "Eks".
 *
 * Pemotongan tetap terjadi saat dirender, tapi di sana ia diatur rasio petak
 * galeri — dan berkas yang tersimpan tetap utuh, jadi lightbox menampilkan
 * gambar yang lengkap.
 */
const W = 1600;

/** Berkas dari `SOURCE`, dirujuk dengan nomor urut abjad (1-based). */
type Manual = { manual: number };
/**
 * Tangkapan halaman publik hasil `capture-product-shots.ts`, dibaca dari
 * `assets/product-public-shots/<slug>/NN.webp`.
 *
 * Folder sumbernya sengaja terpisah dari folder tujuan. Saat keduanya sama,
 * menjalankan impor dua kali membuat entri `keep` membaca berkas yang sudah
 * ditimpa jalan pertama — dan tangkapan publiknya diam-diam berganti jadi
 * salinan dashboard.
 */
type Existing = { keep: string };

const PLAN: Record<string, Array<Manual | Existing>> = {
  'qorv-commerce': [
    { manual: 18 }, // Overview: revenue, pesanan, produk terlaris
    { manual: 17 }, // Produk
    { manual: 19 }, // Pesanan
    { manual: 20 }, // Laporan
    { manual: 21 }, // Voucher
    { manual: 22 }, // Dekorasi toko: warna dan pratinjau etalase
    { manual: 23 }, // Dekorasi toko: saklar section
    { manual: 25 }, // Docs
    { manual: 26 }, // Live chat per pesanan
    { keep: '01' }, // Etalase publik
    { keep: '02' }, // Katalog publik
    { keep: '03' }, // Detail produk publik
    { keep: '04' }, // Katalog tersaring diskon
    { keep: '05' }, // Pencarian
    { keep: '06' }, // Halaman masuk pembeli
  ],
  'clipper-studio': [
    { manual: 2 }, // Editor: timeline, preview, panel properti
    { manual: 3 }, // Editor dengan subtitle
    { manual: 1 }, // Daftar proyek
    { manual: 8 }, // AI Smart Chapters
    { manual: 7 }, // Landing
    { manual: 5 }, // Tagihan & langganan
    { manual: 4 }, // Pengaturan
    { manual: 6 }, // Bantuan & panduan
    { keep: '02' }, // Harga publik
    { keep: '03' }, // Docs: overview
    { keep: '04' }, // Docs: editor flow
    { keep: '05' }, // Docs: video manager
    { keep: '06' }, // Halaman masuk publik
  ],
  'qorv-catering': [
    { manual: 13 }, // Dashboard admin
    { manual: 14 }, // Manajemen menu
    { manual: 15 }, // Tambah menu baru
    { manual: 16 }, // Manajemen ulasan
    { keep: '01' }, // Beranda publik
    { keep: '02' }, // Katalog menu publik
    { keep: '03' }, // Detail menu
    { keep: '04' }, // Galeri
    { keep: '05' }, // Tentang
    { keep: '06' }, // FAQ
  ],
  'wakaf-rw': [
    { manual: 9 }, // Dashboard RW
    { manual: 10 }, // Antrian verifikasi
    { manual: 11 }, // Daftar KK
    { manual: 12 }, // Impor data KK
    { keep: '01' }, // Halaman masuk publik
  ],
};

/*
 * Yang tidak dipakai hanya nomor 24: tangkapannya memuat taskbar Windows dan
 * terpotong di atas. Nomor 25 adalah halaman yang sama tanpa keduanya.
 *
 * Selain itu semuanya masuk. Galerinya sengaja tidak dibatasi enam per produk —
 * sebuah dashboard dinilai dari cakupannya, dan memangkas sembilan layar jadi
 * enam justru membuang bukti bahwa modul-modulnya memang ada.
 *
 * Landing Clipper diambil dari tangkapan manual (nomor 7), bukan dari hasil
 * skrip tangkap, supaya halaman yang sama tidak muncul dua kali.
 */

const manualFiles = (await readdir(SOURCE))
  .filter((f) => /^Screenshot .*\.png$/i.test(f))
  .sort();

console.log(`${manualFiles.length} tangkapan manual di ${SOURCE}\n`);

async function normalize(input: Buffer): Promise<{ data: Buffer; width: number; height: number }> {
  const { data, info } = await sharp(input)
    .resize({ width: W, withoutEnlargement: true })
    .webp({ quality: 84 })
    .toBuffer({ resolveWithObject: true });
  return { data, width: info.width, height: info.height };
}

const manifest: Record<string, Record<string, [number, number]>> = {};

/* Manifes lama dibaca demi entri `cover`, yang ditulis skrip lain. */
const { PRODUCT_MEDIA } = (await import('file://' + MEDIA.replace(/\\/g, '/'))) as {
  PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>>;
};
for (const [slug, entries] of Object.entries(PRODUCT_MEDIA)) {
  if (entries.cover) manifest[slug] = { cover: [...entries.cover] as [number, number] };
}

for (const [slug, plan] of Object.entries(PLAN)) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });

  /*
   * Semua sumber dibaca lebih dulu, baru ditulis.
   *
   * Entri `keep` menunjuk berkas di folder tujuan yang sama, dan penomorannya
   * bergeser — `01` lama bisa jadi `07` baru. Menulis sambil membaca berarti
   * sebagian sumber tertimpa sebelum sempat dibaca.
   */
  const sources: Buffer[] = [];
  for (const item of plan) {
    if ('manual' in item) {
      const name = manualFiles[item.manual - 1];
      if (!name) throw new Error(`${slug}: tangkapan manual #${item.manual} tidak ada`);
      sources.push(await readFile(path.join(SOURCE, name)));
    } else {
      sources.push(await readFile(path.join(PUBLIC_SHOTS, slug, `${item.keep}.webp`)));
    }
  }

  for (const [i, input] of sources.entries()) {
    const key = String(i + 1).padStart(2, '0');
    const { data, width, height } = await normalize(input);
    await writeFile(path.join(dir, `${key}.webp`), data);
    (manifest[slug] ??= {})[key] = [width, height];
  }

  const manual = plan.filter((item) => 'manual' in item).length;
  console.log(`  ${slug.padEnd(16)} ${plan.length} gambar (${manual} dashboard, ${plan.length - manual} publik)`);
}

await writeFile(
  MEDIA,
  [
    '/* DIHASILKAN oleh scripts/make-product-covers.tsx dan import-product-shots.ts. */',
    'export const PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>> =',
    JSON.stringify(manifest, null, 2) + ';',
    '',
  ].join('\n'),
);
console.log('\nManifes: src/lib/mock-data/product-media.ts');
