import { z } from 'zod';

export interface GetUserProfile {
  name: string;
  email: string;
  profileUrl: string | null;
  phoneNumber: string | null;
  createdAt: string;
  updatedAt: string;
  totalForSellCarListings: number;
  totalForRentCarListings: number;
  totalFavoriteCarListings: number;
  totalViews: number;
  totalContacts: number;
  totalShares: number;
  averageViews: number;
  contactRate: number;
  engagementScore: number;
  totalViewDuration: number;
  recentViews: {
    last7Days: number;
    last30Days: number;
  }
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
