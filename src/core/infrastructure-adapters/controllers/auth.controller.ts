import { IAuthController } from '@/core/application/controllers/auth.controller.interface';
import { IAuthUseCase } from '@/core/application/use-cases/auth/auth.use-case.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import {
  LoginDto,
  LoginResponse,
  loginSchema,
} from '@/core/entities/models/auth/login.dto';
import {
  RegisterDto,
  RegisterResponse,
  registerSchema,
} from '@/core/entities/models/auth/register.dto';
import {
  ResetPasswordDto,
  ResetPasswordSchema,
} from '@/core/entities/models/auth/reset-password.dto';
import {
  sendVerificationEmailDto,
  sendVerificationEmailSchema,
} from '@/core/entities/models/auth/send-verification-email.dto';
import { catchActionRequest } from '@/core/lib/api';
import { verifyZodFields } from '@/core/lib/validation';

export class AuthController implements IAuthController {
  constructor(protected readonly authUseCase: IAuthUseCase) {}
  async register(
    registerDto: RegisterDto,
  ): Promise<ApiResponse<RegisterResponse>> {
    try {
      const validatedBody = await verifyZodFields(registerSchema, registerDto);

      const res = await this.authUseCase.register(validatedBody as RegisterDto);

      return res;
    } catch (error) {
      return await catchActionRequest(error);
    }
  }
  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const validatedBody = await verifyZodFields(loginSchema, loginDto);

      const res = await this.authUseCase.login(validatedBody as RegisterDto);

      return res;
    } catch (error) {
      console.log(error);
      return await catchActionRequest(error);
    }
  }

  async sendResetPasswordEmail(
    sendEmailDto: sendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const validatedBody = await verifyZodFields(
      sendVerificationEmailSchema,
      sendEmailDto,
    );

    const res = await this.authUseCase.sendResetPasswordEmail(
      validatedBody as sendVerificationEmailDto,
    );

    return res;
  }
  async validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await this.authUseCase.validateResetPasswordToken(token);

    return res;
  }
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const validatedBody = await verifyZodFields(
      ResetPasswordSchema,
      resetPasswordDto,
    );

    const res = await this.authUseCase.resetPassword(
      validatedBody as ResetPasswordDto,
    );

    return res;
  }
  async signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    const res = await this.authUseCase.signOut();

    return res;
  }
}
