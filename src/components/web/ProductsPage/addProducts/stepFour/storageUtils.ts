'use client'
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

/**
 * Resets form data in localStorage
 */
export const resetStorageState = (): void => {
    try {
        if (typeof window !== 'undefined') {
            localStorage.removeItem(STORAGE_KEY);
            console.log(`Storage key ${STORAGE_KEY} has been removed`);
        }
    } catch (e) {
        console.error("Failed to reset storage state:", e);
    }
};

/**
 * Clear all form data from localStorage
 */
export const clearAllFormData = (): void => {
    try {
        if (typeof window !== 'undefined') {
            // Keys to clear - make sure this covers ALL possible keys
            const keysToRemove = [
                // 'addProduct_stepOne_selections',
                // 'addProduct_stepTwo_data',
                // 'addProduct_stepThree_data',
                'addProduct_stepFour_data',
            ];
            
            // Remove all keys
            keysToRemove.forEach(key => {
                try {
                    localStorage.removeItem(key);
                    console.log(`Removed ${key} from localStorage`);
                } catch (err) {
                    console.error(`Error removing ${key}:`, err);
                }
            });
            
            // Verify removal
            keysToRemove.forEach(key => {
                const check = localStorage.getItem(key);
                if (check) {
                    console.warn(`Warning: Failed to remove ${key} from localStorage, value:`, check);
                }
            });
        }
    } catch (e) {
        console.error("Failed to clear all form data:", e);
    }
};