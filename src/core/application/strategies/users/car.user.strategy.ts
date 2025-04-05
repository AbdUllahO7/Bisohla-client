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
import {
  CreateFavoriteCarListingDto,
  ToggleFavoriteCarListingDto,
  ToggleFavoriteResponse,
  UserFavoriteCarListing,
} from '@/core/entities/models/cars/users-favorites-cars.zod.dto';

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
  getCarFavorites(
    params: QueryParams,
  ): Promise<PaginatedResponse<UserFavoriteCarListing>>;
  addCarListingToFavorites(
    dto: CreateFavoriteCarListingDto,
  ): Promise<ApiResponse<UserFavoriteCarListing>>;
  removeCarListingFromFavorites(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;
  toggleCarListingFavorite(
    dto: ToggleFavoriteCarListingDto,
  ): Promise<ApiResponse<ToggleFavoriteResponse>>;
  checkIsCarListingFavorite(
    carListingId: number,
  ): Promise<ApiResponse<boolean>>;
}
