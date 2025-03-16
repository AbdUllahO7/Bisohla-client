import { ICarMakeRepoController } from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarMakeRepoUseCase } from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarMakeDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarMakeDto,
  UpdateCarMakeDto,
} from '@/core/entities/models/cars/cars.zod.dto';

import { catchClientRequest } from '@/core/lib/error';

export class CarMakeRepoController implements ICarMakeRepoController {
  constructor(protected readonly carMakeRepoUseCase: ICarMakeRepoUseCase) {}
  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    try {
      return await this.carMakeRepoUseCase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findById(id: number): Promise<ApiResponse<SelectCarMakeDto>> {
    try {
      return await this.carMakeRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    try {
      return await this.carMakeRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async create(
    createDto: CreateCarMakeDto,
  ): Promise<ApiResponse<SelectCarMakeDto>> {
    try {
      return await this.carMakeRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async update(
    id: number,
    updateDto: UpdateCarMakeDto,
  ): Promise<ApiResponse<SelectCarMakeDto>> {
    try {
      return await this.carMakeRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carMakeRepoUseCase.delete(id);
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
