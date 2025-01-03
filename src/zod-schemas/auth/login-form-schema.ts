import { z } from 'zod';

export const loginFormSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().min(4).nonempty(),
});

export type LoginFormValues = z.infer<typeof loginFormSchema>;
