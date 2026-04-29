import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';

export interface IListingTypeRefsRepo {
  getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number,
    searchTerm?: string,
    page?: number,
    locale?: string,
    searchKey?: string
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>>;
}
