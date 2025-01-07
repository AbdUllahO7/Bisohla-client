import { z } from 'zod';

export const sendVerificationEmailSchema = z
  .object({
    email: z.string().email(),
  })
  .strict()
  .required();

export type sendVerificationEmailDto = z.infer<
  typeof sendVerificationEmailSchema
>;
