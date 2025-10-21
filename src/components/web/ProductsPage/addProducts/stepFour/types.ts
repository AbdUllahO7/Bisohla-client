import { Currency } from "@/core/entities/enums/currency.enum";
import { CountryCode } from "@/core/entities/enums/country-codes.enum";

// Complete AdInfoState interface with all fields
export interface AdInfoState {
    title: string;
    adStatus: string;
    description: string;
    contactNumber: string;
    price: string;
    listingType: string;
    rentType?: string | null;
    publicationDate: string | null;
    saveStatus?: string;
    currency: string;
    countryCode?: string; // Frontend-only field
}

export interface AddProductStepFourProps {
    onValidationChange: (isValid: boolean) => void;
    isEditMode?: boolean;
    initialData?: any;
}

export interface FormFieldProps {
    label: string;
    id: string;
    placeholder: string;
    value: string;
    onChange: (value: string) => void;
    onBlur: () => void;
    errorMessage: string;
    required?: boolean;
}

export interface StatusSelectProps {
    value: string;
    onChange: (value: string) => void;
    direction: string;
}

export interface PublicationDateProps {
    direction: string;
    onDateChange?: (date: string | null) => void;
    showError: boolean;
    initialDate?: string | null;
}

// Constants
export const STORAGE_KEY = "addProduct_stepFour_data";

export const defaultState: AdInfoState = {
    title: "",
    price: "",
    description: "",
    adStatus: "publish",
    contactNumber: "",
    listingType: "",
    rentType: "",
    publicationDate: new Date().toISOString().split('T')[0],
    saveStatus: "",
    currency: Currency.USD,
    countryCode: CountryCode.US // Default country code
};