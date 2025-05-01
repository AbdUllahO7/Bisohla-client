// types.ts


// Define the prop types for the component
export interface AddProductStepOneProps {
    onValidationChange: (isValid: boolean) => void;
    isEditMode?: boolean;
    initialData?: any; // You can provide a more specific type
}

// Define the options state interface
export interface SelectedOptions {
    marka: string;
    model: string;
    trim: string;
    year: string;
    story: string;
    governorate: string;
    city: string;
    address: string;
    [key: string]: string;

}

// Define the option interface used in SelectableList
export interface Option {
    value: string;
    label: string;
    logoUrl?: string;
}

// Props for SelectableList component
export interface SelectableListProps {
    title: string;
    type: string;
    options: Option[];
    selectedValue: string;
    direction:string ;
    onSelect: (type: string, value: string) => void;
    required?: boolean;
}

// Storage key for localStorage
export const STORAGE_KEY = "addProduct_stepOne_selections";

// Default empty state
export const defaultOptions: SelectedOptions = {
    marka: "",
    model: "",
    trim: "",
    story: "",
    year: "",
    governorate: "",
    city: "",
    address: ""
};