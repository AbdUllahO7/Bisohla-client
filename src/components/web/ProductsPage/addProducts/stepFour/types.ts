// types.ts
export interface AdInfoState {
    adTitle: string;
    adDescription: string;
    adStatus: string;
    publicationDate: string | null;
}

export interface AddProductStepFourProps {
    onValidationChange: (isValid: boolean) => void;
    initialData?: AdInfoState;
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
}

// Constants
export const STORAGE_KEY = "addProduct_stepFour_data";

// Default state with today's date
export const defaultState: AdInfoState = {
    adTitle: "",
    adDescription: "",
    adStatus: "publish",
    publicationDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
};