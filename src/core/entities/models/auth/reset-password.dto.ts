import { z } from 'zod';

export const ResetPasswordSchema = z
  .object({
    password: z.string().min(8).max(255),
    passwordConfirmation: z.string().min(8).max(255),
    token: z.string().nullable(),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });

export type ResetPasswordDto = z.infer<typeof ResetPasswordSchema>;
