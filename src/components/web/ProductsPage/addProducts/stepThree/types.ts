// types.ts
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";

// Component props
export interface AddProductStepThreeProps {
  onValidationChange: (isValid: boolean) => void;
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
    carImages: string;
    oneImage: string;
    tenImages: string;
    tenFiles: string;
  };
  coverImageRef: React.RefObject<ImageUploaderRef | null>;
  carImagesRef: React.RefObject<ImageUploaderRef | null>;
  coverImage: string[];
  carImages: string[];
  onCoverImageChange: (urls: string[]) => void;
  onCarImagesChange: (urls: string[]) => void;
  setIsFormDisabled: (disabled: boolean) => void;
}

// Main state type
export interface CarConditionState {
  // Change to use string keys instead of number keys
  sectionStatus?: Record<string, string>;
  coverImage: string[];
  carImages: string[];

}

// Storage key for localStorage
export const STORAGE_KEY = "addProduct_stepThree_data";

// Default state
export const defaultState: CarConditionState = {
  sectionStatus: {},
  coverImage: [],
  carImages: [],

};