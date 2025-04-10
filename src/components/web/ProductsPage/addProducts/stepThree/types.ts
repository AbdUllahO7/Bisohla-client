// types.ts
import { 
  CarConditionType, 
  CarSection
} from "@/core/entities/enums/cars.damegs.enum"; // Update this import path
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";

// Component props
export interface AddProductStepThreeProps {
  onValidationChange: (isValid: boolean) => void;
}

// Car condition table props
export interface CarConditionTableProps {
  carSections: Array<{ id: string; name: string }>;
  conditionTypes: Array<{ value: string; label: string; colorClass: string }>;
  sectionStatus: Record<string, string>;
  isStatusSelected: (sectionId: string, status: string) => boolean;
  onSectionStatusChange: (sectionId: string, status: string) => void;
  labels: {
    carSectionName: string;
  };
  groupedSections?: Array<{
    label: string;
    options: Array<{ value: string; label: string }>;
  }>;
}

// Car photos section props
export interface CarPhotosSectionProps {
  labels: {
    coverImage: string;
    carImages: string;
    documents: string;
    additionalImages: string;
    oneImage: string;
    tenImages: string;
    tenFiles: string;
  };
  coverImageRef: React.RefObject<ImageUploaderRef | null>;
  carImagesRef: React.RefObject<ImageUploaderRef | null>;
  documentsRef: React.RefObject<ImageUploaderRef | null>;
  additionalImagesRef: React.RefObject<ImageUploaderRef | null>;
  coverImage: string[];
  carImages: string[];
  documents: string[];
  additionalImages: string[];
  onCoverImageChange: (urls: string[]) => void;
  onCarImagesChange: (urls: string[]) => void;
  onDocumentsChange: (urls: string[]) => void;
  onAdditionalImagesChange: (urls: string[]) => void;
  isFormDisabled: boolean;
  setIsFormDisabled: (disabled: boolean) => void;
}

// Main state type
export interface CarConditionState {
  // Change to use string keys instead of number keys
  sectionStatus: Record<string, string>;
  coverImage: string[];
  carImages: string[];
  documents: string[];
  additionalImages: string[];
}

// Storage key for localStorage
export const STORAGE_KEY = "addProduct_stepThree_data";

// Default state
export const defaultState: CarConditionState = {
  sectionStatus: {},
  coverImage: [],
  carImages: [],
  documents: [],
  additionalImages: []
};