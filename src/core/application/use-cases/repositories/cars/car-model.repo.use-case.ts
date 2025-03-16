import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarModelDto } from '@/core/entities/models/cars/cars.dto';
import { ICarModelRepoUseCase } from './cars.repo.use-case.interface';
import { ICarModelRepo } from '@/core/application/repositories/cars/cars.repos.interface';
import {
  CreateCarModelDto,
  UpdateCarModelDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarModelRepoUseCase implements ICarModelRepoUseCase {
  constructor(protected readonly carModelRepo: ICarModelRepo) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    return await this.carModelRepo.search(params);
  }
  async findById(id: number): Promise<ApiResponse<SelectCarModelDto>> {
    return await this.carModelRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    return await this.carModelRepo.findAll(params);
  }
  async create(
    createDto: CreateCarModelDto,
  ): Promise<ApiResponse<SelectCarModelDto>> {
    return await this.carModelRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateCarModelDto,
  ): Promise<ApiResponse<SelectCarModelDto>> {
    return await this.carModelRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carModelRepo.delete(id);
  }
  async seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
