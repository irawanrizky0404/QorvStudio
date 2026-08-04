import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import Link from 'next/link';
import { notFound } from 'next/navigation';

import { pickLocale } from '@/lib/i18n/pick-locale';
import { projectRepo, serviceRepo } from '@/lib/repo';
import { routes } from '@/lib/routes';

import { AdminHeader } from '@/components/admin/shell';
import { ProjectForm } from '@/components/admin/project-form';
import { Button } from '@/components/ui/button';

export const metadata: Metadata = { title: 'Edit project' };
export const dynamic = 'force-dynamic';

export default async function EditProjectPage({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<ReactNode> {
  const { id } = await params;
  const [project, services] = await Promise.all([
    projectRepo.getById(id),
    serviceRepo.list({ perPage: 50, includeDrafts: true }),
  ]);
  if (!project) notFound();

  return (
    <>
      <AdminHeader
        title={pickLocale(project.title, 'en')}
        body={`Last updated ${new Date(project.updatedAt).toISOString().slice(0, 10)}.`}
        action={
          project.status === 'published' ? (
            <Button asChild variant="outline" size="sm">
              <Link href={routes.project('en', project.slug)} target="_blank" rel="noreferrer">
                View live
              </Link>
            </Button>
          ) : undefined
        }
      />
      <ProjectForm
        project={project}
        services={services.items.map((service) => ({
          id: service.id,
          label: pickLocale(service.name, 'en'),
        }))}
      />
    </>
  );
}
