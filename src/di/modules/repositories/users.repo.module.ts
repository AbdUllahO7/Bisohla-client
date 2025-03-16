import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';

// import { BaseRepo } from '@/core/infrastructure/repositories/base.repo';
import { UsersRepo } from '@/core/infrastructure/repositories/users.repo';
import { UserRepoUseCase } from '@/core/application/use-cases/repositories/users/users.repo.use-case';
import { UsersRepoController } from '@/core/infrastructure-adapters/controllers/repositores/users.repo.controller';

export function createUsersRepoModule(): Module {
  const usersRepoModule = createModule();

  //path
  usersRepoModule.bind(DI_SYMBOLS.usersRepoPath).toValue('users-repo');

  //repo
  usersRepoModule
    .bind(DI_SYMBOLS.IUserRepo)
    .toClass(UsersRepo, [DI_SYMBOLS.usersRepoPath]);

  //use case
  usersRepoModule
    .bind(DI_SYMBOLS.IUserRepoUseCase)
    .toClass(UserRepoUseCase, [DI_SYMBOLS.IUserRepo]);

  //conbtroller
  usersRepoModule
    .bind(DI_SYMBOLS.IUserRepoController)
    .toClass(UsersRepoController, [DI_SYMBOLS.IUserRepoUseCase]);

  return usersRepoModule;
}
