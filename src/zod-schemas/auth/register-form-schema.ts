import { z } from 'zod';

export const RegisterFormSchema = z
  .object({
    email: z.string().email(),
    password: z.string().min(8).max(255),
    name: z.string().min(1).max(50),
  })
  .required();

export type RegisterFormValues = z.infer<typeof RegisterFormSchema>;
