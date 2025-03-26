// storageUtils.ts
import { AdInfoState, STORAGE_KEY, defaultState } from './types';

/**
 * Loads saved form data from localStorage
 * @returns The saved AdInfoState or default state if none exists
 */
export const loadFormData = (): AdInfoState => {
    try {
        if (typeof window === 'undefined') {
            return getInitialState();
        }
        
        const savedData = localStorage.getItem(STORAGE_KEY);
        if (savedData) {
            const parsed = JSON.parse(savedData);
            
            // Ensure publication date is set to today if null
            if (!parsed.publicationDate) {
                parsed.publicationDate = new Date().toISOString().split('T')[0];
            }
            
            return parsed;
        }
        
        return getInitialState();
    } catch (e) {
        console.error("Failed to parse saved data:", e);
        return getInitialState();
    }
};

/**
 * Saves form data to localStorage
 * @param data - The current AdInfoState to save
 */
export const saveFormData = (data: AdInfoState): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
        }
    } catch (e) {
        console.error("Failed to save data:", e);
    }
};

/**
 * Gets the initial state with today's date
 * @param initialData - Optional initial data to merge with defaults
 * @returns The initial AdInfoState
 */
export const getInitialState = (initialData?: Partial<AdInfoState>): AdInfoState => {
    const today = new Date().toISOString().split('T')[0];
    
    if (initialData) {
        return {
            ...defaultState,
            ...initialData,
            publicationDate: initialData.publicationDate || today
        };
    }
    
    return {
        ...defaultState,
        publicationDate: today
    };
};