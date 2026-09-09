import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums";
import { AdInformationFormData } from "./schema";
import { EDIT_STORAGE_KEYS, STORAGE_KEYS } from "../Main/hooks/useLocalStorage";
import { Currency } from "@/core/entities/enums/currency.enum";
import { assemblePhone, splitPhone } from "@/core/lib/phone/phone.util";
import { normalizeGovernorate, normalizeCity, normalizeAddress } from "@/core/entities/enums/syria.enums";

// Extended interface for localStorage (includes frontend-only fields)
export interface AdInformationStorageData extends AdInformationFormData {
    countryCode?: string; // Legacy field
}

// Default values for the form
export const defaultAdInfoData: AdInformationStorageData = {
    title: "",
    price: "",
    description: "",
    countryDialCode: "+963",
    contactNumber: "",
    listingType: ListingType.FOR_SALE,
    rentType: null,
    publicationDate: new Date(),
    saveStatus: SaveStatus.PUBLISHED,
    currency: Currency.USD,
    governorate: "",
    city: "",
    address: "",
    latitude: null,
    longitude: null,
    detectedGovernorate: null,
    saveAsSavedAddress: false,
    savedAddressLabel: "",
    installmentsAvailable: false,
    installmentPlans: [],
};

export const combinePhoneNumber = (countryCode: string, phoneNumber: string): string => {
    return assemblePhone(countryCode, phoneNumber) || "";
};

export const parsePhoneNumber = (contactNumber: string): { countryCode: string; phoneNumber: string } => {
    const { dialCode, localNumber } = splitPhone(contactNumber || "");
    return {
        countryCode: dialCode,
        phoneNumber: localNumber
    };
};

/**
 * Checks if the application is in edit mode
 */
export const isEditMode = (): boolean => {
    if (typeof window === "undefined") return false;
    return !!localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG) ||
           (typeof window !== "undefined" && window.location.pathname.toLowerCase().includes('/edit'));
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

    // Handle governorate & city & address normalization
    if (data.governorate) {
        result.governorate = normalizeGovernorate(data.governorate);
        if (!result.detectedGovernorate) {
            result.detectedGovernorate = result.governorate;
        }
    }
    if (data.city) {
        result.city = normalizeCity(data.city, result.governorate);
    }
    if (data.address) {
        result.address = normalizeAddress(data.address);
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

            if (parsedData.contactNumber && !parsedData.countryDialCode) {
                const { dialCode } = splitPhone(parsedData.contactNumber);
                parsedData.countryDialCode = dialCode;
            } else if (!parsedData.countryDialCode) {
                parsedData.countryDialCode = "+963";
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