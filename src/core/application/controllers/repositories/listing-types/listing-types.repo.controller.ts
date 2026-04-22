import { IListingTypesRepoUseCase } from '@/core/application/use-cases/repositories/listing-types/listing-types.repo.use-case.interface';
import { IListingTypesRepoController } from './listing-types.repo.controller.interface';
import { ApiResponse, PaginatedResponse } from '@/core/entities/api/success.response';
import { ListingTypeDto, ListingTypeSchemaDto, ListingTypeFormSchemaDto, ListingTypeFilterSchemaDto, ListingTypeAlertFormSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';

export class ListingTypesRepoController implements IListingTypesRepoController {
  constructor(private readonly useCase: IListingTypesRepoUseCase) {}

  async getListingTypes(
    page?: number,
    limit?: number
  ): Promise<PaginatedResponse<ListingTypeDto>> {
    return await this.useCase.getListingTypes(page, limit);
  }

  async getListingTypeBySlug(slug: string): Promise<ApiResponse<ListingTypeDto>> {
    return await this.useCase.getListingTypeBySlug(slug);
  }

  async getActiveSchema(id: number): Promise<ApiResponse<ListingTypeSchemaDto>> {
    return await this.useCase.getActiveSchema(id);
  }

  async getFormSchema(id: number): Promise<ApiResponse<ListingTypeFormSchemaDto>> {
    return await this.useCase.getFormSchema(id);
  }

  async getFilterSchema(id: number): Promise<ApiResponse<ListingTypeFilterSchemaDto>> {
    return await this.useCase.getFilterSchema(id);
  }

  async getAlertFormSchema(id: number): Promise<ApiResponse<ListingTypeAlertFormSchemaDto>> {
    return await this.useCase.getAlertFormSchema(id);
  }
}
