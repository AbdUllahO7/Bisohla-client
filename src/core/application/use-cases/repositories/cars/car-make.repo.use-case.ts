import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarMakeDto } from '@/core/entities/models/cars/cars.dto';
import { ICarMakeRepoUseCase } from './cars.repo.use-case.interface';
import { ICarMakeRepo } from '@/core/application/repositories/cars/cars.repos.interface';
import {
  CreateCarMakeDto,
  UpdateCarMakeDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export class CarMakeRepoUseCase implements ICarMakeRepoUseCase {
  constructor(protected readonly carMakeRepo: ICarMakeRepo) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    return await this.carMakeRepo.search(params);
  }
  async findById(id: number): Promise<ApiResponse<SelectCarMakeDto>> {
    return await this.carMakeRepo.findById(id);
  }
  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    return await this.carMakeRepo.findAll(params);
  }
  async create(
    createDto: CreateCarMakeDto,
  ): Promise<ApiResponse<SelectCarMakeDto>> {
    return await this.carMakeRepo.create(createDto);
  }
  async update(
    id: number,
    updateDto: UpdateCarMakeDto,
  ): Promise<ApiResponse<SelectCarMakeDto>> {
    return await this.carMakeRepo.update(id, updateDto);
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    throw await this.carMakeRepo.delete(id);
  }
  async seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }
  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
