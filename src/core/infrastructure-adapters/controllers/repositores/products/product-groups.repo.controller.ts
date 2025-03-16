import { IProductGroupsRepoController } from '@/core/application/controllers/repositories/products/product-groups.repo.controller.interface';
import { IProductGroupsRepoUseCase } from '@/core/application/use-cases/repositories/products/product-groups/product-groups.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  CreateProductGroupDto,
  EditProductGroupDtoForPage,
  SelectProductGroupDto,
  UpdateProductGroupDto,
} from '@/core/entities/models/products/product-groups.dto';
import { catchClientRequest } from '@/core/lib/error';

export class ProductGroupsRepoController
  implements IProductGroupsRepoController
{
  constructor(
    protected readonly productGroupsRepoUsecase: IProductGroupsRepoUseCase,
  ) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectProductGroupDto>> {
    try {
      return await this.productGroupsRepoUsecase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async editWholeProductGroup(
    id: number,
    dto: EditProductGroupDtoForPage,
  ): Promise<ApiResponse<EditProductGroupDtoForPage>> {
    try {
      return await this.productGroupsRepoUsecase.editWholeProductGroup(id, dto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findById(id: number): Promise<ApiResponse<SelectProductGroupDto>> {
    try {
      return await this.productGroupsRepoUsecase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectProductGroupDto>> {
    try {
      return await this.productGroupsRepoUsecase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async create(
    createDto: CreateProductGroupDto,
  ): Promise<ApiResponse<SelectProductGroupDto>> {
    try {
      return await this.productGroupsRepoUsecase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async update(
    id: number,
    updateDto: UpdateProductGroupDto,
  ): Promise<ApiResponse<SelectProductGroupDto>> {
    try {
      return await this.productGroupsRepoUsecase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.productGroupsRepoUsecase.delete(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async seed(
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    items: SelectProductGroupDto[],
  ): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
