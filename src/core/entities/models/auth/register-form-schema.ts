import { z } from 'zod';

export const RegisterFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(255),
    passwordConfirmation: z.string().min(8).max(255),
    name: z.string().min(1).max(50),
    acceptedLegal: z
      .boolean()
      .refine((val) => val === true, {
        message: 'auth.errors.legal_required',
      }),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
