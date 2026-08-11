/**
 * Tangkapan layar galeri produk.
 *
 *   npm run product:shots
 *
 * Cover-nya dirancang (lihat make-product-covers.tsx); galerinya justru harus
 * literal — di galeri gambarnya dirender besar dan bisa dibuka lightbox, jadi
 * antarmuka aslinya memang yang mau dilihat orang.
 *
 * Chrome headless dipakai lewat CLI, bukan Playwright atau Puppeteer. Alasannya
 * satu: keduanya berarti dependensi baru plus unduhan peramban ~150 MB, untuk
 * pekerjaan yang sudah dilakukan satu bendera `--screenshot`. Skrip ini jalan
 * sesekali saat aplikasinya berubah, bukan di CI.
 *
 * Tiga aplikasi diambil dari deployment-nya yang hidup; Clipper Studio belum
 * punya URL publik jadi diambil dari dev server lokal (lihat CLIPPER di bawah —
 * nyalakan dulu sebelum menjalankan skrip ini).
 *
 * Halaman yang butuh login tidak diambil. Itu memangkas Wakaf RW jadi sedikit
 * sekali halaman, dan itu memang batas yang sebenarnya — bukan sesuatu yang
 * ditutupi dengan gambar karangan.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const OUT = path.join(process.cwd(), 'public', 'images', 'products');
const TMP = path.join(process.cwd(), '.cache', 'product-shots');
const MEDIA = path.join(process.cwd(), 'src', 'lib', 'mock-data', 'product-media.ts');

/** Dev server lokal Clipper Studio: `npm run dev` di PRODUCT/Clipper Studio. */
const CLIPPER = process.env.CLIPPER_URL ?? 'http://localhost:4310';

const COMMERCE = 'https://qorv-commerce.qorvstudio.workers.dev';
const CATERING = 'https://qorv-catering.qorvstudio.workers.dev';
const WAKAF = process.env.WAKAF_URL ?? 'https://qorv-wakaf.qorvstudio.workers.dev';

const SHOTS: Record<string, string[]> = {
  /* Keranjang, wishlist, dan pesanan semuanya mengalihkan ke halaman masuk, dan
     `/` mengalihkan ke `/store` — yang tersisa untuk pengunjung tanpa akun cuma
     etalase, katalog, dan pencarian. */
  'qorv-commerce': [
    `${COMMERCE}/store`,
    `${COMMERCE}/store/products`,
    `${COMMERCE}/store/products/aqua-botol-600ml`,
    `${COMMERCE}/store/products?discount=1`,
    `${COMMERCE}/store/search?q=vitamin`,
    `${COMMERCE}/store/login`,
  ],
  'qorv-catering': [
    `${CATERING}/`,
    `${CATERING}/menu`,
    `${CATERING}/menu/1`,
    `${CATERING}/galeri`,
    `${CATERING}/tentang`,
    `${CATERING}/faq`,
  ],
  /*
   * Dashboard dan editor Clipper butuh sesi login, jadi tidak diambil — yang
   * tertangkap cuma keadaan gagal-memuat.
   *
   * Tautan jangkar (`/#features` dan kawannya) juga sudah dicoba dan gagal:
   * seksi di bawah lipatan baru muncul lewat animasi reveal berbasis
   * IntersectionObserver, dan melompat langsung ke jangkarnya membuat
   * pengamatnya tidak pernah terpicu — hasilnya bidang hitam polos. Enam
   * halaman yang benar-benar berbeda lebih jujur daripada satu halaman yang
   * dipotong-potong.
   */
  'clipper-studio': [
    `${CLIPPER}/`,
    `${CLIPPER}/pricing`,
    `${CLIPPER}/docs/overview`,
    `${CLIPPER}/docs/editor-flow`,
    `${CLIPPER}/docs/video-manager`,
    `${CLIPPER}/login`,
  ],
  'wakaf-rw': [`${WAKAF}/masuk`],
};

/** Ukuran jendela: 16:10 sedikit lebih tinggi dari 16:9, jadi lipatan pertama
 *  halaman tertangkap lebih utuh tanpa perlu tangkapan seluruh halaman — yang
 *  akan menghasilkan gambar sepanjang lima layar dan tak terbaca di galeri. */
const WIDTH = 1600;
const HEIGHT = 1000;

async function shoot(url: string, png: string): Promise<void> {
  await run(
    CHROME,
    [
      '--headless=new',
      '--disable-gpu',
      '--no-sandbox',
      '--hide-scrollbars',
      `--user-data-dir=${path.join(TMP, 'profile')}`,
      `--window-size=${WIDTH},${HEIGHT}`,
      /* Beri waktu font, gambar, dan hidrasi klien selesai. Tanpa ini yang
         tertangkap adalah kerangka kosong sebelum data mendarat. */
      '--virtual-time-budget=20000',
      `--screenshot=${png}`,
      url,
    ],
    /*
     * Batas waktu keras plus SIGKILL.
     *
     * Tanpa ini satu halaman yang tidak pernah diam menggantung prosesnya
     * selamanya, dan Chrome yatim menumpuk diam-diam — pernah sampai puluhan
     * proses, yang membuat setiap tangkapan berikutnya makin lambat sampai
     * seluruh mesin ikut merangkak. `virtual-time-budget` tidak menolong di
     * sini: ia membatasi waktu di dalam halaman, bukan waktu di jam dinding.
     */
    { maxBuffer: 32 * 1024 * 1024, timeout: 90_000, killSignal: 'SIGKILL' },
  );
}

await mkdir(TMP, { recursive: true });

/* Manifes cover ditulis oleh skrip cover; galeri ditambahkan ke atasnya, bukan
   menggantikannya. Membaca ulang berkasnya lebih murah daripada menjalankan
   ulang kedua skrip setiap kali salah satunya berubah. */
const { PRODUCT_MEDIA } = (await import(
  /* @vite-ignore */ 'file://' + MEDIA.replace(/\\/g, '/')
)) as { PRODUCT_MEDIA: Record<string, Record<string, readonly [number, number]>> };

/* Seluruh entri disalin, bukan cover saja. Dengan filter satu aplikasi di bawah,
   menyalin `cover` sendirian berarti galeri tiga aplikasi lain terhapus dari
   manifes tanpa berkasnya ikut terhapus — dan halaman produknya jadi melempar
   "tidak ada di manifes" untuk gambar yang sebenarnya ada di disk. */
const failed: string[] = [];
const manifest: Record<string, Record<string, [number, number]>> = {};
for (const [slug, entries] of Object.entries(PRODUCT_MEDIA)) {
  manifest[slug] = Object.fromEntries(
    Object.entries(entries).map(([key, size]) => [key, [...size] as [number, number]]),
  );
}

/* Argumen opsional membatasi ke satu aplikasi: `npm run product:shots -- clipper-studio`.
   Satu aplikasi berubah jauh lebih sering daripada keempatnya sekaligus, dan
   mengulang semuanya berarti dua puluh lima kali muat halaman demi enam. */
const only = process.argv.slice(2);
const targets = Object.entries(SHOTS).filter(([slug]) => only.length === 0 || only.includes(slug));
if (targets.length === 0) throw new Error(`Tidak ada aplikasi cocok: ${only.join(', ')}`);

for (const [slug, urls] of targets) {
  const dir = path.join(OUT, slug);
  await mkdir(dir, { recursive: true });

  for (const [i, url] of urls.entries()) {
    const key = String(i + 1).padStart(2, '0');
    const png = path.join(TMP, `${slug}-${key}.png`);

    /* Sekali coba ulang: kegagalan yang pernah terjadi selalu berupa batas waktu
       pada halaman yang kebetulan lambat, bukan URL yang salah. Yang tetap gagal
       dicatat dan dilaporkan di akhir — bukan menghentikan seluruh proses, karena
       satu halaman rewel tidak boleh membuang lima belas tangkapan yang sudah jadi. */
    try {
      await shoot(url, png).catch(() => shoot(url, png));
    } catch (error) {
      failed.push(`${slug}/${key}  ${url}  (${(error as Error).message.split('\n')[0]})`);
      continue;
    }

    const { data, info } = await sharp(png)
      .webp({ quality: 84 })
      .toBuffer({ resolveWithObject: true });
    await writeFile(path.join(dir, `${key}.webp`), data);
    (manifest[slug] ??= {})[key] = [info.width, info.height];
  }

  const ok = Object.keys(manifest[slug] ?? {}).filter((k) => /^\d+$/.test(k)).length;
  console.log(`  ${slug.padEnd(16)} ${ok}/${urls.length} tangkapan`);
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

await rm(TMP, { recursive: true, force: true });
console.log(`\nManifes: ${path.relative(process.cwd(), MEDIA)}`);
