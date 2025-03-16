import { createModule, Module } from '@evyweb/ioctopus';
import { DI_SYMBOLS } from '../../../types';

import { CarMakeRepo } from '@/core/infrastructure/repositories/cars/car-make.repo';
import { CarModelRepo } from '@/core/infrastructure/repositories/cars/car-model.repo';
import { CarTrimRepo } from '@/core/infrastructure/repositories/cars/car-trim.repo';
import { CarFeatureRepo } from '@/core/infrastructure/repositories/cars/car-feature.repo';
import { CarListingRepo } from '@/core/infrastructure/repositories/cars/car-listing.repo';
import { CarMakeRepoUseCase } from '@/core/application/use-cases/repositories/cars/car-make.repo.use-case';
import { CarModelRepoUseCase } from '@/core/application/use-cases/repositories/cars/car-model.repo.use-case';
import { CarTrimRepoUseCase } from '@/core/application/use-cases/repositories/cars/car-trim.repo.use-case';
import { CarFeatureRepoUseCase } from '@/core/application/use-cases/repositories/cars/car-feature.repo.use-case';
import { CarListingRepoUseCase } from '@/core/application/use-cases/repositories/cars/car-listing.repo.use-case';
import { CarMakeRepoController } from '@/core/infrastructure-adapters/controllers/repositores/cars/car-make.repo.controller';
import { CarModelRepoController } from '@/core/infrastructure-adapters/controllers/repositores/cars/car-model.repo.controller';
import { CarTrimRepoController } from '@/core/infrastructure-adapters/controllers/repositores/cars/car-trim.repo.controller';
import { CarFeatureRepoController } from '@/core/infrastructure-adapters/controllers/repositores/cars/car-feature.repo.controller';
import { CarListingRepoController } from '@/core/infrastructure-adapters/controllers/repositores/cars/car-listing.repo.controller';

export function createCarRepoModule(): Module {
  const carsReposModule = createModule();

  //path
  carsReposModule.bind(DI_SYMBOLS.carMakeRepoPath).toValue('car-makes-repo');
  carsReposModule.bind(DI_SYMBOLS.carModelRepoPath).toValue('car-models-repo');
  carsReposModule.bind(DI_SYMBOLS.carTrimRepoPath).toValue('car-trims-repo');
  carsReposModule.bind(DI_SYMBOLS.carFeatureRepoPath).toValue('features-repo');
  carsReposModule
    .bind(DI_SYMBOLS.carListingRepoPath)
    .toValue('car-listings-repo');

  //repo
  carsReposModule
    .bind(DI_SYMBOLS.ICarMakeRepo)
    .toClass(CarMakeRepo, [DI_SYMBOLS.carMakeRepoPath]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarModelRepo)
    .toClass(CarModelRepo, [DI_SYMBOLS.carModelRepoPath]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarTrimRepo)
    .toClass(CarTrimRepo, [DI_SYMBOLS.carTrimRepoPath]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarFeatureRepo)
    .toClass(CarFeatureRepo, [DI_SYMBOLS.carFeatureRepoPath]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarListingRepo)
    .toClass(CarListingRepo, [DI_SYMBOLS.carListingRepoPath]);

  //use case
  carsReposModule
    .bind(DI_SYMBOLS.ICarMakeRepoUseCase)
    .toClass(CarMakeRepoUseCase, [DI_SYMBOLS.ICarMakeRepo]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarModelRepoUseCase)
    .toClass(CarModelRepoUseCase, [DI_SYMBOLS.ICarModelRepo]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarTrimRepoUseCase)
    .toClass(CarTrimRepoUseCase, [DI_SYMBOLS.ICarTrimRepo]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarFeatureRepoUseCase)
    .toClass(CarFeatureRepoUseCase, [DI_SYMBOLS.ICarFeatureRepo]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarListingRepoUseCase)
    .toClass(CarListingRepoUseCase, [DI_SYMBOLS.ICarListingRepo]);

  //conbtroller
  carsReposModule
    .bind(DI_SYMBOLS.ICarMakeRepoController)
    .toClass(CarMakeRepoController, [DI_SYMBOLS.ICarMakeRepoUseCase]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarModelRepoController)
    .toClass(CarModelRepoController, [DI_SYMBOLS.ICarModelRepoUseCase]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarTrimRepoController)
    .toClass(CarTrimRepoController, [DI_SYMBOLS.ICarTrimRepoUseCase]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarFeatureRepoController)
    .toClass(CarFeatureRepoController, [DI_SYMBOLS.ICarFeatureRepoUseCase]);
  carsReposModule
    .bind(DI_SYMBOLS.ICarListingRepoController)
    .toClass(CarListingRepoController, [DI_SYMBOLS.ICarListingRepoUseCase]);

  return carsReposModule;
}
