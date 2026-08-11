/**
 * Membuka Chrome dengan profil khusus tangkapan layar, supaya Anda bisa login
 * sendiri di sana.
 *
 *   npm run product:profile
 *
 * Kenapa terpisah dari profil Chrome Anda sehari-hari: skrip tangkapan menjalankan
 * Chrome headless dengan `--user-data-dir` yang sama, dan Chrome menolak dua proses
 * memakai satu profil sekaligus. Profil terpisah berarti peramban Anda tidak perlu
 * ditutup, dan sesi aplikasi produk tidak bercampur dengan sesi pribadi.
 *
 * Alurnya:
 *   1. `npm run product:profile` — jendela terbuka dengan tab halaman masuk.
 *   2. Login sendiri di tiap tab. Skrip tangkapan tidak pernah mengisi form login.
 *   3. Tutup jendelanya.
 *   4. `npm run product:shots:auth` — halaman di balik login yang diambil.
 *
 * Cookie sesi tersimpan di profil ini, jadi langkah 1-3 cuma perlu diulang saat
 * sesinya kedaluwarsa.
 */
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const CHROME =
  process.env.CHROME_PATH ?? 'C:/Program Files/Google/Chrome/Application/chrome.exe';
const PROFILE = path.join(process.cwd(), '.cache', 'product-profile');

const LOGIN_PAGES = [
  'https://qorv-commerce.qorvstudio.workers.dev/login',
  'https://qorv-catering.qorvstudio.workers.dev/admin/login',
  'https://qorv-wakaf.qorvstudio.workers.dev/masuk',
  `${process.env.CLIPPER_URL ?? 'http://localhost:4310'}/login`,
];

await mkdir(PROFILE, { recursive: true });

console.log('Membuka Chrome dengan profil tangkapan layar.\n');
console.log('  Login di tiap tab, lalu tutup jendelanya.');
console.log('  Setelah itu jalankan: npm run product:shots:auth\n');
console.log(`  Profil: ${path.relative(process.cwd(), PROFILE)} (tidak masuk git)\n`);

/* `detached` + `unref` supaya perintah npm-nya selesai dan jendelanya tetap
   terbuka — kalau tidak, menutup terminal ikut menutup peramban. */
const child = spawn(CHROME, [`--user-data-dir=${PROFILE}`, '--no-first-run', ...LOGIN_PAGES], {
  detached: true,
  stdio: 'ignore',
});
child.unref();
