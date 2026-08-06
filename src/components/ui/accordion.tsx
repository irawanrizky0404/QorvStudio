'use client';

import type { ReactNode } from 'react';
import * as RadixAccordion from '@radix-ui/react-accordion';
import { Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

export interface AccordionItemData {
  id: string;
  question: string;
  answer: string;
}

/**
 * FAQ accordion, from reference theme A: each row is its own rounded panel with
 * a numbered index, rather than rules stacked on a flat background.
 */
export function Accordion({
  items,
  className,
}: {
  items: AccordionItemData[];
  className?: string;
}): ReactNode {
  if (items.length === 0) return null;

  return (
    <RadixAccordion.Root type="single" collapsible className={cn('grid gap-[3px] border-3 border-ink ruled', className)}>
      {items.map((item, index) => (
        <RadixAccordion.Item
          key={item.id}
          value={item.id}
          className="bg-paper transition-colors duration-150 data-[state=open]:bg-acid"
        >
          <RadixAccordion.Header>
            <RadixAccordion.Trigger className="group flex w-full items-start gap-5 p-6 text-left focus-visible:outline-3 focus-visible:-outline-offset-3 focus-visible:outline-ink">
              <span className="label tabular mt-1.5 shrink-0">
                {String(index + 1).padStart(2, '0')}
              </span>
              <span className="display rank-5 flex-1">
                {item.question}
              </span>
              <Plus
                aria-hidden
                strokeWidth={1.5}
                className="mt-0.5 size-5 shrink-0 text-ink transition-transform duration-300 group-data-[state=open]:rotate-45"
              />
            </RadixAccordion.Trigger>
          </RadixAccordion.Header>
          <RadixAccordion.Content className="overflow-hidden">
            <p className="px-6 pb-6 pl-[3.6rem] text-[14.5px] leading-relaxed text-ink md:pl-[4rem]">
              {item.answer}
            </p>
          </RadixAccordion.Content>
        </RadixAccordion.Item>
      ))}
    </RadixAccordion.Root>
  );
}
