import { IAuthController } from '@/core/application/controllers/auth.controller.interface';
import { IAuthService } from '@/core/application/services/auth.service.interface';

import { IAuthUseCase } from '@/core/application/use-cases/auth/auth.use-case.interface';

export const DI_SYMBOLS = {
  //services
  IAuthService: Symbol.for('IAuthService'),

  //repositories

  // use cases
  IAuthUseCase: Symbol.for('IAuthUseCase'),

  //controllers
  IAuthController: Symbol.for('IAuthController'),
};

export interface DI_RETURN_TYPES {
  //services
  IAuthService: IAuthService;

  //repositories

  // use cases
  IAuthUseCase: IAuthUseCase;

  // controllers
  IAuthController: IAuthController;
}
