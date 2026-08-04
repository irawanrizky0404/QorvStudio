import type { ReactNode } from 'react';

import { requireRole } from '@/lib/auth';
import { UserForm } from '@/components/admin/user-form';

export default async function NewUserPage(): Promise<ReactNode> {
  await requireRole('dev');

  return (
    <div className="max-w-3xl">
      <h1 className="display rank-3">Pengguna baru</h1>
      <p className="mt-4 text-[15px] leading-relaxed">
        Akun ini bisa langsung dipakai masuk begitu dibuat.
      </p>
      <UserForm />
    </div>
  );
}
