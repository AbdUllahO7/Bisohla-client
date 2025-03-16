import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';

// import { BaseRepo } from '@/core/infrastructure/repositories/base.repo';
import { RolesRepo } from '@/core/infrastructure/repositories/roles.repo';
import { RolesRepoUseCase } from '@/core/application/use-cases/repositories/roles/roles.repo.use-case';
import { RolesRepoController } from '@/core/infrastructure-adapters/controllers/repositores/roles.repo.controller';

export function createRolesRepoModule(): Module {
  const rolesRepoModule = createModule();

  //path
  rolesRepoModule.bind(DI_SYMBOLS.rolesRepoPath).toValue('roles-repo');

  //repo
  rolesRepoModule
    .bind(DI_SYMBOLS.IRolesRepo)
    .toClass(RolesRepo, [DI_SYMBOLS.rolesRepoPath]);

  //use case
  rolesRepoModule
    .bind(DI_SYMBOLS.IRolesRepoUseCase)
    .toClass(RolesRepoUseCase, [DI_SYMBOLS.IRolesRepo]);

  //conbtroller
  rolesRepoModule
    .bind(DI_SYMBOLS.IRolesRepoController)
    .toClass(RolesRepoController, [DI_SYMBOLS.IRolesRepoUseCase]);

  return rolesRepoModule;
}
