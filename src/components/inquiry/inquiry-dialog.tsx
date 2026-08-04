'use client';

import { useState } from 'react';
import type { ReactNode } from 'react';
import { useDictionary } from '@/lib/i18n/dictionary-provider';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import type { ButtonProps } from '@/components/ui/button';
import type { InquirySource, Tier } from '@/types/content';
import { InquiryForm } from './inquiry-form';

/**
 * The single conversion control. Every package and product CTA opens this;
 * there is no checkout anywhere on the site.
 */
export function InquiryDialog({
  label, sourceType, sourceId = null, sourceTier = null,
  contextLabel, contextValue, variant = 'primary', size = 'md', className,
}: {
  label: string; sourceType: InquirySource; sourceId?: string | null; sourceTier?: Tier | null;
  contextLabel?: string; contextValue?: string;
  variant?: ButtonProps['variant']; size?: ButtonProps['size']; className?: string;
}): ReactNode {
  const { dictionary: t } = useDictionary();
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant={variant} size={size} className={className} onClick={() => setOpen(true)}>
        {label}
      </Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title={t.inquiry.title}
        description={t.inquiry.subtitle}
        closeLabel={t.nav.close}
      >
        <InquiryForm
          sourceType={sourceType}
          sourceId={sourceId}
          sourceTier={sourceTier}
          contextLabel={contextLabel}
          contextValue={contextValue}
        />
      </Dialog>
    </>
  );
}
