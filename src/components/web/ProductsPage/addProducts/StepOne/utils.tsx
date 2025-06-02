// utils.ts
import { Option, SelectedOptions } from "./types";
import { 
    SyriaGovernorate, 
    SyriaCity,
    SyriaGovernorate_ARABIC_NAMES, 
    SyriaCity_ARABIC_NAMES,
    SyriaGovernorate_TO_CITIES 
} from "@/core/entities/enums/syria.enums";

/**
 * Prepares governorate options with bilingual support
 */
export const getGovernorateOptions = (isArabic: boolean): Option[] => {
    return Object.values(SyriaGovernorate)
        .map(gov => ({
            value: gov,
            label: isArabic 
                ? SyriaGovernorate_ARABIC_NAMES[gov]
                : gov.replace(/-/g, ' ')
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
};;

/**
 * Prepares city options based on selected governorate
 */
export const getCityOptions = (governorate: string, isArabic: boolean): Option[] => {
    if (!governorate) return [];
    
    const selectedGov = governorate as SyriaGovernorate;
    return SyriaGovernorate_TO_CITIES[selectedGov]
        .map(city => ({
            value: city,
            label: isArabic
                ? SyriaCity_ARABIC_NAMES[city]
                : city.replace(/-/g, ' ')
        }))
        .sort((a, b) => a.label.localeCompare(b.label));
};

/**
 * Prepares year options
 */
export const getYearOptions = (t: (key: string) => string): Option[] => {
    const currentYear = new Date().getFullYear();
    const years: number[] = [];
    
    // Generate years from current year down to 1970 (in descending order)
    for (let year = currentYear; year >= 1980; year--) {
        years.push(year);
    }
    
    return years.map(year => ({
        value: year.toString(),
        label: year.toString()
    }));
};

/**
 * Validates if the form is completely filled
 */export const validateForm = (selectedOptions: SelectedOptions): boolean => {
    return Boolean(
        selectedOptions.marka && 
        selectedOptions.model && 
        selectedOptions.trim && 
        selectedOptions.year &&
        selectedOptions.governorate &&
        selectedOptions.city &&
        selectedOptions.address
    );
};