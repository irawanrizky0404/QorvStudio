import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

import { userRepo } from '@/lib/repo';
import type { SafeUser, UserRole } from '@/types/content';

/**
 * Sesi panel admin.
 *
 * Sebelumnya panel ini punya satu akun studio tanpa tabel pengguna: cookie-nya
 * hanya membawa waktu kedaluwarsa beserta HMAC-nya, dan artinya cuma "seseorang
 * tahu passwordnya". Dengan beberapa pengguna dan dua peran, itu tidak cukup —
 * setiap permintaan harus tahu **siapa** yang masuk dan **boleh apa**.
 *
 * Cookie kini membawa `userId.expiresAt.signature`. Perannya sengaja TIDAK ikut
 * ditulis di cookie: peran yang dibawa klien akan tetap berlaku setelah operator
 * diturunkan haknya, sampai cookie-nya kedaluwarsa. Peran selalu dibaca ulang
 * dari penyimpanan pada setiap permintaan.
 *
 * `proxy.ts` hanya memeriksa keberadaan cookie — pengalihan itu kemudahan,
 * bukan gerbangnya. Gerbangnya `requireSession` dan `requireRole`.
 */

export const SESSION_COOKIE = 'qorv_session';

const MAX_AGE_SECONDS = 60 * 60 * 8;

function secret(): string {
  const value = process.env.ADMIN_SECRET;
  if (value && value.length >= 16) return value;
  if (process.env.NODE_ENV === 'production') {
    throw new Error('ADMIN_SECRET must be set to at least 16 characters in production.');
  }
  return 'qorv-development-secret-not-for-production';
}

function sign(payload: string): string {
  return createHmac('sha256', secret()).update(payload).digest('hex');
}

/** Constant-time compare so a wrong guess leaks no timing signal. */
function equals(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}

function mintToken(userId: string): string {
  const expiresAt = Date.now() + MAX_AGE_SECONDS * 1000;
  const payload = `${userId}.${expiresAt}`;
  return `${payload}.${sign(payload)}`;
}

function readToken(token: string | undefined): string | null {
  if (!token) return null;
  const parts = token.split('.');
  if (parts.length !== 3) return null;

  const [userId, expiresAt, signature] = parts as [string, string, string];
  if (!equals(signature, sign(`${userId}.${expiresAt}`))) return null;
  if (Number(expiresAt) <= Date.now()) return null;

  return userId;
}

export async function startSession(userId: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, mintToken(userId), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: MAX_AGE_SECONDS,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/**
 * Pengguna yang sedang masuk, dibaca ulang dari penyimpanan setiap kali.
 *
 * Mengembalikan `null` juga ketika akunnya sudah dihapus atau dinonaktifkan
 * setelah cookie diterbitkan — jadi mencabut akses berlaku seketika, tanpa
 * menunggu sesi kedaluwarsa.
 */
export async function currentUser(): Promise<SafeUser | null> {
  const store = await cookies();
  const userId = readToken(store.get(SESSION_COOKIE)?.value);
  if (!userId) return null;

  const user = await userRepo.get(userId);
  if (!user || !user.active) return null;
  return user;
}

export async function isAuthenticated(): Promise<boolean> {
  return (await currentUser()) !== null;
}

/** Panggil di awal setiap halaman admin dan setiap server action admin. */
export async function requireSession(): Promise<SafeUser> {
  const user = await currentUser();
  if (!user) redirect('/admin/login');
  return user;
}

/**
 * Gerbang peran.
 *
 * `dev` melewati semuanya. `admin` hanya lolos bila yang diminta `admin`.
 * Ditulis sebagai daftar peran yang diterima, bukan hierarki angka, supaya
 * menambah peran ketiga nanti tidak diam-diam memberi akses ke mana-mana.
 */
export async function requireRole(...allowed: UserRole[]): Promise<SafeUser> {
  const user = await requireSession();
  if (user.role === 'dev') return user;
  if (allowed.includes(user.role)) return user;
  redirect('/admin');
}
