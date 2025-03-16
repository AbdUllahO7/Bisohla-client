import { ICarListingRepoController } from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarListingRepoUseCase } from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
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

import { catchClientRequest } from '@/core/lib/error';

export class CarListingRepoController implements ICarListingRepoController {
  constructor(
    protected readonly carListingRepoUseCase: ICarListingRepoUseCase,
  ) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    try {
      return await this.carListingRepoUseCase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findById(id: number): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carListingRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    try {
      return await this.carListingRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async create(
    createDto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carListingRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async update(
    id: number,
    updateDto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carListingRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carListingRepoUseCase.delete(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async seed(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  async reset(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
