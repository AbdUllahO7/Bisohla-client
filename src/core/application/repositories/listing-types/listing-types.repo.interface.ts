import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeDto, ListingTypeSchemaDto, ListingTypeFormSchemaDto, ListingTypeFilterSchemaDto, ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';

export interface IListingTypesRepo {
  getListingTypes(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<ListingTypeDto>>;
  
  getListingTypeBySlug(
    slug: string
  ): Promise<ApiResponse<ListingTypeDto>>;

  getActiveSchema(
    id: number
  ): Promise<ApiResponse<ListingTypeSchemaDto>>;

  getFormSchema(
    id: number
  ): Promise<ApiResponse<ListingTypeFormSchemaDto>>;

  getFilterSchema(
    id: number
  ): Promise<ApiResponse<ListingTypeFilterSchemaDto>>;

  getAlertFormSchema(
    id: number
  ): Promise<ApiResponse<ListingTypeAlertFormSchemaDto>>;
}
