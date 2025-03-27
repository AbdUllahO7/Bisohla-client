// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";
import { 
  CarConditionType, 
  CarSection,
  getCarSectionOptions,
  getCarConditionOptions
} from "@/core/entities/enums/car-condition.enum";
import { CarConditionState, defaultState } from "./types";
import { loadFromStorage, saveToStorage, validateForm } from "./utils";

/**
 * Custom hook for the AddProductStepThree component
 */
export const useAddProductStepThree = (onValidationChange: (isValid: boolean) => void) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const direction = isRTL ? "rtl" : "ltr";
  const t = useTranslations("addProduct.enteredData.stepThree");
  
  // State
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [carCondition, setCarCondition] = useState<CarConditionState>(defaultState);
  
  // Refs
  const coverImageRef = useRef<ImageUploaderRef>(null);
  const carImagesRef = useRef<ImageUploaderRef>(null);
  const documentsRef = useRef<ImageUploaderRef>(null);
  const additionalImagesRef = useRef<ImageUploaderRef>(null);
  const prevValidState = useRef<boolean | null>(null);
  
  // Text labels
  const labels = useMemo(
    () => ({
      carInfo: isRTL ? "معلومات حالة السيارة" : "Car Condition Information",
      carPhotos: isRTL ? "صور السيارة" : "Car Photos",
      carSectionName: isRTL ? "أقسام السيارة" : "Car Section Name",
      coverImage: isRTL ? "صورة الغلاف" : "Cover Image",
      carImages: isRTL ? "صور السيارة" : "Car Images",
      documents: isRTL ? "المستندات" : "Documents",
      additionalImages: isRTL ? "صور إضافية" : "Additional Images",
      oneImage: isRTL ? "صورة واحدة" : "One image",
      tenImages: isRTL ? "10 صور كحد أقصى" : "Maximum 10 images",
      tenFiles: isRTL ? "10 ملفات كحد أقصى" : "Maximum 10 files",
      required: isRTL ? "مطلوب" : "Required",
    }),
    [isRTL],
  );

  // Memoized options
  const options = useMemo(() => ({
    carSections: getCarSectionOptions(t),
    conditionTypes: getCarConditionOptions(t)
  }), [t]);

  // Initialize client-side
  useEffect(() => {
    setIsClient(true);
    
    // Only run client-side code after hydration
    if (typeof window !== 'undefined') {
      window.scrollTo(0, 0);
      
      // Safe localStorage operations
      try {
        const savedData = loadFromStorage();
        if (savedData) {
          setCarCondition(savedData);
        }
      } catch (e) {
        console.error("Failed to load data:", e);
      }
    }
  }, []);

  // Save to localStorage
  useEffect(() => {
    if (isClient && typeof window !== 'undefined') {
      saveToStorage(carCondition);
    }
  }, [carCondition, isClient]);

  // Handle section status change
  const handleSectionStatusChange = useCallback((sectionId: CarSection, status: CarConditionType) => {
    setCarCondition(prev => {
      const newSectionStatus = { ...prev.sectionStatus };
      
      // If clicking the same status again, remove it
      if (newSectionStatus[sectionId] === status) {
        delete newSectionStatus[sectionId];
      } else {
        // Otherwise set to the new status
        newSectionStatus[sectionId] = status;
      }
      
      return {
        ...prev,
        sectionStatus: newSectionStatus
      };
    });
  }, []);

  // Check if a status is selected
  const isStatusSelected = useCallback((sectionId: CarSection, status: CarConditionType) => {
    return carCondition.sectionStatus[sectionId] === status;
  }, [carCondition.sectionStatus]);

  // Image handlers
  const handleCoverImageChange = useCallback((urls: string[]) => {
    setCarCondition(prev => ({
      ...prev,
      coverImage: urls
    }));
  }, []);

  const handleCarImagesChange = useCallback((urls: string[]) => {
    setCarCondition(prev => ({
      ...prev,
      carImages: urls
    }));
  }, []);

  const handleDocumentsChange = useCallback((urls: string[]) => {
    setCarCondition(prev => ({
      ...prev,
      documents: urls
    }));
  }, []);

  const handleAdditionalImagesChange = useCallback((urls: string[]) => {
    setCarCondition(prev => ({
      ...prev,
      additionalImages: urls
    }));
  }, []);

  // Validation effect
  useEffect(() => {
    if (isClient) {
      const isValid = validateForm(carCondition, options.carSections);
      
      if (isValid !== prevValidState.current) {
        prevValidState.current = isValid;
        onValidationChange(isValid);
      }
    }
  }, [carCondition, options.carSections, onValidationChange, isClient]);
  
  return {
    isClient,
    direction,
    labels,
    options,
    carCondition,
    isFormDisabled,
    setIsFormDisabled,
    coverImageRef,
    carImagesRef,
    documentsRef,
    additionalImagesRef,
    handleSectionStatusChange,
    isStatusSelected,
    handleCoverImageChange,
    handleCarImagesChange,
    handleDocumentsChange,
    handleAdditionalImagesChange
  };
};