import { z } from 'zod';

export interface GetUserProfile {
  name: string;
  email: string;
  profileUrl: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  totalListings: number;
  totalForSaleListings: number;
  totalForRentListings: number;
  countsByListingType: any[];
  totalViewsReceived: string | number;
  totalContactsReceived: string | number;
  totalFavoritesReceived: string | number;
  totalSharesReceived: string | number;
  totalDetailsViewedReceived: string | number;
  avgViewDurationReceived: string | number;
  totalFavoritesGiven: number;
  mostViewedListing: any;
  trendingListing: any;
  recentActivity: {
    last7Days: string | number;
    last30Days: string | number;
  };
}

export const updateProfileSchema = z.object({
  name: z.string().min(1).max(50).optional(),
  // email: z.string().email().optional(),
  profileUrl: z.string().nullable().optional(),
  phone: z.string().optional().nullable(),
  password: z.string().min(8).max(255).optional().nullable(),
  passwordConfirmation: z.string().min(8).max(255).optional().nullable(),
});

export type UpdateProfileDto = z.infer<typeof updateProfileSchema>;
