import { z } from 'zod';
// import { selectProductGroupScheme } from './product-groups.dto';

// Validation schemas
export const productsCategorySchema = z.object({
  id: z.number().int(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().optional(),
  imageUrl: z.string().optional(),
  parentId: z.number().int().nullable(),
  groupId: z.number().int(),
  children: z.lazy(
    (): z.ZodTypeAny => z.array(productsCategorySchema).nullable().optional(),
  ),
});

export type ProductsCategoryDto = z.infer<typeof productsCategorySchema>;

export const createProductsCategorySchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  icon: z.instanceof(File).optional(), // File object for icon
  image: z.instanceof(File).optional(), // File object for image
  parentId: z.number().int().nullable(),
  groupId: z.number().int(),
});

export type CreateProductsCategoryDto = z.infer<
  typeof createProductsCategorySchema
>;

export type UpdateProductsCategoryDto = Partial<CreateProductsCategoryDto>;
