import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';
import { CarUserService } from '@/core/infrastructure/services/users/car.user.service';
import { CarUserUseCase } from '@/core/application/use-cases/users/cars/car.user.use-case';
import { CarUserController } from '@/core/infrastructure-adapters/controllers/users/car.user.controller';

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

  return UsersModule;
};
