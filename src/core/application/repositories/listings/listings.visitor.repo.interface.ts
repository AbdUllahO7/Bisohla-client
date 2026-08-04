import { PaginatedResponse, ApiResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { RevealContactDto } from '@/core/entities/models/listings/reveal-contact.dto';
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
  getListingBySlug(slug: string, params?: QueryParams): Promise<ApiResponse<any>>;
  getListingById(id: number, params?: QueryParams): Promise<ApiResponse<any>>;

  /**
   * Fetch a seller's number for one listing, when the listing came back with
   * `contactNumber: null` but `contactAvailable: true`.
   *
   * Takes the NUMERIC listing id — the product route accepts a slug too, so
   * callers must pass `carData.id`, not the route param.
   */
  revealContact(listingId: number): Promise<ApiResponse<RevealContactDto>>;
}
