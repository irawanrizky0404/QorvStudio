import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { deleteProject } from '@/app/actions/content';
import { formatDateShort } from '@/lib/format';
import { pickLocale } from '@/lib/i18n/pick-locale';
import { projectRepo } from '@/lib/repo';
import { adminRoutes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { EntityTable, NewEntityButton } from '@/components/admin/entity-table';
import type { EntityRow } from '@/components/admin/entity-table';

export const metadata: Metadata = { title: 'Projects' };
export const dynamic = 'force-dynamic';

export default async function AdminProjectsPage(): Promise<ReactNode> {
  const { items } = await projectRepo.list({
    perPage: 50,
    sort: 'manual',
    includeDrafts: true,
  });

  const rows: EntityRow[] = items.map((project) => ({
    id: project.id,
    title: pickLocale(project.title, 'en'),
    subtitle: `${project.client} · ${project.year} · ${project.category}`,
    status: project.status,
    meta: formatDateShort(project.updatedAt, 'en'),
    featured: project.featured,
    editHref: adminRoutes.projectEdit(project.id),
  }));

  return (
    <>
      <AdminHeader
        title="Projects"
        body="Client work shown under Work on the public site."
        action={<NewEntityButton href={adminRoutes.projectNew} label="New project" />}
      />
      <EntityTable
        rows={rows}
        noun="projects"
        onDelete={deleteProject}
        emptyAction={<NewEntityButton href={adminRoutes.projectNew} label="New project" />}
      />
    </>
  );
}
