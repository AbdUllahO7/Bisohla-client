'use client'
// storageUtils.ts - Fixed to prevent hydration errors
import { AdInfoState, STORAGE_KEY } from './types';

export const getInitialState = (initialData?: Partial<AdInfoState>): AdInfoState => {
    return {
        adTitle: initialData?.adTitle || '',
        adDescription: initialData?.adDescription || '',
        adStatus: initialData?.adStatus || '',
        publicationDate: initialData?.publicationDate || null,
        listingType: initialData?.listingType || '',
        rentType: initialData?.rentType || '',
    };
};

export const saveFormData = (formData: AdInfoState): void => {
    // Only run on the client
    if (typeof window === 'undefined') return;
    
    try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(formData));
    } catch (error) {
        console.error("Error saving form data to localStorage:", error);
    }
};

export const loadFormData = (): AdInfoState => {
    // Return initial state on the server to prevent hydration mismatch
    if (typeof window === 'undefined') {
        return getInitialState();
    }

    try {
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (!savedData) {
            return getInitialState();
        }

        const parsedData = JSON.parse(savedData) as Partial<AdInfoState>;
        
        // Ensure we return a complete object with all expected properties
        return {
            adTitle: parsedData.adTitle || '',
            adDescription: parsedData.adDescription || '',
            adStatus: parsedData.adStatus || '',
            publicationDate: parsedData.publicationDate || null,
            listingType: parsedData.listingType || '',
            rentType: parsedData.rentType || '',
        };
    } catch (e) {
        console.error('Error parsing saved form data:', e);
        return getInitialState();
    }
};