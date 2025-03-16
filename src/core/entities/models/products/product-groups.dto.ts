import { zodTimestamps } from '@/core/lib/zod';
import { z } from 'zod';
import { productsCategorySchema } from './product-categories.dto';
import { infoSectionSchema } from './info-sections.dt';
import { productGroupsInfoTypes } from './product-groups-info.dto';

// #### TPYPES FOR TABLE
export const selectProductGroupScheme: z.ZodSchema = z.object({
  id: z.number().int(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().nonempty(),
  imageUrl: z.string().nonempty(),
  categories: z.array(productsCategorySchema),
  infoSections: z.array(infoSectionSchema),
  ...zodTimestamps(),
});

export type SelectProductGroupDto = z.infer<typeof selectProductGroupScheme>;

export const createProductGroupSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type CreateProductGroupDto = z.infer<typeof createProductGroupSchema>;

export const updateProductGroupSchema = z.object({
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().optional().nullable(),
  imageUrl: z.string().optional().nullable(),
});

export type UpdateProductGroupDto = z.infer<typeof updateProductGroupSchema>;

// #### TPYPES FOR CREATE PRODUCT GROUP PAGE
export const editProductGroupCategoriesSchema = z.object({
  id: z.number().int().nullable().optional(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().nullable().optional(),
  imageUrl: z.string().nullable().optional(),
  parentId: z.number().int().nullable().optional(),
  groupId: z.number().int().nullable().optional(),
  children: z
    .lazy(
      (): z.ZodTypeAny =>
        z.array(editProductGroupCategoriesSchema).nullable().optional(),
    )
    .nullable()
    .optional(),
});

export interface EditProductGroupCategory {
  id?: number | null;
  name: string;
  description: string;
  iconUrl?: string | null;
  imageUrl?: string | null;
  parentId?: number | null;
  groupId?: number | null;
  children?: EditProductGroupCategory[] | null | undefined;
}

export const editProductGroupsInfoSchema = z.object({
  id: z.number().int().nullable().optional(),
  name: z.string().nonempty(),
  hint: z.string().optional(),
  description: z.string().optional(),
  iconUrl: z.string().optional().nullable(), // File object for icon
  isRequired: z.boolean().default(true),
  type: productGroupsInfoTypes,
  visualOptions: z.any().optional().nullable(), // Use appropriate schema for visual options if needed
  selectOptions: z.any().optional().nullable(), // Use appropriate schema for visual options if needed
  // infoSectionId: z.number().int(),
});

export interface EditProductGroupsInfo {
  id?: number | null;
  name: string;
  hint?: string;
  description?: string;
  iconUrl?: string | null;
  isRequired: boolean;
  type: typeof productGroupsInfoTypes.Values;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  visualOptions?: any | null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  selectOptions?: any | null;
}

export const editProductGroupsInfoSectionSchema = z.object({
  id: z.number().int().nullable().optional(),
  name: z.string().nonempty(),
  description: z.string().nullable().optional(),
  children: z
    .lazy(
      (): z.ZodTypeAny =>
        z.array(editProductGroupsInfoSectionSchema).nullable().optional(),
    )
    .nullable()
    .optional(),
  productGroupsInfo: z.array(editProductGroupsInfoSchema),
});

export interface EditInfoSectionDto {
  id?: number | null;
  name: string;
  description?: string | null;
  children?: EditInfoSectionDto[] | null;
  productGroupsInfo?: EditProductGroupsInfo[] | null;
  groupId?: number | null;
}

export const editProductGroupSchemaForPage = z.object({
  id: z.number().int().nullable().optional(),
  name: z.string().nonempty(),
  description: z.string().nonempty(),
  iconUrl: z.string().nonempty(),
  imageUrl: z.string().nonempty(),
  categories: z.array(editProductGroupCategoriesSchema),
  infoSections: z.array(editProductGroupsInfoSectionSchema),
});

export type EditProductGroupDtoForPage = z.infer<
  typeof editProductGroupSchemaForPage
>;

// export interface EditProductGroupDtoForPage {
//   id?: number | null;
//   name: string;
//   description: string;
//   iconUrl: string;
//   imageUrl: string;
//   categories: EditProductGroupCategory[];
//   infoSections: EditInfoSectionDto[];
// }
