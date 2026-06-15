import { IListingsVisitorRepo } from '@/core/application/repositories/listings/listings.visitor.repo.interface';
import { IListingsVisitorRepoUseCase } from './listings.visitor.repo.use-case.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';

export class ListingsVisitorRepoUseCase implements IListingsVisitorRepoUseCase {
  constructor(private readonly repository: IListingsVisitorRepo) {}

  async getFeaturedListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>> {
    return await this.repository.getFeaturedListings(undefined, { page, pageSize });
  }

  async getTrendingListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>> {
    return await this.repository.getTrendingListings({ page, pageSize });
  }
}
