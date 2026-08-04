import { readFile } from 'node:fs/promises';
import path from 'node:path';

/**
 * Sumber tunggal untuk favicon, apple icon, dan gambar Open Graph.
 *
 * Logo QORV adalah **logotype**, bukan berkas gambar: "QORV." dalam Space
 * Grotesk berat, huruf besar, tracking rapat, titiknya acid. Karena tidak ada
 * aset gambar yang bisa dipakai, ikonnya digambar dari huruf aslinya lewat
 * `ImageResponse`.
 *
 * Fontnya di-vendor ke repositori, bukan diambil dari Google saat build. Build
 * yang bergantung pada jaringan pihak ketiga akan gagal justru saat jaringan itu
 * bermasalah, dan yang gagal bukan cuma ikonnya — seluruh build.
 * Space Grotesk berlisensi SIL Open Font License 1.1, jadi boleh disertakan.
 *
 * Pada ukuran favicon, "QORV." tidak terbaca. Yang dipakai hanya **Q**-nya, huruf
 * pertama, di atas bidang acid — sesuai aturan sistem: acid tidak pernah jadi
 * foreground, selalu bidang dengan tinta di atasnya. Wordmark utuh dipakai di
 * gambar Open Graph, di mana ruangnya cukup.
 */

export const PAPER = '#e9e9e3';
export const INK = '#0b0b0b';
export const ACID = '#d4ff00';

let cached: Promise<ArrayBuffer> | null = null;

/** Space Grotesk 700, dibaca sekali per proses. */
export function displayFont(): Promise<ArrayBuffer> {
  cached ??= readFile(path.join(process.cwd(), 'src/app/_brand/space-grotesk-700.ttf')).then(
    (buffer) => Uint8Array.from(buffer).buffer as ArrayBuffer,
  );
  return cached;
}

export async function fonts() {
  return [
    {
      name: 'Space Grotesk',
      data: await displayFont(),
      weight: 700 as const,
      style: 'normal' as const,
    },
  ];
}
