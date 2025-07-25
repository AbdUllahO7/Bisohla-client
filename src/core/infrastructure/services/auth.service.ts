import { IAuthService } from '@/core/application/services/auth.service.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { AppError } from '@/core/entities/errors/app-error';
import { LoginDto, LoginResponse } from '@/core/entities/models/auth/login.dto';
import {
  RegisterDto,
  RegisterResponse,
} from '@/core/entities/models/auth/register.dto';
import { ResetPasswordDto } from '@/core/entities/models/auth/reset-password.dto';
import { SendVerificationEmailDto } from '@/core/entities/models/auth/send-verification-email.dto';
import { getAuthReq, postReq } from '@/core/lib/api';

export class AuthService implements IAuthService {
  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<RegisterResponse>> {
    const res = await postReq<RegisterDto, RegisterResponse>({
      url: '/auth/register',
      body: registerDto,
      errorDefaultMessage: 'Failed to register.',
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  }
  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const res = await postReq<LoginDto, LoginResponse>({
      url: '/auth/login',
      body: loginDto,
      errorDefaultMessage: 'Failed to login.',
    });
    // console.error('from service: ' + res.message);

    if (!res.success) {
      throw new AppError(res);
    }

    return res;
  }
  async adminLogin(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    const res = await postReq<LoginDto, LoginResponse>({
      url: '/admin/auth/login',
      body: loginDto,
      errorDefaultMessage: 'Failed to login.',
    });
    // console.error('from service: ' + res.message);

    if (!res.success) {
      throw new AppError(res);
    }

    return res;
  }

  async sendResetPasswordEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const response = await postReq<
      SendVerificationEmailDto,
      SuccessResponseWithNoContent
    >({
      url: '/auth/send-reset-password-email',
      body: sendEmailDto,
      errorDefaultMessage: 'Failed to send reset password email.',
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  async sendVerificationEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const response = await postReq<
      SendVerificationEmailDto,
      SuccessResponseWithNoContent
    >({
      url: '/auth/send-verification-email',
      body: sendEmailDto,
      errorDefaultMessage: 'Failed to send verificatoin email.',
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  async validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const response = await postReq<
      { token: string },
      SuccessResponseWithNoContent
    >({
      url: `/auth/check-reset-password-token?token=${token}`,
      errorDefaultMessage: 'Failed to validate reset password token.',
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const response = await postReq<
      ResetPasswordDto,
      SuccessResponseWithNoContent
    >({
      url: `/auth/reset-password-from-client?token=${resetPasswordDto.token}`,
      body: resetPasswordDto,
      errorDefaultMessage: 'Failed to reset password.',
    });

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  async signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const fields = {};
    const response = await postReq<typeof fields, SuccessResponseWithNoContent>(
      {
        url: '/auth/signout',
        body: {},
        errorDefaultMessage: 'Failed to sign out.',
      },
    );

    if (!response.success) {
      throw new Error(response.message);
    }

    return response;
  }

  async checkAuth(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await getAuthReq({
      url: '/auth/check/user',
    });

    if (!res.success) {
      throw new Error(res.message);
    }

    return res;
  }

  // async register(
  //   registerDto: RegisterDto,
  // ): Promise<ApiResponse<RegisterResponse>> {
  //   const response = await postReq<RegisterDto, RegisterResponse>({
  //     url: '/auth/register',
  //     body: registerDto,
  //     errorDefaultMessage: 'Failed to register.',
  //   });

  //   if (!response.success) {
  //     throw new Error(response.message);
  //   }

  //   return response;
  // }
}
