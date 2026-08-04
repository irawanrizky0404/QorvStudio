/**
 * URL kanonik situs, dibersihkan.
 *
 * Nilai mentah `NEXT_PUBLIC_SITE_URL` tidak dipakai langsung karena satu karakter
 * tak terlihat di dalamnya menjatuhkan seluruh metadata situs.
 *
 * Yang benar-benar terjadi: variabel ini disetel lewat pipe PowerShell, dan
 * PowerShell menuliskan BOM UTF-8 (U+FEFF) di depan nilainya. `new URL()` di
 * dalam `metadataBase` melempar `ERR_INVALID_URL`, `generateMetadata` gagal, dan
 * karena metadata dirender sebagai satu kesatuan, **semua** tag ikut hilang —
 * title, Open Graph, dan link favicon. Gejalanya di browser cuma satu: ikon tab
 * tidak muncul. Halamannya sendiri tetap 200 dan terlihat normal, jadi tidak ada
 * yang mengarahkan curiga ke metadata.
 *
 * BOM, spasi, dan garis miring di ujung dibuang. Nilai yang tetap tidak sah
 * dijatuhkan ke default, bukan dilempar: konfigurasi yang salah seharusnya
 * membuat URL kanoniknya keliru, bukan membuat setiap halaman kehilangan
 * judulnya.
 */
const FALLBACK = 'http://localhost:3030';

export function siteUrl(): string {
  const raw = process.env.NEXT_PUBLIC_SITE_URL;
  if (!raw) return FALLBACK;

  const cleaned = raw.replace(/^﻿/, '').trim().replace(/\/+$/, '');
  try {
    return new URL(cleaned).toString().replace(/\/+$/, '');
  } catch {
    return FALLBACK;
  }
}
