import { ICarUserController } from '@/core/application/controllers/users/cars/car-controller.interface';
import { ICarUserUseCase } from '@/core/application/use-cases/users/cars/car.user.use-case.interface';
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
  UserFavoriteCarListing,
  CreateFavoriteCarListingDto,
  ToggleFavoriteCarListingDto,
  ToggleFavoriteResponse,
} from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { catchClientRequest } from '@/core/lib/error';

export class CarUserController implements ICarUserController {
  constructor(private readonly carUserUseCase: ICarUserUseCase) {}

  async getMyCars(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    try {
      return await this.carUserUseCase.getMyCars(params);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getMyCarById(id: number): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carUserUseCase.getMyCarById(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }

  async getCarFavorites(
    params: QueryParams,
  ): Promise<PaginatedResponse<UserFavoriteCarListing>> {
    try {
      return await this.carUserUseCase.getCarFavorites(params);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async addCarListingToFavorites(
    dto: CreateFavoriteCarListingDto,
  ): Promise<ApiResponse<UserFavoriteCarListing>> {
    try {
      return await this.carUserUseCase.addCarListingToFavorites(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async removeCarListingFromFavorites(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carUserUseCase.removeCarListingFromFavorites(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async toggleCarListingFavorite(
    dto: ToggleFavoriteCarListingDto,
  ): Promise<ApiResponse<ToggleFavoriteResponse>> {
    try {
      return await this.carUserUseCase.toggleCarListingFavorite(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async checkIsCarListingFavorite(
    carListingId: number,
  ): Promise<ApiResponse<boolean>> {
    try {
      return await this.carUserUseCase.checkIsCarListingFavorite(carListingId);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async addCarListing(
    dto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carUserUseCase.addCarListing(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async editCarListing(
    id: number,
    dto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    try {
      return await this.carUserUseCase.editCarListing(id, dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async deleteCarListing(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      return await this.carUserUseCase.deleteCarListing(id);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
}
