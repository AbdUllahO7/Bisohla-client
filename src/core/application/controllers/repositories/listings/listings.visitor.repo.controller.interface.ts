import { PaginatedResponse, ApiResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { RevealContactDto } from '@/core/entities/models/listings/reveal-contact.dto';

export interface IListingsVisitorRepoController {
  getFeaturedListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;

  getTrendingListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>>;
  /** See `IListingsVisitorRepo.revealContact` — takes the NUMERIC listing id. */
  revealContact(listingId: number): Promise<ApiResponse<RevealContactDto>>;
}
