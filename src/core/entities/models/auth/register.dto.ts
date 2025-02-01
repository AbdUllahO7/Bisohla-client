import { z } from 'zod';

export const registerSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(255),
    passwordConfirmation: z.string().min(8).max(255),
    name: z.string().min(1).max(50),
  })
  .refine((data) => data.password === data.passwordConfirmation, {
    message: 'Password confirmation must match the password',
    path: ['passwordConfirmation'], // Target the password_confirmation field for the error
  });

export type RegisterDto = z.infer<typeof registerSchema>;

export type RegisterResponse = RegisterDto;
