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
  /**
   * Menaikkan penghitung dan mengembalikan nilai barunya, dengan masa berlaku
   * dipasang saat kunci pertama kali dibuat.
   *
   * Dipakai pembatas laju. Ini satu-satunya operasi yang harus atomik: dua
   * permintaan bersamaan yang membaca-lalu-menulis akan sama-sama melihat
   * hitungan lama, dan batasnya bocor persis saat sedang ditekan.
   */
  increment(key: string, ttlSeconds: number): Promise<number>;
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

  async increment(key: string): Promise<number> {
    const next = ((memory.get(key) as number | undefined) ?? 0) + 1;
    memory.set(key, next);
    return next;
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

    async increment(key: string, ttlSeconds: number): Promise<number> {
      const value = await redis.incr(key);
      /* Masa berlaku dipasang hanya pada kenaikan pertama. Memasangnya di setiap
         kenaikan akan memperpanjang jendela setiap kali ada permintaan — pemohon
         yang terus mengetuk tidak akan pernah keluar dari jendelanya sendiri. */
      if (value === 1) await redis.expire(key, ttlSeconds);
      return value;
    },
  };
}

/* ── Pemilihan ────────────────────────────────────────────────────────────── */

/**
 * Dua penamaan untuk kredensial yang sama.
 *
 * Integrasi Upstash di Vercel Marketplace masih menyuntikkan nama warisan
 * `KV_REST_API_*` dari masa Vercel KV, sedangkan `Redis.fromEnv()` dan dokumentasi
 * Upstash memakai `UPSTASH_REDIS_REST_*`. Menerima keduanya lebih murah daripada
 * menyuruh operator menduplikasi variabel dengan nama lain, dan menghindari satu
 * kelas kegagalan yang membingungkan: kredensial jelas-jelas terpasang, tapi
 * aplikasi bersikeras tidak menemukannya.
 */
function credentials(): { url: string; token: string } | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  return url && token ? { url, token } : null;
}

function pick(): StorageDriver {
  const found = credentials();

  if (found) return redisDriver(new Redis(found));

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

  /*
   * Jalan keluar yang disengaja untuk menjalankan build produksi di mesin
   * sendiri.
   *
   * `npm start` memakai `NODE_ENV=production`, jadi tanpa ini penjaganya menyala
   * dan setiap rute dinamis balas 500 di localhost — build produksi jadi tidak
   * bisa diperiksa sama sekali sebelum dikirim. Penjaganya tetap menyala secara
   * bawaan di mana pun; mematikannya menuntut satu variabel yang harus diketik
   * sendiri, dan namanya menyebutkan persis apa yang sedang ditukar.
   */
  const allowMemory = process.env.QORV_ALLOW_MEMORY_STORE === '1';

  if (process.env.NODE_ENV === 'production' && !building && !allowMemory) {
    throw new Error(
      'Kredensial Redis wajib ada di produksi: UPSTASH_REDIS_REST_URL + ' +
        'UPSTASH_REDIS_REST_TOKEN, atau KV_REST_API_URL + KV_REST_API_TOKEN. ' +
        'Pasang integrasi Upstash lewat Vercel Marketplace, lalu deploy ulang. ' +
        'Untuk menjalankan build produksi di mesin sendiri tanpa Redis, setel ' +
        'QORV_ALLOW_MEMORY_STORE=1 — datanya hilang tiap restart.',
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
