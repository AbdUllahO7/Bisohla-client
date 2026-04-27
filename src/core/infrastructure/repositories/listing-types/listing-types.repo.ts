import { IListingTypesRepo } from '@/core/application/repositories/listing-types/listing-types.repo.interface';
import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeDto, ListingTypeSchemaDto, ListingTypeFormSchemaDto, ListingTypeFilterSchemaDto, ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { getReq } from '@/core/lib/api';

export class ListingTypesRepo implements IListingTypesRepo {
  async getListingTypes(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<ListingTypeDto>> {
    const queryParams = new URLSearchParams();
    if (page !== undefined) queryParams.append('page', page.toString());
    if (limit !== undefined) queryParams.append('limit', limit.toString());

    const queryString = queryParams.toString();
    const url = `/listing-types${queryString ? `?${queryString}` : ''}`;

    const res = await getReq({ url });
    return res as PaginatedResponse<ListingTypeDto>;
  }

  async getListingTypeBySlug(slug: string): Promise<ApiResponse<ListingTypeDto>> {
    const res = await getReq({
      url: `/listing-types/${encodeURIComponent(slug)}`,
    });
    return res as ApiResponse<ListingTypeDto>;
  }

  async getActiveSchema(id: number): Promise<ApiResponse<ListingTypeSchemaDto>> {
    const res = await getReq({
      url: `/listing-types/${id}/schema`,
    });
    return res as ApiResponse<ListingTypeSchemaDto>;
  }

  async getFormSchema(id: number): Promise<ApiResponse<ListingTypeFormSchemaDto>> {
    const res = await getReq({
      url: `/listing-types/${id}/form-schema`,
    });
    return res as ApiResponse<ListingTypeFormSchemaDto>;
  }

  async getFilterSchema(id: number): Promise<ApiResponse<ListingTypeFilterSchemaDto>> {
    const res = await getReq({
      url: `/listing-types/${id}/filter-schema`,
    });
    return res as ApiResponse<ListingTypeFilterSchemaDto>;
  }

  async getAlertFormSchema(id: number): Promise<ApiResponse<ListingTypeAlertFormSchemaDto>> {
    const res = await getReq({
      url: `/listing-types/${id}/alert-form-schema`,
    });
    return res as ApiResponse<ListingTypeAlertFormSchemaDto>;
  }
}
