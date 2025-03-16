import { ICarUserController } from '@/core/application/controllers/users/cars/car-controller.interface';
import { ICarUserUseCase } from '@/core/application/use-cases/users/cars/car.user.use-case.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { catchClientRequest } from '@/core/lib/error';

export class CarUserController implements ICarUserController {
  constructor(private readonly carUserUseCase: ICarUserUseCase) {}
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
