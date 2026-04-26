import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { QueryParams } from 'next-intl/navigation';

export interface IListingsVisitorRepo {
  getFeaturedListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;

  getTrendingListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;

  searchListings(
    listingTypeId: number,
    params: QueryParams
  ): Promise<PaginatedResponse<ListingDto>>;
  getListingBySlug(slug: string): Promise<ApiResponse<any>>;
  getListingById(id: number): Promise<ApiResponse<any>>;
}
