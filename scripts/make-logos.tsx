import { ImageResponse } from 'next/og';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';
import type { ReactElement } from 'react';

/**
 * Menghasilkan berkas logo dari logotype-nya.
 *
 *   npm run logos
 *
 * Sumbernya sama dengan favicon dan gambar Open Graph: huruf Space Grotesk yang
 * di-vendor di `src/app/_brand/`, bukan gambar yang digambar ulang. Satu tempat
 * kebenaran, jadi logo di berkas ini tidak bisa menyimpang dari logo di situs.
 *
 * Skrip sekali jalan — hasilnya di-commit sebagai aset, tidak dipanggil saat
 * build. Situsnya sendiri sudah punya rute `/icon` dan `/opengraph-image`.
 */

const PAPER = '#e9e9e3';
const INK = '#0b0b0b';
const ACID = '#d4ff00';

/*
 * Hitam dan putih murni, terpisah dari kertas dan tinta.
 *
 * Palet merek memakai #e9e9e3 dan #0b0b0b — keduanya sengaja bukan putih dan
 * hitam murni. Tapi banyak tempat di luar kendali kita menuntut #fff atau #000
 * betulan: cetak satu warna, sablon, watermark, dan berkas yang ditempel ke
 * dokumen milik orang lain. Di sana kertas terbaca sebagai abu kotor.
 */
const WHITE = '#ffffff';
const BLACK = '#000000';

/*
 * Keluarannya ke `Docs/Logo/`, bukan `public/`.
 *
 * Situsnya sendiri tidak memakai berkas ini — favicon dan gambar Open Graph
 * dirender oleh rute `/icon` dan `/opengraph-image`. Berkas di sini untuk dipakai
 * di luar situs: kop surat, profil sosial, deck, cetak. Menaruhnya di `public/`
 * hanya akan menambah aset yang tidak pernah diminta siapa pun ke tiap deploy,
 * dan `public/logos/` sudah berisi logo pihak lain (Figma, Stripe, Vercel).
 */
const OUT = path.join(process.cwd(), 'Docs', 'Logo');
const FONT = path.join(process.cwd(), 'src', 'app', '_brand', 'space-grotesk-700.ttf');

const fontData = Uint8Array.from(await readFile(FONT)).buffer as ArrayBuffer;
const fonts = [
  { name: 'Space Grotesk', data: fontData, weight: 700 as const, style: 'normal' as const },
];

/**
 * Menulis PNG dan JPG dari satu render.
 *
 * `ImageResponse` hanya mengeluarkan PNG, jadi JPG-nya hasil konversi `sharp` —
 * paket yang sudah ikut Next, bukan dependensi baru.
 *
 * JPG tidak punya kanal alfa. Varian berlatar transparan karena itu diratakan
 * dulu ke warna yang disebut: PNG transparan yang di-encode ke JPG tanpa
 * perataan keluar dengan bidang hitam pekat di belakang logonya.
 */
async function save(
  name: string,
  element: ReactElement,
  width: number,
  height: number,
  flatten: string,
): Promise<void> {
  const response = new ImageResponse(element, { width, height, fonts });
  const png = Buffer.from(await response.arrayBuffer());

  await writeFile(path.join(OUT, `${name}.png`), png);
  await writeFile(
    path.join(OUT, `${name}.jpg`),
    await sharp(png).flatten({ background: flatten }).jpeg({ quality: 92 }).toBuffer(),
  );

  console.log(`  ${name}  ${width}x${height}  png + jpg`);
}

/**
 * Titik pada logotype.
 *
 * Acid, sesuai brand guidelines — kecuali kalau bidangnya sendiri acid. Di sana
 * titiknya jadi tak terlihat, jadi ia mengikuti warna hurufnya. Aturan yang sama
 * dengan yang berlaku di situs: acid tidak pernah jadi foreground di atas acid.
 */
function dotColor(background: string, color: string): string {
  return background === ACID ? color : ACID;
}

/** "QORV." — titiknya acid, sesuai brand guidelines. */
function wordmark(color: string, background: string = 'transparent'): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color,
        fontFamily: 'Space Grotesk',
        fontSize: 400,
        letterSpacing: '-0.06em',
      }}
    >
      <span>QORV</span>
      <span style={{ color: dotColor(background, color) }}>.</span>
    </div>
  );
}

/**
 * "QORV." di dalam bidang persegi.
 *
 * Wordmark aslinya sekitar 3,4:1, jadi ia tidak muat di tempat yang menuntut 1:1
 * — foto profil, avatar, petak app store. Yang dikecilkan hanya ukurannya;
 * tracking tidak disentuh dan hurufnya tidak ditumpuk jadi dua baris, karena
 * brand guidelines menuntut karakter logonya tetap solid dan tracking-nya tetap.
 */
function wordmarkSquare(color: string, background: string): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color,
        fontFamily: 'Space Grotesk',
        fontSize: 190,
        letterSpacing: '-0.06em',
      }}
    >
      <span>QORV</span>
      <span style={{ color: dotColor(background, color) }}>.</span>
    </div>
  );
}

/** Bidang berisi satu huruf Q — bentuk yang dipakai saat ruangnya sempit. */
function mark(background: string, color: string): ReactElement {
  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background,
        color,
        fontFamily: 'Space Grotesk',
        fontSize: 760,
        letterSpacing: '-0.06em',
        paddingBottom: 90,
      }}
    >
      Q
    </div>
  );
}

await mkdir(OUT, { recursive: true });
console.log('Menulis ke Docs/Logo/');

// Wordmark: PNG latarnya transparan supaya bisa ditempel di atas apa saja.
await save('qorv-wordmark-ink', wordmark(INK), 2400, 700, PAPER);
await save('qorv-wordmark-paper', wordmark(PAPER), 2400, 700, INK);

// Versi yang bidangnya ikut, untuk tempat yang tidak menyediakan latar sendiri.
await save('qorv-wordmark-ink-on-paper', wordmark(INK, PAPER), 2400, 700, PAPER);
await save('qorv-wordmark-paper-on-ink', wordmark(PAPER, INK), 2400, 700, INK);

// Hitam dan putih murni, untuk latar yang bukan milik kita.
await save('qorv-wordmark-black-on-white', wordmark(BLACK, WHITE), 2400, 700, WHITE);
await save('qorv-wordmark-white-on-black', wordmark(WHITE, BLACK), 2400, 700, BLACK);

// Persegi: wordmark utuh untuk tempat yang menuntut 1:1.
await save('qorv-square-ink-on-paper', wordmarkSquare(INK, PAPER), 1024, 1024, PAPER);
await save('qorv-square-paper-on-ink', wordmarkSquare(PAPER, INK), 1024, 1024, INK);
await save('qorv-square-black-on-white', wordmarkSquare(BLACK, WHITE), 1024, 1024, WHITE);
await save('qorv-square-white-on-black', wordmarkSquare(WHITE, BLACK), 1024, 1024, BLACK);
await save('qorv-square-ink-on-acid', wordmarkSquare(INK, ACID), 1024, 1024, ACID);

// Tanda satu huruf: ruang sempit, avatar, profil sosial.
await save('qorv-mark-acid', mark(ACID, INK), 1024, 1024, ACID);
await save('qorv-mark-ink', mark(INK, PAPER), 1024, 1024, INK);
await save('qorv-mark-paper', mark(PAPER, INK), 1024, 1024, PAPER);
await save('qorv-mark-black', mark(BLACK, WHITE), 1024, 1024, BLACK);
await save('qorv-mark-white', mark(WHITE, BLACK), 1024, 1024, WHITE);

console.log('Selesai.');
