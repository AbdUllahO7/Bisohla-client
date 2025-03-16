'use client';

import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';

import { useMutation } from '@tanstack/react-query';

import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import {
  createCarListing,
  deleteCarListing,
  updateCarListing,
} from '../../actions/users/car.user.actions';

export const useCreateCarListing = () =>
  useMutation<ApiResponse<SelectCarListingDto>, Error, CreateCarListingDto>({
    mutationFn: async (creategroupDto) =>
      await createCarListing(creategroupDto),
  });

export const useUpdateCarListing = () =>
  useMutation<
    ApiResponse<SelectCarListingDto>,
    Error,
    { id: number; data: UpdateCarListingDto }
  >({
    mutationFn: async ({ id, data }) => {
      // console.log('DATA: ', data);
      return await updateCarListing(id, data);
    },
    onError: (error) => {
      console.error('Failed to update car Listing:', error);
    },
  });

export const useDeleteCarListing = () =>
  useMutation<ApiResponse<SuccessResponseWithNoContent>, Error, { id: number }>(
    {
      mutationFn: async ({ id }) => await deleteCarListing(id),
      onError: (error) => {
        console.error('Failed to update car Listing:', error);
      },
    },
  );
