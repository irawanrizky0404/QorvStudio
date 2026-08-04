'use server';

import { randomUUID } from 'node:crypto';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

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
 * Unggah satu gambar dan kembalikan path publiknya.
 *
 * Berkas ditulis ke `public/uploads/`, jadi Next menyajikannya langsung tanpa
 * route tambahan. Konsekuensinya: ini hanya bekerja di server dengan disk yang
 * bisa ditulis. Di Vercel filesystem-nya read-only, jadi sebelum deploy bagian
 * `writeFile` ini harus diganti Vercel Blob — sisa fungsinya (auth, batas
 * ukuran, deteksi signature, penamaan acak) tetap sama.
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
  const dir = path.join(process.cwd(), 'public', 'uploads');
  await mkdir(dir, { recursive: true });
  await writeFile(path.join(dir, name), bytes);

  return { ok: true, url: `/uploads/${name}` };
}
