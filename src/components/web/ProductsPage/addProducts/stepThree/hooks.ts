// hooks.ts - Updated with immediate validation after image upload
import { useState, useEffect, useCallback, useMemo, useRef } from "react";
import { useLocale, useTranslations } from "next-intl";
import { ImageUploaderRef } from "@/components/image-uploader/image-uploader";
import { 
  CarConditionType, 
  getCarSectionOptions,
  getCarConditionOptions,
  getGroupedCarSectionOptions
} from "@/core/entities/enums/cars.damegs.enum"; 

import { CarConditionState,  defaultState, STORAGE_KEY, EDIT_STORAGE_KEY, EDIT_MODE_FLAG, SectionStatusMap } from "./types";
import { 
  validateForm, 
  isEditMode as checkIsEditMode,
} from "./utils";

/**
 * Custom hook for the AddProductStepThree component
 */
export const useAddProductStepThree = (
  onValidationChange: (isValid: boolean) => void,
  isComponentEditMode: boolean = false
) => {
  const locale = useLocale();
  const isRTL = locale === "ar";
  const direction = isRTL ? "rtl" : "ltr";
  const t = useTranslations("addProduct.enteredData.stepThree");
   
  // State
  const [isFormDisabled, setIsFormDisabled] = useState(false);
  const [isClient, setIsClient] = useState(false);
  const [carCondition, setCarCondition] = useState<CarConditionState>(defaultState);
  const [isEditMode, setIsEditMode] = useState(false);
  const [storageKey, setStorageKey] = useState("");
  
  // Refs
  const coverImageRef = useRef<ImageUploaderRef>(null);
  const prevValidState = useRef<boolean | null>(null);
  const editModeApplied = useRef(false);
  const initialLoadComplete = useRef(false);
  
  // Text labels
  const labels = useMemo(
    () => ({
      carInfo: t('carInfo'),
      carPhotos: t('carPhotos'),
      carSectionName: t('carSectionName'),
      coverImage: t('images.coverImage'),
      oneImage: t('images.oneImage'),
      tenImages: t('images.tenImages'),
      tenFiles: t('images.tenFiles'),
      required: "Required", // Add this to translation file if needed
    }),
    [t, isEditMode],
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

  // Helper function to run validation and notify parent
  const runValidation = useCallback((currentState: CarConditionState) => {
    const isValid = validateForm(currentState, options.carSections);
    

    
    if (isValid !== prevValidState.current) {
      prevValidState.current = isValid;
      onValidationChange(isValid);
    }
  }, [onValidationChange, options.carSections]);

  // Check if we're in edit mode (from localStorage flag) on mount
  useEffect(() => {
    // Determine edit mode status using the prop or localStorage
    const detectedEditMode = isComponentEditMode || checkIsEditMode();
    setIsEditMode(detectedEditMode);
    
    // Get the appropriate storage key based on edit mode
    const key = detectedEditMode ? EDIT_STORAGE_KEY : STORAGE_KEY;
    setStorageKey(key);
    
  }, [isComponentEditMode]);

  // Initialize client-side - Load data from localStorage ONCE
  useEffect(() => {
    setIsClient(true);
    
    // Only run client-side code after hydration and only once
    if (typeof window !== 'undefined' && !initialLoadComplete.current && storageKey) {
      window.scrollTo(0, 0);
      
      // Safe localStorage operations
      try {
        // Use the direct localStorage key to ensure we get the right data
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
          const parsedData = JSON.parse(savedData) as Partial<CarConditionState>;
          
          // Handle both old format (string values) and new format (object values)
          let updatedData = { ...parsedData };
          
          if (parsedData.sectionStatus) {
            // Normalize the section status format to match what the component expects
            const normalizedSectionStatus: SectionStatusMap = {};
            
            // Check if we need to convert the format
            Object.entries(parsedData.sectionStatus).forEach(([key, value]) => {
              if (typeof value === 'string') {
                // Old format: { sectionId: 'status' }
                normalizedSectionStatus[key] = value;
              } else if (value && typeof value === 'object' && 'status' in value) {
                // New format from edit mode: { sectionId: { status: 'status', description: '' } }
                normalizedSectionStatus[key] = (value as { status: string }).status;
              }
            });
            
            updatedData = {
              ...parsedData,
              sectionStatus: normalizedSectionStatus
            };
          }
          
          const finalState = updatedData as CarConditionState;
          
          // Set the normalized data with proper type assertion
          setCarCondition(finalState);
          
          // Run initial validation after loading data
          setTimeout(() => {
            runValidation(finalState);
          }, 100);
          
          // Mark initial load as complete
          initialLoadComplete.current = true;
        } else {
          // Run validation even with default state
          setTimeout(() => {
            runValidation(defaultState);
          }, 100);
        }
      } catch (e) {
        console.error("❌ Failed to load data:", e);
      }
    }
  }, [storageKey, runValidation]); // Add runValidation to dependencies

  // Function to set initial damages from edit mode
  const setInitialDamages = useCallback((damagesMap: Record<string, { status: string, description?: string }>) => {
    if (!editModeApplied.current) {
      
      // First, get the current data to preserve images
      const currentData = { ...carCondition };
      
      // Convert from edit format { sectionId: { status, description } }
      // to the format this component uses { sectionId: status }
      const normalizedDamages: SectionStatusMap = {};
      
      Object.entries(damagesMap).forEach(([key, value]) => {
        if (value && typeof value === 'object' && 'status' in value) {
          normalizedDamages[key] = value.status;
        }
      });
      
      
      // Create updated state with preserved images
      const updatedState: CarConditionState = {
        ...currentData,
        sectionStatus: normalizedDamages
      };
      
      
      // Update state with the normalized format
      setCarCondition(updatedState);
      
      // Save to storage in the normalized format
      try {
        localStorage.setItem(storageKey, JSON.stringify(updatedState));
      } catch (e) {
        console.error(`Error saving initial damages to ${storageKey}:`, e);
      }
      
      // Run validation after setting initial damages
      setTimeout(() => {
        runValidation(updatedState);
      }, 100);
      
      editModeApplied.current = true;
    }
  }, [carCondition, storageKey, runValidation]);

  // Save to localStorage only when the state changes intentionally
  // (not on initial load)
  useEffect(() => {
    if (isClient && initialLoadComplete.current && storageKey) {
      
      try {
        // Save to the correct localStorage key based on edit mode
        localStorage.setItem(storageKey, JSON.stringify(carCondition));
      } catch (e) {
        console.error(`Error saving to localStorage with key ${storageKey}:`, e);
      }
      
      // Run validation after state changes
      runValidation(carCondition);
    }
  }, [carCondition, isClient, storageKey, runValidation]);

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
      
      const updatedState: CarConditionState = {
        ...prev,
        sectionStatus: newSectionStatus
      };
      
      // Save to localStorage immediately after state update
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedState));
        } catch (e) {
          console.error(`Error saving section status change to ${storageKey}:`, e);
        }
      }
      
      // Run validation immediately after state update
      setTimeout(() => {
        runValidation(updatedState);
      }, 0);
      
      return updatedState;
    });
  }, [storageKey, runValidation]);

  // Check if a status is selected
  const isStatusSelected = useCallback((sectionId: string, status: string) => {
    return carCondition.sectionStatus?.[sectionId] === status;
  }, [carCondition.sectionStatus]);

  // Image handlers - FIXED VERSION
  const handleCoverImageChange = useCallback((urls: string[]) => {
    
    setCarCondition(prev => {
      const updatedState: CarConditionState = {
        ...prev,
        coverImage: urls
      };
      
      // Save to localStorage immediately after state update
      if (storageKey) {
        try {
          localStorage.setItem(storageKey, JSON.stringify(updatedState));
        } catch (e) {
          console.error(`Error saving cover image change to ${storageKey}:`, e);
        }
      }
      
      // Run validation immediately after state update
      // Use setTimeout to ensure state has been updated
      setTimeout(() => {
        runValidation(updatedState);
      }, 0);
      
      return updatedState;
    });
  }, [storageKey, runValidation]);

  return {
    isClient,
    direction,
    labels,
    options,
    carCondition,
    isFormDisabled,
    setIsFormDisabled,
    coverImageRef,
    handleSectionStatusChange,
    isStatusSelected,
    handleCoverImageChange,
    setInitialDamages,
    isEditMode,  
    storageKey    
  };
};