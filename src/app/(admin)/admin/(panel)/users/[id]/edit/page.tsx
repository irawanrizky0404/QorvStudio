import type { ReactNode } from 'react';
import { notFound } from 'next/navigation';

import { requireRole } from '@/lib/auth';
import { userRepo } from '@/lib/repo';
import { UserForm } from '@/components/admin/user-form';

export default async function EditUserPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  await requireRole('dev');

  const { id } = await params;
  const user = await userRepo.get(id);
  if (!user) notFound();

  return (
    <div className="max-w-3xl">
      <h1 className="display rank-3">Sunting pengguna</h1>
      <p className="mt-4 text-[15px] leading-relaxed">{user.email}</p>
      <UserForm user={user} />
    </div>
  );
}
