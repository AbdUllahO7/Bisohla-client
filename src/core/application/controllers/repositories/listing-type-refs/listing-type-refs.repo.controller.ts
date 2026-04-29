import { IListingTypeRefsRepoUseCase } from '@/core/application/use-cases/repositories/listing-type-refs/listing-type-refs.repo.use-case.interface';
import { IListingTypeRefsRepoController } from './listing-type-refs.repo.controller.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeRefItemDto } from '@/core/entities/models/listing-type-refs/listing-type-refs.dto';

export class ListingTypeRefsRepoController implements IListingTypeRefsRepoController {
  constructor(private readonly useCase: IListingTypeRefsRepoUseCase) {}

  async getItemsByGroupId(
    groupId: number,
    parentItemId?: number,
    pageSize?: number,
    searchTerm?: string,
    page?: number,
    locale?: string,
    searchKey?: string
  ): Promise<PaginatedResponse<ListingTypeRefItemDto>> {
    return await this.useCase.getItemsByGroupId(groupId, parentItemId, pageSize, searchTerm, page, locale, searchKey);
  }
}
