import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';

export interface IListingsVisitorRepo {
  getFeaturedListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;

  getTrendingListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;
}
