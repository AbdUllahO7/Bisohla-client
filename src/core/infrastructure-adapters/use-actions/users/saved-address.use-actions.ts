'use client';

import { useMutation, useQueryClient } from '@tanstack/react-query';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  UserAddress,
  CreateUserAddressDto,
  UpdateUserAddressDto,
  DeleteUserAddressResponse,
} from '@/core/entities/models/users/saved-address.dto';
import {
  getUserAddresses,
  getUserAddressById,
  createUserAddress,
  updateUserAddress,
  setDefaultUserAddress,
  deleteUserAddress,
  touchUserAddress,
} from '../../actions/users/saved-address.actions';
import { useLocaleQuery } from '../common/use-locale-query';

export const useSavedAddresses = (options?: { enabled?: boolean }) =>
  useLocaleQuery<ApiResponse<UserAddress[]>>({
    queryKey: ['user-addresses'],
    queryFn: async () => await getUserAddresses(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: options?.enabled ?? true,
  });

export const useSavedAddressById = (id: number, options?: { enabled?: boolean }) =>
  useLocaleQuery<ApiResponse<UserAddress>>({
    queryKey: ['user-address', String(id)],
    queryFn: async () => await getUserAddressById(id),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: (options?.enabled ?? true) && !!id,
  });

export const useCreateSavedAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UserAddress>, Error, CreateUserAddressDto>({
    mutationFn: async (dto) => await createUserAddress(dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useUpdateSavedAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<
    ApiResponse<UserAddress>,
    Error,
    { id: number; dto: UpdateUserAddressDto }
  >({
    mutationFn: async ({ id, dto }) => await updateUserAddress(id, dto),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useSetDefaultSavedAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<UserAddress>, Error, number>({
    mutationFn: async (id: number) => await setDefaultUserAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useDeleteSavedAddress = () => {
  const queryClient = useQueryClient();

  return useMutation<ApiResponse<DeleteUserAddressResponse>, Error, number>({
    mutationFn: async (id: number) => await deleteUserAddress(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['user-addresses'] });
    },
  });
};

export const useTouchSavedAddress = () => {
  return useMutation<ApiResponse<UserAddress>, Error, number>({
    mutationFn: async (id: number) => await touchUserAddress(id),
  });
};
