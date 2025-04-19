// src/components/product/types/step-types.ts
import { Currency } from '@/core/entities/enums/currency.enum'
import { SyriaCity, SyriaGovernorate } from '@/core/entities/enums/syria.enums'
import { BodyType, FuelType, Transmission } from '@/core/entities/enums/cars.enums'
import { CarImage, CarListingFeature, SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto'
import { SelectUserDto } from '@/core/entities/models/users/users.dto'

// Basic shared types
export interface SectionStatus {
  [key: string]: boolean
}

// Step-specific data types
export interface StepOneData {
  marka: string
  model: string
  year: string
  trim: string
  governorate: string
  city: string
  address: string
}

export interface StepTwoData {
  currency: string
  price: string | number
  colorExterior: string
  colorInterior: string
  fuelType: string
  bodyType: string
  transmission: string
  doors: string | number
  plateNumber: string | number
  mileage: string | number
  enginePower: string | number
  engineSize: string | number
  vin: string | number
  selectedFeatures: Array<{
    id: number
    carListingId: number
    featureId: string
    feature?: {
      id: number
      name: string
      category: string
      icon: string | null
      createdAt: Date | string
      updatedAt: Date | string
      deletedAt: Date | string | null
    }
  }>
}

export interface StepThreeData {
  coverImage: string[]
  carImages: CarImage | string[]
  additionalImages: string[]
  documents: string[]
  governorate: SyriaGovernorate
  city: SyriaCity
  address: string
  sectionStatus?: SectionStatus
}

export interface StepFourData {
  adTitle: string
  adDescription: string
}

// Component props types
export interface StepContentProps {
  children: React.ReactNode
  handleBack: () => void
  handleNext: () => void
  direction: string
  step: string
  isNextDisabled: boolean
  requiredFieldsMessage: string
}

export interface StepTriggerProps {
  totalSteps: number
  step: string
  index: number
}

export interface StepComponentProps {
  onValidationChange: (isValid: boolean) => void
}

export interface SuccessDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  homeButtonText: string
  profileButtonText: string
}

export interface ErrorDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  description: string
  errorMessage: string
  tryAgainText: string
  onTryAgain: () => void
}

// Form submission type
export interface CarListingSubmission {
  makeId: number
  modelId: number
  trimId: number | null
  year: number
  address: string
  city: string
  governorate: string
  currency: Currency
  price: number
  status: string
  isFeatured: boolean
  isSold: boolean
  title: string
  description: string
  featureIds: number[]
  images: string[]
  primaryImageIndex?: number
  mileage: number
  fuelType: FuelType | null
  transmission: Transmission | null
  engineSize: number
  enginePower: number
  bodyType: BodyType | null
  doors: number
  colorExterior: string | null
  colorInterior: string | null
  vin: string | null
  plateNumber: string | null
}