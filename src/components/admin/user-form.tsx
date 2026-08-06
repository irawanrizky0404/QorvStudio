'use client';

import { useState } from 'react';
import type { FormEvent, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

import { createUser, updateUser } from '@/app/actions/users';
import { toast } from '@/stores/ui-store';
import { USER_ROLES } from '@/types/content';
import type { SafeUser, UserRole } from '@/types/content';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/field';

/**
 * Formulir pengguna panel.
 *
 * Satu formulir untuk membuat dan menyunting. Bedanya hanya password: wajib
 * saat membuat, dan saat menyunting boleh dikosongkan yang berarti "biarkan
 * yang lama" — mengharuskan password diketik ulang setiap kali nama diperbaiki
 * akan membuat operator memilih password yang mudah diingat.
 *
 * Password lama tidak pernah diisikan ke field, karena memang tidak bisa
 * dibaca: yang tersimpan hanya turunan scrypt-nya.
 */
export function UserForm({ user }: { user?: SafeUser }): ReactNode {
  const router = useRouter();
  const editing = user !== undefined;

  const [email, setEmail] = useState(user?.email ?? '');
  const [name, setName] = useState(user?.name ?? '');
  const [role, setRole] = useState<UserRole>(user?.role ?? 'admin');
  const [active, setActive] = useState(user?.active ?? true);
  const [password, setPassword] = useState('');
  const [pending, setPending] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>): Promise<void> {
    event.preventDefault();
    setPending(true);

    const payload = { email, name, role, active, password };
    const result = editing ? await updateUser(user.id, payload) : await createUser(payload);

    setPending(false);

    if (!result.ok) {
      toast.error('Gagal menyimpan', result.message ?? 'Coba lagi.');
      return;
    }

    toast.success(editing ? 'Pengguna diperbarui' : 'Pengguna dibuat');
    router.push('/admin/users');
    router.refresh();
  }

  return (
    <form onSubmit={(event) => void onSubmit(event)} noValidate className="mt-8 grid gap-5">
      <div className="grid gap-5 md:grid-cols-2">
        <Input
          label="Email"
          type="email"
          autoComplete="off"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
        <Input
          label="Nama"
          required
          value={name}
          onChange={(event) => setName(event.target.value)}
        />
      </div>

      <Input
        label={editing ? 'Password baru (kosongkan bila tidak diubah)' : 'Password'}
        type="password"
        autoComplete="new-password"
        required={!editing}
        hint="Minimal 10 karakter."
        value={password}
        onChange={(event) => setPassword(event.target.value)}
      />

      <fieldset>
        <legend className="label">Peran</legend>
        <div className="mt-2 grid grid-cols-2 gap-[3px] border-3 border-ink ruled">
          {USER_ROLES.map((value) => (
            <button
              key={value}
              type="button"
              aria-pressed={role === value}
              onClick={() => setRole(value)}
              className={
                'label min-h-12 px-4 py-3 text-center transition-colors duration-150 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink ' +
                (role === value ? 'bg-acid text-ink' : 'bg-paper text-ink-soft hover:bg-paper-dim')
              }
            >
              {value === 'dev' ? 'Dev — akses penuh' : 'Admin — konten saja'}
            </button>
          ))}
        </div>
        <p className="mt-3 text-[13px] leading-relaxed">
          Hanya peran <b className="text-ink">Dev</b> yang bisa membuka dan mengubah daftar
          pengguna. Peran <b className="text-ink">Admin</b> mengelola konten saja.
        </p>
      </fieldset>

      <fieldset>
        <legend className="label">Status</legend>
        <div className="mt-2 grid grid-cols-2 gap-[3px] border-3 border-ink ruled">
          {[true, false].map((value) => (
            <button
              key={String(value)}
              type="button"
              aria-pressed={active === value}
              onClick={() => setActive(value)}
              className={
                'label min-h-12 px-4 py-3 text-center transition-colors duration-150 focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink ' +
                (active === value ? 'bg-acid text-ink' : 'bg-paper text-ink-soft hover:bg-paper-dim')
              }
            >
              {value ? 'Aktif' : 'Nonaktif'}
            </button>
          ))}
        </div>
      </fieldset>

      <div className="mt-2 flex flex-wrap gap-4">
        <Button type="submit" size="lg" loading={pending}>
          {editing ? 'Simpan perubahan' : 'Buat pengguna'}
        </Button>
        <Button type="button" size="lg" variant="outline" onClick={() => router.push('/admin/users')}>
          Batal
        </Button>
      </div>
    </form>
  );
}
