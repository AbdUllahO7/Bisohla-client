import { IListingTypeRefsRepo } from '@/core/application/repositories/listing-type-refs/listing-type-refs.repo.interface';
import { IListingTypeRefsRepoUseCase } from './listing-type-refs.repo.use-case.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';

export class ListingTypeRefsRepoUseCase implements IListingTypeRefsRepoUseCase {
  constructor(private readonly repository: IListingTypeRefsRepo) {}

  async getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number,
    searchTerm?: string,
    page?: number,
    locale?: string,
    searchKey?: string
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>> {
    return await this.repository.getItemsByGroupId(groupId, parentItemId, pageSize, searchTerm, page, locale, searchKey);
  }
}
