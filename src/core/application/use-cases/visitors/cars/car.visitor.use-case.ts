import { QueryParams } from '@/core/entities/api/api';
import {
  PaginatedResponse,
  ApiResponse,
} from '@/core/entities/api/success.response';
import {
  FacetCount,
  SelectCarListingDto,
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
  SelectFeatureDto,
} from '@/core/entities/models/cars/cars.dto';
import { ICarVisitorUseCase } from './car.visitor.use-case.interface';
import { ICarVisitorService } from '@/core/application/services/visitors/car.visitor.service.interface';

export class CarVisitorUseCase implements ICarVisitorUseCase {
  constructor(protected readonly service: ICarVisitorService) {}
  async getPublicFilterFacets(
    params: QueryParams,
  ): Promise<ApiResponse<FacetCount[]>> {
    return await this.service.getPublicFilterFacets(params);
  }
  async findCarListings(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    return await this.service.findCarListings(queryParams);
  }
  async findCarListingById(
    queryParams: QueryParams,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.service.findCarListingById(queryParams);
  }
  async findCarMakes(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    return await this.service.findCarMakes(queryParams);
  }
  async findCarModels(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    return await this.service.findCarModels(queryParams);
  }
  async findCarTrims(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    return await this.service.findCarTrims(queryParams);
  }
  async findCarFetures(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    return await this.service.findCarFetures(queryParams);
  }
}
