/**
 * Ekspor dan impor isi Redis.
 *
 *   npm run backup            # tulis ke backups/qorv-<tanggal>.json
 *   npm run backup -- --in backups/qorv-2026-08-07.json   # pulihkan
 *
 * Kredensialnya dibaca dari `.env.local`. Ambil dari Vercel lebih dulu:
 *
 *   vercel env pull .env.local
 *
 * Catatan: variabel yang ditandai **Sensitive** di Vercel tidak bisa dibaca
 * balik dan akan terisi kosong. Kalau `vercel env pull` menghasilkan nilai
 * kosong, salin URL dan token REST-nya langsung dari console.upstash.com.
 *
 * Kunci pengguna ikut terekspor, dan isinya memuat **hash password scrypt**.
 * Hash bukan password, tapi berkas hasilnya tetap harus diperlakukan sebagai
 * rahasia: jangan di-commit, jangan ditempel ke mana-mana. `backups/` sudah
 * masuk `.gitignore`.
 */
import { Redis } from '@upstash/redis';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const KEYS = [
  'qorv:projects',
  'qorv:services',
  'qorv:products',
  'qorv:inquiries',
  'qorv:settings',
  'qorv:users',
] as const;

function client(): Redis {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;

  if (!url || !token) {
    throw new Error(
      'Kredensial Redis tidak ditemukan. Jalankan `vercel env pull .env.local`, ' +
        'atau salin UPSTASH_REDIS_REST_URL dan UPSTASH_REDIS_REST_TOKEN dari console.upstash.com.',
    );
  }
  return new Redis({ url, token });
}

async function exportAll(): Promise<void> {
  const redis = client();
  const data: Record<string, unknown> = {};

  for (const key of KEYS) {
    const value = await redis.get(key);
    data[key] = value ?? null;
    const count = Array.isArray(value) ? `${value.length} record` : value ? 'ada' : 'kosong';
    console.log(`  ${key.padEnd(18)} ${count}`);
  }

  const dir = path.join(process.cwd(), 'backups');
  await mkdir(dir, { recursive: true });
  const file = path.join(dir, `qorv-${new Date().toISOString().slice(0, 10)}.json`);
  await writeFile(file, JSON.stringify({ exportedAt: new Date().toISOString(), data }, null, 2));

  console.log(`\nTersimpan: ${path.relative(process.cwd(), file)}`);
}

async function importAll(file: string): Promise<void> {
  const parsed = JSON.parse(await readFile(file, 'utf8')) as {
    exportedAt?: string;
    data?: Record<string, unknown>;
  };
  if (!parsed.data) throw new Error(`Berkas tidak berisi bidang "data": ${file}`);

  const redis = client();
  console.log(`Memulihkan dari ${file} (diekspor ${parsed.exportedAt ?? 'entah kapan'})\n`);

  for (const key of KEYS) {
    const value = parsed.data[key];
    /*
     * Kunci yang nilainya null dilewati, tidak dihapus. Cadangan yang dibuat
     * sebelum sebuah koleksi terisi akan mengosongkan koleksi itu kalau null
     * diperlakukan sebagai "hapus" — pemulihan yang justru menghilangkan data.
     */
    if (value === null || value === undefined) {
      console.log(`  ${key.padEnd(18)} dilewati (kosong di cadangan)`);
      continue;
    }
    await redis.set(key, value);
    console.log(`  ${key.padEnd(18)} dipulihkan`);
  }

  console.log('\nSelesai.');
}

const inFlag = process.argv.indexOf('--in');
if (inFlag !== -1) {
  const file = process.argv[inFlag + 1];
  if (!file) throw new Error('Sebutkan berkasnya: --in backups/qorv-2026-08-07.json');
  await importAll(file);
} else {
  await exportAll();
}
