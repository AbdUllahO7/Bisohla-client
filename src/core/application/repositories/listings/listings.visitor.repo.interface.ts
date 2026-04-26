import { PaginatedResponse, ApiResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { QueryParams } from '@/core/entities/api/api';

export interface IListingsVisitorRepo {
  getFeaturedListings(
    typeId?: number,
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>>;

  getTrendingListings(
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>>;

  searchListings(
    listingTypeId: number,
    params: QueryParams
  ): Promise<PaginatedResponse<ListingDto>>;
  getListingBySlug(slug: string): Promise<ApiResponse<any>>;
  getListingById(id: number): Promise<ApiResponse<any>>;
}
