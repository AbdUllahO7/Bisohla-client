import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { IProductGroupsRepoUseCase } from './product-groups.repo.use-case.interface';
import {
  CreateProductGroupDto,
  EditProductGroupDtoForPage,
  SelectProductGroupDto,
  UpdateProductGroupDto,
} from '@/core/entities/models/products/product-groups.dto';
import { IProductGroupsRepo } from '@/core/application/repositories/products/product-groups.repo.interface';

export class ProductGroupsRepoUseCase implements IProductGroupsRepoUseCase {
  constructor(protected readonly productGroupsRepo: IProductGroupsRepo) {}
  search(params: QueryParams): Promise<PaginatedResponse<any>> {
    throw new Error('Method not implemented.');
  }
  async editWholeProductGroup(
    id: number,
    
    dto: EditProductGroupDtoForPage,
  ): Promise<ApiResponse<EditProductGroupDtoForPage>> {
    return await this.productGroupsRepo.editWholeProductGroup(id, dto);
  }
  async findById(id: number): Promise<ApiResponse<SelectProductGroupDto>> {
    return await this.productGroupsRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectProductGroupDto>> {
    return await this.productGroupsRepo.findAll(params);
  }
  async create(
    createDto: CreateProductGroupDto,
  ): Promise<ApiResponse<SelectProductGroupDto>> {
    return await this.productGroupsRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateProductGroupDto,
  ): Promise<ApiResponse<SelectProductGroupDto>> {
    return await this.productGroupsRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.productGroupsRepo.delete(id);
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
