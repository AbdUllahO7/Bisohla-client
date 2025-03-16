import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';

export interface ICarUserStrategy {
  addCarListing(
    dto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>>;
  editCarListing(
    id: number,
    dto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>>;
  deleteCarListing(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;
}
