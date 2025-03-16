import { ICarTrimRepoController } from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarTrimRepoUseCase } from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
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

import { catchClientRequest } from '@/core/lib/error';

export class CarTrimRepoController implements ICarTrimRepoController {
  constructor(protected readonly carTrimRepoUseCase: ICarTrimRepoUseCase) {}

  async findById(id: number): Promise<ApiResponse<SelectCarTrimDto>> {
    try {
      return await this.carTrimRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    try {
      return await this.carTrimRepoUseCase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    try {
      return await this.carTrimRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async create(
    createDto: CreateCarTrimDto,
  ): Promise<ApiResponse<SelectCarTrimDto>> {
    try {
      return await this.carTrimRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async update(
    id: number,
    updateDto: UpdateCarTrimDto,
  ): Promise<ApiResponse<SelectCarTrimDto>> {
    try {
      return await this.carTrimRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carTrimRepoUseCase.delete(id);
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
