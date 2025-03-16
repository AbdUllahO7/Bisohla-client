import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../types';
import { AuthUseCase } from '@/core/application/use-cases/auth/auth.use-case';
import { AuthController } from '@/core/infrastructure-adapters/controllers/auth.controller';
import { AuthService } from '@/core/infrastructure/services/auth.service';

export function createAuthModule(): Module {
  const authModule = createModule();

  //service
  authModule.bind(DI_SYMBOLS.IAuthService).toClass(AuthService, []);

  // use cases
  authModule
    .bind(DI_SYMBOLS.IAuthUseCase)
    .toClass(AuthUseCase, [DI_SYMBOLS.IAuthService]);

  // controllers
  authModule
    .bind(DI_SYMBOLS.IAuthController)
    .toClass(AuthController, [DI_SYMBOLS.IAuthUseCase]);

  return authModule;
}
