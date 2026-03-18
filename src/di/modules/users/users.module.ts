import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';
import { CarUserService } from '@/core/infrastructure/services/users/car.user.service';
import { CarUserUseCase } from '@/core/application/use-cases/users/cars/car.user.use-case';
import { CarUserController } from '@/core/infrastructure-adapters/controllers/users/car.user.controller';
import { NotificationUserService } from '@/core/infrastructure/services/users/notification.user.service';
import { NotificationUserUseCase } from '@/core/application/use-cases/users/notifications/notification.user.use-case';
import { UserProfileService } from '@/core/infrastructure/services/users/user-profile.service';
import { UserProfileUseCase } from '@/core/application/use-cases/users/user-profile/user-profile.use-case';
import { NotificationUserController } from '@/core/infrastructure-adapters/controllers/users/notification.user.controller';
import { UserProfileController } from '@/core/infrastructure-adapters/controllers/users/user-profile.controller';
import { CarAlertUserService } from '@/core/infrastructure/services/users/car-alert.user.service';
import { CarAlertUserUseCase } from '@/core/application/use-cases/users/car-alerts/car-alert.user.use-case';
import { CarAlertUserController } from '@/core/infrastructure-adapters/controllers/users/car-alert.user.controller';

export const createUsersModule = (): Module => {
  const UsersModule = createModule();

  // cars
  UsersModule.bind(DI_SYMBOLS.ICarUserService).toClass(CarUserService);

  UsersModule.bind(DI_SYMBOLS.ICarUserUseCase).toClass(CarUserUseCase, [
    DI_SYMBOLS.ICarUserService,
  ]);

  UsersModule.bind(DI_SYMBOLS.ICarUserController).toClass(CarUserController, [
    DI_SYMBOLS.ICarUserUseCase,
  ]);

  // car alerts
  UsersModule.bind(DI_SYMBOLS.ICarAlertUserService).toClass(CarAlertUserService);

  UsersModule.bind(DI_SYMBOLS.ICarAlertUserUseCase).toClass(CarAlertUserUseCase, [
    DI_SYMBOLS.ICarAlertUserService,
  ]);

  UsersModule.bind(DI_SYMBOLS.ICarAlertUserController).toClass(
    CarAlertUserController,
    [DI_SYMBOLS.ICarAlertUserUseCase],
  );

  // notifications
  UsersModule.bind(DI_SYMBOLS.INotificationUserService).toClass(
    NotificationUserService,
  );
  UsersModule.bind(DI_SYMBOLS.INotificationUserUseCase).toClass(
    NotificationUserUseCase,
    [DI_SYMBOLS.INotificationUserService],
  );
  UsersModule.bind(DI_SYMBOLS.INotificationUserController).toClass(
    NotificationUserController,
    [DI_SYMBOLS.INotificationUserUseCase],
  );

  // user profile
  UsersModule.bind(DI_SYMBOLS.IUserProfileService).toClass(UserProfileService);
  UsersModule.bind(DI_SYMBOLS.IUserProfileUseCase).toClass(UserProfileUseCase, [
    DI_SYMBOLS.IUserProfileService,
  ]);
  UsersModule.bind(DI_SYMBOLS.IUserProfileController).toClass(
    UserProfileController,
    [DI_SYMBOLS.IUserProfileUseCase],
  );

  return UsersModule;
};
