// hooks/useLocalStorage.ts
import { useState, useEffect } from 'react';

// Base storage keys
export const STORAGE_KEYS = {
  STEP_ONE: 'addProduct_stepOne_selections',
  STEP_TWO: 'addProduct_stepTwo_data',
  STEP_THREE: 'addProduct_stepThree_data',
  STEP_FOUR: 'addProduct_stepFour_data',
  EDIT_MODE_FLAG: 'edit_car_listing_id'
};

// Create edit mode versions of the keys by adding "_edit" suffix
export const EDIT_STORAGE_KEYS = Object.entries(STORAGE_KEYS).reduce((acc, [key, value]) => {
  if (key !== 'EDIT_MODE_FLAG') {
    acc[key as keyof typeof STORAGE_KEYS] = `${value}_edit`;
  } else {
    acc[key as keyof typeof STORAGE_KEYS] = value;
  }
  return acc;
}, {} as Record<keyof typeof STORAGE_KEYS, string>);

// Helper function to get the appropriate storage key based on edit mode
export const getStorageKey = (baseKey: keyof typeof STORAGE_KEYS, isEditMode: boolean): string => {
  return isEditMode ? EDIT_STORAGE_KEYS[baseKey] : STORAGE_KEYS[baseKey];
};

// Helper function to clear all form data
export const clearFormData = (includeEditData: boolean = true): void => {
  // Clear regular keys
  Object.values(STORAGE_KEYS).forEach(key => {
    localStorage.removeItem(key);
  });
  
  // Optionally clear edit mode keys
  if (includeEditData) {
    Object.values(EDIT_STORAGE_KEYS)
      .filter(key => key !== EDIT_STORAGE_KEYS.EDIT_MODE_FLAG) // Don't remove the edit mode flag yet
      .forEach(key => {
        localStorage.removeItem(key);
      });
  }
};

// Custom hook for localStorage with edit mode awareness
export function useLocalStorageWithEditMode<T>(
  key: keyof typeof STORAGE_KEYS,
  initialValue: T
): [T, (value: T) => void, boolean] {
  // Check if we're in edit mode
  const [isEditMode, setIsEditMode] = useState<boolean>(false);
  
  // Determine which key to use based on edit mode
  const storageKey = getStorageKey(key, isEditMode);
  
  // Initialize state with value from localStorage or initialValue
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      // Get the value from localStorage
      const item = localStorage.getItem(storageKey);
      
      // Parse and return the item if it exists
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${storageKey}":`, error);
      return initialValue;
    }
  });

  // Check if we're in edit mode when the component mounts
  useEffect(() => {
    const editModeId = localStorage.getItem(STORAGE_KEYS.EDIT_MODE_FLAG);
    setIsEditMode(!!editModeId);
  }, []);
  
  // Update localStorage when the state changes
  const setValue = (value: T): void => {
    try {
      // Save to state
      setStoredValue(value);
      
      // Save to localStorage using the appropriate key
      localStorage.setItem(storageKey, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${storageKey}":`, error);
    }
  };
  
  return [storedValue, setValue, isEditMode];
}

// Function to get all form data regardless of edit mode
export const getAllFormData = (
  isEditMode: boolean = false
): { stepOne: any; stepTwo: any; stepThree: any; stepFour: any; } | null => {
  try {
    // Get data using the appropriate keys
    const stepOneKey = getStorageKey('STEP_ONE', isEditMode);
    const stepTwoKey = getStorageKey('STEP_TWO', isEditMode);
    const stepThreeKey = getStorageKey('STEP_THREE', isEditMode);
    const stepFourKey = getStorageKey('STEP_FOUR', isEditMode);
    
    // Get the data from localStorage
    const data1 = localStorage.getItem(stepOneKey);
    const data2 = localStorage.getItem(stepTwoKey);
    const data3 = localStorage.getItem(stepThreeKey);
    const data4 = localStorage.getItem(stepFourKey);
    
    // Check if we have all required data
    if (!data1 || !data2 || !data3 || !data4) {
      console.error('Missing required data in localStorage', {
        stepOne: !!data1,
        stepTwo: !!data2,
        stepThree: !!data3,
        stepFour: !!data4
      });
      return null;
    }
    
    // Parse and return the data
    return {
      stepOne: JSON.parse(data1),
      stepTwo: JSON.parse(data2),
      stepThree: JSON.parse(data3),
      stepFour: JSON.parse(data4)
    };
  } catch (error) {
    console.error('Error getting form data:', error);
    return null;
  }
};