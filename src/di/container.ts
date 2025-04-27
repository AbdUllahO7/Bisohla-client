import { createContainer } from '@evyweb/ioctopus';

import { createAuthModule } from './modules/auth.module';
import { DI_RETURN_TYPES, DI_SYMBOLS } from './types';
import { createPermissionModule } from './modules/permission.module';
import { createUsersRepoModule } from './modules/repositories/users.repo.module';
import { createRepoModule } from './modules/repositories/repo.module';
import { createRolesRepoModule } from './modules/repositories/roles.repo.module';
import { createFileManagerModule } from './modules/file-manager.module';
import { createProductGroupsRepoModule } from './modules/repositories/products/product-groups.repo.module';
import { createCarRepoModule } from './modules/repositories/cars/car.module';
import { createVisitorsModule } from './modules/visitors/visitor.module';
import { createUsersModule } from './modules/users/users.module';
import { createNotificationsModule } from './modules/notifications.module';

const AppContainer = createContainer();

AppContainer.load(Symbol('AuthModule'), createAuthModule());
AppContainer.load(Symbol('PermissionModule'), createPermissionModule());
AppContainer.load(Symbol('FileManagerModule'), createFileManagerModule());

//repos
AppContainer.load(Symbol('RepoModule'), createRepoModule());

AppContainer.load(Symbol('UsersRepoModule'), createUsersRepoModule());

AppContainer.load(Symbol('RolesRepoModule'), createRolesRepoModule());

AppContainer.load(Symbol('CarsRepoModule'), createCarRepoModule());

AppContainer.load(Symbol('VisitorsModule'), createVisitorsModule());

AppContainer.load(Symbol('UsersModule'), createUsersModule());

AppContainer.load(Symbol('NotificationModule'), createNotificationsModule());

AppContainer.load(
  Symbol('ProductGroupsRepoModule'),
  createProductGroupsRepoModule(),
);

export function getInjection<K extends keyof typeof DI_SYMBOLS>(
  symbol: K,
): DI_RETURN_TYPES[K] {
  return AppContainer.get(DI_SYMBOLS[symbol]);
}
