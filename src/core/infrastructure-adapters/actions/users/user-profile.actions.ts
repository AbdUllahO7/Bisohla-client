'use server';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { putAuthReq } from '@/core/lib/api';
import { deleteSession } from '@/core/lib/web/session';
import { getInjection } from '@/di/container';
import { revalidatePath, revalidateTag } from 'next/cache';

export const getMyProfile = async (): Promise<ApiResponse<GetUserProfile>> => {
  const controller = getInjection('IUserProfileController');
  const res = await controller.getAuthProfile();
  return res;
};

export const updateProfile = async (
  dto: UpdateProfileDto,
): Promise<ApiResponse<SelectUserDto>> => {
  const controller = getInjection('IUserProfileController');
  const res = await controller.updateAuthProfile(dto);
  return res;
};

export const deleteMyAccount = async (): Promise<
  ApiResponse<SuccessResponseWithNoContent>
> => {
  const res = await putAuthReq({
    url: '/profile/delete-my-account',
  });

  if (!res.success) {
    throw new Error(res.message || 'Failed to delete account');
  }

  await deleteSession();

  // Revalidate all paths and clear auth cache
  revalidatePath('/', 'layout');
  revalidateTag('auth');
  revalidateTag('session');
  revalidateTag('user');

  return res;
};
