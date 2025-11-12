import { z } from 'zod';

// Schema for a single News Category
export const SelectNewsCategorySchema = z.object({
  id: z.number().int(),
  name: z.string(),
  slug: z.string(),
  description: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SelectNewsCategoryDto = z.infer<typeof SelectNewsCategorySchema>;

// Schema for Author
export const SelectNewsAuthorSchema = z.object({
  id: z.number().int(),
  name: z.string(),
  email: z.string().email(),
  profileUrl: z.string().url().nullable(),
  phone: z.string().nullable(),
  password: z.string().nullable(),
  hashedToken: z.string().nullable(),
  verifiedAt: z.string().datetime().nullable(),
  lang: z.string().nullable(),
  provider: z.string().nullable(),
  providerId: z.string().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
  deletedAt: z.string().datetime().nullable(),
});

export type SelectNewsAuthorDto = z.infer<typeof SelectNewsAuthorSchema>;

// Base Schema for a single News Article (without relations)
export const SelectNewsArticleSchema = z.object({
  id: z.number().int(),
  title: z.string(),
  subTitle: z.string().nullable(),
  slug: z.string(),
  content: z.string(),
  excerpt: z.string().nullable(),
  coverImage: z.string().url().nullable(),
  metaTitle: z.string().nullable(),
  metaDescription: z.string().nullable(),
  authorId: z.number().int().nullable(),
  categoryId: z.number().int().nullable(),
  tags: z.array(z.string()).nullable(),
  isPublished: z.boolean(),
  viewCount: z.number().int().default(0),
  publishedAt: z.string().datetime().nullable(),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime(),
});

export type SelectNewsArticleDto = z.infer<typeof SelectNewsArticleSchema>;

// Extended Schema with Relations (for detailed article view)
export const SelectNewsArticleWithRelationsSchema = SelectNewsArticleSchema.extend({
  category: SelectNewsCategorySchema.nullable().optional(),
  author: SelectNewsAuthorSchema.nullable().optional(),
});

export type SelectNewsArticleWithRelationsDto = z.infer<typeof SelectNewsArticleWithRelationsSchema>;