// hooks.ts
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";
import { 
  CarConditionType, 
  getCarSectionOptions,
  getCarConditionOptions,
  getGroupedCarSectionOptions
} from "@/core/entities/enums/cars.damegs.enum"; // Updated import path
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
      carInfo: t('carInfo'),
      carPhotos: t('carPhotos'),
      carSectionName: t('carSectionName'),
      coverImage: t('images.coverImage'),
      carImages: t('images.carImages'),
      oneImage: t('images.oneImage'),
      tenImages: t('images.tenImages'),
      tenFiles: t('images.tenFiles'),
      required: "Required", // Add this to translation file if needed
    }),
    [t],
  );

  // Generate condition types with color classes for the table
  const getConditionTypesWithColors = useCallback(() => {
    const conditionOptions = getCarConditionOptions(t);
    
    // Define color classes for each condition type
    const colorClasses: Record<string, string> = {
      [CarConditionType.PAINT]: 'bg-primary-light',
      [CarConditionType.REPLACEMENT]: 'bg-secondary-purple',
      [CarConditionType.SCRATCH]: 'bg-secondary-indigo',
    };
    
    // Add color classes to condition types
    return conditionOptions.map(option => ({
      ...option,
      colorClass: colorClasses[option.value] || 'bg-gray-500' // Fallback color
    }));
  }, [t]);

  // Format car sections for the table
  const formatCarSections = useCallback(() => {
    // Get all car sections with translations
    const allSections = getCarSectionOptions(t);
    
    // Map to table format
    return allSections.map(section => ({
      id: section.value,
      name: section.label
    }));
  }, [t]);

  // Memoized options with grouped sections
  const options = useMemo(() => ({
    carSections: formatCarSections(),
    conditionTypes: getConditionTypesWithColors(),
    groupedSections: getGroupedCarSectionOptions(t) // Add grouped sections for filtering
  }), [t, formatCarSections, getConditionTypesWithColors]);

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
    if (isClient) {
      saveToStorage(carCondition);
    }
  }, [carCondition, isClient]);

  // Handle section status change
  const handleSectionStatusChange = useCallback((sectionId: string, status: string) => {
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
  const isStatusSelected = useCallback((sectionId: string, status: string) => {
    return carCondition.sectionStatus?.[sectionId] === status;
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