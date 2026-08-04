import 'server-only';

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
 * Hash-nya dihitung sekali per proses, bukan tiap pembacaan.
 *
 * scrypt sengaja lambat. Tanpa cache ini, setiap pembacaan daftar pengguna pada
 * instance yang belum tersemai akan membayar biaya itu lagi walaupun hasilnya
 * langsung dibuang karena kuncinya ternyata sudah ada.
 */
let bootstrapSeed: Promise<User[]> | null = null;

function seedUsers(): Promise<User[]> {
  bootstrapSeed ??= (async () => {
    const now = nowIso();
    return [
      {
        id: BOOTSTRAP_ID,
        email: bootstrapEmail().toLowerCase(),
        name: 'Studio Owner',
        role: 'dev',
        passwordHash: await hashPassword(bootstrapPassword()),
        active: true,
        createdAt: now,
        updatedAt: now,
      },
    ];
  })();
  return bootstrapSeed;
}

/*
 * `loadOrSeed` menerima seed sinkron, sedangkan milik kita async. Menghitungnya
 * lebih dulu di sini menjaga antarmuka driver tetap sederhana, dan biayanya
 * hanya sekali per proses berkat cache di atas.
 */
async function readUsers(): Promise<User[]> {
  const seed = await seedUsers();
  return getDriver().loadOrSeed<User[]>(USERS_KEY, () => structuredClone(seed));
}

async function writeUsers(users: User[]): Promise<void> {
  await getDriver().save(USERS_KEY, users);
}

function safe(user: User): SafeUser {
  const { passwordHash: _hash, ...rest } = user;
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
