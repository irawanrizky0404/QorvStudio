import 'server-only';

import { randomBytes, scrypt as scryptCb, timingSafeEqual } from 'node:crypto';
import { promisify } from 'node:util';

const scrypt = promisify(scryptCb) as (
  password: string,
  salt: Buffer,
  keylen: number,
) => Promise<Buffer>;

/**
 * Password hashing.
 *
 * `scrypt` dari `node:crypto` — tanpa dependensi baru. Ia memory-hard, jadi
 * jauh lebih mahal untuk diserang dengan GPU dibanding hash cepat seperti
 * SHA-256, dan itu satu-satunya alasan memilihnya di sini.
 *
 * Sampai sekarang panel admin membandingkan satu password polos dari variabel
 * lingkungan. Dengan beberapa pengguna, menyimpan password apa adanya berarti
 * satu kebocoran basis data membocorkan semua akun sekaligus — jadi yang
 * disimpan hanya turunannya, dan nilai aslinya tidak pernah bisa dibaca lagi
 * oleh siapapun, termasuk operator dengan peran `dev`.
 *
 * Format: `salt:hash`, keduanya hex. Salt acak 16 byte per pengguna, sehingga
 * dua orang dengan password sama tetap menghasilkan hash berbeda.
 */

const KEY_LENGTH = 64;
const SALT_BYTES = 16;

export async function hashPassword(plain: string): Promise<string> {
  const salt = randomBytes(SALT_BYTES);
  const derived = await scrypt(plain, salt, KEY_LENGTH);
  return `${salt.toString('hex')}:${derived.toString('hex')}`;
}

/**
 * Selalu berjalan dalam waktu yang sama untuk hash yang berbentuk benar, supaya
 * lamanya jawaban tidak membocorkan seberapa dekat tebakannya.
 */
export async function verifyPassword(plain: string, stored: string): Promise<boolean> {
  const [saltHex, hashHex] = stored.split(':');
  if (!saltHex || !hashHex) return false;

  const expected = Buffer.from(hashHex, 'hex');
  const derived = await scrypt(plain, Buffer.from(saltHex, 'hex'), expected.length);
  if (derived.length !== expected.length) return false;

  return timingSafeEqual(derived, expected);
}
