import 'server-only';

import { createHash } from 'node:crypto';

import { hashPassword, verifyPassword } from '@/lib/password';
import type { SafeUser, User, UserRole } from '@/types/content';
import { getDriver, storeKey } from '../driver';
import { makeId, nowIso } from './store';

/**
 * Penyimpanan pengguna panel.
 *
 * Sama seperti entitas lain, datanya lewat driver — lihat `../driver.ts`.
 * Bedanya satu hal penting: **pengguna pertama dibuat dari variabel lingkungan**,
 * bukan dari data seed. Kalau ia ikut di-seed sebagai literal, kredensial
 * operator akan tercatat di dalam repositori.
 *
 * `passwordHash` tidak pernah meninggalkan modul ini. Setiap fungsi yang
 * dipanggil dari luar mengembalikan `SafeUser`, sehingga tidak ada jalan bagi
 * hash untuk sampai ke payload Server Component atau ke klien.
 */

const USERS_KEY = storeKey('users');

/**
 * Id pengguna bootstrap sengaja TETAP, bukan `makeId('usr')`.
 *
 * Di dev, Next mengevaluasi modul server lebih dari sekali pada instance yang
 * berbeda, jadi penyemaian bisa berjalan ulang. Dengan id acak, setiap evaluasi
 * ulang menghasilkan id baru — cookie yang baru diterbitkan menunjuk id lama,
 * `get()` mengembalikan null, sesi dianggap mati, dan operator dilempar balik ke
 * login yang langsung memulai siklusnya lagi: ERR_TOO_MANY_REDIRECTS.
 *
 * Di serverless alasannya makin kuat: setiap instance dingin menyemai sendiri,
 * dan id yang berbeda-beda akan membuat sesi mati setiap kali permintaan
 * mendarat di instance lain.
 */
const BOOTSTRAP_ID = 'usr_bootstrap';

function bootstrapEmail(): string {
  return process.env.ADMIN_EMAIL ?? 'studio@qorv.id';
}

function bootstrapPassword(): string {
  const value = process.env.ADMIN_PASSWORD;
  if (value && value.length > 0) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_PASSWORD must be set in production.');
  }
  return 'qorv-admin';
}

/**
 * Sidik jari nilai lingkungan yang membentuk pengguna bootstrap.
 *
 * Murah — satu SHA-256 — jadi boleh dihitung di setiap pembacaan, tidak seperti
 * scrypt. Tidak dipakai untuk otentikasi apa pun, hanya untuk menjawab satu
 * pertanyaan: apakah `ADMIN_EMAIL` atau `ADMIN_PASSWORD` berubah sejak record
 * ini dibangun?
 */
function envFingerprint(email: string, password: string): string {
  return createHash('sha256').update(`${email}\n${password}`).digest('hex');
}

function buildBootstrap(email: string, hash: string, fingerprint: string): User {
  const now = nowIso();
  return {
    id: BOOTSTRAP_ID,
    email,
    name: 'Studio Owner',
    role: 'dev',
    passwordHash: hash,
    active: true,
    createdAt: now,
    updatedAt: now,
    envFingerprint: fingerprint,
  };
}

/**
 * Pengguna bootstrap **dimiliki oleh lingkungan**, bukan oleh panel.
 *
 * Versi sebelumnya hanya menyemainya sekali: kalau kuncinya sudah ada di
 * penyimpanan, nilai `ADMIN_EMAIL` dan `ADMIN_PASSWORD` yang baru diabaikan
 * selamanya. Itu jebakan yang mahal — mengganti password admin di dashboard
 * terasa seperti berhasil, padahal tidak mengubah apa pun, dan satu-satunya
 * cara memperbaikinya adalah menghapus kunci Redis secara manual.
 *
 * Sekarang record-nya dibangun ulang setiap kali sidik jari lingkungannya
 * berubah. Konsekuensinya jelas dan disengaja: **email dan password akun ini
 * tidak bisa diubah lewat panel** — kalau diubah, ia akan kembali ke nilai
 * lingkungan pada permintaan berikutnya. Akun yang dikelola panel dibuat lewat
 * Admin > Users.
 *
 * Kalau alamat itu sudah dipakai pengguna lain, rekonsiliasinya dilewati. Lebih
 * baik satu akun tertinggal di nilai lama daripada dua record berbagi email dan
 * `verify()` memilih salah satunya secara sembarang.
 */
async function readUsers(): Promise<User[]> {
  const email = bootstrapEmail().trim().toLowerCase();
  const fingerprint = envFingerprint(email, bootstrapPassword());

  const stored = await getDriver().loadOrSeed<User[]>(USERS_KEY, () => []);

  const current = stored.find((user) => user.id === BOOTSTRAP_ID);
  if (current?.envFingerprint === fingerprint) return stored;

  if (stored.some((user) => user.id !== BOOTSTRAP_ID && user.email === email)) {
    return stored;
  }

  const rebuilt = buildBootstrap(email, await hashPassword(bootstrapPassword()), fingerprint);
  const next = current
    ? stored.map((user) =>
        user.id === BOOTSTRAP_ID
          ? { ...rebuilt, createdAt: current.createdAt, name: current.name }
          : user,
      )
    : [rebuilt, ...stored];

  await writeUsers(next);
  return next;
}

async function writeUsers(users: User[]): Promise<void> {
  await getDriver().save(USERS_KEY, users);
}

function safe(user: User): SafeUser {
  const { passwordHash: _hash, envFingerprint: _fingerprint, ...rest } = user;
  return rest;
}

function countActiveDevs(users: User[]): number {
  return users.filter((user) => user.role === 'dev' && user.active).length;
}

export interface UserInput {
  email: string;
  name: string;
  role: UserRole;
  active: boolean;
  /** Kosong saat menyunting berarti "biarkan password lama". */
  password?: string;
}

export const userRepo = {
  async list(): Promise<SafeUser[]> {
    const users = await readUsers();
    return users.map(safe).sort((a, b) => a.email.localeCompare(b.email));
  },

  async get(id: string): Promise<SafeUser | null> {
    const users = await readUsers();
    const found = users.find((user) => user.id === id);
    return found ? safe(found) : null;
  },

  async create(input: UserInput): Promise<SafeUser> {
    const users = await readUsers();
    const email = input.email.trim().toLowerCase();

    if (users.some((user) => user.email === email)) {
      throw new Error('EMAIL_TAKEN');
    }
    if (!input.password) {
      throw new Error('PASSWORD_REQUIRED');
    }

    const now = nowIso();
    const user: User = {
      id: makeId('usr'),
      email,
      name: input.name.trim(),
      role: input.role,
      passwordHash: await hashPassword(input.password),
      active: input.active,
      createdAt: now,
      updatedAt: now,
    };
    await writeUsers([...users, user]);
    return safe(user);
  },

  async update(id: string, input: UserInput): Promise<SafeUser> {
    const users = await readUsers();
    const current = users.find((user) => user.id === id);
    if (!current) throw new Error('NOT_FOUND');

    const email = input.email.trim().toLowerCase();
    if (users.some((user) => user.email === email && user.id !== id)) {
      throw new Error('EMAIL_TAKEN');
    }

    /*
     * Akun bootstrap dimiliki lingkungan. Menerima perubahan email atau password
     * di sini akan membuatnya terbalik sendiri pada pembacaan berikutnya, dan
     * kegagalan yang paling membingungkan adalah yang tampak berhasil.
     */
    if (id === BOOTSTRAP_ID && (email !== current.email || input.password)) {
      throw new Error('ENV_MANAGED');
    }

    // Menurunkan peran `dev` terakhir akan mengunci semua orang keluar dari
    // manajemen pengguna, dan tidak ada jalan memulihkannya dari dalam panel.
    const lastDev = current.role === 'dev' && countActiveDevs(users) <= 1;
    if (lastDev && input.role !== 'dev') throw new Error('LAST_DEV');
    if (lastDev && !input.active) throw new Error('LAST_DEV');

    const updated: User = {
      ...current,
      email,
      name: input.name.trim(),
      role: input.role,
      active: input.active,
      passwordHash: input.password ? await hashPassword(input.password) : current.passwordHash,
      updatedAt: nowIso(),
    };
    await writeUsers(users.map((user) => (user.id === id ? updated : user)));
    return safe(updated);
  },

  async remove(id: string): Promise<void> {
    const users = await readUsers();
    const current = users.find((user) => user.id === id);
    if (!current) throw new Error('NOT_FOUND');
    if (current.role === 'dev' && countActiveDevs(users) <= 1) {
      throw new Error('LAST_DEV');
    }
    await writeUsers(users.filter((user) => user.id !== id));
  },

  /**
   * Satu-satunya tempat password diperiksa.
   *
   * Pengguna yang tidak ada dan password yang salah menghasilkan jawaban yang
   * sama, dan keduanya tetap menjalankan satu verifikasi scrypt — tanpa itu,
   * jawaban cepat akan memberitahu penebak bahwa alamatnya belum terdaftar.
   */
  async verify(email: string, password: string): Promise<SafeUser | null> {
    const users = await readUsers();
    const found = users.find((user) => user.email === email.trim().toLowerCase() && user.active);

    const hash = found?.passwordHash ?? (await decoyHash());
    const ok = await verifyPassword(password, hash);

    return ok && found ? safe(found) : null;
  },
};

/** Hash tetap yang tidak akan pernah cocok, dipakai agar waktu jawab seragam. */
let decoy: string | null = null;
async function decoyHash(): Promise<string> {
  decoy ??= await hashPassword(`decoy-${Math.random()}`);
  return decoy;
}
