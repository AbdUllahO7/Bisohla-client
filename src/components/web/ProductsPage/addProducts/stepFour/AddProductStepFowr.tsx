'use client'
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useLocale } from 'next-intl';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { AddProductStepFourProps, AdInfoState } from './types';
import { getInitialState, loadFormData, saveFormData } from './storageUtils';
import { 
    getContactErrorMessage, 
    getDescriptionErrorMessage, 
    getTitleErrorMessage, 
    validateForm,
    getPublicationDateErrorMessage 
} from './validationUtils';
import FormField from './FormField';
import PublicationDate from './PublicationDate';
import { ListingType, RentType } from '@/core/entities/enums/cars.enums';
import ProductTypeSelect from './ProductTypeSelect';

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
        contactNumber: !!adInfo.contactNumber,
        listingType: !!adInfo.listingType,
        rentType: !!adInfo.rentType,
        publicationDate: !!adInfo.publicationDate
    });
    
    // Refs
    const prevValidState = useRef<boolean | null>(null);
    const formInitialized = useRef(false);
    
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
            if (savedData.adTitle || savedData.adDescription || savedData.listingType || savedData.publicationDate) {
                setTouchedFields({
                    adTitle: true,
                    adDescription: true,
                    contactNumber: true,
                    listingType: true,
                    rentType: true,
                    publicationDate: true
                });
            }
            
            // Force validation on initial load
            setTimeout(() => {
                const isValid = validateForm(savedData);
                console.log("Initial validation result:", isValid, savedData);
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
            
            // Force a validation check when form data changes
            const isValid = validateForm(adInfo);
            if (isValid !== prevValidState.current) {
                prevValidState.current = isValid;
                onValidationChange(isValid);
                console.log("Validation state changed to:", isValid);
            }
        }
    }, [adInfo, isClient, onValidationChange]);

    // Field change handlers
    const handleTextChange = useCallback((field: keyof AdInfoState, value: string) => {
        console.log(`Field ${field} changed to:`, value);
        setTouchedFields((prev) => ({ ...prev, [field]: true }));
        setAdInfo((prev) => ({ ...prev, [field]: value }));
    }, []);

    const handleDateChange = useCallback((date: string | null) => {
        console.log("Date changed to:", date);
        setTouchedFields((prev) => ({ ...prev, publicationDate: true }));
        setAdInfo((prev) => ({ ...prev, publicationDate: date }));
    }, []);
    
    const handleListingTypeChange = useCallback((value: ListingType | '') => {
        console.log("Listing type changed to:", value);
        setTouchedFields((prev) => ({ ...prev, listingType: true }));
        setAdInfo((prev) => ({ ...prev, listingType: value }));
    }, []);
    
    const handleRentTypeChange = useCallback((value: RentType | '') => {
        console.log("Rent type changed to:", value);
        setTouchedFields((prev) => ({ ...prev, rentType: true }));
        setAdInfo((prev) => ({ ...prev, rentType: value }));
    }, []);

    // Debug function to manually trigger validation
    const checkValidation = () => {
        const isValid = validateForm(adInfo);
        onValidationChange(isValid);
        console.log("Manual validation check:", isValid);
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
                    <FormField 
                        label={direction === "ltr" ? 'Contact Number ' : 'رقم الاتصال'}
                        id="contactNumber"
                        placeholder={direction === "ltr" ? 'Contact Number' : 'رقم الاتصال'}
                        value={adInfo.contactNumber}
                        onChange={(value) => handleTextChange('contactNumber', value)}
                        onBlur={() => setTouchedFields(prev => ({ ...prev, contactNumber: true }))}
                        errorMessage={touchedFields.contactNumber ? getContactErrorMessage(adInfo.contactNumber, direction) : ''}
                        required={true}
                    />
                </Box>

                {/* Right Section - Product Type & Calendar */}
                <Box variant="column" className='w-full md:w-auto border border-gray-100 p-4 md:p-5 gap-4 md:gap-8 rounded-lg items-start'>
                    {/* Product Type Select */}
                    <ProductTypeSelect 
                        listingType={adInfo.listingType}
                        rentType={adInfo.rentType}
                        onListingTypeChange={handleListingTypeChange}
                        onRentTypeChange={handleRentTypeChange}
                        direction={direction}
                    />

                    {/* Publication Date */}
                    <PublicationDate 
                        direction={direction}
                        onDateChange={handleDateChange}
                        showError={touchedFields.publicationDate && !adInfo.publicationDate}
                        initialDate={adInfo.publicationDate} 
                    />
                </Box>
            </Box>
            
        </Box>
    );
};

export default AddProductStepFour;