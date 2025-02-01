import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().email().nonempty(),
  password: z.string().min(4).nonempty(),
});

export type LoginDto = z.infer<typeof loginSchema>;

export interface LoginResponse {
  message: string;
  id: number;
  name: string;
  roles: string[];
  permissions: string[];
  accessToken: string;
  refreshToken: string;
}
