// utils.ts
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
    console.log(`Loading car condition from localStorage using key: ${key}`);
    
    const savedData = localStorage.getItem(key);
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      return parsedData;
    }
    
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
    console.log(`Saving car condition to localStorage using key: ${key}`);
    
    localStorage.setItem(key, JSON.stringify(data));
  } catch (e) {
    console.error(`Failed to save data to ${getStorageKey()}:`, e);
  }
};

/**
 * Validates the car condition state
 * @param carCondition Current car condition state
 * @param carSections Available car sections
 * @returns Boolean indicating if the form is valid
 */
export const validateForm = (
  carCondition: CarConditionState,
  carSections: any[]
): boolean => {
  // Check if at least cover image is provided
  const hasCoverImage = carCondition.coverImage && carCondition.coverImage.length > 0;

  // Check if at least one car image is provided
  const hasCarImages = carCondition.carImages && carCondition.carImages.length > 0;

  // Overall validation - only photos are now required
  return hasCoverImage && hasCarImages;
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