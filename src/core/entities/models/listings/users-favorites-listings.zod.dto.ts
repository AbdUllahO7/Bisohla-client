import { z } from 'zod';
import { ListingDto } from './listings.dto';

export interface UserFavoriteListing {
  id: number;
  userId: number;
  createdAt: string;
  updatedAt: string;
  listingId: number;
  listing?: ListingDto | null;
  notes: string | null;
}

// DTO for creating a favorite listing
export const CreateFavoriteListingSchema = z.object({
  listingId: z.number().int().positive(),
  notes: z
    .string()
    .max(500, 'Notes must be 500 characters or less')
    .optional()
    .nullable(),
});

export type CreateFavoriteListingDto = z.infer<
  typeof CreateFavoriteListingSchema
>;

// DTO for toggling a favorite listing
export const ToggleFavoriteListingSchema = z.object({
  listingId: z.number().int().positive('Listing ID is required'),
});

export type ToggleFavoriteListingDto = z.infer<
  typeof ToggleFavoriteListingSchema
>;

export type ToggleFavoriteListingResponse = {
  isFavorited: boolean;
  message: string;
  favoriteInfo?: UserFavoriteListing;
};
