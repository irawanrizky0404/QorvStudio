import { z } from 'zod';

/**
 * One schema, two consumers: the client form (via zodResolver) and the server
 * action. A field can never validate differently on the two sides.
 */
export const inquiryFormSchema = z.object({
  name: z.string().min(2).max(80),
  email: z.email(),
  company: z.string().max(120).optional().default(''),
  phone: z.string().max(30).optional().default(''),
  subject: z.string().min(3).max(140),
  message: z.string().min(10).max(4000),
  budgetRange: z
    .enum(['<10m', '10-50m', '50-200m', '200m+', 'undecided'])
    .optional()
    .default('undecided'),

  // Context carried from whichever CTA opened the form.
  sourceType: z.enum(['contact', 'project', 'product', 'service', 'pricing']),
  sourceId: z.string().nullable().default(null),
  sourceTier: z.enum(['basic', 'gold', 'premium']).nullable().default(null),
  locale: z.enum(['en', 'id']),

  /*
   * Anti-abuse. Both are server-checked and neither is ever shown to a human:
   *  - `website` is a honeypot: a real user cannot fill a hidden field.
   *  - `elapsedMs` rejects submissions faster than a person can read the form.
   * This endpoint is the only public write path, so it needs a floor.
   */
  website: z.string().max(0, 'Rejected'),
  elapsedMs: z.number().int().min(2000, 'Rejected'),
});

export type InquiryFormValues = z.input<typeof inquiryFormSchema>;
export type InquiryFormParsed = z.output<typeof inquiryFormSchema>;
