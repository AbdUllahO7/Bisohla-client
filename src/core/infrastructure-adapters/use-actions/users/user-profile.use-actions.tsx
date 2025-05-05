'use client';

import { ApiResponse } from '@/core/entities/api/success.response';
import { useSession } from '../auth/use-session';
import {
  getMyProfile,
  updateProfile,
} from '../../actions/users/user-profile.actions';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { useMutation } from '@tanstack/react-query';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { useLocaleQuery } from '../common/use-locale-query';

export const useGetMyProfile = () => {
  const session = useSession();
  const { user } = session;

  return useLocaleQuery<ApiResponse<GetUserProfile>>({
    queryKey: ['auth-profile', user.id],
    queryFn: async () => await getMyProfile(),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });
};

export const useUpdateUserProfile = () =>
  useMutation<ApiResponse<SelectUserDto>, Error, UpdateProfileDto>({
    mutationFn: async (dto) => await updateProfile(dto),
    onError: (error) => {
      console.error('Failed to update notification read status:', error);
    },
  });
