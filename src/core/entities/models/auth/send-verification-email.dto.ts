import { z } from 'zod';

export const sendVerificationEmailSchema = z
  .object({
    email: z.string().email(),
  })
  .strict()
  .required();

export type SendVerificationEmailDto = z.infer<
  typeof sendVerificationEmailSchema
>;

export interface SendVerificationEmailResponse {
  message: string;
  success: boolean;
}
