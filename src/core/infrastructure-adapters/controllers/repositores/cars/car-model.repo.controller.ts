import { ICarModelRepoController } from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarModelRepoUseCase } from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';

import { catchClientRequest } from '@/core/lib/error';
import {
  CreateCarModelDto,
  UpdateCarModelDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { SelectCarModelDto } from '@/core/entities/models/cars/cars.dto';

export class CarModelRepoController implements ICarModelRepoController {
  constructor(protected readonly carModelRepoUseCase: ICarModelRepoUseCase) {}

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    try {
      return await this.carModelRepoUseCase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findById(id: number): Promise<ApiResponse<SelectCarModelDto>> {
    try {
      return await this.carModelRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    try {
      return await this.carModelRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async create(
    createDto: CreateCarModelDto,
  ): Promise<ApiResponse<SelectCarModelDto>> {
    try {
      return await this.carModelRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async update(
    id: number,
    updateDto: UpdateCarModelDto,
  ): Promise<ApiResponse<SelectCarModelDto>> {
    try {
      return await this.carModelRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carModelRepoUseCase.delete(id);
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
