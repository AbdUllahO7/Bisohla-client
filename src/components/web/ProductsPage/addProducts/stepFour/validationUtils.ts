// validationUtils.ts
import { AdInfoState } from './types';

/**
 * Validates the entire form
 * @param data - The current AdInfoState
 * @returns boolean indicating if the form is valid
 */
export const validateForm = (data: AdInfoState): boolean => {
    // Required fields validation with minimum length checks
    const isTitleValid = data.adTitle.trim().length >= 3; // Title must be at least 3 characters
    const isDescriptionValid = data.adDescription.trim().length >= 10; // Description must be at least 10 characters
    
    // Status validation
    const isStatusValid = data.adStatus !== "";
    
    // Date validation
    const isDateValid = data.publicationDate !== null;
    
    // Overall form validation
    return isTitleValid && isDescriptionValid && isStatusValid && isDateValid;
};

/**
 * Gets the title error message based on validation rules
 * @param title - The title value
 * @param direction - The text direction (ltr or rtl)
 * @returns The error message or empty string if valid
 */
export const getTitleErrorMessage = (title: string, direction: string): string => {
    if (!title.trim()) {
        return direction === "ltr" ? 'Title is required' : 'العنوان مطلوب';
    } else if (title.trim().length < 3) {
        return direction === "ltr" ? 'Title must be at least 3 characters' : 'يجب أن يكون العنوان 3 أحرف على الأقل';
    }
    return '';
};

/**
 * Gets the description error message based on validation rules
 * @param description - The description value
 * @param direction - The text direction (ltr or rtl)
 * @returns The error message or empty string if valid
 */
export const getDescriptionErrorMessage = (description: string, direction: string): string => {
    if (!description.trim()) {
        return direction === "ltr" ? 'Description is required' : 'الوصف مطلوب';
    } else if (description.trim().length < 10) {
        return direction === "ltr" ? 'Description must be at least 10 characters' : 'يجب أن يكون الوصف 10 أحرف على الأقل';
    }
    return '';
};