// storageUtils.ts
import { STORAGE_KEY, SelectedOptions, defaultOptions } from "./types";

/**
 * Loads saved form data from localStorage
 */
export const loadSelections = (): SelectedOptions => {
    try {
        if (typeof window === 'undefined') {
            return defaultOptions;
        }
        
        const savedSelections = localStorage.getItem(STORAGE_KEY);
        if (savedSelections) {
            return JSON.parse(savedSelections);
        }
        
        return defaultOptions;
    } catch (e) {
        console.error("Failed to load saved selections:", e);
        return defaultOptions;
    }
};

/**
 * Saves form data to localStorage
 */
export const saveSelections = (selections: SelectedOptions): void => {
    try {
       
    } catch (e) {
        console.error("Failed to save selections:", e);
    }
};