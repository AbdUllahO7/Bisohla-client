import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';
import { CarVisitorService } from '@/core/infrastructure/services/visitors/car.visitor.service';
import { CarVisitorUseCase } from '@/core/application/use-cases/visitors/cars/car.visitor.use-case';
import { CarVisitorController } from '@/core/infrastructure-adapters/controllers/visitors/car.visitor.controller';

export const createVisitorsModule = (): Module => {
  const visitorsModule = createModule();

  // cars
  visitorsModule.bind(DI_SYMBOLS.ICarVisitorService).toClass(CarVisitorService);

  visitorsModule
    .bind(DI_SYMBOLS.ICarVisitorUseCase)
    .toClass(CarVisitorUseCase, [DI_SYMBOLS.ICarVisitorService]);

  visitorsModule
    .bind(DI_SYMBOLS.ICarVisitorController)
    .toClass(CarVisitorController, [DI_SYMBOLS.ICarVisitorUseCase]);

  return visitorsModule;
};
