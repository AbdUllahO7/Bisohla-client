import { ListingType, RentType } from "@/core/entities/enums/cars.enums";

// Complete AdInfoState interface with all fields
export interface AdInfoState {
    title: string;
    adStatus: string; 
    description: string;
    contactNumber: string;
    listingType: ListingType | '';
    rentType: RentType | '';
    publicationDate: string | null;
}

export interface AddProductStepFourProps {
    onValidationChange: (isValid: boolean) => void;
    initialData?: Partial<AdInfoState>;
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
    description: "",
    adStatus: "publish",
    contactNumber: "",
    listingType: "",
    rentType: "",
    publicationDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
};