import { ICarVisitorController } from '@/core/application/controllers/visitors/cars/car-controller.interface';
import { ICarVisitorUseCase } from '@/core/application/use-cases/visitors/cars/car.visitor.use-case.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  PaginatedResponse,
  ApiResponse,
} from '@/core/entities/api/success.response';
import {
  SelectCarListingDto,
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
  SelectFeatureDto,
} from '@/core/entities/models/cars/cars.dto';
import { catchClientRequest } from '@/core/lib/error';

export class CarVisitorController implements ICarVisitorController {
  constructor(private readonly carUseCase: ICarVisitorUseCase) {}
  async findCarListings(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    try {
      return await this.carUseCase.findCarListings(queryParams);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findCarListingById(
    id: number,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carUseCase.findCarListingById(id);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findCarMakes(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    try {
      return await this.carUseCase.findCarMakes(queryParams);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findCarModels(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    try {
      return await this.carUseCase.findCarModels(queryParams);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findCarTrims(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    try {
      return await this.carUseCase.findCarTrims(queryParams);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async findCarFetures(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    try {
      return await this.carUseCase.findCarFetures(queryParams);
    } catch (err) {
      return catchClientRequest(err);
    }
  }
}
