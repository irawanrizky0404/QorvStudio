'use server';

import { redirect } from 'next/navigation';

import { endSession, startSession } from '@/lib/auth';
import { userRepo } from '@/lib/repo';
import { loginSchema } from '@/lib/schemas/user';

export interface LoginResult {
  ok: boolean;
  message?: string;
  /** Tujuan setelah berhasil. Perpindahannya dilakukan klien, lihat `login`. */
  to?: string;
}

/**
 * ponytail: penghitung percobaan di memori. Benar untuk satu proses; Phase 5
 * memindahkannya ke penghitung KV supaya bertahan setelah restart dan berlaku
 * lintas instance.
 *
 * Dikunci per alamat email, bukan satu penghitung global seperti sebelumnya:
 * dengan penghitung bersama, satu penebak bisa mengunci seluruh operator lain
 * keluar hanya dengan mengirim enam tebakan salah.
 */
const LIMIT = { max: 6, windowMs: 15 * 60 * 1000 };
const attempts = new Map<string, number[]>();

function limited(key: string): boolean {
  const now = Date.now();
  const list = attempts.get(key) ?? [];
  while (list.length > 0 && now - (list[0] as number) > LIMIT.windowMs) list.shift();
  attempts.set(key, list);
  if (list.length >= LIMIT.max) return true;
  list.push(now);
  return false;
}

/** Hanya path satu-origin, supaya `?from=` tidak bisa melempar operator keluar. */
function safeRedirect(from: string): string {
  return from.startsWith('/') && !from.startsWith('//') ? from : '/admin';
}

export async function login(raw: unknown): Promise<LoginResult> {
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) {
    return { ok: false, message: 'Masukkan email dan password yang valid.' };
  }

  const email = parsed.data.email.trim().toLowerCase();

  if (limited(email)) {
    return { ok: false, message: 'Terlalu banyak percobaan. Tunggu beberapa menit.' };
  }

  const user = await userRepo.verify(email, parsed.data.password);
  if (!user) {
    // Satu pesan untuk email tak dikenal, password salah, dan akun nonaktif.
    // Membedakannya akan memberitahu penebak alamat mana yang terdaftar.
    return { ok: false, message: 'Email atau password tidak cocok.' };
  }

  await startSession(user.id);
  attempts.delete(email);

  /*
   * Tujuannya dikembalikan, bukan `redirect()`.
   *
   * `redirect()` bekerja dengan melempar. Di Server Action, lemparan itu ikut
   * menolak promise yang ditunggu klien, jadi `try/catch` di formulir menangkap
   * keberhasilan dan menampilkannya sebagai kegagalan — persis yang terjadi:
   * kredensial benar, sesi terbentuk, tapi yang terbaca operator adalah pesan
   * galat.
   *
   * Membiarkan klien yang berpindah menghapus seluruh kelas masalah itu: jalur
   * berhasil dan jalur gagal sama-sama kembali sebagai nilai biasa.
   */
  return { ok: true, to: safeRedirect(parsed.data.from) };
}

export async function logout(): Promise<void> {
  await endSession();
  redirect('/admin/login');
}
