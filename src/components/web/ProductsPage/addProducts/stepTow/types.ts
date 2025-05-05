// types.ts
import { CarListingFeature } from "@/core/entities/models/cars/cars.dto";

// Component props type
export interface AddProductStepTwoProps {
  onValidationChange: (isValid: boolean) => void;
}

// Define Feature type for UI components
export interface Feature {
  id: string;
  label: string;
}

// Define form field props
export interface FormFieldProps {
  label: string;
  field: string;
  children: React.ReactNode;
  required?: boolean;
  error?: string;
}

// Define select field props
export interface SelectFieldProps {
  label: string;
  field: string;
  options: any[];
  placeholder: string;
  optionsLabel: string;
  required?: boolean;
}

// Define CarInfoState interface for form data
export interface CarInfoState {
  currency: string;
  colorExterior: string;
  colorInterior: string;
  fuelType: string;
  bodyType: string;
  transmission: string;
  mileage: string;
  enginePower: string;
  engineSize: string;
  doors: string;
  plateNumber: string;
  vin: string;
  
  selectedFeatures: CarListingFeature[]; // Array of selected features
  [key: string]: any;
}

// Define validation errors interface
export interface ValidationErrors {
  doors: string;
  engineSize: string;
  bodyType : string
}

// Define category data structure
export interface CategoryData {
  label: string;
  features: Feature[];
}

// Define grouped features by category
export interface GroupedFeatures {
  [category: string]: CategoryData;
}

// Storage key for localStorage
export const STORAGE_KEY = "addProduct_stepTwo_data";

// Default state with empty array for selectedFeatures
export const defaultState: CarInfoState = {
  currency: "",
  colorExterior: "",
  colorInterior: "",
  fuelType: "",
  bodyType: "",
  transmission: "",
  mileage: "",
  enginePower: "",
  engineSize: "",
  doors: "",
  plateNumber: "",
  vin: "",
  selectedFeatures: [], // Empty array
};