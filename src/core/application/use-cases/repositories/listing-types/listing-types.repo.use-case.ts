import { IListingTypesRepo } from '@/core/application/repositories/listing-types/listing-types.repo.interface';
import { IListingTypesRepoUseCase } from './listing-types.repo.use-case.interface';
import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeDto, ListingTypeSchemaDto, ListingTypeFormSchemaDto, ListingTypeFilterSchemaDto, ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';

export class ListingTypesRepoUseCase implements IListingTypesRepoUseCase {
  constructor(private readonly repository: IListingTypesRepo) {}

  async getListingTypes(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<ListingTypeDto>> {
    return await this.repository.getListingTypes(page, limit);
  }

  async getListingTypeBySlug(slug: string): Promise<ApiResponse<ListingTypeDto>> {
    return await this.repository.getListingTypeBySlug(slug);
  }

  async getActiveSchema(id: number): Promise<ApiResponse<ListingTypeSchemaDto>> {
    return await this.repository.getActiveSchema(id);
  }

  async getFormSchema(id: number): Promise<ApiResponse<ListingTypeFormSchemaDto>> {
    return await this.repository.getFormSchema(id);
  }

  async getFilterSchema(id: number): Promise<ApiResponse<ListingTypeFilterSchemaDto>> {
    return await this.repository.getFilterSchema(id);
  }

  async getAlertFormSchema(id: number): Promise<ApiResponse<ListingTypeAlertFormSchemaDto>> {
    return await this.repository.getAlertFormSchema(id);
  }
}
