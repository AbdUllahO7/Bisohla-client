import { z } from 'zod';

export const selectRoleSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
});

export type SelectRoleDto = z.infer<typeof selectRoleSchema>;

export const createRoleSchema = selectRoleSchema.pick({
  name: true,
  description: true,
});

export type CreateRoleDto = z.infer<typeof createRoleSchema>;

export const updateRoleSchema = selectRoleSchema.pick({
  name: true,
  description: true,
});

export type UpdateRoleDto = z.infer<typeof updateRoleSchema>;
