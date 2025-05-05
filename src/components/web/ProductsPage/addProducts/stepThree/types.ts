// types.ts
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";

// Component props
export interface AddProductStepThreeProps {
  onValidationChange: (isValid: boolean) => void;
  isEditMode?: boolean;
  initialData?: any;
}

// Car condition table props
export interface CarConditionTableProps {
  carSections?: Array<{ id: string; name: string }>;
  conditionTypes?: Array<{ value: string; label: string; colorClass: string }>;
  damages?: Record<string, string>;
  isStatusSelected?: (sectionId: string, conditionTypeValue: string) => boolean;
  onSectionStatusChange?: (sectionId: string, conditionTypeValue: string) => void;
  labels?: {
    carSectionName?: string;
  };
  groupedSections?: Array<{ label: string; options: Array<{ value: string; label: string }> }>;
}

// Car photos section props
export interface CarPhotosSectionProps {
  labels: {
    coverImage: string;
    oneImage: string;
    tenImages: string;
    tenFiles: string;
  };
  coverImageRef: React.RefObject<ImageUploaderRef | null>;
  coverImage: string[];
  onCoverImageChange: (urls: string[]) => void;
  setIsFormDisabled: (disabled: boolean) => void;
}

// Main state type
export interface CarConditionState {
  // For component use: simplified sectionStatus as Record<string, string>
  sectionStatus: Record<string, string>;
  coverImage: string[];
  // Allow other fields to be present
  [key: string]: any;
}

// Type for damages used in API and EditProductPage
export interface Damage {
  damageZone: string;
  damageType: string;
  description?: string | null;
}

// IMPORTANT: Using direct string literals for storage keys
export const STORAGE_KEY = "addProduct_stepThree_data";
export const EDIT_STORAGE_KEY = "addProduct_stepThree_data_edit";
export const EDIT_MODE_FLAG = "edit_car_listing_id";

// Default state
export const defaultState: CarConditionState = {
  sectionStatus: {},
  coverImage: [],
  
};