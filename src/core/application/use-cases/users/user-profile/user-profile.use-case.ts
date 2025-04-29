import { ApiResponse } from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { IUserProfileUseCase } from './user-profile.use-case.interface';
import { IUserProfileService } from '@/core/application/services/users/user-profile.service.interface';

export class UserProfileUseCase implements IUserProfileUseCase {
  constructor(protected readonly service: IUserProfileService) {}
  async getAuthProfile(): Promise<ApiResponse<GetUserProfile>> {
    return await this.service.getAuthProfile();
  }
  async updateAuthProfile(
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<SelectUserDto>> {
    return await this.service.updateAuthProfile(dto);
  }
}
