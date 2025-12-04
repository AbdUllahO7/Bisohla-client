'use client';

import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { useSession } from '../auth/use-session';
import {
  deleteMyAccount,
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
import { useToast } from '@/hooks/use-toast';
import { useTranslations } from 'next-intl';

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
      console.error('Failed to update user profile:', error);
    },
  });

export const useDeleteMyAccount = () => {
  const t = useTranslations('UserProfile.profile.deleteAccount');
  const { toast } = useToast();

  return useMutation<ApiResponse<SuccessResponseWithNoContent>, Error, null>({
    mutationFn: async () => await deleteMyAccount(),
    onSuccess: async (res) => {
      if (res.success) {
        toast({
          title: t('successResponse'),
        });
      } else {
        toast({
          title: res.message || t('errorResponse'),
          variant: 'destructive',
        });
      }
    },
    onError: (error) => {
      toast({
        title: error.message || t('errorResponse'),
        variant: 'destructive',
      });
      console.error('Failed to delete auth user account:', error);
    },
  });
};
