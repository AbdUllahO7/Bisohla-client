import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../types';
import { CarVisitorService } from '@/core/infrastructure/services/visitors/car.visitor.service';
import { CarVisitorUseCase } from '@/core/application/use-cases/visitors/cars/car.visitor.use-case';
import { CarVisitorController } from '@/core/infrastructure-adapters/controllers/visitors/car.visitor.controller';
import { NewsVisitorService } from '@/core/infrastructure/services/visitors/news.visitor.service';
import { NewsVisitorUseCase } from '@/core/application/use-cases/visitors/news/news.visitor.use-case';
import { NewsVisitorController } from '@/core/infrastructure-adapters/controllers/visitors/news.controller';

// --- FIX: Corrected the import path here ---

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

    // news
  // Note: Binding INewsVisitorStrategy to NewsVisitorService
  visitorsModule
    .bind(DI_SYMBOLS.INewsVisitorStrategy)
    .toClass(NewsVisitorService);

  visitorsModule
    .bind(DI_SYMBOLS.INewsVisitorUseCase)
    .toClass(NewsVisitorUseCase, [DI_SYMBOLS.INewsVisitorStrategy]);

  visitorsModule
    .bind(DI_SYMBOLS.INewsVisitorController)
    .toClass(NewsVisitorController, [DI_SYMBOLS.INewsVisitorUseCase]);

  return visitorsModule;
};