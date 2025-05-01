import { ListingType, RentType, SaveStatus } from "@/core/entities/enums/cars.enums";

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

}

export interface AddProductStepFourProps {
    onValidationChange: (isValid: boolean) => void;
    isEditMode?: boolean;
    initialData?: any; // This could be more specific based on your API response type
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
    initialDate?: string | null; // Optional prop for initial date
}

// Constants
export const STORAGE_KEY = "addProduct_stepFour_data";


export const defaultState: AdInfoState = {
    title: "",
    price : "",
    description: "",
    adStatus: "publish",
    contactNumber: "",
    listingType: "",
    rentType: "",
    publicationDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
};