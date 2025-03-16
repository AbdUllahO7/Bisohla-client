import {
  ICarFeatureRepo,
  ICarListingRepo,
  ICarMakeRepo,
  ICarModelRepo,
  ICarTrimRepo,
} from '@/core/application/repositories/cars/cars.repos.interface';

export type ICarMakeRepoController = ICarMakeRepo;
export type ICarModelRepoController = ICarModelRepo;
export type ICarTrimRepoController = ICarTrimRepo;
export type ICarListingRepoController = ICarListingRepo;
export type ICarFeatureRepoController = ICarFeatureRepo;
