import { createContainer } from '@evyweb/ioctopus';

import { createAuthModule } from './modules/auth.module';
import { DI_RETURN_TYPES, DI_SYMBOLS } from './types';
import { createPermissionModule } from './modules/permission.module';
import { createUsersRepoModule } from './modules/repositories/users.repo.module';
import { createRepoModule } from './modules/repositories/repo.module';
import { createRolesRepoModule } from './modules/repositories/roles.repo.module';

const AppContainer = createContainer();

AppContainer.load(Symbol('AuthModule'), createAuthModule());
AppContainer.load(Symbol('PermissionModule'), createPermissionModule());

//repos
AppContainer.load(Symbol('RepoModule'), createRepoModule());

AppContainer.load(Symbol('UsersRepoModule'), createUsersRepoModule());

AppContainer.load(Symbol('RolesRepoModule'), createRolesRepoModule());

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return AppContainer.get(DI_SYMBOLS[symbol]);
}
