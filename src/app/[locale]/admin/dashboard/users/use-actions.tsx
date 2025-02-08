import {
  createUser,
  getPaginatedUsers,
} from '@/app/[locale]/admin/dashboard/users/actions';
import { QueryParams } from '@/core/entities/api/api';
import {
  ApiResponse,
  PaginatedResponse,
} from '@/core/entities/api/success.response';
import {
  CreateUserDto,
  CreateUserResponse,
  SelectUserDto,
} from '@/core/entities/models/users/users.dto';

import { useMutation, useQuery } from '@tanstack/react-query';

export const usePaginatedUsers = (params: QueryParams) =>
  useQuery<PaginatedResponse<SelectUserDto>>({
    queryKey: ['users', params],
    queryFn: async () => await getPaginatedUsers(params),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    // keepPreviousData: true, // Keep previous data during re-fetch
  });

export const useCreateUser = () =>
  useMutation<ApiResponse<CreateUserResponse>, Error, CreateUserDto>({
    mutationFn: async (createUserDto) => await createUser(createUserDto),
    onError: (error) => {
      // Optional error handling
      console.error('Failed to create user:', error);
    },
    // Optionally invalidate the users query to trigger a refetch
    onSuccess: () => {},
  });
