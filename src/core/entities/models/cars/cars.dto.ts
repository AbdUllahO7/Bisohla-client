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
  VehicleCondition,
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
  isCarTrimRequired: boolean;
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
  doors: string | null;
  colorExterior: string | null;
  vin: string | null;
  plateNumber: string | null;
  condition: VehicleCondition;
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
  doors?: string | null;
  colorExterior?: string | null;
  vin?: string | null;
  plateNumber?: string | null;
  condition?: string | null;
}

// Update DTO for CarDetails
export type UpdateCarDetailsDto = Partial<CreateCarDetailsDto>;

export interface SelectCarListingDto {
  id: number;
  slug: string;
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
  listingTypeId: number;
  status: string;
  isFeatured: boolean;
  isTrend: boolean; // Added instead of isSold
  isFavorite?: boolean | null;
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
  primaryImage?: string | null;

  // Related entities
  details: CarDetails;
  features: CarListingFeature[];
  images: CarImage[];
  make: SelectCarMakeDto;
  model: SelectCarModelDto;
  trim?: SelectCarTrimDto;

  // Added damage information
  damages?: SelectCarDamageDto[];


  statics: {
    id: number;
    carListingId: number;
    viewsCount: number | null;
    contactCount: number | null;
    favoritesCount: number | null;
    viewDuration: number | null;     // seconds
    sharesCount: number | null;
    detailsViewedCount: number | null;
    lastViewedAt: string | null;     // because { mode: "string" }
    createdAt: string;               // from timestamps(false)
    updatedAt: string;               // from timestamps(false)


  }

  // ===== CAR LISTING STATISTICS =====


  // Engagement Statistics
  totalContacts?: number;           // Number of contact/inquiry requests
  totalShares?: number;             // Number of times shared
  totalFavorites?: number;          // Number of users who favorited this car
  totalClicks?: number;             // Total clicks on "View Details"

  // Performance Metrics
  contactRate?: number;             // Percentage of views that resulted in contact
  favoriteRate?: number;            // Percentage of views that resulted in favorite
  engagementScore?: number;         // Overall engagement score (0-100)

  // Recent Activity (Last 7/30 days)
  recentViews?: {
    today?: number;
    yesterday?: number;
    last7Days?: number;
    last30Days?: number;
  };

  recentContacts?: {
    today?: number;
    yesterday?: number;
    last7Days?: number;
    last30Days?: number;
  };

  // Trend Data
  viewTrend?: 'increasing' | 'decreasing' | 'stable';
  contactTrend?: 'increasing' | 'decreasing' | 'stable';

  // Ranking/Comparison
  viewRank?: number;                // Rank compared to other listings
  priceCompetitiveness?: number;    // How competitive is the price (0-100)

  // Time on Market
  daysOnMarket?: number;            // Days since published
  lastViewedAt?: string | Date;    // Last time someone viewed this car
  lastContactedAt?: string | Date; // Last time someone contacted about this car

}

export interface FacetCount {
  field: string;
  value: string | number | boolean;
  count: number;
}

export interface BodyTypeCategoryCount {
  bodyType: string;
  count: number;
}

export interface GovernorateCategoryCount {
  governorate: string;
  count: number;
}
