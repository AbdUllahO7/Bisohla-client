import { ICarUserService } from '@/core/application/services/users/car.user.service.interface';
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
import {
  deleteAuthReq,
  getAuthReq,
  postAuthReq,
  putAuthReq,
} from '@/core/lib/api';

export class CarUserService implements ICarUserService {
  async getCarFavorites(
    params: QueryParams,
  ): Promise<PaginatedResponse<UserFavoriteCarListing>> {
    const res = await postAuthReq<QueryParams, UserFavoriteCarListing>({
      url: '/user-favorites',
      body: params,
    });

    return res;
  }
  async addCarListingToFavorites(
    dto: CreateFavoriteCarListingDto,
  ): Promise<ApiResponse<UserFavoriteCarListing>> {
    const res = await postAuthReq<
      CreateFavoriteCarListingDto,
      UserFavoriteCarListing
    >({
      url: '/user-favorites/add',
      body: dto,
    });

    return res;
  }
  async removeCarListingFromFavorites(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await deleteAuthReq({
      url: '/user-favorites/' + id,
    });

    return res;
  }
  async toggleCarListingFavorite(
    dto: ToggleFavoriteCarListingDto,
  ): Promise<ApiResponse<ToggleFavoriteResponse>> {
    const res = await postAuthReq<
      ToggleFavoriteCarListingDto,
      UserFavoriteCarListing
    >({
      url: '/user-favorites/toggle',
      body: dto,
    });

    return res;
  }
  async checkIsCarListingFavorite(
    carListingId: number,
  ): Promise<ApiResponse<boolean>> {
    const res = await getAuthReq<
      { carListingId: number },
      { isFavorite: boolean }
    >({
      url: '/user-favorites/check/' + carListingId,
    });

    return res;
  }

  async addCarListing(
    dto: CreateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    const res = await postAuthReq<CreateCarListingDto, SelectCarListingDto>({
      url: '/car-listings-user',
      body: dto,
    });

    return res;
  }
  async editCarListing(
    id: number,
    dto: UpdateCarListingDto,
  ): Promise<ApiResponse<SelectCarListingDto>> {
    const res = await putAuthReq<UpdateCarListingDto, SelectCarListingDto>({
      url: '/car-listings-user/' + id,
      body: dto,
    });

    return res;
  }
  async deleteCarListing(
    id: number,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await deleteAuthReq({
      url: '/car-listings-user/' + id,
    });

    return res;
  }

  async getMyCars(
    params: QueryParams,
  ): Promise<PaginatedResponse<SelectCarListingDto>> {
    const res = await postAuthReq<QueryParams, UserFavoriteCarListing>({
      url: '/car-listings-user/my-cars',
      body: params,
    });

    return res;
  }
}
