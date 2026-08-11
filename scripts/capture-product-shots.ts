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
 * Halaman yang butuh login tidak diambil — skrip ini tidak pernah mengisi form
 * login. Yang di balik login masuk lewat `import-product-shots.ts`, dari
 * tangkapan yang diambil operator sendiri.
 *
 * Keluarannya bernama `pub-NN.webp`, bukan `NN.webp`. Galerinya dirakit oleh
 * skrip impor, yang menulis `NN.webp` — dan pernah terjadi skrip impor membaca
 * berkas publik dari folder tujuan yang sudah ditimpanya sendiri pada jalan
 * sebelumnya, sehingga tangkapan publiknya berganti jadi salinan dashboard.
 * Ruang nama terpisah membuat itu tidak bisa terjadi lagi.
 */
import { mkdir, rm, writeFile } from 'node:fs/promises';
import { execFile } from 'node:child_process';
import path from 'node:path';
import { promisify } from 'node:util';
import sharp from 'sharp';

const run = promisify(execFile);

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
/*
 * Bukan di `public/`: keluaran skrip ini bahan mentah untuk
 * `import-product-shots.ts`, bukan aset yang disajikan. Menaruhnya di `public/`
 * berarti belasan berkas ikut ter-deploy padahal tidak pernah diminta satu
 * permintaan pun.
 */
const OUT = path.join(process.cwd(), 'assets', 'product-public-shots');
const TMP = path.join(process.cwd(), '.cache', 'product-shots');
const MEDIA = path.join(process.cwd(), 'src', 'lib', 'mock-data', 'product-media.ts');

/*
 * Profil Chrome. Sekali pakai secara bawaan; kalau `SHOT_PROFILE` disetel,
 * profil itu dipakai dan tidak dihapus di akhir — di situlah cookie sesi login
 * disimpan. Profil sekali pakai tidak pernah punya sesi, jadi tanpa ini setiap
 * halaman terkunci hanya menghasilkan tangkapan halaman masuk.
 */
const AUTHED_RUN = process.argv.includes('--authed');
const PROFILE = AUTHED_RUN
  ? path.join(process.cwd(), '.cache', 'product-profile')
  : path.join(TMP, 'profile');

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

/**
 * Halaman di balik login, dipakai menggantikan daftar publik di atas ketika
 * `SHOT_PROFILE` menunjuk ke profil Chrome yang sudah login.
 *
 * Bagian terkuat dari keempat aplikasi ini justru ada di balik login — dasbor
 * bendahara, antrian verifikasi, pengelolaan pesanan. Yang publik cuma etalase.
 *
 * Skrip ini tidak pernah mengisi form login sendiri. Alur yang dipakai: buka
 * Chrome biasa dengan profil ini, login manual, tutup, lalu jalankan skrip —
 * cookie-nya ikut terbawa. Lihat `npm run product:profile`, lalu `npm run product:shots:auth`.
 */
const AUTHED: Record<string, string[]> = {
  'qorv-commerce': [
    `${COMMERCE}/dashboard`,
    `${COMMERCE}/dashboard/products`,
    `${COMMERCE}/dashboard/orders`,
    `${COMMERCE}/dashboard/reports`,
    `${COMMERCE}/dashboard/store-decoration`,
    `${COMMERCE}/dashboard/customers`,
  ],
  'qorv-catering': [
    `${CATERING}/admin/overview`,
    `${CATERING}/admin/menu`,
    `${CATERING}/admin/categories`,
    `${CATERING}/admin/reviews`,
    `${CATERING}/admin/staff`,
    `${CATERING}/menu`,
  ],
  'clipper-studio': [
    `${CLIPPER}/projects`,
    `${CLIPPER}/video-manager`,
    `${CLIPPER}/settings`,
    `${CLIPPER}/billing`,
    `${CLIPPER}/`,
    `${CLIPPER}/pricing`,
  ],
  'wakaf-rw': [
    `${WAKAF}/admin`,
    `${WAKAF}/admin/verifikasi`,
    `${WAKAF}/admin/kk`,
    `${WAKAF}/admin/periode`,
    `${WAKAF}/admin/bayar`,
    `${WAKAF}/rt`,
  ],
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
      `--user-data-dir=${PROFILE}`,
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

/* Manifes hanya dibaca-tulis oleh skrip cover dan skrip impor. Skrip ini cuma
   menghasilkan berkas gambar, jadi manifesnya dibiarkan apa adanya. */
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
const only = process.argv.slice(2).filter((arg) => arg !== '--authed');
const targets = Object.entries(AUTHED_RUN ? AUTHED : SHOTS).filter(
  ([slug]) => only.length === 0 || only.includes(slug),
);
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
    (manifest[slug] ??= {})[`pub-${key}`] = [info.width, info.height];
  }

  const ok = Object.keys(manifest[slug] ?? {}).filter((k) => k.startsWith('pub-')).length;
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

/* Profil persisten hidup di luar TMP, jadi menghapus TMP tidak membuang sesinya. */
await rm(TMP, { recursive: true, force: true });
console.log(`\nManifes: ${path.relative(process.cwd(), MEDIA)}`);
