/**
 * Public profile data type
 * Contains only public-safe information about a user
 */
export interface PublicProfileData {
  id: number;
  name: string;
  profileUrl: string | null;
  createdAt: string;
  // email: string;
  // phone: string | null;
  totalForSaleListings: number;
  totalForRentListings: number;
  // totalViews: number;
  totalListings: number;
  countsByListingType?: {
    listingTypeId: number;
    count: number;
  }[];
}
