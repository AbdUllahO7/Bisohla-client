import { IListingTypeRefsRepo } from '@/core/application/repositories/listing-type-refs/listing-type-refs.repo.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';
import { getReq } from '@/core/lib/api';

export class ListingTypeRefsRepo implements IListingTypeRefsRepo {
  async getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number,
    searchTerm?: string,
    page?: number,
    locale?: string,
    searchKey?: string
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>> {
    const queryParams = new URLSearchParams();
    if (parentItemId !== undefined) {
      queryParams.append('parentItemId', parentItemId.toString());
    }
    if (pageSize !== undefined) {
      queryParams.append('pageSize', pageSize.toString());
    }
    if (searchTerm) {
      queryParams.append('searchTerm', searchTerm);
    }
    if (searchKey) {
      queryParams.append('searchKey', searchKey);
    }
    if (page !== undefined) {
      queryParams.append('page', page.toString());
    }
    if (locale) {
      queryParams.append('locale', locale);
    }
    
    const queryString = queryParams.toString();
    const url = `/listing-type-ref/ref-groups/${groupId}/items${queryString ? `?${queryString}` : ''}`;

    const res = await getReq({ url });
    return res as PaginatedResponse<ListingTypeRefItemDto>;
  }
}
