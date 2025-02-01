import { LoginDto } from '@/core/entities/models/auth/login.dto';
import { IAuthUseCase } from './auth.use-case.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { IAuthService } from '../../services/auth.service.interface';
import { createSession } from '@/lib/session';
import { sendVerificationEmailDto } from '@/core/entities/models/auth/send-verification-email.dto';
import { ResetPasswordDto } from '@/core/entities/models/auth/reset-password.dto';
import {
  RegisterDto,
  RegisterResponse,
} from '@/core/entities/models/auth/register.dto';

export class AuthUseCase implements IAuthUseCase {
  constructor(protected readonly authService: IAuthService) {}
  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<RegisterResponse>> {
    const res = await this.authService.register(registerDto);

    if (res.success && res.data) {
      // TODO: do something when success;
    }

    return res;
  }

  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const res = await this.authService.login(loginDto);

    if (res.success && res.data) {
      await createSession({
        user: {
          id: res.data.id,
          name: res.data.name,
          roles: res.data.roles,
          permissions: res.data.permissions,
        },
        accessToken: res.data.accessToken,
        refreshToken: res.data.refreshToken,
      });
    }

    return res;
  }
  async sendResetPasswordEmail(
    sendEmailDto: sendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    // TODO: Implement AUTHORIZATION in use cases

    const res = await this.authService.sendResetPasswordEmail(sendEmailDto);

    if (res.success && res.data) {
      //TODO: Implement something when response success
    }

    return res;
  }
  async validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    // TODO: Implement AUTHORIZATION in use cases

    const res = await this.authService.validateResetPasswordToken(token);

    if (res.success && res.data) {
      //TODO: Implement something when response success
    }

    return res;
  }
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    // TODO: Implement AUTHORIZATION in use cases

    const res = await this.authService.resetPassword(resetPasswordDto);

    if (res.success && res.data) {
      //TODO: Implement something when response success
    }

    return res;
  }
  async signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    // TODO: Implement AUTHORIZATION in use cases

    const res = await this.authService.signOut();

    if (res.success && res.data) {
      // revalidatePath('/');
      // redirect(allRoutes.user.children.dashboard.path);
    }

    return res;
  }
}
