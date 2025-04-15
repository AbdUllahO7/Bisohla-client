// utils.ts
import { CarConditionState, STORAGE_KEY, defaultState } from "./types";
import { CarSection, CarConditionType } from "@/core/entities/enums/cars.damegs.enum";

/**
 * Loads car condition data from localStorage
 * @returns Loaded car condition state
 */
export const loadFromStorage = (): CarConditionState => {
  try {
    if (typeof window === 'undefined') {
      return defaultState;
    }
    
    const savedData = localStorage.getItem(STORAGE_KEY);
    if (savedData) {
      return JSON.parse(savedData);
    }
    
    return defaultState;
  } catch (e) {
    console.error("Failed to parse saved data:", e);
    return defaultState;
  }
};

/**
 * Saves car condition data to localStorage
 * @param data Car condition state to save
 */
export const saveToStorage = (data: CarConditionState): void => {
  try {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    }
  } catch (e) {
    console.error("Failed to save data:", e);
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
  // Modified: No longer checking if all sections have a status
  // const allSectionsHaveStatus = carSections.every(section => 
  //   Boolean(carCondition.sectionStatus[section.id])
  // );

  // Check if at least cover image is provided
  const hasCoverImage = carCondition.coverImage.length > 0;

  // Check if at least one car image is provided
  const hasCarImages = carCondition.carImages.length > 0;

  // Overall validation - only photos are now required
  return hasCoverImage && hasCarImages;
};

/**
 * Transform the sectionStatus object to the backend's expected damages array format
 */
/**
 * Transform the sectionStatus object to the backend's expected damages array format
 * Maps our frontend CarSection values to backend DamageZone values
 */
export const transformDamages = (sectionStatus: Record<string, string>) => {
  if (!sectionStatus || Object.keys(sectionStatus).length === 0) {
    return [];
  }

  // Map our frontend section enum values to backend DamageZone enum values
  const sectionToDamageZoneMap: Record<string, string> = {
    // Map CarSection enum values to valid backend DamageZone values
    [CarSection.Hood]: 'hood',
    [CarSection.Roof]: 'roof',
    [CarSection.LeftFrontFender]: 'left_front_fender',
    [CarSection.RightFrontFender]: 'right_front_fender',
    [CarSection.LeftFrontDoor]: 'left_front_door',
    [CarSection.RightFrontDoor]: 'right_front_door',
    [CarSection.LeftRearDoor]: 'left_rear_door',
    [CarSection.RightRearDoor]: 'right_rear_door',
    [CarSection.Package]: 'trunk', // Map Package to trunk as it's the closest matching backend value
    [CarSection.LeftRearFender]: 'left_rear_fender',
    [CarSection.RightRearFender]: 'right_rear_fender',
  };

  // Map our frontend condition type enum values to backend DamageType enum values
  const conditionToDamageTypeMap: Record<string, string> = {
    [CarConditionType.SCRATCH]: 'scratch',
    [CarConditionType.PAINT]: 'paint_faded',
    [CarConditionType.REPLACEMENT]: 'panel_replaced',
  };

  // Transform sectionStatus object into damages array with valid backend values
  const damages = Object.entries(sectionStatus).map(([sectionId, conditionType]) => {
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
      description: null // You can add description handling if needed
    };
  }).filter(item => item !== null); // Remove any null entries
  
  return damages;
};