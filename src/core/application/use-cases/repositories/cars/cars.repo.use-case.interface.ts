import {
  ICarFeatureRepo,
  ICarListingRepo,
  ICarMakeRepo,
  ICarModelRepo,
  ICarTrimRepo,
} from '@/core/application/repositories/cars/cars.repos.interface';

export type ICarMakeRepoUseCase = ICarMakeRepo;
export type ICarModelRepoUseCase = ICarModelRepo;
export type ICarTrimRepoUseCase = ICarTrimRepo;
export type ICarListingRepoUseCase = ICarListingRepo;
// export type ICarDetailsRepoUseCase = ICarDetailsRepo;
export type ICarFeatureRepoUseCase = ICarFeatureRepo;
