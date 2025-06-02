// utils.ts - Updated with better validation and debugging
import { CarConditionState, defaultState, STORAGE_KEY, EDIT_STORAGE_KEY, EDIT_MODE_FLAG } from "./types";
import { CarSection, CarConditionType } from "@/core/entities/enums/cars.damegs.enum";

/**
 * Checks if the application is in edit mode
 * @returns Boolean indicating if we're in edit mode
 */
export const isEditMode = (): boolean => {
  if (typeof window === "undefined") return false;
  return !!localStorage.getItem(EDIT_MODE_FLAG);
};

/**
 * Gets the appropriate storage key based on edit mode
 * @returns The localStorage key to use
 */
export const getStorageKey = (): string => {
  return isEditMode() ? EDIT_STORAGE_KEY : STORAGE_KEY;
};

/**
 * Load car condition data from localStorage with edit mode awareness
 */
export const loadFromStorage = (): CarConditionState => {
  try {
    if (typeof window === "undefined") return defaultState;
    
    const key = getStorageKey();
    console.log(`📂 Loading data from localStorage key: ${key}`);
    
    const savedData = localStorage.getItem(key);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      console.log(`✅ Loaded data:`, parsedData);
      return parsedData;
    }
    
    console.log(`❌ No data found in localStorage for key: ${key}`);
    return defaultState;
  } catch (e) {
    console.error(`Failed to load data from ${getStorageKey()}:`, e);
    return defaultState;
  }
};

/**
 * Save car condition data to localStorage with edit mode awareness
 */
export const saveToStorage = (data: CarConditionState): void => {
  try {
    if (typeof window === "undefined") return;
    
    const key = getStorageKey();
    console.log(`💾 Saving data to localStorage key: ${key}`, data);
    
    localStorage.setItem(key, JSON.stringify(data));
    console.log(`✅ Data saved successfully to ${key}`);
  } catch (e) {
    console.error(`Failed to save data to ${getStorageKey()}:`, e);
  }
};

/**
 * Enhanced validation with detailed logging
 * @param carCondition Current car condition state
 * @param carSections Available car sections (optional, for future use)
 * @returns Boolean indicating if the form is valid
 */
export const validateForm = (
  carCondition: CarConditionState,
  carSections?: any[]
): boolean => {
  console.log(`🔍 Running validation on:`, carCondition);
  
  // Check if at least cover image is provided
  const coverImages = carCondition.coverImage || [];
  const hasCoverImage = Array.isArray(coverImages) && coverImages.length > 0;
  
  console.log(`📸 Cover image validation:`, {
    coverImages,
    coverImageCount: coverImages.length,
    hasCoverImage,
    imageDetails: coverImages.map((img, index) => `${index + 1}: ${img?.substring(0, 50)}...`)
  });

  // Additional validation checks (currently not required but good to have)
  const sectionStatus = carCondition.sectionStatus || {};
  const hasSelectedConditions = Object.keys(sectionStatus).length > 0;
  
  console.log(`🔧 Section status validation:`, {
    sectionStatus,
    sectionCount: Object.keys(sectionStatus).length,
    hasSelectedConditions
  });

  // Overall validation - only photos are now required
  const isValid = hasCoverImage;
  
  console.log(`✅ Validation result:`, {
    hasCoverImage,
    hasSelectedConditions,
    isValid,
    reason: !isValid ? 'Missing cover image' : 'All requirements met'
  });

  return isValid;
};

/**
 * Get detailed validation status for debugging
 * @param carCondition Current car condition state
 * @returns Detailed validation information
 */
export const getValidationDetails = (carCondition: CarConditionState) => {
  const coverImages = carCondition.coverImage || [];
  const hasCoverImage = Array.isArray(coverImages) && coverImages.length > 0;
  const sectionStatus = carCondition.sectionStatus || {};
  const hasSelectedConditions = Object.keys(sectionStatus).length > 0;
  
  return {
    coverImage: {
      count: coverImages.length,
      hasImages: hasCoverImage,
      urls: coverImages
    },
    sectionStatus: {
      count: Object.keys(sectionStatus).length,
      hasSelections: hasSelectedConditions,
      selections: sectionStatus
    },
    overall: {
      isValid: hasCoverImage,
      requiredMet: hasCoverImage,
      issues: !hasCoverImage ? ['Cover image is required'] : []
    }
  };
};

/**
 * Validate a specific field
 * @param field Field name to validate
 * @param carCondition Current state
 * @returns Boolean indicating if the field is valid
 */
export const validateField = (field: 'coverImage' | 'sectionStatus', carCondition: CarConditionState): boolean => {
  switch (field) {
    case 'coverImage':
      const coverImages = carCondition.coverImage || [];
      return Array.isArray(coverImages) && coverImages.length > 0;
    
    case 'sectionStatus':
      const sectionStatus = carCondition.sectionStatus || {};
      return Object.keys(sectionStatus).length > 0;
    
    default:
      return false;
  }
};

/**
 * Transform the sectionStatus object to the backend's expected damages array format
 * Maps our frontend CarSection values to backend DamageZone values
 */
export const transformDamages = (sectionStatus: Record<string, string | { status: string, description: string | null }>) => {
  if (!sectionStatus || Object.keys(sectionStatus).length === 0) {
    return [];
  }

  // Map our frontend section enum values to backend DamageZone enum values
  const sectionToDamageZoneMap: Record<string, string> = {
    // Map CarSection enum values to valid backend DamageZone values
    [CarSection.Hood]: 'Hood',
    [CarSection.Roof]: 'Roof',
    [CarSection.LeftFrontFender]: 'Left Front Fender',
    [CarSection.RightFrontFender]: 'Right Front Fender',
    [CarSection.LeftFrontDoor]: 'Left Front Door',
    [CarSection.RightFrontDoor]: 'Right Front Door',
    [CarSection.LeftRearDoor]: 'Left Rear Door',
    [CarSection.RightRearDoor]: 'Right Rear Door',
    [CarSection.Package]: 'Package', 
    [CarSection.LeftRearFender]: ' Left Rear Fender',
    [CarSection.RightRearFender]: 'Right Rear Fender',
  };
  
  // Map our frontend condition type enum values to backend DamageType enum values
  const conditionToDamageTypeMap: Record<string, string> = {
    [CarConditionType.SCRATCH]: 'Scratch',
    [CarConditionType.PAINT]: 'paint',
    [CarConditionType.REPLACEMENT]: 'replacement',
  };

  // Transform sectionStatus object into damages array with valid backend values
  const damages = Object.entries(sectionStatus).map(([sectionId, value]) => {
    // Handle both string values and object values
    let conditionType: string;
    let description: string | null = null;
    
    if (typeof value === 'string') {
      conditionType = value;
    } else if (value && typeof value === 'object' && 'status' in value) {
      conditionType = value.status;
      description = value.description || null;
    } else {
      console.warn(`Skipping invalid section status format for ${sectionId}:`, value);
      return null;
    }
    
    // Map the frontend IDs to backend enum values
    const damageZone = sectionToDamageZoneMap[sectionId];
    const damageType = conditionToDamageTypeMap[conditionType];
    
    if (!damageZone || !damageType) {
      console.warn(`Skipping unknown section or condition: ${sectionId} - ${conditionType}`);
      return null;
    }
    
    return {
      damageZone,
      damageType,
      description
    };
  }).filter(item => item !== null); // Remove any null entries
  
  return damages;
};

/**
 * Clear form data from localStorage
 * @param specificKey Optional specific key to clear, otherwise clears current mode's key
 */
export const clearFormData = (specificKey?: string): void => {
  try {
    if (typeof window === "undefined") return;
    
    const keyToClear = specificKey || getStorageKey();
    localStorage.removeItem(keyToClear);
    console.log(`🗑️ Cleared data from localStorage key: ${keyToClear}`);
  } catch (e) {
    console.error(`Failed to clear data from localStorage:`, e);
  }
};