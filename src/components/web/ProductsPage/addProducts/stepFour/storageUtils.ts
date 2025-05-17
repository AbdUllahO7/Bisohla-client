import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums";
import { AdInformationFormData } from "./schema";
import { EDIT_STORAGE_KEYS, STORAGE_KEYS } from "../main/hooks/useLocalStorage";
import { Currency } from "@/core/entities/enums/currency.enum";

// Default values for the form
export const defaultAdInfoData: AdInformationFormData = {
    title: "",
    price: "",
    description: "",
    contactNumber: "",
    listingType: ListingType.FOR_SALE,
    rentType: null,
    publicationDate: new Date(),
    saveStatus: SaveStatus.DRAFT,
    currency: Currency.USD // Default currency
};

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
export const getAdInfoStorageKey = (): string => {
    return isEditMode() ? EDIT_STORAGE_KEYS.STEP_FOUR : STORAGE_KEYS.STEP_FOUR;
};

/**
 * Ensure enum values are preserved during serialization/deserialization
 * @param data The data to process
 * @returns Data with correct enum types
 */
export const ensureEnumValues = (data: any): AdInformationFormData => {
    const result = { ...data };
    
    // Handle listingType
    if (data.listingType && typeof data.listingType === 'string') {
        if (Object.values(ListingType).includes(data.listingType as ListingType)) {
            result.listingType = data.listingType as ListingType;
        } else {
            const normalizedValue = data.listingType.toUpperCase().replace(/\s+/g, '_');
            for (const [key, value] of Object.entries(ListingType)) {
                if (key.toUpperCase() === normalizedValue) {
                    result.listingType = value;
                    break;
                }
            }
        }
    }
    
    // Handle saveStatus
    if (data.saveStatus && typeof data.saveStatus === 'string') {
        if (Object.values(SaveStatus).includes(data.saveStatus as SaveStatus)) {
            result.saveStatus = data.saveStatus as SaveStatus;
        } else {
            const normalizedValue = data.saveStatus.toUpperCase().replace(/\s+/g, '_');
            for (const [key, value] of Object.entries(SaveStatus)) {
                if (key.toUpperCase() === normalizedValue) {
                    result.saveStatus = value;
                    break;
                }
            }
        }
    }

    // Handle currency
    if (data.currency && typeof data.currency === 'string') {
        if (Object.values(Currency).includes(data.currency as Currency)) {
            result.currency = data.currency as Currency;
        } else {
            const normalizedValue = data.currency.toUpperCase().replace(/\s+/g, '_');
            for (const [key, value] of Object.entries(Currency)) {
                if (key.toUpperCase() === normalizedValue) {
                    result.currency = value;
                    break;
                }
            }
        }
    }
    
    return result as AdInformationFormData;
};

/**
 * Loads saved ad information data from localStorage with edit mode awareness
 */
export const loadAdInfoData = (): AdInformationFormData => {
    try {
        if (typeof window === "undefined") {
            return defaultAdInfoData;
        }

        const storageKey = getAdInfoStorageKey();
        const savedData = localStorage.getItem(storageKey);
        
        if (savedData) {
            const parsedData = JSON.parse(savedData);

            // Convert string date back to Date object
            if (parsedData.publicationDate) {
                parsedData.publicationDate = new Date(parsedData.publicationDate);
            }

            // Set default saveStatus if not present in saved data
            if (!parsedData.saveStatus) {
                parsedData.saveStatus = SaveStatus.DRAFT;
            }

            // Set default currency if not present in saved data
            if (!parsedData.currency) {
                parsedData.currency = Currency.USD;
            }

            // Ensure enum values are properly set
            return ensureEnumValues(parsedData);
        }

        return defaultAdInfoData;
    } catch (e) {
        console.error(`Failed to load saved ad information from ${getAdInfoStorageKey()}:`, e);
        return defaultAdInfoData;
    }
};

/**
 * Saves ad information data to localStorage with edit mode awareness
 */
export const saveAdInfoData = (data: AdInformationFormData): void => {
    try {
        if (typeof window !== "undefined") {
            const storageKey = getAdInfoStorageKey();
            localStorage.setItem(storageKey, JSON.stringify(data));
        }
    } catch (e) {
        console.error(`Failed to save ad information to ${getAdInfoStorageKey()}:`, e);
    }
};

/**
 * Automatically saves form data as it changes with edit mode awareness
 * Preserves enum values during partial updates
 * @param data Current form data
 * @param previousData Previous form data for comparison (optional)
 */
export const autoSaveAdInfoData = (
    data: Partial<AdInformationFormData>, 
    previousData?: Partial<AdInformationFormData>
): void => {
    // Don't save if the data hasn't changed
    if (previousData && 
        JSON.stringify(data) === JSON.stringify(previousData)) {
        return;
    }
    
    try {
        if (typeof window !== "undefined") {
            // Get existing data first so we don't overwrite fields not in the partial data
            const existingData = loadAdInfoData();
            
            // Important: preserve enum values explicitly
            const updatedData = {
                ...existingData,
                ...data,
                // Always preserve these enum values if they exist in original data
                listingType: data.listingType || existingData.listingType,
                saveStatus: data.saveStatus || existingData.saveStatus,
                currency: data.currency || existingData.currency,
                rentType: data.rentType !== undefined ? data.rentType : existingData.rentType
            };
            
            const storageKey = getAdInfoStorageKey();
            localStorage.setItem(storageKey, JSON.stringify(updatedData));
        }
    } catch (e) {
        console.error(`Failed to auto-save ad information to ${getAdInfoStorageKey()}:`, e);
    }
};

/**
 * Custom hook to use ad information with edit mode awareness
 */
export const useAdInfoData = () => {
    const isCurrentEditMode = isEditMode();
    const storageKey = getAdInfoStorageKey();
    
    return {
        loadData: loadAdInfoData,
        saveData: saveAdInfoData,
        autoSaveData: autoSaveAdInfoData,
        isEditMode: isCurrentEditMode,
        storageKey
    };
};