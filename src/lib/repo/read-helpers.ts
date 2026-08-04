import 'server-only';

import type { Inquiry } from '@/types/content';
import { inquiryRepo } from './index';

export { inquiryRepo };

/**
 * Opening an inquiry marks it read, but only on the first open - re-reading a
 * replied or archived item must not drag it backwards through the workflow.
 */
export async function setInquiryStatusOnRead(
  id: string,
  current: Inquiry['status'],
): Promise<void> {
  if (current !== 'new') return;
  await inquiryRepo.setStatus(id, 'read');
}
