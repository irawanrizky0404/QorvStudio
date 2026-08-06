import type { ReactNode } from 'react';
import Link from 'next/link';

import { requireRole } from '@/lib/auth';
import { userRepo } from '@/lib/repo';
import { Button } from '@/components/ui/button';
import { DeleteUser } from '@/components/admin/user-actions';

export const dynamic = 'force-dynamic';

/**
 * Daftar pengguna panel — hanya peran `dev`.
 *
 * `requireRole('dev')` di sini, dan sekali lagi di setiap server action-nya.
 * Menyembunyikan menu dari peran `admin` hanya mengurus tampilan; halaman dan
 * action punya URL sendiri dan bisa diminta langsung.
 */
export default async function UsersPage(): Promise<ReactNode> {
  const actor = await requireRole('dev');
  const users = await userRepo.list();

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5 border-b-3 border-ink pb-6">
        <div>
          <h1 className="display rank-3">Pengguna</h1>
          <p className="mt-4 max-w-[52ch] text-[15px] leading-relaxed">
            Peran <b className="text-ink">Dev</b> mengelola pengguna dan seluruh konten. Peran{' '}
            <b className="text-ink">Admin</b> mengelola konten saja.
          </p>
        </div>
        <Button asChild>
          <Link href="/admin/users/new">Tambah pengguna</Link>
        </Button>
      </div>

      <ul className="mt-8 grid gap-[3px] border-3 border-ink ruled">
        {users.map((user) => (
          <li
            key={user.id}
            className="grid items-center gap-4 bg-paper p-5 md:grid-cols-[1.6fr_auto_auto_auto]"
          >
            <div className="min-w-0">
              <p className="display rank-5 truncate normal-case">{user.email}</p>
              <p className="mt-1.5 truncate text-[13px]">{user.name}</p>
            </div>

            <span className="label border-3 border-ink px-3 py-1.5 justify-self-start">
              {user.role === 'dev' ? 'Dev' : 'Admin'}
            </span>

            <span
              className={
                'label px-3 py-1.5 justify-self-start border-3 border-ink ' +
                (user.active ? 'bg-acid text-ink' : 'text-ink-soft')
              }
            >
              {user.active ? 'Aktif' : 'Nonaktif'}
            </span>

            <div className="flex flex-wrap gap-3 md:justify-self-end">
              <Button asChild variant="outline" size="sm">
                <Link href={`/admin/users/${user.id}/edit`}>Sunting</Link>
              </Button>
              {/* Akun sendiri tidak bisa dihapus — operator akan mengeluarkan
                  dirinya di tengah tindakan, tanpa cara memulihkannya. */}
              {actor.id === user.id ? (
                <span className="label flex items-center px-2">Akun Anda</span>
              ) : (
                <DeleteUser id={user.id} email={user.email} />
              )}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
