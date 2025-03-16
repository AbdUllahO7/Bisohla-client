import { zodTimestamps } from '@/core/lib/zod';
import { z } from 'zod';
import { productGroupsInfoSchema } from './product-groups-info.dto';
import { selectProductGroupScheme } from './product-groups.dto';
// import { productGroupsInfoSchema } from './product-groups-info.dto';

// Validation schemas
export const infoSectionSchema = z.object({
  id: z.number().int(),
  name: z.string().nonempty(),
  description: z.string().optional(),
  parentId: z.number().int().nullable(),
  // Use z.lazy() for recursive references
  parent: z.lazy((): z.ZodTypeAny => infoSectionSchema.nullable().optional()),
  children: z.lazy(
    (): z.ZodTypeAny => z.array(infoSectionSchema).nullable().optional(),
  ),
  productGroupsInfo: z.array(productGroupsInfoSchema).nullable().optional(),
  productGroup: z.lazy(
    (): z.ZodTypeAny => selectProductGroupScheme.nullable().optional(),
  ),
  ...zodTimestamps(),
});

export type InfoSectionDto = z.infer<typeof infoSectionSchema>;

export const createInfoSectionSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  parentId: z.number().int().nullable().optional(), // Nullable for root-level sections
  groupId: z.number().int(),
});

export type CreateInfoSectionDto = z.infer<typeof createInfoSectionSchema>;

export const updateInfoSectionSchema = z.object({
  name: z.string().nonempty().optional(),
  description: z.string().optional(),
  parentId: z.number().int().nullable().optional(),
});

export type UpdateInfoSectionDto = z.infer<typeof updateInfoSectionSchema>;
