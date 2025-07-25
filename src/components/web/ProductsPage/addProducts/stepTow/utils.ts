// utils.ts
import { SelectFeatureDto, CarListingFeature } from "@/core/entities/models/cars/cars.dto";
import { Feature, GroupedFeatures, CarInfoState } from "./types";
import { FeatureCategory } from "@/core/entities/enums/cars.enums";
import { EDIT_STORAGE_KEYS, STORAGE_KEYS } from "../main/hooks/useLocalStorage";

/**
 * Checks if the application is in edit mode
 */
export const isEditMode = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
};

/**
 * Gets the appropriate storage key based on edit mode
 */
export const getCarInfoStorageKey = (): string => {
    return isEditMode() ? EDIT_STORAGE_KEYS.STEP_TWO : STORAGE_KEYS.STEP_TWO;
};

/**
 * Function to group features by category from backend data
 * @param allFeatures - Array of features from the backend
 * @returns Record of categories with their features
 */
export const groupFeaturesByCategory = (allFeatures: SelectFeatureDto[]): GroupedFeatures => {
    const categoriesMap: GroupedFeatures = {};
    
    // Group features by their category
    allFeatures.forEach(feature => {
        if (!categoriesMap[feature.category]) {
        categoriesMap[feature.category] = {
            label: feature.category.charAt(0).toUpperCase() + feature.category.slice(1), // Capitalize first letter
            features: []
        };
        }
        
        categoriesMap[feature.category].features.push({
        id: feature.id.toString(),
        label: feature.name
        });
    });
    
    return categoriesMap;
};


/**
 * Validate doors value
 * @param value - Doors value to validate
 * @returns Boolean indicating if doors count is valid
 */
export const isValidDoors = (value: string): boolean => {
    const doorsNum = parseInt(value);
    return Number.isInteger(doorsNum) && doorsNum > 0 && doorsNum <= 10;
};

/**
 * Validate engine size value
 * @param value - Engine size value to validate
 * @returns Boolean indicating if engine size is valid
 */
export const isValidEngineSize = (value: string): boolean => {
    const sizeNum = parseFloat(value);
    return !isNaN(sizeNum) && sizeNum > 0;
};

/**
 * Load data from localStorage with edit mode awareness
 * @returns CarInfoState object with loaded data or default state
 */
export const loadFromStorage = (): CarInfoState => {
    try {
        const storageKey = getCarInfoStorageKey();
        const savedData = localStorage.getItem(storageKey);
        
        
        if (savedData) {
            const parsed = JSON.parse(savedData);

            // Ensure selectedFeatures is an array that matches CarListingFeature structure
            if (parsed.selectedFeatures) {
                // Handle different storage formats
                if (!Array.isArray(parsed.selectedFeatures)) {
                    // If stored as an object with categories, convert to array of objects
                    const featureArray: CarListingFeature[] = [];
                    
                    // Loop through each category
                    Object.entries(parsed.selectedFeatures).forEach(([category, featureIds]) => {
                        // Convert each feature ID to a CarListingFeature object
                        (featureIds as string[]).forEach(featureId => {
                            featureArray.push({
                                id: 0, // This will be assigned by the backend
                                carListingId: 0, // This will be assigned by the backend
                                featureId: featureId,
                                feature: {
                                    id: parseInt(featureId),
                                    name: "", // We don't need to populate this as it's just for reference
                                    category: category as FeatureCategory,
                                    icon: null,
                                    createdAt: new Date(),
                                    updatedAt: new Date(),
                                    deletedAt: null
                                }
                            });
                        });
                    });
                    
                    parsed.selectedFeatures = featureArray;
                }
            } else {
                parsed.selectedFeatures = [];
            }

         

            return parsed;
        }
    } catch (e) {
        console.error(`Failed to parse saved data from ${getCarInfoStorageKey()}:`, e);
    }
    
    // Return default state if loading failed
    return {
        colorExterior: "",
        fuelType: "",
        bodyType: "",
        transmission: "",
        mileage: "",
        enginePower: "",
        engineSize: "",
        doors: "",
        plateNumber: "",
        vin: "",
        selectedFeatures: [], // Empty array
    };
};

/**
 * Save data to localStorage with edit mode awareness
 * @param data - CarInfoState object to save
 */
export const saveToStorage = (data: CarInfoState): void => {
    try {
        const storageKey = getCarInfoStorageKey();
        localStorage.setItem(storageKey, JSON.stringify(data));
    } catch (e) {
        console.error(`Failed to save data to ${getCarInfoStorageKey()}:`, e);
    }
};

/**
 * Validate required fields for the form
 * @param carInfo - Current form state
 * @param validationErrors - Current validation errors
 * @returns Boolean indicating if form is valid
 */
export const validateForm = (carInfo: CarInfoState, validationErrors: any): boolean => {
    const requiredFields = [
        "colorExterior",  "fuelType", "bodyType", "transmission", "mileage", "engineSize", "doors"
    ];
  
    // Doors validation
    const isDoorsValid = isValidDoors(carInfo.doors);
    
    // Engine Size validation
    const isEngineSizeValid = isValidEngineSize(carInfo.engineSize);
    
    // Other fields validation
    const areOtherFieldsValid = requiredFields
        .filter(field => field !== 'doors' && field !== 'engineSize') // Handling these separately
        .every((field) => Boolean(carInfo[field]));
    
    // Form is valid if all conditions are met AND there are no validation errors
    return isDoorsValid && isEngineSizeValid && areOtherFieldsValid && 
            !validationErrors.doors && !validationErrors.engineSize;
};

/**
 * Hook-like function for working with car info
 * Returns loading, saving, validation functions and edit mode status
 */
export const useCarInfo = () => {
    const currentEditMode = isEditMode();
    const storageKey = getCarInfoStorageKey();
    
    return {
        loadFromStorage,
        saveToStorage,
        validateForm,
        isEditMode: currentEditMode,
        storageKey
    };
};