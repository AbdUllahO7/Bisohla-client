'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { AddProductStepFourProps, AdInfoState } from '../stepFour/types';
import { getInitialState, loadFormData, saveFormData } from '../stepFour/storageUtils';
import { getDescriptionErrorMessage, getTitleErrorMessage, validateForm } from '../stepFour/validationUtils';
import FormField from '../stepFour/FormField';
import StatusSelect from '../stepFour/StatusSelect';
import PublicationDate from '../stepFour/PublicationDate';



// Main component
const AddProductStepFour: React.FC<AddProductStepFourProps> = ({ 
    onValidationChange,
    initialData 
}) => {
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    
    // State
    const [isClient, setIsClient] = useState(false);
    const [adInfo, setAdInfo] = useState<AdInfoState>(() => getInitialState(initialData));
    const [touchedFields, setTouchedFields] = useState<Record<string, boolean>>({
        adTitle: !!adInfo.adTitle,
        adDescription: !!adInfo.adDescription,
        adStatus: !!adInfo.adStatus,
        publicationDate: !!adInfo.publicationDate
    });
    
    // Refs
    const prevValidState = useRef<boolean | null>(null);
    const formInitialized = useRef(false);
    
    // Debug refs
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
            const savedData = loadFormData();
            setAdInfo(savedData);
            
            // Consider all fields as touched if we load saved data
            if (savedData.adTitle || savedData.adDescription || savedData.adStatus) {
                setTouchedFields({
                    adTitle: true,
                    adDescription: true,
                    adStatus: true,
                    publicationDate: true
                });
            }
            
            // Force validation on initial load
            setTimeout(() => {
                const isValid = validateForm(savedData);
                if (isValid !== prevValidState.current) {
                    prevValidState.current = isValid;
                    onValidationChange(isValid);
                }
            }, 100);
            
            formInitialized.current = true;
        }
    }, [isClient, onValidationChange]);

    // Save to localStorage when form state changes
    useEffect(() => {
        if (isClient && formInitialized.current) {
            saveFormData(adInfo);
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

    const handleDateChange = useCallback((date: string | null) => {
        console.log("Date changed to:", date);
        setTouchedFields((prev) => ({ ...prev, publicationDate: true }));
        setAdInfo((prev) => ({ ...prev, publicationDate: date }));
    }, []);

    // Validation effect
    useEffect(() => {
        const isValid = validateForm(adInfo);
        
        // Only call onValidationChange if validation state changed
        if (isValid !== prevValidState.current) {
            prevValidState.current = isValid;
            onValidationChange(isValid);
            console.log("Validation state changed to:", isValid);
            
            // Update validation debug info
            validationDebugRef.current = {
                lastCheck: Date.now(),
                isTitleValid: adInfo.adTitle.trim().length >= 3,
                isDescriptionValid: adInfo.adDescription.trim().length >= 10,
                isStatusValid: adInfo.adStatus !== "",
                isDateValid: adInfo.publicationDate !== null,
                overall: isValid
            };
        }
    }, [adInfo, onValidationChange]);

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
                    <FormField 
                        label={direction === "ltr" ? 'Ad Title' : 'عنوان الإعلان'}
                        id="adTitle"
                        placeholder={direction === "ltr" ? 'Ad Title (min 3 characters)' : 'عنوان الإعلان (3 أحرف على الأقل)'}
                        value={adInfo.adTitle}
                        onChange={(value) => handleTextChange('adTitle', value)}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, adTitle: true }))}
                        errorMessage={touchedFields.adTitle ? getTitleErrorMessage(adInfo.adTitle, direction) : ''}
                        required={true}
                    />

                    {/* Ad Description */}
                    <FormField 
                        label={direction === "ltr" ? 'Ad Description' : 'وصف الإعلان'}
                        id="adDescription"
                        placeholder={direction === "ltr" ? 'Ad Description (min 10 characters)' : 'وصف الإعلان (10 أحرف على الأقل)'}
                        value={adInfo.adDescription}
                        onChange={(value) => handleTextChange('adDescription', value)}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, adDescription: true }))}
                        errorMessage={touchedFields.adDescription ? getDescriptionErrorMessage(adInfo.adDescription, direction) : ''}
                        required={true}
                    />
                </Box>

                {/* Right Section - Status & Calendar */}
                <Box variant="column" className='w-full md:w-auto border border-gray-100 p-4 md:p-5 gap-4 md:gap-8 rounded-lg items-start'>
                    {/* Status Select */}
                    <Box variant="column" className='w-full items-start'>
                        <Text className='font-bold text-primary mb-2 md:mb-3'>
                            {direction === 'ltr' ? 'Ad Status' : 'حالة الإعلان'}
                        </Text>
                        <StatusSelect 
                            value={adInfo.adStatus}
                            onChange={handleStatusChange}
                            direction={direction}
                        />
                    </Box>

                    {/* Publication Date */}
                    <PublicationDate 
                        direction={direction}
                        onDateChange={handleDateChange}
                        showError={touchedFields.publicationDate && !adInfo.publicationDate}
                    />
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