import 'server-only';

import { getDriver } from '@/lib/repo';

/**
 * Pembatas laju jendela tetap, dibagi lintas instance.
 *
 * Versi sebelumnya ada dua, keduanya `Map` di memori proses — satu untuk login,
 * satu untuk formulir kontak. Di serverless itu berarti batasnya **tidak
 * benar-benar ada**: tiap instance punya hitungan sendiri, dan penebak yang
 * mengirim cukup cepat mendarat di instance yang berbeda-beda, masing-masing
 * dengan hitungan nol. Batas 6 percobaan per 15 menit menjadi 6 dikali berapa
 * pun instance yang kebetulan hidup.
 *
 * Sekarang hitungannya di Redis, jadi satu batas berlaku untuk semua.
 *
 * Jendela tetap, bukan sliding window: satu `INCR` plus satu `EXPIRE` pada
 * kunci pertama, dua perintah, tanpa menyimpan daftar timestamp. Sisi lemahnya
 * diketahui — pemohon bisa mengirim `max` di ujung jendela dan `max` lagi di
 * awal jendela berikutnya. Untuk menahan penebakan password dan spam formulir
 * itu sudah cukup; yang dicegah adalah ribuan percobaan, bukan dua kali lipat.
 *
 * ponytail: jendela tetap. Naikkan ke sliding window kalau lonjakan di batas
 * jendela benar-benar terlihat di log.
 */
export interface RateLimit {
  /** `true` berarti permintaan ini harus ditolak. */
  limited: boolean;
  /** Sisa jatah setelah permintaan ini. */
  remaining: number;
}

/**
 * Menghitung satu percobaan dan mengatakan apakah kuotanya sudah lewat.
 *
 * Gagal-terbuka kalau penyimpanannya bermasalah. Pilihan itu disengaja: Redis
 * yang tidak bisa dihubungi seharusnya tidak menutup formulir kontak dan halaman
 * login untuk semua orang. Kegagalan tertutup akan mengubah gangguan penyimpanan
 * menjadi pemadaman total.
 */
export async function hit(scope: string, key: string, max: number, windowSec: number): Promise<RateLimit> {
  const driver = getDriver();

  /* Driver memori tidak punya operasi atomik, dan saat pengembangan pembatasan
     laju hanya menghalangi. Batasnya nyata hanya di penyimpanan persisten. */
  if (!driver.persistent) return { limited: false, remaining: max };

  const bucket = Math.floor(Date.now() / (windowSec * 1000));
  const redisKey = `qorv:rl:${scope}:${key}:${bucket}`;

  try {
    const used = await driver.increment(redisKey, windowSec);
    return { limited: used > max, remaining: Math.max(0, max - used) };
  } catch {
    return { limited: false, remaining: max };
  }
}
