'use client'
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useLocale } from 'next-intl';
import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePickerForm } from '@/components/DatePicke';

// Type definitions
interface AddProductStepFourProps {
    onValidationChange: (isValid: boolean) => void;
    initialData?: AdInfoState;
}

interface AdInfoState {
    adTitle: string;
    adDescription: string;
    adStatus: string;
    publicationDate: string | null;
}

// Storage key for localStorage
const STORAGE_KEY = "addProduct_stepFour_data";

// Default state with today's date
const defaultState: AdInfoState = {
    adTitle: "",
    adDescription: "",
    adStatus: "publish",
    publicationDate: new Date().toISOString().split('T')[0], // Format: YYYY-MM-DD
};

const AddProductStepFour: React.FC<AddProductStepFourProps> = ({ 
    onValidationChange,
    initialData 
}) => {
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    
    // State
    const [isClient, setIsClient] = useState(false);
    
    // Initialize with current date if no data provided
    const [adInfo, setAdInfo] = useState<AdInfoState>(() => {
        const today = new Date().toISOString().split('T')[0];
        
        // If initialData is provided, use it but ensure it has a publication date
        if (initialData) {
            return {
                ...initialData,
                publicationDate: initialData.publicationDate || today
            };
        }
        
        // Otherwise use default state with today's date
        return {
            ...defaultState,
            publicationDate: today
        };
    });
    
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
        adTitle: !!adInfo.adTitle,
        adDescription: !!adInfo.adDescription,
        adStatus: !!adInfo.adStatus,
        publicationDate: !!adInfo.publicationDate
    });
    
    // Use ref to track previous validation state to prevent unnecessary updates
    const prevValidState = useRef<boolean | null>(null);
    const formInitialized = useRef(false);

    // Debug refs to track validation issues
    const validationDebugRef = useRef({
        lastCheck: Date.now(),
        isTitleValid: false,
        isDescriptionValid: false,
        isStatusValid: false,
        isDateValid: false,
        overall: false
    });

    // Scroll to top on mount
    useEffect(() => {
        window.scrollTo(0, 0);
        setIsClient(true);
    }, []);

    // Load data from localStorage on client-side
    useEffect(() => {
        if (isClient && !formInitialized.current) {
            try {
                const savedData = localStorage.getItem(STORAGE_KEY);
                if (savedData) {
                    const parsed = JSON.parse(savedData);
                    
                    // Ensure publication date is set to today if null
                    if (!parsed.publicationDate) {
                        parsed.publicationDate = new Date().toISOString().split('T')[0];
                    }
                    
                    setAdInfo(parsed);
                    
                    // Consider all fields as touched if we load saved data
                    setTouchedFields({
                        adTitle: true,
                        adDescription: true,
                        adStatus: true,
                        publicationDate: true
                    });
                }
                
                // Force validation on initial load
                setTimeout(() => {
                    validateForm(adInfo);
                }, 100);
                
                formInitialized.current = true;
            } catch (e) {
                console.error("Failed to parse saved data:", e);
            }
        }
    }, [isClient]);

    // Save to localStorage
    useEffect(() => {
        if (isClient && formInitialized.current) {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(adInfo));
        }
    }, [adInfo, isClient]);

    // Field change handlers
    const handleTextChange = useCallback((field: keyof AdInfoState, value: string) => {
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
        setAdInfo((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleStatusChange = useCallback((value: string) => {
        setTouchedFields((prev) => ({ ...prev, adStatus: true }));
        setAdInfo((prev) => ({ ...prev, adStatus: value }));
    }, []);

    // This will be called by DatePickerForm somehow, 
    // but we don't directly pass it as a prop since the component doesn't accept it
    const handleDateChange = useCallback((date: string | null) => {
        console.log("Date changed to:", date);
        setTouchedFields((prev) => ({ ...prev, publicationDate: true }));
        setAdInfo((prev) => ({ ...prev, publicationDate: date }));
    }, []);

    // Listen for any custom events that might be emitted by DatePickerForm
    useEffect(() => {
        // In case the DatePickerForm uses custom events to communicate date changes
        const handleDatePickerEvent = (event: CustomEvent) => {
            if (event.detail && event.detail.date) {
                handleDateChange(event.detail.date);
            }
        };
        
        window.addEventListener('datepicker:change' as any, handleDatePickerEvent as EventListener);
        
        return () => {
            window.removeEventListener('datepicker:change' as any, handleDatePickerEvent as EventListener);
        };
    }, [handleDateChange]);

    // Validation function with minimum character checks
    const validateForm = useCallback((data: AdInfoState) => {
        // Required fields validation with minimum length checks
        const isTitleValid = data.adTitle.trim().length >= 3; // Title must be at least 3 characters
        const isDescriptionValid = data.adDescription.trim().length >= 10; // Description must be at least 10 characters
        
        // Status validation
        const isStatusValid = data.adStatus !== "";
        
        // Date validation
        const isDateValid = data.publicationDate !== null;
        
        // Overall form validation
        const isValid = isTitleValid && isDescriptionValid && isStatusValid && isDateValid;
        
        // Store validation debug info
        validationDebugRef.current = {
            lastCheck: Date.now(),
            isTitleValid,
            isDescriptionValid,
            isStatusValid,
            isDateValid,
            overall: isValid
        };
        
        
        return isValid;
    }, []);

    // Validation effect
    useEffect(() => {
        const isValid = validateForm(adInfo);
        
        // Only call onValidationChange if validation state changed
        if (isValid !== prevValidState.current) {
            prevValidState.current = isValid;
            onValidationChange(isValid);
            
            console.log("Validation state changed to:", isValid);
        }
    }, [adInfo, onValidationChange, validateForm]);

    // Force validation after component mounts
    useEffect(() => {
        if (isClient) {
            const isValid = validateForm(adInfo);
            if (isValid !== prevValidState.current) {
                prevValidState.current = isValid;
                onValidationChange(isValid);
                console.log("Initial validation state:", isValid);
            }
        }
    }, [isClient, adInfo, validateForm, onValidationChange]);

    // Use this approach in development to see what props DatePickerForm actually accepts
    useEffect(() => {
        if (process.env.NODE_ENV === 'development') {
            try {
                // @ts-ignore - Just for debugging purposes
                console.log("DatePickerForm component:", DatePickerForm);
            } catch (e) {
                // Silently fail
            }
        }
    }, []);

    // Helper function to get the correct validation message
    const getTitleErrorMessage = () => {
        if (!adInfo.adTitle.trim()) {
            return direction === "ltr" ? 'Title is required' : 'العنوان مطلوب';
        } else if (adInfo.adTitle.trim().length < 3) {
            return direction === "ltr" ? 'Title must be at least 3 characters' : 'يجب أن يكون العنوان 3 أحرف على الأقل';
        }
        return '';
    };

    const getDescriptionErrorMessage = () => {
        if (!adInfo.adDescription.trim()) {
            return direction === "ltr" ? 'Description is required' : 'الوصف مطلوب';
        } else if (adInfo.adDescription.trim().length < 10) {
            return direction === "ltr" ? 'Description must be at least 10 characters' : 'يجب أن يكون الوصف 10 أحرف على الأقل';
        }
        return '';
    };

    return (
        <Box className="w-full bg-white rounded-lg pb-10" variant="column" dir={direction}>
            {/* Header */}
            <Box className="bg-gray-100 px-4 py-4 md:px-5 md:py-5 w-full flex justify-center">
                <Text className="font-bold text-primary text-lg md:text-xl">
                    {direction === "ltr" ? "Ad Information" : "معلومات الإعلان"}
                </Text>
            </Box>

            

            {/* Main Content */}
            <Box variant="column" className='flex-col md:flex-row justify-center items-center w-full pt-6 md:pt-10 gap-6 md:gap-10 px-4 md:px-4'>
                {/* Left Section - Form Fields */}
                <Box className='w-full md:w-[700px] justify-start items-start gap-4 md:gap-8' variant="column">
                    {/* Ad Title */}
                    <Box variant="column" className='w-full items-start'>
                        <Label htmlFor="adTitle">
                            {direction === "ltr" ? 'Ad Title' : 'عنوان الإعلان'} 
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            type="text" 
                            id="adTitle" 
                            placeholder={direction === "ltr" ? 'Ad Title (min 3 characters)' : 'عنوان الإعلان (3 أحرف على الأقل)'} 
                            className='w-full'
                            value={adInfo.adTitle}
                            onChange={(e) => handleTextChange('adTitle', e.target.value)}
                            onBlur={() => setTouchedFields(prev => ({ ...prev, adTitle: true }))}
                        />
                        {touchedFields.adTitle && getTitleErrorMessage() && (
                            <Text className="text-red-500 text-sm mt-1">
                                {getTitleErrorMessage()}
                            </Text>
                        )}
                    </Box>

                    {/* Ad Description */}
                    <Box variant="column" className='w-full items-start'>
                        <Label htmlFor="adDescription">
                            {direction === "ltr" ? 'Ad Description' : 'وصف الإعلان'}
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input 
                            type="text" 
                            id="adDescription" 
                            placeholder={direction === "ltr" ? 'Ad Description (min 10 characters)' : 'وصف الإعلان (10 أحرف على الأقل)'} 
                            className='w-full'
                            value={adInfo.adDescription}
                            onChange={(e) => handleTextChange('adDescription', e.target.value)}
                            onBlur={() => setTouchedFields(prev => ({ ...prev, adDescription: true }))}
                        />
                        {touchedFields.adDescription && getDescriptionErrorMessage() && (
                            <Text className="text-red-500 text-sm mt-1">
                                {getDescriptionErrorMessage()}
                            </Text>
                        )}
                    </Box>
                </Box>

                {/* Right Section - Status & Calendar */}
                <Box variant="column" className='w-full md:w-auto border border-gray-100 p-4 md:p-5 gap-4 md:gap-8 rounded-lg items-start'>
                    {/* Status Select */}
                    <Box variant="column" className='w-full items-start'>
                        <Text className='font-bold text-primary mb-2 md:mb-3'>
                            {direction === 'ltr' ? 'Ad Status' : 'حالة الإعلان'}
                        </Text>
                        <Box variant="column" className='w-full items-start'>
                            <Label htmlFor="statusSelect">
                                {direction === "ltr" ? 'Status' : 'الحالة'}
                                <span className="text-red-500">*</span>
                            </Label>
                            <Select 
                                value={adInfo.adStatus}
                                onValueChange={handleStatusChange}
                                defaultValue="publish"
                            >
                                <SelectTrigger className="w-full md:w-[180px]" id="statusSelect">
                                    <SelectValue placeholder={direction === "ltr" ? 'Select status' : 'اختر الحالة'} />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectGroup>
                                        <SelectItem value="publish">{direction === "ltr" ? 'Publish' : 'نشر'}</SelectItem>
                                        <SelectItem value="draft">{direction === "ltr" ? 'Draft' : 'مسودة'}</SelectItem>
                                        <SelectItem value="archived">{direction === "ltr" ? 'Archived' : 'مؤرشف'}</SelectItem>
                                    </SelectGroup>
                                </SelectContent>
                            </Select>   
                        </Box>
                    </Box>

                    {/* Publication Date - pass only the props that DatePickerForm accepts */}
                    <Box className="w-full overflow-x-auto pb-2">
                        <DatePickerForm 
                            title={direction === "ltr" ? 'Publication date': 'تاريخ النشر'} 
                            placeHolder={direction === "ltr" ? 'Pick a date ' : 'اختر تاريخا'}
                            // Remove value and onChange props as they're not accepted
                        />
                        {touchedFields.publicationDate && !adInfo.publicationDate && (
                            <Text className="text-red-500 text-sm mt-1">
                                {direction === "ltr" ? 'Publication date is required' : 'تاريخ النشر مطلوب'}
                            </Text>
                        )}
                        
                       
                    </Box>
                </Box>
            </Box>
            
            {/* Hidden input to store the date value for form submission */}
            <input
                type="hidden"
                name="publicationDate"
                value={adInfo.publicationDate || ''}
            />
        </Box>
    );
};

export default AddProductStepFour;