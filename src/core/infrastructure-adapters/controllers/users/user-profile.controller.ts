import { IUserProfileController } from '@/core/application/controllers/users/user-profile/user-profile.controller.interface';
import { IUserProfileUseCase } from '@/core/application/use-cases/users/user-profile/user-profile.use-case.interface';
import { ApiResponse } from '@/core/entities/api/success.response';
import {
  GetUserProfile,
  UpdateProfileDto,
} from '@/core/entities/models/profile/user.profile.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { catchClientRequest } from '@/core/lib/error';

export class UserProfileController implements IUserProfileController {
  constructor(protected readonly useCase: IUserProfileUseCase) {}
  async getAuthProfile(): Promise<ApiResponse<GetUserProfile>> {
    try {
      return await this.useCase.getAuthProfile();
    } catch (e) {
      return catchClientRequest(e);
    }
  }
  async updateAuthProfile(
    dto: UpdateProfileDto,
  ): Promise<ApiResponse<SelectUserDto>> {
    try {
      return await this.useCase.updateAuthProfile(dto);
    } catch (e) {
      return catchClientRequest(e);
    }
  }
}
