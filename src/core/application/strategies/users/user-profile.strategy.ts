import { ApiResponse } from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

export interface UserProfileStrategy {
  getAuthProfile(): Promise<ApiResponse<GetUserProfile>>;
  updateAuthProfile(dto: UpdateProfileDto): Promise<ApiResponse<SelectUserDto>>;
}
