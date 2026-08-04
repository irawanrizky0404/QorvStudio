'use server';

import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

import { put } from '@vercel/blob';

import { requireSession } from '@/lib/auth';

export interface UploadResult {
  ok: boolean;
  url?: string;
  message?: string;
}

const MAX_BYTES = 8 * 1024 * 1024;

/**
 * Tipe ditentukan dari **byte pertama berkas**, bukan dari `file.type`.
 *
 * `file.type` dan nama berkas datang dari klien dan bisa dikarang: `evil.html`
 * yang mengaku `image/png` akan tersaji sebagai HTML kalau ekstensinya yang
 * dipercaya. Jadi ekstensi yang ditulis ke disk selalu berasal dari signature
 * di bawah ini, dan nama aslinya dibuang seluruhnya.
 *
 * SVG sengaja tidak ada di daftar: SVG adalah dokumen XML yang bisa memuat
 * skrip, dan disajikan dari domain sendiri itu berarti XSS.
 */
const SIGNATURES: ReadonlyArray<{ ext: string; test: (b: Buffer) => boolean }> = [
  { ext: 'png', test: (b) => b.subarray(0, 4).toString('hex') === '89504e47' },
  { ext: 'jpg', test: (b) => b.subarray(0, 3).toString('hex') === 'ffd8ff' },
  { ext: 'gif', test: (b) => b.subarray(0, 4).toString('ascii') === 'GIF8' },
  {
    ext: 'webp',
    test: (b) =>
      b.subarray(0, 4).toString('ascii') === 'RIFF' && b.subarray(8, 12).toString('ascii') === 'WEBP',
  },
  { ext: 'avif', test: (b) => b.subarray(4, 12).toString('ascii') === 'ftypavif' },
];

/**
 * Unggah satu gambar dan kembalikan URL publiknya.
 *
 * Dua tujuan penyimpanan, dipilih dari environment — pola yang sama dengan
 * lapisan repositori:
 *
 * - **Vercel Blob** kalau `BLOB_READ_WRITE_TOKEN` ada. Ini yang dipakai di
 *   produksi, karena filesystem Vercel read-only kecuali `/tmp`, dan `/tmp`
 *   tidak disajikan ke publik.
 * - **`public/uploads/`** kalau tidak. Ini yang dipakai saat pengembangan lokal
 *   supaya `npm run dev` jalan tanpa akun apa pun.
 *
 * Semua pemeriksaan — sesi, batas ukuran, deteksi tipe, penamaan acak —
 * berlaku sama untuk keduanya.
 */
export async function uploadImage(formData: FormData): Promise<UploadResult> {
  await requireSession();

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ok: false, message: 'Tidak ada berkas yang dipilih.' };
  }
  if (file.size > MAX_BYTES) {
    return { ok: false, message: 'Ukuran maksimal 8 MB.' };
  }

  const bytes = Buffer.from(await file.arrayBuffer());
  const match = SIGNATURES.find((s) => s.test(bytes));
  if (!match) {
    return { ok: false, message: 'Format tidak dikenali. Pakai PNG, JPG, WebP, AVIF, atau GIF.' };
  }

  const name = `${randomUUID()}.${match.ext}`;

  if (process.env.BLOB_READ_WRITE_TOKEN) {
    /*
     * `addRandomSuffix: false` karena namanya sudah UUID. Membiarkan Blob
     * menambah suffix-nya sendiri hanya membuat URL lebih panjang tanpa
     * menambah jaminan apa pun.
     */
    const blob = await put(`uploads/${name}`, bytes, {
      access: 'public',
      contentType: file.type || `image/${match.ext}`,
      addRandomSuffix: false,
    });
    return { ok: true, url: blob.url };
  }

  if (process.env.NODE_ENV === 'production') {
    return {
      ok: false,
      message:
        'Penyimpanan berkas belum dikonfigurasi. Pasang integrasi Vercel Blob, lalu deploy ulang.',
    };
  }

  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return { ok: true, url: `/uploads/${name}` };
}
