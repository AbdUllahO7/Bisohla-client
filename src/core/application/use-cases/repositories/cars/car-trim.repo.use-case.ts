import { ICarTrimRepo } from '@/core/application/repositories/cars/cars.repos.interface';
import { ICarTrimRepoUseCase } from './cars.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarTrimDto,
  UpdateCarTrimDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarTrimRepoUseCase implements ICarTrimRepoUseCase {
  constructor(protected readonly carTrimRepo: ICarTrimRepo) {}
  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    return await this.carTrimRepo.search(params);
  }
  async findById(id: number): Promise<ApiResponse<SelectCarTrimDto>> {
    return await this.carTrimRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    return await this.carTrimRepo.findAll(params);
  }
  async create(
    createDto: CreateCarTrimDto,
  ): Promise<ApiResponse<SelectCarTrimDto>> {
    return await this.carTrimRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateCarTrimDto,
  ): Promise<ApiResponse<SelectCarTrimDto>> {
    return await this.carTrimRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carTrimRepo.delete(id);
  }
  async seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
