import { z } from 'zod';
import { USER_ROLES } from '@/types/content';

/**
 * Skema pengguna panel.
 *
 * `password` opsional saat menyunting — kosong berarti "biarkan yang lama".
 * Saat membuat, wajibnya ditegakkan di `userRepo.create`, bukan di sini, supaya
 * satu skema melayani kedua formulir tanpa bercabang.
 */
export const userFormSchema = z.object({
  email: z.string().trim().min(1).email(),
  name: z.string().trim().min(2).max(80),
  role: z.enum(USER_ROLES as [string, ...string[]]),
  active: z.boolean(),
  password: z
    .string()
    .min(10, 'Minimal 10 karakter.')
    .max(200)
    .optional()
    .or(z.literal('')),
});

export type UserFormValues = z.infer<typeof userFormSchema>;

export const loginSchema = z.object({
  email: z.string().trim().min(1).email(),
  password: z.string().min(1),
  from: z.string().default('/admin'),
});
