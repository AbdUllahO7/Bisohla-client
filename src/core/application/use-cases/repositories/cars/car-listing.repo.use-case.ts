import { ICarListingRepo } from '@/core/application/repositories/cars/cars.repos.interface';
import { ICarListingRepoUseCase } from './cars.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarListingRepoUseCase implements ICarListingRepoUseCase {
  constructor(protected readonly carListingRepo: ICarListingRepo) {}
  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    return await this.carListingRepo.search(params);
  }
  async findById(id: number): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.carListingRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    return await this.carListingRepo.findAll(params);
  }
  async create(
    createDto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.carListingRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.carListingRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carListingRepo.delete(id);
  }
  seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
