import { z } from 'zod';
import { SelectCarListingDto } from './cars.dto';

export interface UserFavoriteCarListing {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  carListingId: number;
  carListing?: SelectCarListingDto | null;
  notes: string | null;
}

// DTO for creating a favorite car listing
export const CreateFavoriteCarListingSchema = z.object({
  carListingId: z.number().int().positive(),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .nullable(),
});

export type CreateFavoriteCarListingDto = z.infer<
  typeof CreateFavoriteCarListingSchema
>;

// DTO for updating a favorite car listing
export const UpdateFavoriteCarListingSchema = z.object({
  notes: z.string().max(500, 'Notes must be 500 characters or less').optional(),
});

export type UpdateFavoriteCarListingDto = z.infer<
  typeof UpdateFavoriteCarListingSchema
>;

// DTO for toggling a favorite car listing
export const ToggleFavoriteCarListingSchema = z.object({
  carListingId: z.number().int().positive('Car listing ID is required'),
});

export type ToggleFavoriteCarListingDto = z.infer<
  typeof ToggleFavoriteCarListingSchema
>;

export type ToggleFavoriteResponse = {
  isFavorited: boolean;
  message: string;
  favoriteInfo?: UserFavoriteCarListing;
};
