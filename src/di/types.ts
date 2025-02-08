import { IRolesRepoController } from './../core/application/controllers/repositories/roles.repo.controller.interface';
import { IRolesRepoUseCase } from './../core/application/use-cases/repositories/roles/roles.repo.use-case.inteface';
import { IAuthController } from '@/core/application/controllers/auth.controller.interface';
import { IPermissionController } from '@/core/application/controllers/permission.controller.interface';
import { IUserRepoController } from '@/core/application/controllers/repositories/users.repo.controller.interface';
import { IRolesRepo } from '@/core/application/repositories/roles.repo.interface';
import { IUserRepository } from '@/core/application/repositories/user.repo.interface';
import { IAuthService } from '@/core/application/services/auth.service.interface';
import { IPermissionService } from '@/core/application/services/permission.service.interface';
import { IBaseRepo } from '@/core/application/strategies/repo.strategy';

import { IAuthUseCase } from '@/core/application/use-cases/auth/auth.use-case.interface';
import { IPermissionUseCase } from '@/core/application/use-cases/permission/permission.use-case.interface';
import { IUsersRepoUseCase } from '@/core/application/use-cases/repositories/users/users.repo.use-case.interface';

export const DI_SYMBOLS = {
  //services
  IAuthService: Symbol.for('IAuthService'),
  IPermissionService: Symbol.for('IPermissionService'),

  // use cases
  IAuthUseCase: Symbol.for('IAuthUseCase'),
  IPermissionUseCase: Symbol.for('IPermissionUseCase'),

  //controllers
  IAuthController: Symbol.for('IAuthController'),
  IPermissionController: Symbol.for('IPermissionController'),

  //REPOSITORIES
  IBaseRepo: Symbol.for('IBaseRepo'),

  //repositores
  IUserRepo: Symbol.for('IUserRepo'),
  IRolesRepo: Symbol.for('IRolesRepo'),

  //repositories use cases
  IUserRepoUseCase: Symbol.for('IUserRepoUseCase'),
  IRolesRepoUseCase: Symbol.for('IRolesRepoUseCase'),

  // repositories controllers
  IUserRepoController: Symbol.for('IUserRepoController'),
  IRolesRepoController: Symbol.for('IRolesRepoController'),

  //repo patths
  usersRepoPath: Symbol.for('usersRepoPath'),
  rolesRepoPath: Symbol.for('rolesRepoPath'), //
};

export interface DI_RETURN_TYPES {
  //services
  IAuthService: IAuthService;
  IPermissionService: IPermissionService;

  // use cases
  IAuthUseCase: IAuthUseCase;
  IPermissionUseCase: IPermissionUseCase;

  // controllers
  IAuthController: IAuthController;
  IPermissionController: IPermissionController;

  //REPOSITORIES
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  IBaseRepo: IBaseRepo<any, any, any>;

  //repositores
  IUserRepo: IUserRepository;
  IRolesRepo: IRolesRepo;

  //repositories use cases
  IUserRepoUseCase: IUsersRepoUseCase;
  IRolesRepoUseCase: IRolesRepoUseCase;

  // repositories controllers
  IUserRepoController: IUserRepoController;
  IRolesRepoController: IRolesRepoController;

  //repo patths
  usersRepoPath: string;
  rolesRepoPath: string;
}
