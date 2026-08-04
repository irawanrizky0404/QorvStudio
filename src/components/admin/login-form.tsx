'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';

import { login } from '@/app/actions/auth';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';
import { Card } from '@/components/ui/primitives';

/**
 * Login panel.
 *
 * Kini email dan password. Sebelumnya hanya password, karena panel ini punya
 * satu akun studio tanpa tabel pengguna — dengan beberapa operator, password
 * saja tidak lagi mengidentifikasi siapapun.
 *
 * Pesan galatnya sengaja satu untuk semua sebab kegagalan (email tak dikenal,
 * password salah, akun nonaktif) dan ditaruh di atas formulir, bukan menempel
 * di salah satu field — menempelkannya di password akan memberitahu penebak
 * bahwa alamat yang dimasukkan ternyata terdaftar.
 */
export function LoginForm({ from }: { from: string }): ReactNode {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);
    setError(null);
    try {
      // Kredensial yang benar melakukan redirect, jadi hanya jalur gagal
      // yang kembali ke sini.
      const result = await login({ email, password, from });
      setError(result.message ?? 'Gagal masuk.');
    } catch {
      // Action yang ditolak tetap harus melepas tombol, atau formulirnya macet.
      setError('Login sedang tidak tersedia. Coba lagi.');
    }
    setPending(false);
  }

  return (
    <Card className="mt-10">
      <form onSubmit={(event) => void onSubmit(event)} noValidate className="flex flex-col gap-5">
        {error ? (
          <p role="alert" className="border-3 border-danger px-4 py-3 text-[13px] text-danger">
            {error}
          </p>
        ) : null}

        <Input
          label="Email"
          type="email"
          autoComplete="username"
          autoFocus
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Password"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
        <Button type="submit" size="lg" loading={pending} className="mt-1 w-full">
          {pending ? 'Masuk…' : 'Masuk'}
        </Button>
      </form>
    </Card>
  );
}
