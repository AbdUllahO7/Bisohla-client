import { IListingsVisitorRepoUseCase } from '@/core/application/use-cases/repositories/listings/listings.visitor.repo.use-case.interface';
import { IListingsVisitorRepoController } from './listings.visitor.repo.controller.interface';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';

export class ListingsVisitorRepoController implements IListingsVisitorRepoController {
  constructor(private readonly useCase: IListingsVisitorRepoUseCase) {}

  async getFeaturedListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>> {
    return await this.useCase.getFeaturedListings(page, pageSize);
  }

  async getTrendingListings(
    page?: number,
    pageSize?: number
  ): Promise<PaginatedResponse<ListingDto>> {
    return await this.useCase.getTrendingListings(page, pageSize);
  }
}
