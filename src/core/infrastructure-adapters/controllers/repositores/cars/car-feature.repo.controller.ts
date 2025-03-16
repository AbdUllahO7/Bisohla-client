import { ICarFeatureRepoController } from '@/core/application/controllers/repositories/cars/car.repo.controller.interface';
import { ICarFeatureRepoUseCase } from '@/core/application/use-cases/repositories/cars/cars.repo.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectFeatureDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateFeatureDto,
  UpdateFeatureDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { catchClientRequest } from '@/core/lib/error';

export class CarFeatureRepoController implements ICarFeatureRepoController {
  constructor(
    protected readonly carFeatureRepoUseCase: ICarFeatureRepoUseCase,
  ) {}
  async findById(id: number): Promise<ApiResponse<SelectFeatureDto>> {
    try {
      return await this.carFeatureRepoUseCase.findById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async search(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    try {
      return await this.carFeatureRepoUseCase.search(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async findAll(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    try {
      return await this.carFeatureRepoUseCase.findAll(params);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async create(
    createDto: CreateFeatureDto,
  ): Promise<ApiResponse<SelectFeatureDto>> {
    try {
      return await this.carFeatureRepoUseCase.create(createDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async update(
    id: number,
    updateDto: UpdateFeatureDto,
  ): Promise<ApiResponse<SelectFeatureDto>> {
    try {
      return await this.carFeatureRepoUseCase.update(id, updateDto);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async delete(id: number): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carFeatureRepoUseCase.delete(id);
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
