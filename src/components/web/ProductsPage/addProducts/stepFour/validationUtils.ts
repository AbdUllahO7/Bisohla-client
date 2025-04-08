// validationUtils.ts - Fixed validation to match all fields
import { ListingType } from '@/core/entities/enums/cars.enums';
import { AdInfoState } from './types';

export const getTitleErrorMessage = (title: string, direction: string): string => {
    if (!title.trim()) {
        return direction === 'ltr' ? 'Title is required' : 'العنوان مطلوب';
    }
    if (title.trim().length < 3) {
        return direction === 'ltr' ? 'Title must be at least 3 characters' : 'يجب أن يكون العنوان 3 أحرف على الأقل';
    }
    return '';
};

export const getDescriptionErrorMessage = (description: string, direction: string): string => {
    if (!description.trim()) {
        return direction === 'ltr' ? 'Description is required' : 'الوصف مطلوب';
    }
    if (description.trim().length < 10) {
        return direction === 'ltr' ? 'Description must be at least 10 characters' : 'يجب أن يكون الوصف 10 أحرف على الأقل';
    }
    return '';
};

export const validateForm = (formData: AdInfoState): boolean => {
    // Log the entire form data to debug
    console.log("Validating form data:", formData);
    
    // Basic validation
    const isTitleValid = formData.adTitle.trim().length >= 3;
    const isDescriptionValid = formData.adDescription.trim().length >= 10;
    const isDateValid = formData.publicationDate !== null;
    
    // Listing type validation
    const isListingTypeValid = formData.listingType !== '';
    
    // Rent type validation (only needed if listing type is FOR_RENT)
    const isRentTypeValid = 
        formData.listingType !== ListingType.FOR_RENT || 
        (formData.listingType === ListingType.FOR_RENT && formData.rentType !== '');
    
    // Log each validation check result
    console.log("Validation checks:", {
        isTitleValid,
        isDescriptionValid,
        isDateValid,
        isListingTypeValid,
        isRentTypeValid,
        title: formData.adTitle,
        description: formData.adDescription,
        date: formData.publicationDate,
        listingType: formData.listingType,
        rentType: formData.rentType
    });
    
    // Combined validation result
    const isValid = isTitleValid && 
                   isDescriptionValid && 
                   isDateValid && 
                   isListingTypeValid && 
                   isRentTypeValid;
                   
    console.log("Final validation result:", isValid);
    
    return isValid;
};