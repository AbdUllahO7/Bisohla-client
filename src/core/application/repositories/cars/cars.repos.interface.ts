import {
  SelectCarListingDto,
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
  SelectFeatureDto,
} from '@/core/entities/models/cars/cars.dto';
import { IBaseRepo } from '../../strategies/repo.strategy';
import {
  CreateCarListingDto,
  CreateCarMakeDto,
  CreateCarModelDto,
  CreateCarTrimDto,
  CreateFeatureDto,
  UpdateCarListingDto,
  UpdateCarMakeDto,
  UpdateCarModelDto,
  UpdateCarTrimDto,
  UpdateFeatureDto,
} from '@/core/entities/models/cars/cars.zod.dto';

/**
 * Interface for the car make repository
 */
export type ICarMakeRepo = IBaseRepo<
  SelectCarMakeDto,
  CreateCarMakeDto,
  UpdateCarMakeDto
>;

/**
 * Interface for the car model repository
 */
export type ICarModelRepo = IBaseRepo<
  SelectCarModelDto,
  CreateCarModelDto,
  UpdateCarModelDto
>;

/**
 * Interface for the car trim repository
 */
export type ICarTrimRepo = IBaseRepo<
  SelectCarTrimDto,
  CreateCarTrimDto,
  UpdateCarTrimDto
>;

/**
 * Interface for the car listing repository
 */
export type ICarListingRepo = IBaseRepo<
  SelectCarListingDto,
  CreateCarListingDto,
  UpdateCarListingDto
>;

/**
 * Interface for the car details repository
 */
// export type ICarDetailsRepo = IBaseRepo<
//   CarDetails,
//   CreateCarDetailsDto,
//   UpdateCarDetailsDto
// >;

/**
 * Interface for the car feature repository
 */
export type ICarFeatureRepo = IBaseRepo<
  SelectFeatureDto,
  CreateFeatureDto,
  UpdateFeatureDto
>;
