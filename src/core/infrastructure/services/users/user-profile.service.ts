import { IUserProfileService } from '@/core/application/services/users/user-profile.service.interface';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { getAuthReq, putAuthReq } from '@/core/lib/api';

export class UserProfileService implements IUserProfileService {
  private path = '/profile';
  async getAuthProfile(): Promise<ApiResponse<GetUserProfile>> {
    const res = await getAuthReq<
      Record<string, unknown>,
      ApiResponse<GetUserProfile>
    >({
      url: this.path,
    });
    return res;
  }
  async updateAuthProfile(
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<SelectUserDto>> {
    const res = await putAuthReq<UpdateProfileDto, ApiResponse<SelectUserDto>>({
      url: this.path + '/update',
      body: dto,
    });

    return res;
  }
}
