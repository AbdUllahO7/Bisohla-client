import { ICarUserService } from '@/core/application/services/users/car.user.service.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { deleteAuthReq, postAuthReq, putAuthReq } from '@/core/lib/api';

export class CarUserService implements ICarUserService {
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
}
