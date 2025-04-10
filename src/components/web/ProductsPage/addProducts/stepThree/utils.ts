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

/**
 * Transform the sectionStatus object to the backend's expected damages array format
 */
/**
 * Transform the sectionStatus object to the backend's expected damages array format
 */
export const transformDamages = (sectionStatus: Record<string, string>) => {
  if (!sectionStatus || Object.keys(sectionStatus).length === 0) {
    return [];
  }

  // Map our frontend section IDs to backend DamageZone enum values (using snake_case)
  const sectionToDamageZoneMap: Record<string, string> = {
    // Front section
    'frontBumper': 'front_bumper',
    'hood': 'hood',
    'frontGrill': 'front_grill',
    'leftHeadlight': 'left_headlight',
    'rightHeadlight': 'right_headlight',
    
    // Roof section
    'roof': 'roof',
    
    // Rear section
    'trunk': 'trunk',
    'rearBumper': 'rear_bumper',
    'leftTaillight': 'left_taillight',
    'rightTaillight': 'right_taillight',
    
    // Left side
    'leftFrontFender': 'left_front_fender',
    'leftFrontDoor': 'left_front_door',
    'leftRearDoor': 'left_rear_door',
    'leftRearFender': 'left_rear_fender',
    'leftMirror': 'left_mirror',
    'leftFrontPillar': 'left_front_pillar',
    'leftCenterPillar': 'left_center_pillar',
    'leftRearPillar': 'left_rear_pillar',
    
    // Right side
    'rightFrontFender': 'right_front_fender',
    'rightFrontDoor': 'right_front_door',
    'rightRearDoor': 'right_rear_door',
    'rightRearFender': 'right_rear_fender',
    'rightMirror': 'right_mirror',
    'rightFrontPillar': 'right_front_pillar',
    'rightCenterPillar': 'right_center_pillar',
    'rightRearPillar': 'right_rear_pillar',
    
    // Glass
    'frontWindshield': 'front_windshield',
    'rearWindshield': 'rear_windshield',
    'leftFrontWindow': 'left_front_window',
    'leftRearWindow': 'left_rear_window',
    'rightFrontWindow': 'right_front_window',
    'rightRearWindow': 'right_rear_window',
    
    // Wheels/Rims
    'leftFrontWheel': 'left_front_wheel',
    'leftRearWheel': 'left_rear_wheel',
    'rightFrontWheel': 'right_front_wheel',
    'rightRearWheel': 'right_rear_wheel',
  };

  // Map our frontend condition type values to backend DamageType enum values (using snake_case)
  const conditionToDamageTypeMap: Record<string, string> = {
    'scratch': 'scratch',
    'dent': 'dent',
    'paintFaded': 'paint_faded',
    'paintRepaired': 'paint_repaired',
    'panelReplaced': 'panel_replaced',
  };

  // Transform sectionStatus object into damages array
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