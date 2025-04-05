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
import { ICarUserUseCase } from './car.user.use-case.interface';
import { ICarUserService } from '@/core/application/services/users/car.user.service.interface';
import { QueryParams } from '@/core/entities/api/api';
import {
  UserFavoriteCarListing,
  CreateFavoriteCarListingDto,
  ToggleFavoriteCarListingDto,
  ToggleFavoriteResponse,
} from '@/core/entities/models/cars/users-favorites-cars.zod.dto';

export class CarUserUseCase implements ICarUserUseCase {
  constructor(protected readonly carUserStrategy: ICarUserService) {}
  async getCarFavorites(
    params: QueryParams,
  ): Promise<PaginatedResponse<UserFavoriteCarListing>> {
    return await this.carUserStrategy.getCarFavorites(params);
  }
  async addCarListingToFavorites(
    dto: CreateFavoriteCarListingDto,
  ): Promise<ApiResponse<UserFavoriteCarListing>> {
    return await this.carUserStrategy.addCarListingToFavorites(dto);
  }
  async removeCarListingFromFavorites(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carUserStrategy.removeCarListingFromFavorites(id);
  }
  async toggleCarListingFavorite(
    dto: ToggleFavoriteCarListingDto,
  ): Promise<ApiResponse<ToggleFavoriteResponse>> {
    return await this.carUserStrategy.toggleCarListingFavorite(dto);
  }
  async checkIsCarListingFavorite(
    carListingId: number,
  ): Promise<ApiResponse<boolean>> {
    return await this.carUserStrategy.checkIsCarListingFavorite(carListingId);
  }
  async addCarListing(
    dto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.carUserStrategy.addCarListing(dto);
  }
  async editCarListing(
    id: number,
    dto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    return await this.carUserStrategy.editCarListing(id, dto);
  }
  async deleteCarListing(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    return await this.carUserStrategy.deleteCarListing(id);
  }
}
