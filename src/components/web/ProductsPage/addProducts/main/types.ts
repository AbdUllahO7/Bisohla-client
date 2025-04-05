// types/index.ts
import { Currency } from '@/core/entities/enums/currency.enum';
import { BodyType, FuelType, Transmission } from '@/core/entities/enums/cars.enums';
import { SyriaCity, SyriaGovernorate } from '@/core/entities/enums/syria.enums';
import { CarDetails, CarImage, CarListingFeature, SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';

// Type definitions
export interface SectionStatus {
  [key: string]: boolean;
}

export interface StepOneData {
  marka: string;
  model: string;
  year: string;
  trim: string;
  governorate: string;
  city: string;
  address: string;
}

export interface StepTwoData {
  currency: string;
  price: string | number;
  colorExterior: string;  
  colorInterior: string;  
  fuelType: string;
  bodyType: string;
  transmission: string;
  doors: string | number;
  plateNumber: string | number;
  mileage: string | number;
  enginePower: string | number; 
  engineSize: string | number;
  vin: string | number;
  selectedFeatures: Array<{
    id: number;
    carListingId: number;
    featureId: string;
    feature?: {
      id: number;
      name: string;
      category: string;
      icon: string | null;
      createdAt: Date | string;
      updatedAt: Date | string;
      deletedAt: Date | string | null;
    }
  }>;
}

export interface StepThreeData {
  coverImage: string[];
  carImages: CarImage;
  additionalImages: string[];
  documents: string[];
  governorate: SyriaGovernorate;
  city: SyriaCity;
  address: string;
  sectionStatus: SectionStatus;
}

export interface StepFourData {
  adTitle: string;
  adDescription: string;
}

// Update CarListingDTO to use Currency enum type
export interface CarListingDTO {
  id: number;
  title: string;
  description: string;
  price: number | null;
  currency: Currency;
  userId: number;
  user?: SelectUserDto;
  makeId: number;
  modelId: number;
  trimId: number | null;
  status: string;
  isFeatured: boolean;
  isSold: boolean;

  // location
  governorate: SyriaGovernorate;
  city: SyriaCity;
  address: string;

  createdAt: string | Date;
  updatedAt: string | Date;
  deletedAt?: string | Date | null;

  // Related entities
  details: CarDetails;
  features: CarListingFeature[];
  images: CarImage[];
  make: SelectCarMakeDto;
  model: SelectCarModelDto;
  trim?: SelectCarTrimDto;
}

export interface CreateCarListingDto {
  // Basic vehicle details
  makeId: number;
  modelId: number;
  trimId: number | null;
  year: number;
  
  // Location details
  address: string;
  city: string;
  governorate: string;
  
  // Pricing
  currency: Currency;
  price: number;
  
  // Listing metadata
  status: string;
  isFeatured: boolean;
  isSold: boolean;
  
  // Listing content
  title: string;
  description: string;
  
  // Features and images
  featureIds: number[];
  images: string[];
  primaryImageIndex?: number;
  
  // Car details
  mileage: number;
  fuelType: FuelType | null;
  transmission: Transmission | null;
  engineSize: number;
  enginePower: number;
  bodyType: BodyType | null;
  doors: number;
  colorExterior: string | null;
  colorInterior: string | null;
  vin: string | null;
  plateNumber: string | null;
}

export interface StepProps {
  onValidationChange: (isValid: boolean) => void;
}

export interface StepValidation {
  productType: boolean;
  location: boolean;
  productInfo: boolean;
  adsInfo: boolean;
}

export interface ValidationAttempted {
  productType: boolean;
  location: boolean;
  productInfo: boolean;
  adsInfo: boolean;
}

export interface FormData {
  productType: any;
  location: any;
  productInfo: any;
  adsInfo: any;
}

export interface DialogTexts {
  title: string;
  description: string;
  tryAgainText?: string;
  homeButtonText?: string;
  profileButtonText?: string;
}

export interface StepContentProps {
  handleBack: () => void;
  handleNext: () => void;
  direction: string;
  step: string;
  isNextDisabled: boolean;
  requiredFieldsMessage: string;
  children: React.ReactNode;
}

export interface StepTriggerProps {
  totalSteps: number;
  step: string;
  index: number;
}