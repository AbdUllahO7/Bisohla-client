import { ApiResponse } from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { getInjection } from '@/di/container';

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
