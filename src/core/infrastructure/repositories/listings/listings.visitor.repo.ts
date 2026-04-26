import { IListingsVisitorRepo } from '@/core/application/repositories/listings/listings.visitor.repo.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { getReq } from '@/core/lib/api';
import { QueryParams } from '@/core/entities/api/api';

export class ListingsVisitorRepo implements IListingsVisitorRepo {
  async getFeaturedListings(
    typeId?: number,
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginatedResponse<ListingDto>>({
      url: '/listings-visitor/featured',
      params: { typeId, ...params },
    });
    return res;
  }

  async getTrendingListings(
    params?: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginatedResponse<ListingDto>>({
      url: '/listings-visitor/trending',
      params,
    });
    return res;
  }

  async searchListings(
    listingTypeId: number,
    params: QueryParams
  ): Promise<PaginatedResponse<ListingDto>> {
    const res = await getReq<any, PaginatedResponse<ListingDto>>({
      url: `/listings-visitor/${listingTypeId}/search`,
      params,
    });
    return res;
  }
  
  async getListingBySlug(slug: string): Promise<ApiResponse<any>> {
    const res = await getReq<any, ApiResponse<any>>({
      url: `/listings-visitor/slug/${slug}`,
    });
    return res;
  }

  async getListingById(id: number): Promise<ApiResponse<any>> {
    const res = await getReq<any, ApiResponse<any>>({
      url: `/listings-visitor/${id}`,
    });
    return res;
  }
}
