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
import { SendVerificationEmailDto } from '@/core/entities/models/auth/send-verification-email.dto';

export interface IAuthStrategy {
  login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>>;
  adminLogin(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>>;
  register(registerDto: RegisterDto): Promise<ApiResponse<RegisterResponse>>;
  sendVerificationEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  sendResetPasswordEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>>;

  signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>>;
}
