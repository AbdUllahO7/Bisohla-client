import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';

export interface IListingTypeRefsRepoController {
  getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>>;
}
