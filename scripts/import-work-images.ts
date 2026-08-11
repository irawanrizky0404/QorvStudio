/**
 * Menyalin dan mengoptimalkan gambar karya.
 *
 *   npm run import:work
 *
 * Sumbernya `phantomstudio/web/public/projects` — 133 MB, sebagian besar render
 * beresolusi cetak. Yang masuk ke repo hanya turunan web-nya: lebar dibatasi,
 * dikonversi ke WebP, video dilewati. Tanpa itu repositorinya membengkak dua
 * puluh kali lipat demi piksel yang tidak pernah dilihat siapa pun di layar.
 *
 * Sumber ini dipilih ketimbang folder `Curated Work` karena penamaannya sudah
 * berurutan dan seragam — `NN-home`, `NN-slug`, `NN-gallery-N`. Folder yang satu
 * lagi berisi berkas yang sama tapi dengan nama bebas, termasuk satu salah ketik
 * ("Coverr Home"), dan mencocokkannya dengan pola berarti satu proyek bisa
 * kehilangan cover tanpa satupun pesan.
 *
 * Skrip sekali jalan. Hasilnya di-commit; sumbernya tidak.
 */
import { mkdir, readdir, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const SOURCE = 'D:/Rizky Irawan/App/phantomstudio/web/public/projects';
const OUT = path.join(process.cwd(), 'public', 'images', 'work');

/** Nomor urut di sumber → slug yang dipakai situs. Slug-nya dari `works.json`. */
const SLUGS: Record<string, string> = {
  '01': 'nasa-space-tech',
  '02': 'sleepstack',
  '03': 'cooldown',
  '04': 'dread-runaway',
  '05': 'f-this-party',
  '06': 'glass-mousepad',
  '07': 'myair0',
  '08': 'cartel-clinic',
  '09': 'ghibli-interior',
  '10': 'orthosis-shock',
  '11': 'roombase',
};

/** Enam sudah lebih dari cukup untuk satu studi kasus. */
const MAX_GALLERY = 6;

/**
 * Manifes dimensi, ditulis bersama gambarnya.
 *
 * `MediaRef` menuntut `width` dan `height` yang benar — Next memakainya untuk
 * memesan ruang sebelum gambar termuat, dan angka yang salah berarti halaman
 * melompat saat gambar mendarat. Mengetiknya ulang dengan tangan untuk 80-an
 * berkas adalah cara yang pasti menghasilkan angka keliru, jadi skrip yang sama
 * yang menghasilkan gambarnya juga yang mencatat ukurannya.
 */
const manifest: Record<string, Record<string, [number, number]>> = {};

async function emit(src: string, dest: string, width: number, slug: string, key: string): Promise<number> {
  const out = sharp(src)
    .rotate() // hormati EXIF, kalau tidak sebagian render keluar terbalik
    .resize({ width, withoutEnlargement: true })
    .webp({ quality: 82 });

  const { data, info } = await out.toBuffer({ resolveWithObject: true });
  await writeFile(dest, data);
  (manifest[slug] ??= {})[key] = [info.width, info.height];
  return data.length;
}

const files = await readdir(SOURCE);
let totalIn = 0;
let totalOut = 0;

for (const [num, slug] of Object.entries(SLUGS)) {
  const to = path.join(OUT, slug);
  await mkdir(to, { recursive: true });

  const mine = files.filter((f) => f.startsWith(`${num}-`) && /\.(jpe?g|png)$/i.test(f));
  for (const f of mine) totalIn += (await stat(path.join(SOURCE, f))).size;

  const home = mine.find((f) => f.includes('-home'));
  const hero = mine.find((f) => f.includes('-slug'));
  const gallery = mine.filter((f) => f.includes('-gallery')).sort().slice(0, MAX_GALLERY);

  if (!home || !hero) throw new Error(`${slug}: cover atau hero tidak ditemukan di sumber`);

  /*
   * Sumber cover dipilih berdasarkan lebarnya, bukan namanya.
   *
   * Berkas `-home` dipotong khusus untuk kartu, tapi enam dari sebelas di
   * antaranya lebih sempit dari 1200px — satu bahkan 600px. Kartu di kisi Karya
   * dirender sekitar 450px CSS, yang di layar 2× menuntut ~900px, jadi berkas
   * sekecil itu diperbesar paksa dan hasilnya lembek. Kelembekan itu terbaca
   * sebagai warna yang pudar, bukan sebagai gambar yang buram.
   *
   * `-slug` selalu 1900px atau lebih. Rasionya lanskap sementara sebagian
   * `-home` potret, tapi kartunya memakai `object-cover` — pemotongan diurus
   * CSS. Ketajaman lebih penting daripada potongan yang sudah dipilih.
   */
  const homeMeta = await sharp(path.join(SOURCE, home)).metadata();
  const coverSource = (homeMeta.width ?? 0) >= 1200 ? home : hero;
  if (coverSource !== home) console.log(`    ${slug}: cover pakai -slug (${homeMeta.width}px terlalu kecil)`);

  totalOut += await emit(path.join(SOURCE, coverSource), path.join(to, 'cover.webp'), 1600, slug, 'cover');
  totalOut += await emit(path.join(SOURCE, hero), path.join(to, 'hero.webp'), 2000, slug, 'hero');
  for (const [i, g] of gallery.entries()) {
    const key = String(i + 1).padStart(2, '0');
    totalOut += await emit(path.join(SOURCE, g), path.join(to, `${key}.webp`), 1600, slug, key);
  }

  console.log(`  ${slug.padEnd(18)} cover + hero + ${gallery.length} galeri`);
}

await writeFile(
  path.join(process.cwd(), 'src', 'lib', 'mock-data', 'work-media.ts'),
  [
    '/* DIHASILKAN oleh scripts/import-work-images.ts — jangan disunting tangan. */',
    'export const WORK_MEDIA: Record<string, Record<string, readonly [number, number]>> =',
    JSON.stringify(manifest, null, 2) + ';',
    '',
  ].join('\n'),
);

const mb = (n: number) => (n / 1024 / 1024).toFixed(1) + ' MB';
console.log(`\nSumber ${mb(totalIn)} -> keluaran ${mb(totalOut)}`);
console.log('Manifes: src/lib/mock-data/work-media.ts');
