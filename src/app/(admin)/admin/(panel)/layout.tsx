import type { ReactNode } from 'react';

import { requireSession } from '@/lib/auth';
import { inquiryRepo } from '@/lib/repo';
import { AdminShell } from '@/components/admin/shell';

/**
 * Everything inside this group is behind the session. Login sits outside it,
 * which is why the group exists at all - the guard runs once, here, rather than
 * being repeated in each page.
 */
export default async function PanelLayout({
  children,
}: {
  children: ReactNode;
}): Promise<ReactNode> {
  const user = await requireSession();
  const counts = await inquiryRepo.countByStatus();

  return (
    <AdminShell inquiryBadge={counts.new} role={user.role} email={user.email}>
      {children}
    </AdminShell>
  );
}
