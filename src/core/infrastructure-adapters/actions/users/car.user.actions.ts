'use server';

import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import { getInjection } from '@/di/container';

export const createCarListing = async (
  createCarListingDto: CreateCarListingDto,
): Promise<ApiResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarUserController');
    console.log("createCarListingDto" , createCarListingDto)
  const res = await carListingController.addCarListing(createCarListingDto);

  return res;
};

export const updateCarListing = async (
  id: number,
  dto: UpdateCarListingDto,
): Promise<ApiResponse<SelectCarListingDto>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.editCarListing(id, dto);

  return res;
};

export const deleteCarListing = async (
  id: number,
): Promise<ApiResponse<SuccessResponseWithNoContent>> => {
  const carListingController = getInjection('ICarUserController');

  const res = await carListingController.deleteCarListing(id);

  return res;
};
