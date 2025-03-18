import { ICarVisitorService } from '@/core/application/services/visitors/car.visitor.service.interface';
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
import { getReq, postReq } from '@/core/lib/api';

export class CarVisitorService implements ICarVisitorService {
  async findCarListings(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    const res = await postReq<QueryParams, SelectCarListingDto>({
      url: '/car-listings-visitor/search',
      body: queryParams,
    });

    return res;
  }
  async findCarListingById(
    id: number,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    const res = await getReq<
      Record<string, unknown>,
      ApiResponse<SelectCarListingDto>
    >({
      url: '/car-listings-visitor/' + id,
    });

    return res;
  }
  async findCarMakes(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarMakeDto>> {
    // const locale = await getLocale();
    const res = await postReq<QueryParams, SelectCarMakeDto>({
      url: '/car-make-visitor/search',
      body: queryParams,
    });

    return res;
  }
  async findCarModels(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarModelDto>> {
    // const locale = await getLocale();
    const res = await postReq<QueryParams, SelectCarModelDto>({
      url: '/car-model-visitor/search',
      body: queryParams,
    });

    return res;
  }
  async findCarTrims(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectCarTrimDto>> {
    // const locale = await getLocale();
    const res = await postReq<QueryParams, SelectCarTrimDto>({
      url: '/car-trim-visitor/search',
      body: queryParams,
    });

    return res;
  }
  async findCarFetures(
    queryParams: QueryParams,
  ): Promise<PaginatedResponse<SelectFeatureDto>> {
    // const locale = await getLocale();
    const res = await postReq<QueryParams, SelectFeatureDto>({
      url: '/features-visitor/search',
      body: queryParams,
    });

    return res;
  }
}
