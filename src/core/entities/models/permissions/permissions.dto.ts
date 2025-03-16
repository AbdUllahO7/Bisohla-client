import { z } from 'zod';

export const selectPermissionSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  description: z.string().nullable(),
  parentId: z.number().nullable(),
  parent: z.object({
    id: z.number().int(),
    name: z.string(),
    description: z.string().nullable(),
    parentId: z.number().nullable(),
  }),
  children: z.array(
    z.object({
      id: z.number().int(),
      name: z.string(),
      description: z.string().nullable(),
      parentId: z.number().nullable(),
    }),
  ),
});

export type SelectPermissionDto = z.infer<typeof selectPermissionSchema>;

export const CreatePermissionSchema = selectPermissionSchema.pick({
  name: true,
  description: true,
  parentId: true,
});

export type CreatePermissionDto = z.infer<typeof CreatePermissionSchema>;
