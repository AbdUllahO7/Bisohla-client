import { ListingType } from "@/core/entities/enums/cars.enums"
import { AdInformationFormData } from "./schema"

// Storage key for ad information
export const AD_INFO_STORAGE_KEY = "addProduct_stepFour_data"

// Default values for the form
export const defaultAdInfoData: AdInformationFormData = {
    title: "",
    description: "",
    contactNumber: "",
    listingType: ListingType.FOR_SALE,
    rentType: null,
    publicationDate: new Date(),
}

/**
 * Loads saved ad information data from localStorage
 */
export const loadAdInfoData = (): AdInformationFormData => {
    try {
        if (typeof window === "undefined") {
            return defaultAdInfoData
        }

        const savedData = localStorage.getItem(AD_INFO_STORAGE_KEY)
        if (savedData) {
            const parsedData = JSON.parse(savedData)

            // Convert string date back to Date object
            if (parsedData.publicationDate) {
                parsedData.publicationDate = new Date(parsedData.publicationDate)
            }

            return parsedData
        }

        return defaultAdInfoData
    } catch (e) {
        console.error("Failed to load saved ad information:", e)
        return defaultAdInfoData
    }
}

/**
 * Saves ad information data to localStorage
 */
export const saveAdInfoData = (data: AdInformationFormData): void => {
    try {
        if (typeof window !== "undefined") {
            localStorage.setItem(AD_INFO_STORAGE_KEY, JSON.stringify(data))
            console.log("Ad information saved automatically:", data)
        }
    } catch (e) {
        console.error("Failed to save ad information:", e)
    }
}

/**
 * Automatically saves form data as it changes
 * @param data Current form data
 * @param previousData Previous form data for comparison (optional)
 */
export const autoSaveAdInfoData = (
    data: Partial<AdInformationFormData>, 
    previousData?: Partial<AdInformationFormData>
): void => {
    // Don't save if the data hasn't changed
    if (previousData && 
        JSON.stringify(data) === JSON.stringify(previousData)) {
        return
    }
    
    try {
        if (typeof window !== "undefined") {
            // Get existing data first so we don't overwrite fields not in the partial data
            const existingData = loadAdInfoData()
            // Merge the existing data with new changes
            const mergedData = { ...existingData, ...data }
            localStorage.setItem(AD_INFO_STORAGE_KEY, JSON.stringify(mergedData))
            console.log("Ad information auto-saved:", mergedData)
        }
    } catch (e) {
        console.error("Failed to auto-save ad information:", e)
    }
}