import {
  BodyType,
  DamageType,
  DamageZone,
  FeatureCategory,
  FuelType,
  ListingType,
  RentType,
  SaveStatus,
  Transmission,
} from '../../enums/cars.enums';
import { Currency } from '../../enums/currency.enum';
import { SyriaCity, SyriaGovernorate } from '../../enums/syria.enums';
import { SelectUserDto } from '../users/users.dto';

// Define the select type interfaces that represent what's returned from the database
export interface SelectCarMakeDto {
  id: number;
  name: string;
  logoUrl: string | null;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface SelectCarModelDto {
  id: number;
  makeId: number;
  make?: SelectCarMakeDto;
  name: string;
  yearStart: number | null;
  yearEnd: number | null;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface SelectCarTrimDto {
  id: number;
  modelId: number;
  model?: SelectCarModelDto;
  name: string;
  description: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface SelectFeatureDto {
  id: number;
  name: string;
  category: FeatureCategory;
  icon: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface CarListingFeature {
  id: number;
  carListingId: number;
  featureId: string;
  feature?: SelectFeatureDto;
}

export interface CarImage {
  id: number;
  carListingId: number;
  url: string;
  isPrimary: boolean;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

export interface SelectCarDamageDto {
  damageZone: DamageZone;
  damageType: DamageType;
  description: string;
  id: number;
  createdAt: string | Date;
  updatedAt: string | Date;
  carListingId: number;
}

export interface CarDetails {
  id: number;
  carListingId: number;
  year: number;
  mileage: number | null;
  fuelType?: FuelType | null;
  transmission?: Transmission | null;
  engineSize: number | null;
  enginePower: number | null;
  bodyType?: BodyType | null;
  doors: number | null;
  colorExterior: string | null;
  colorInterior: string | null;
  vin: string | null;
  plateNumber: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt: string | Date | null;
}

// Create DTO for CarDetails
export interface CreateCarDetailsDto {
  year: number;
  mileage?: number | null;
  fuelType?: string | null;
  transmission?: string | null;
  engineSize?: number | null;
  enginePower?: number | null;
  bodyType?: string | null;
  doors?: number | null;
  colorExterior?: string | null;
  colorInterior?: string | null;
  vin?: string | null;
  plateNumber?: string | null;
}

// Update DTO for CarDetails
export type UpdateCarDetailsDto = Partial<CreateCarDetailsDto>;

export interface SelectCarListingDto {
  id: number;
  title: string;
  description: string;
  story?: string | null;
  price: number | null;
  currency: Currency;
  userId: number;
  user?: SelectUserDto; 
  makeId: number;
  modelId: number;
  trimId: number | null;
  status: string;
  isFeatured: boolean;
  isTrend: boolean; // Added instead of isSold

  // Save status and listing type
  saveStatus: SaveStatus;
  listingType: ListingType;
  rentType?: RentType | null;
  contactNumber?: string | null;

  // location
  governorate: SyriaGovernorate;
  city: SyriaCity;
  address: string;

  // Timestamps
  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;
  publishedAt?: string | Date | null;

  // Related entities
  details: CarDetails;
  features: CarListingFeature[];
  images: CarImage[];
  make: SelectCarMakeDto;
  model: SelectCarModelDto;
  trim?: SelectCarTrimDto;

  // Added damage information
  damages?: SelectCarDamageDto[];
}

export interface FacetCount {
  field: string;
  value: string | number | boolean;
  count: number;
}
