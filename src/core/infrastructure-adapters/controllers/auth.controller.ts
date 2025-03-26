import { IAuthController } from '@/core/application/controllers/auth.controller.interface';
import { IAuthUseCase } from '@/core/application/use-cases/auth/auth.use-case.interface';
import {
  ApiResponse,
  SuccessResponseWithNoContent,
} from '@/core/entities/api/success.response';
import { ValidationError } from '@/core/entities/errors/validation-error';
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
  resetPasswordSchema,
} from '@/core/entities/models/auth/reset-password.dto';
import {
  SendVerificationEmailDto,
  sendVerificationEmailSchema,
} from '@/core/entities/models/auth/send-verification-email.dto';
import { catchClientRequest } from '@/core/lib/error';
import { validateSchema, verifyZodFields } from '@/core/lib/validation';

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
      return catchClientRequest(error);
    }
  }
  async login(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const validation = await validateSchema(loginSchema, loginDto);

      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const res = await this.authUseCase.login(loginDto as LoginDto);
      return res;
    } catch (error) {
      return catchClientRequest(error);
    }
  }

  async adminLogin(loginDto: LoginDto): Promise<ApiResponse<LoginResponse>> {
    try {
      const validation = await validateSchema(loginSchema, loginDto);

      if (!validation.success) {
        throw new ValidationError(validation.errors || {});
      }

      const res = await this.authUseCase.adminLogin(loginDto as LoginDto);
      return res;
    } catch (error) {
      return catchClientRequest(error);
    }
  }

  async sendResetPasswordEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const validatedBody = await validateSchema(
        sendVerificationEmailSchema,
        sendEmailDto,
      );

      const res = await this.authUseCase.sendResetPasswordEmail(
        validatedBody.data as SendVerificationEmailDto,
      );

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async sendVerificationEmail(
    sendEmailDto: SendVerificationEmailDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const validatedBody = await validateSchema(
        sendVerificationEmailSchema,
        sendEmailDto,
      );

      const res = await this.authUseCase.sendVerificationEmail(
        validatedBody.data as SendVerificationEmailDto,
      );

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async validateResetPasswordToken(
    token: string,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const res = await this.authUseCase.validateResetPasswordToken(token);

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async resetPassword(
    resetPasswordDto: ResetPasswordDto,
  ): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const validatedBody = await validateSchema(
        resetPasswordSchema,
        resetPasswordDto,
      );

      const res = await this.authUseCase.resetPassword(
        validatedBody.data as ResetPasswordDto,
      );

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
  async signOut(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const res = await this.authUseCase.signOut();

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }

  async checkAuth(): Promise<ApiResponse<SuccessResponseWithNoContent>> {
    try {
      const res = await this.authUseCase.checkAuth();

      return res;
    } catch (err) {
      return catchClientRequest(err);
    }
  }
}
