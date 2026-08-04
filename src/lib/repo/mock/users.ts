import 'server-only';

import { hashPassword, verifyPassword } from '@/lib/password';
import type { SafeUser, User, UserRole } from '@/types/content';
import { makeId, nowIso } from './store';

/**
 * Penyimpanan pengguna panel — Phase 1.
 *
 * Sama seperti entitas lain, ini state di level modul dan hilang saat server
 * restart. Bedanya satu hal penting: **pengguna pertama dibuat dari variabel
 * lingkungan**, bukan dari data seed. Kalau ia ikut di-seed sebagai literal,
 * kredensial operator akan tercatat di dalam repositori.
 *
 * `passwordHash` tidak pernah meninggalkan modul ini. Setiap fungsi yang
 * dipanggil dari luar mengembalikan `SafeUser`, sehingga tidak ada jalan bagi
 * hash untuk sampai ke payload Server Component atau ke klien.
 */

/**
 * Id pengguna bootstrap sengaja TETAP, bukan `makeId('usr')`.
 *
 * Di dev, Next mengevaluasi modul server lebih dari sekali pada instance yang
 * berbeda, jadi `ensureSeeded()` bisa berjalan ulang. Dengan id acak, setiap
 * evaluasi ulang menghasilkan id baru — cookie yang baru diterbitkan menunjuk
 * id lama, `get()` mengembalikan null, sesi dianggap mati, dan operator dilempar
 * balik ke login yang langsung memulai siklusnya lagi: ERR_TOO_MANY_REDIRECTS.
 *
 * Store entitas lain tidak kena karena id-nya literal tetap di data seed. Ini
 * satu-satunya yang membuat id saat runtime, jadi ia harus deterministik juga.
 */
const BOOTSTRAP_ID = 'usr_bootstrap';

let users: User[] | null = null;
let seeding: Promise<void> | null = null;

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
 * Sekali saja, dan aman terhadap panggilan bersamaan: promise-nya disimpan,
 * jadi dua permintaan yang datang berbarengan menunggu proses seed yang sama
 * alih-alih membuat dua pengguna bootstrap.
 */
async function ensureSeeded(): Promise<void> {
  if (users) return;
  if (seeding) return seeding;

  seeding = (async () => {
    const now = nowIso();
    users = [
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

  await seeding;
}

function safe(user: User): SafeUser {
  const { passwordHash: _hash, ...rest } = user;
  return rest;
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
    await ensureSeeded();
    return (users ?? [])
      .map(safe)
      .sort((a, b) => a.email.localeCompare(b.email));
  },

  async get(id: string): Promise<SafeUser | null> {
    await ensureSeeded();
    const found = (users ?? []).find((user) => user.id === id);
    return found ? safe(found) : null;
  },

  async create(input: UserInput): Promise<SafeUser> {
    await ensureSeeded();
    const email = input.email.trim().toLowerCase();

    if ((users ?? []).some((user) => user.email === email)) {
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
    users = [...(users ?? []), user];
    return safe(user);
  },

  async update(id: string, input: UserInput): Promise<SafeUser> {
    await ensureSeeded();
    const current = (users ?? []).find((user) => user.id === id);
    if (!current) throw new Error('NOT_FOUND');

    const email = input.email.trim().toLowerCase();
    if ((users ?? []).some((user) => user.email === email && user.id !== id)) {
      throw new Error('EMAIL_TAKEN');
    }

    // Menurunkan peran `dev` terakhir akan mengunci semua orang keluar dari
    // manajemen pengguna, dan tidak ada jalan memulihkannya dari dalam panel.
    if (current.role === 'dev' && input.role !== 'dev' && (await countActiveDevs()) <= 1) {
      throw new Error('LAST_DEV');
    }
    if (current.role === 'dev' && !input.active && (await countActiveDevs()) <= 1) {
      throw new Error('LAST_DEV');
    }

    const updated: User = {
      ...current,
      email,
      name: input.name.trim(),
      role: input.role,
      active: input.active,
      passwordHash: input.password ? await hashPassword(input.password) : current.passwordHash,
      updatedAt: nowIso(),
    };
    users = (users ?? []).map((user) => (user.id === id ? updated : user));
    return safe(updated);
  },

  async remove(id: string): Promise<void> {
    await ensureSeeded();
    const current = (users ?? []).find((user) => user.id === id);
    if (!current) throw new Error('NOT_FOUND');
    if (current.role === 'dev' && (await countActiveDevs()) <= 1) {
      throw new Error('LAST_DEV');
    }
    users = (users ?? []).filter((user) => user.id !== id);
  },

  /**
   * Satu-satunya tempat password diperiksa.
   *
   * Pengguna yang tidak ada dan password yang salah menghasilkan jawaban yang
   * sama, dan keduanya tetap menjalankan satu verifikasi scrypt — tanpa itu,
   * jawaban cepat akan memberitahu penebak bahwa alamatnya belum terdaftar.
   */
  async verify(email: string, password: string): Promise<SafeUser | null> {
    await ensureSeeded();
    const found = (users ?? []).find(
      (user) => user.email === email.trim().toLowerCase() && user.active,
    );

    const hash = found?.passwordHash ?? (await decoyHash());
    const ok = await verifyPassword(password, hash);

    return ok && found ? safe(found) : null;
  },
};

async function countActiveDevs(): Promise<number> {
  await ensureSeeded();
  return (users ?? []).filter((user) => user.role === 'dev' && user.active).length;
}

/** Hash tetap yang tidak akan pernah cocok, dipakai agar waktu jawab seragam. */
let decoy: string | null = null;
async function decoyHash(): Promise<string> {
  decoy ??= await hashPassword(`decoy-${Math.random()}`);
  return decoy;
}
