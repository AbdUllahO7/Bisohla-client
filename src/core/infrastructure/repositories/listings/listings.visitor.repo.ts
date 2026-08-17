import { IListingsVisitorRepo } from '@/core/application/repositories/listings/listings.visitor.repo.interface';
import { PaginatedResponse, ApiResponse, PaginationInfo } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { RevealContactDto } from '@/core/entities/models/listings/reveal-contact.dto';
import { getReq, postReq } from '@/core/lib/api';
import { QueryParams } from '@/core/entities/api/api';

export class ListingsVisitorRepo implements IListingsVisitorRepo {
  async getFeaturedListings(
    typeId?: number,
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginationInfo<ListingDto>>({
      url: '/listings-visitor/featured',
      params: { typeId, ...params },
    });
    return res;
  }

  async getTrendingListings(
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginationInfo<ListingDto>>({
      url: '/listings-visitor/trending',
      params,
    });
    return res;
  }

  async searchListings(
    listingTypeId: number,
    params: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginationInfo<ListingDto>>({
      url: `/listings-visitor/${listingTypeId}/search`,
      params,
    });
    return res;
  }
  
  async getListingBySlug(slug: string, params?: QueryParams): Promise<ApiResponse<any>> {
    const res = await getReq<any, any>({
      url: `/listings-visitor/slug/${slug}`,
      params,
    });
    return res;
  }

  async getListingById(id: number, params?: QueryParams): Promise<ApiResponse<any>> {
    const res = await getReq<any, any>({
      url: `/listings-visitor/${id}`,
      params,
    });
    return res;
  }

  /**
   * `postReq`, not `postAuthReq`: anonymous visitors must be able to reach a
   * seller. `postReq` still attaches a bearer opportunistically when there is a
   * session, which is what earns the signed-in visitor the higher daily quota.
   *
   * The endpoint is POST on the backend by design — a GET would be executed by
   * Next `<Link>` prefetch on hover and burn every visitor's quota without a
   * click, so this must never be turned into a GET route handler.
   */
  async revealContact(listingId: number): Promise<ApiResponse<RevealContactDto>> {
    const res = await postReq<any, RevealContactDto>({
      url: `/listings-visitor/${listingId}/reveal-contact`,
    });
    return res;
  }

  async getMapListings(
    params: { bbox: string; typeId?: number; offerType?: string; where?: any; filterGroups?: any }
  ): Promise<ApiResponse<any>> {
    const res = await getReq<any, any>({
      url: '/listings-visitor/map',
      params,
    });
    return res;
  }

  async getListingCard(slug: string): Promise<ApiResponse<any>> {
    const res = await getReq<any, any>({
      url: `/listings-visitor/card/${slug}`,
    });
    return res;
  }

  async getGovernorateCounts(): Promise<ApiResponse<any>> {
    const res = await getReq<any, any>({
      url: '/listings-visitor/governorate-counts',
    });
    return res;
  }
}

