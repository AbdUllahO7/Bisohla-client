// types.ts
import { 
    CarConditionType, 
    CarSection
  } from "@/core/entities/enums/car-condition.enum";
  import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";
  
  // Component props
  export interface AddProductStepThreeProps {
    onValidationChange: (isValid: boolean) => void;
  }
  
  // Car condition table props
  export interface CarConditionTableProps {
    carSections: any[];
    conditionTypes: any[];
    sectionStatus: Record<number, CarConditionType>;
    isStatusSelected: (sectionId: CarSection, status: CarConditionType) => boolean;
    onSectionStatusChange: (sectionId: CarSection, status: CarConditionType) => void;
    labels: {
      carSectionName: string;
    };
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
    // Fixed: Changed RefObject<ImageUploaderRef> to React.RefObject<ImageUploaderRef | null>
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
    sectionStatus: {
      [sectionId: number]: CarConditionType;
    };
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