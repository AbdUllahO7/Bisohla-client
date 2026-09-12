import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums";
import { AdInformationFormData } from "./schema";
import { Currency } from "@/core/entities/enums/currency.enum";
import { assemblePhone, splitPhone } from "@/core/lib/phone/phone.util";
import { normalizeGovernorate, normalizeAddress } from "@/core/entities/enums/syria.enums";
import { resolveCityValue } from "@/utils/geocodeToSyria";
import { commonFieldsStore } from "../Main/context/common-fields.store";

// Extended interface for the wizard state (includes frontend-only fields)
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
    // Required, but never pre-picked: the seller must state the condition (mobile parity).
    condition: "" as AdInformationFormData["condition"],
    saveAsProfileNumber: false,
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

export const isEditMode = (): boolean => commonFieldsStore.getMode() === 'edit';

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

    if (data.rentType && !Object.values(RentType).includes(data.rentType as RentType)) {
        result.rentType = null;
    }

    // Handle governorate & city & address normalization
    if (data.governorate) {
        result.governorate = normalizeGovernorate(data.governorate);
        if (!result.detectedGovernorate) {
            result.detectedGovernorate = result.governorate;
        }
    }
    if (result.governorate || data.city) {
        result.city = resolveCityValue(data.city, result.governorate, data.latitude, data.longitude);
    }
    if (data.address) {
        result.address = normalizeAddress(data.address);
    }

    return result as AdInformationStorageData;
};

/**
 * Loads the common fields from the wizard state (seeded by hydrate / draft restore).
 */
export const loadAdInfoData = (): AdInformationStorageData => {
    const saved = commonFieldsStore.get();
    if (!saved) return defaultAdInfoData;

    const parsedData: any = { ...saved };
    if (parsedData.publicationDate && !(parsedData.publicationDate instanceof Date)) {
        parsedData.publicationDate = new Date(parsedData.publicationDate);
    }
    if (!parsedData.saveStatus) parsedData.saveStatus = SaveStatus.PUBLISHED;
    if (!parsedData.currency) parsedData.currency = Currency.USD;

    if (parsedData.contactNumber && !parsedData.countryDialCode) {
        const { dialCode } = splitPhone(parsedData.contactNumber);
        parsedData.countryDialCode = dialCode;
    } else if (!parsedData.countryDialCode) {
        parsedData.countryDialCode = "+963";
    }

    return ensureEnumValues(parsedData);
};

/** True once the wizard holds common fields (hydrated edit, restored draft, or the seller's edits). */
export const hasSavedAdInfoData = (): boolean => commonFieldsStore.has();

/**
 * Writes the common fields into the wizard state.
 */
export const saveAdInfoData = (data: AdInformationStorageData): void => {
    commonFieldsStore.set(ensureEnumValues(data));
};

/**
 * Merges a partial change into the wizard state (debounced by the caller).
 */
export const autoSaveAdInfoData = (
    data: Partial<AdInformationStorageData>,
    previousData?: Partial<AdInformationStorageData>
): void => {
    if (previousData && JSON.stringify(data) === JSON.stringify(previousData)) {
        return;
    }

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

    commonFieldsStore.set(ensureEnumValues(updatedData));
};
