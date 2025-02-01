import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { LoginDto, LoginResponse } from '@/core/entities/models/auth/login.dto';
import {
  RegisterDto,
  RegisterResponse,
} from '@/core/entities/models/auth/register.dto';
import { ResetPasswordDto } from '@/core/entities/models/auth/reset-password.dto';
import { sendVerificationEmailDto } from '@/core/entities/models/auth/send-verification-email.dto';

export interface IAuthStrategy {
  login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>>;
  register(registerDto: RegisterDto): Promise<ApiResponse<RegisterResponse>>;
  sendResetPasswordEmail(
    sendEmailDto: sendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>>;
}
