import 'server-only';

import { Redis } from '@upstash/redis';

/**
 * Di mana data repositori disimpan.
 *
 * Dua implementasi, dipilih dari environment:
 *
 * - **Redis (Upstash)** ketika `UPSTASH_REDIS_REST_URL` dan tokennya ada. Ini
 *   yang dipakai di produksi. Serverless berarti setiap permintaan bisa jatuh
 *   ke instance proses yang berbeda, jadi memori proses tidak bisa jadi tempat
 *   penyimpanan — dua pengunjung akan melihat data berbeda dan suntingan
 *   operator hilang begitu instance-nya didaur.
 * - **Memori** ketika kredensialnya tidak ada. Ini yang dipakai saat
 *   pengembangan lokal supaya `npm run dev` jalan tanpa akun apa pun.
 *
 * Catatan: `@vercel/kv` sudah tidak ada lagi sebagai produk first-party Vercel;
 * penggantinya adalah Upstash Redis lewat Marketplace.
 *
 * Satu koleksi disimpan sebagai satu nilai JSON, bukan satu kunci per record.
 * Jumlah datanya puluhan, dan bentuk itu membuat seluruh penyaringan,
 * pengurutan, dan paginasi yang sudah ada tetap bekerja apa adanya di atas
 * array biasa.
 *
 * ponytail: tulis-baca seluruh koleksi tanpa penguncian — dua penyuntingan
 * bersamaan, yang terakhir menang. Panel ini dipakai satu operator, jadi
 * batasnya belum terasa. Kalau nanti perlu, naikkan ke satu kunci per record
 * dengan indeks terpisah.
 */
export interface StorageDriver {
  /** `false` berarti data hilang saat proses berhenti. */
  readonly persistent: boolean;
  /** Membaca nilai; menulis `seed()` lebih dulu bila kuncinya belum ada. */
  loadOrSeed<T>(key: string, seed: () => T): Promise<T>;
  save<T>(key: string, value: T): Promise<void>;
}

/* ── Memori ───────────────────────────────────────────────────────────────── */

/*
 * Dipin ke `globalThis` karena Next mengevaluasi ulang modul server saat HMR.
 * Tanpa ini, tiap penyuntingan berkas diam-diam mengosongkan data yang baru
 * saja diubah operator di panel.
 */
const globalMemory = globalThis as unknown as { __qorvStore?: Map<string, unknown> };
const memory = (globalMemory.__qorvStore ??= new Map<string, unknown>());

const memoryDriver: StorageDriver = {
  persistent: false,

  async loadOrSeed<T>(key: string, seed: () => T): Promise<T> {
    if (!memory.has(key)) memory.set(key, seed());
    return memory.get(key) as T;
  },

  async save<T>(key: string, value: T): Promise<void> {
    memory.set(key, value);
  },
};

/* ── Redis ────────────────────────────────────────────────────────────────── */

function redisDriver(redis: Redis): StorageDriver {
  return {
    persistent: true,

    async loadOrSeed<T>(key: string, seed: () => T): Promise<T> {
      const existing = await redis.get<T>(key);
      if (existing !== null && existing !== undefined) return existing;

      /*
       * `nx: true` supaya instance yang start bersamaan tidak saling menimpa.
       * Yang kalah membaca ulang dan memakai nilai pemenang, bukan nilai seed
       * miliknya sendiri.
       */
      const value = seed();
      await redis.set(key, value, { nx: true });
      return (await redis.get<T>(key)) ?? value;
    },

    async save<T>(key: string, value: T): Promise<void> {
      await redis.set(key, value);
    },
  };
}

/* ── Pemilihan ────────────────────────────────────────────────────────────── */

function pick(): StorageDriver {
  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (url && token) return redisDriver(new Redis({ url, token }));

  /*
   * Gagal keras saat dijalankan di produksi, bukan diam-diam menyajikan memori.
   *
   * Kegagalan yang paling mahal di sini bukan error saat boot, melainkan panel
   * yang kelihatan bekerja: operator menyunting seharian, semuanya tampak
   * tersimpan, lalu hilang pada permintaan berikutnya karena mendarat di
   * instance lain.
   *
   * `next build` dikecualikan. Build juga berjalan dengan `NODE_ENV=production`,
   * dan menolak di sana berarti `npm run build` tidak bisa dipakai memverifikasi
   * apa pun tanpa kredensial. Kalau kredensialnya memang tidak ada saat deploy,
   * kegagalannya tetap muncul — hanya bergeser ke permintaan pertama, di mana ia
   * justru lebih terlihat.
   */
  const building = process.env.NEXT_PHASE === 'phase-production-build';
  if (process.env.NODE_ENV === 'production' && !building) {
    throw new Error(
      'UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN wajib ada di produksi. ' +
        'Pasang integrasi Upstash lewat Vercel Marketplace, lalu deploy ulang.',
    );
  }

  return memoryDriver;
}

/**
 * Driver dipilih saat pertama dipakai, bukan saat modul dievaluasi.
 *
 * Next mengevaluasi kode level modul saat build. Memilih driver di sana berarti
 * pemeriksaan environment ikut berjalan saat build dan menggagalkannya sebelum
 * satu permintaan pun terjadi.
 *
 * Sebuah fungsi, bukan `Proxy`: pembungkus Proxy di sekitar klien penyimpanan
 * memutus pustaka yang memeriksa bentuk objeknya.
 */
const globalDriver = globalThis as unknown as { __qorvDriver?: StorageDriver };

export function getDriver(): StorageDriver {
  return (globalDriver.__qorvDriver ??= pick());
}

/** Awalan kunci supaya satu basis Redis bisa dipakai bersama proyek lain. */
export function storeKey(name: string): string {
  return `qorv:${name}`;
}

/**
 * Kunci penyimpanan untuk sebuah koleksi berseed.
 *
 * Pada driver memori, tanda tangan seed ikut masuk ke kunci. Menambah record ke
 * berkas seed karena itu langsung terlihat di dev server tanpa restart: seed
 * yang berbeda adalah kunci yang berbeda, jadi isinya dibangun ulang sendiri.
 * Suntingan yang dibuat lewat panel tetap hidup lintas HMR karena tidak pernah
 * mengubah seed.
 *
 * Pada driver persisten, tanda tangannya diabaikan. Menyunting berkas seed tidak
 * boleh menyembunyikan data produksi di balik kunci baru.
 */
export function seededKey(name: string, seed: ReadonlyArray<{ id: string }>): string {
  const key = storeKey(name);
  if (getDriver().persistent) return key;
  return `${key}#${seed.length}:${seed.map((item) => item.id).join(',')}`;
}
