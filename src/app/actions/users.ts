'use server';

import { revalidatePath } from 'next/cache';

import { requireRole, requireSession } from '@/lib/auth';
import { userRepo } from '@/lib/repo';
import { userFormSchema } from '@/lib/schemas/user';
import type { UserRole } from '@/types/content';

export interface ActionResult {
  ok: boolean;
  message?: string;
}

/**
 * Manajemen pengguna — hanya peran `dev`.
 *
 * Setiap action memanggil `requireRole('dev')` sendiri. Menyembunyikan menunya
 * dari peran `admin` mencegah tampilan, bukan akses: server action punya URL
 * dan bisa dipanggil langsung, jadi gerbangnya harus ada di sini.
 */

const DENY: Record<string, string> = {
  EMAIL_TAKEN: 'Email itu sudah dipakai pengguna lain.',
  PASSWORD_REQUIRED: 'Password wajib diisi untuk pengguna baru.',
  NOT_FOUND: 'Pengguna tidak ditemukan.',
  LAST_DEV:
    'Ini satu-satunya pengguna dev yang aktif. Angkat pengguna lain jadi dev dulu sebelum mengubah yang ini.',
  ENV_MANAGED:
    'Email dan password akun ini diatur lewat variabel lingkungan (ADMIN_EMAIL dan ADMIN_PASSWORD), bukan dari panel. Ubah di sana, atau buat pengguna baru di sini.',
};

function explain(error: unknown): string {
  const code = error instanceof Error ? error.message : '';
  return DENY[code] ?? 'Gagal menyimpan. Coba lagi.';
}

/**
 * Nama kolom dalam bahasa yang dipakai formulirnya.
 *
 * Versi sebelumnya menjawab setiap kegagalan validasi dengan satu kalimat yang
 * sama — "Periksa kembali isian formulir." Formulir ini punya lima kolom dan
 * tidak melakukan validasi di klien selain `required`, jadi kalimat itu
 * menyuruh operator menebak kolom mana yang salah.
 */
const FIELD: Record<string, string> = {
  email: 'Email',
  name: 'Nama',
  role: 'Peran',
  active: 'Status',
  password: 'Password',
};

type Parsed =
  | { ok: true; input: { email: string; name: string; role: UserRole; active: boolean; password?: string } }
  | { ok: false; message: string };

function parse(raw: unknown): Parsed {
  const parsed = userFormSchema.safeParse(raw);

  if (!parsed.success) {
    const issue = parsed.error.issues[0];
    const field = issue?.path[0];
    const label = typeof field === 'string' ? FIELD[field] : undefined;
    return {
      ok: false,
      message: label
        ? `${label}: ${issue?.message ?? 'tidak valid.'}`
        : 'Periksa kembali isian formulir.',
    };
  }

  return {
    ok: true,
    input: {
      email: parsed.data.email,
      name: parsed.data.name,
      role: parsed.data.role as UserRole,
      active: parsed.data.active,
      password: parsed.data.password ? parsed.data.password : undefined,
    },
  };
}

export async function createUser(raw: unknown): Promise<ActionResult> {
  await requireRole('dev');

  const parsed = parse(raw);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  try {
    await userRepo.create(parsed.input);
  } catch (error) {
    return { ok: false, message: explain(error) };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function updateUser(id: string, raw: unknown): Promise<ActionResult> {
  await requireRole('dev');

  const parsed = parse(raw);
  if (!parsed.ok) return { ok: false, message: parsed.message };

  try {
    await userRepo.update(id, parsed.input);
  } catch (error) {
    return { ok: false, message: explain(error) };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

export async function deleteUser(id: string): Promise<ActionResult> {
  const actor = await requireRole('dev');

  // Menghapus akun sendiri akan mengeluarkan operator di tengah tindakannya,
  // dan tidak ada cara membatalkannya dari dalam panel.
  if (actor.id === id) {
    return { ok: false, message: 'Anda tidak bisa menghapus akun Anda sendiri.' };
  }

  try {
    await userRepo.remove(id);
  } catch (error) {
    return { ok: false, message: explain(error) };
  }

  revalidatePath('/admin/users');
  return { ok: true };
}

/** Dipakai header panel untuk menampilkan siapa yang sedang masuk. */
export async function whoami(): Promise<{ email: string; role: UserRole } | null> {
  const user = await requireSession();
  return { email: user.email, role: user.role };
}
