'use client';

import {
  ApiResponse,
  PaginatedResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';

import { useMutation } from '@tanstack/react-query';

import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import {
  CreateCarListingDto,
  UpdateCarListingDto,
} from '@/core/entities/models/cars/cars.zod.dto';
import {
  addCarListingToFavorites,
  checkIsCarListingFavorite,
  createCarListing,
  deleteCarListing,
  getCarFavorites,
  getMyCarListings,
  removeCarListingFromFavorites,
  toggleCarListingFavorite,
  updateCarListing,
} from '../../actions/users/car.user.actions';
import { useLocaleQuery } from '../common/use-locale-query';
import {
  CreateFavoriteCarListingDto,
  ToggleFavoriteCarListingDto,
  ToggleFavoriteResponse,
  UserFavoriteCarListing,
} from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { QueryParams } from '@/core/entities/api/api';
import { useSession } from '../auth/use-session';

export const useGetCarFavorites = (params: QueryParams) => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<PaginatedResponse<UserFavoriteCarListing>>({
    queryKey: ['user-favorite-cars', user.id],
    queryFn: async () => await getCarFavorites(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

// 1. Add car to favorites
export const useAddCarToFavorites = () =>
  useMutation<
    ApiResponse<UserFavoriteCarListing>,
    Error,
    CreateFavoriteCarListingDto
  >({
    mutationFn: async (favoriteDto) =>
      await addCarListingToFavorites(favoriteDto),
    onError: (error) => {
      console.error('Failed to add car to favorites:', error);
    },
  });

// 2. Remove car from favorites
export const useRemoveCarFromFavorites = () =>
  useMutation<ApiResponse<SuccessResponseWithNoContent>, Error, { id: number }>(
    {
      mutationFn: async ({ id }) => await removeCarListingFromFavorites(id),
      onError: (error) => {
        console.error('Failed to remove car from favorites:', error);
      },
    },
  );

// 3. Toggle car favorite status
export const useToggleCarFavorite = () =>
  useMutation<
    ApiResponse<ToggleFavoriteResponse>,
    Error,
    ToggleFavoriteCarListingDto
  >({
    mutationFn: async (toggleDto) => await toggleCarListingFavorite(toggleDto),
    onError: (error) => {
      console.error('Failed to toggle car favorite status:', error);
    },
  });

// 4. Check if car is in favorites
export const useCheckCarIsFavorite = (carListingId: number) => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<ApiResponse<boolean>, Error>({
    queryKey: ['car-favorite-check', user.id, carListingId],
    queryFn: async () => await checkIsCarListingFavorite(carListingId),
    staleTime: 5 * 60 * 1000,
    enabled: !!carListingId && !!user.id,
  });
};

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

export const useMyCarListings = (params: QueryParams) =>
  useLocaleQuery<PaginatedResponse<SelectCarListingDto>>({
    queryKey: ['visitors-car-listings', params],
    queryFn: async () => await getMyCarListings(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
});
