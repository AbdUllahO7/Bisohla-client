import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums";
import { AdInformationFormData } from "./schema";
import { EDIT_STORAGE_KEYS, STORAGE_KEYS } from "../main/hooks/useLocalStorage";
import { Currency } from "@/core/entities/enums/currency.enum";
import { CountryCode } from "@/core/entities/enums/country-codes.enum";

// Extended interface for localStorage (includes frontend-only fields)
export interface AdInformationStorageData extends AdInformationFormData {
    countryCode?: CountryCode; // Frontend-only: for UI selector
}

// Default values for the form
export const defaultAdInfoData: AdInformationStorageData = {
    title: "",
    price: "",
    description: "",
    contactNumber: "", // Will store full phone with country code
    listingType: ListingType.FOR_SALE,
    rentType: null,
    publicationDate: new Date(),
    saveStatus: SaveStatus.PUBLISHED,
    currency: Currency.USD,
    countryCode: CountryCode.SY, // Default to Syria (frontend-only)
};

/**
 * Combines country code and phone number into full format for contactNumber
 * @param countryCode - The country calling code (e.g., "+963")
 * @param phoneNumber - The phone number without country code
 * @returns Full phone number (e.g., "+963 5389370863")
 */
export const combinePhoneNumber = (countryCode: string, phoneNumber: string): string => {
    if (!phoneNumber) return "";
    // Remove any existing + or spaces from phone number
    const cleanPhone = phoneNumber.replace(/[\s+-]/g, "");
    return `${countryCode} ${cleanPhone}`;
};

/**
 * Parses contactNumber into country code and phone number for UI
 * @param contactNumber - Complete phone with country code (e.g., "+963 5389370863")
 * @returns Object with countryCode and phoneNumber (without country code)
 */
export const parsePhoneNumber = (contactNumber: string): { countryCode: string; phoneNumber: string } => {
    if (!contactNumber) {
        return { countryCode: CountryCode.SY, phoneNumber: "" };
    }
    
    // Try to extract country code (e.g., "+963" or "+1")
    const match = contactNumber.match(/^(\+\d{1,4})\s*(.*)$/);
    
    if (match) {
        const [, code, number] = match;
        return {
            countryCode: code as CountryCode,
            phoneNumber: number.trim()
        };
    }
    
    // If no match, return the whole thing as phone number with default country code
    return {
        countryCode: CountryCode.SY,
        phoneNumber: contactNumber.replace(/[\s+-]/g, "")
    };
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
 */
export const ensureEnumValues = (data: any): AdInformationStorageData => {
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

    // Handle countryCode (frontend-only)
    if (data.countryCode && typeof data.countryCode === 'string') {
        if (Object.values(CountryCode).includes(data.countryCode as CountryCode)) {
            result.countryCode = data.countryCode as CountryCode;
        } else {
            result.countryCode = CountryCode.SY; // Default to Syria
        }
    }
    
    return result as AdInformationStorageData;
};

/**
 * Loads saved ad information data from localStorage with edit mode awareness
 */
export const loadAdInfoData = (): AdInformationStorageData => {
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

            // Set defaults if not present
            if (!parsedData.saveStatus) {
                parsedData.saveStatus = SaveStatus.PUBLISHED;
            }
            if (!parsedData.currency) {
                parsedData.currency = Currency.USD;
            }

            // Parse contactNumber to extract countryCode if not present
            if (parsedData.contactNumber && !parsedData.countryCode) {
                const { countryCode } = parsePhoneNumber(parsedData.contactNumber);
                parsedData.countryCode = countryCode;
            } else if (!parsedData.countryCode) {
                parsedData.countryCode = CountryCode.SY;
            }

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
 * contactNumber will contain the full phone number with country code
 */
export const saveAdInfoData = (data: AdInformationStorageData): void => {
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
 */
export const autoSaveAdInfoData = (
    data: Partial<AdInformationStorageData>, 
    previousData?: Partial<AdInformationStorageData>
): void => {
    if (previousData && 
        JSON.stringify(data) === JSON.stringify(previousData)) {
        return;
    }
    
    try {
        if (typeof window !== "undefined") {
            const existingData = loadAdInfoData();
            
            const updatedData = {
                ...existingData,
                ...data,
                listingType: data.listingType || existingData.listingType,
                saveStatus: data.saveStatus || existingData.saveStatus,
                currency: data.currency || existingData.currency,
                countryCode: data.countryCode || existingData.countryCode,
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
        storageKey,
        // Helper functions
        combinePhoneNumber,
        parsePhoneNumber
    };
};