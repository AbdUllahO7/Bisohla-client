import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectFeatureDto } from '@/core/entities/models/cars/cars.dto';
import { ICarFeatureRepoUseCase } from './cars.repo.use-case.interface';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarFeatureRepoUseCase implements ICarFeatureRepoUseCase {
  constructor(protected readonly carFeatureRepo: ICarFeatureRepoUseCase) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    return await this.carFeatureRepo.search(params);
  }
  async findById(id: number): Promise<ApiResponse<SelectFeatureDto>> {
    return await this.carFeatureRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    return await this.carFeatureRepo.findAll(params);
  }
  async create(
    createDto: CreateFeatureDto,
  ): Promise<ApiResponse<SelectFeatureDto>> {
    return await this.carFeatureRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateFeatureDto,
  ): Promise<ApiResponse<SelectFeatureDto>> {
    return await this.carFeatureRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carFeatureRepo.delete(id);
  }
  async seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
