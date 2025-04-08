// utils.ts
import { CarConditionState, STORAGE_KEY, defaultState } from "./types";

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
  // Check if all required sections have a status
  const allSectionsHaveStatus = carSections.every(section => 
    Boolean(carCondition.sectionStatus[section.id])
  );

  // Check if at least cover image is provided
  const hasCoverImage = carCondition.coverImage.length > 0;

  // Check if at least one car image is provided
  const hasCarImages = carCondition.carImages.length > 0;

  // Overall validation
  return allSectionsHaveStatus && hasCoverImage && hasCarImages;
};