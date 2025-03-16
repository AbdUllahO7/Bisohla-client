import { zodTimestamps } from '@/core/lib/zod';
import { z } from 'zod';

export const productGroupsInfoTypes = z.enum([
  'visual',
  'text',
  'number',
  'date',
  'date_range',
  'boolean',
  'image',
  'file',
  'select',
  'multi-select',
  'url',
]);

// Validation schemas
export const productGroupsInfoSchema = z.object({
  id: z.number().int(),
  name: z.string().nonempty(),
  hint: z.string().optional(),
  description: z.string().optional(),
  iconUrl: z.string().optional(),
  isRequired: z.boolean().default(true),
  type: productGroupsInfoTypes,
  visualOptions: z.any().optional(), // Use appropriate schema for visual options if needed
  selectOptions: z.any().optional(), // Use appropriate schema for visual options if needed
  infoSectionId: z.number().int(),
  ...zodTimestamps(),
});

export type ProductGroupsInfoDto = z.infer<typeof productGroupsInfoSchema>;

export const createProductGroupsInfoSchema = z.object({
  name: z.string().nonempty(),
  hint: z.string().optional(),
  description: z.string().optional(),
  icon: z.instanceof(File).optional(), // File object for icon
  isRequired: z.boolean().default(true),
  type: productGroupsInfoTypes,
  visualOptions: z.any().optional(), // Use appropriate schema for visual options if needed
  selectOptions: z.any().optional(), // Use appropriate schema for select options if needed
  infoSectionId: z.number().int(),
});

export type CreateProductGroupsInfoDto = z.infer<
  typeof createProductGroupsInfoSchema
>;

export type UpdateProductGroupsInfoDto = Partial<CreateProductGroupsInfoDto>;
