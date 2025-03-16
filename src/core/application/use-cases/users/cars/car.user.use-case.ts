import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { ICarUserUseCase } from './car.user.use-case.interface';
import { ICarUserService } from '@/core/application/services/users/car.user.service.interface';

export class CarUserUseCase implements ICarUserUseCase {
  constructor(protected readonly carUserStrategy: ICarUserService) {}
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
