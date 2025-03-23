'use client'
import Box from '@/components/box/box'
import React, { useState, useCallback, useEffect } from 'react'
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import AddProductStepOne from './AddProductStepOne';
import { StepContent } from './StepContent';
import { StepTrigger } from './StepTrigger';
import AddProductStepThree from './AddProductStepThree';
import AddProductStepFour from './AddProductStepFowr';
import { useRouter } from 'next/navigation';
import AddProductStepTwo from './AddProductStepTwo';
import { createCarListing } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
// Import the Currency enum from your project
import { Currency } from '@/core/entities/enums/currency.enum'; // Adjust the import path as needed
import { CarDetails, CarImage, CarListingFeature, SelectCarListingDto, SelectCarMakeDto, SelectCarModelDto, SelectCarTrimDto } from '@/core/entities/models/cars/cars.dto';
import { SelectUserDto } from '@/core/entities/models/users/users.dto';
import { SyriaCity, SyriaGovernorate } from '@/core/entities/enums/syria.enums';
import { BodyType, FuelType, Transmission } from '@/core/entities/enums/cars.enums';
import ErrorDialog from './Dialogs/ErrorDialog';
import SuccessDialog from './Dialogs/SuccessDialogProps';

// Type definitions
interface SectionStatus {
    [key: string]: boolean;
}

interface StepOneData {
    marka: string;
    model: string;
    year: string;
    trim: string;
    governorate : string,
    city : string,
    address : string,
}

interface StepTwoData {
    currency: string;
    price: string | number;
    colorExterior: string;  
    colorInterior: string;  
    fuelType: string;
    bodyType: string;
    transmission: string;
    doors: string | number;
    plateNumber: string | number;
    mileage: string | number;
    enginePower: string | number; 
    engineSize: string | number;
    vin: string | number;
    selectedFeatures: Array<{
        id: number;
        carListingId: number;
        featureId: string;
        feature?: {
            id: number;
            name: string;
            category: string;
            icon: string | null;
            createdAt: Date | string;
            updatedAt: Date | string;
            deletedAt: Date | string | null;
        }
    }>;
}

interface StepThreeData {
    coverImage: string[];
    carImages: CarImage;
    additionalImages: string[];
    documents: string[];
    governorate: SyriaGovernorate;
    city: SyriaCity;
    address: string;
    sectionStatus: SectionStatus;
}

interface StepFourData {
    adTitle: string;
    adDescription: string;
}

// Update CarListingDTO to use Currency enum type
interface CarListingDTO {
    id: number;
    title: string;
    description: string;
    price: number | number | null;
    currency: Currency;
    userId: number;
    user?: SelectUserDto; // TODO: maybe change this type
    makeId: number;
    modelId: number;
    trimId: number | null;
    status: string;
    isFeatured: boolean;
    isSold: boolean;

    // location
    governorate: SyriaGovernorate;
    city: SyriaCity;
    address: string;

    createdAt: string | Date;
    updatedAt: string | Date;
    deletedAt?: string | Date | null;

    // Related entities
    details: CarDetails;
    features: CarListingFeature[];
    images: CarImage[];
    make: SelectCarMakeDto;
    model: SelectCarModelDto;
    trim?: SelectCarTrimDto;
}

const Steps = () => {
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    const router = useRouter(); 
    const isArabic = direction === 'rtl';

    // Dialog states
    const [showSuccessDialog, setShowSuccessDialog] = useState(false);
    const [showErrorDialog, setShowErrorDialog] = useState(false);
    const [errorMessage, setErrorMessage] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    
    const steps = ['productType', 'location', 'productInfo', 'adsInfo'];
    // Ensure currentStep is always a string, not an array
    const [currentStep, setCurrentStep] = useState<string>(steps[0]);

    // Add state to track validation for each step
    const [stepValidation, setStepValidation] = useState({
        productType: false,
        location: false,
        productInfo: true,
        adsInfo: true
    });

    // State to track if validation is attempted
    const [validationAttempted, setValidationAttempted] = useState({
        productType: false,
        location: false,
        productInfo: false,
        adsInfo: false
    });

    // Add state to store form data from all steps
    const [formData, setFormData] = useState({
        productType: {},
        location: {},
        productInfo: {},
        adsInfo: {}
    });

    const handleNext = () => {
        const currentIndex = steps.indexOf(currentStep);
        const currentStepName = steps[currentIndex];
        
        // Mark current step validation as attempted
        setValidationAttempted(prev => ({
            ...prev,
            [currentStepName]: true
        }));
        
        // Only proceed if step is valid
        if (stepValidation[currentStepName as keyof typeof stepValidation]) {
            // Check if it's the last step
            if (currentIndex === steps.length - 1) {
                // This is the last step, handle submission or redirection
                handleFinalSubmission();
            } else {
                // Move to the next step
                setCurrentStep(steps[currentIndex + 1]);
            }
        }
    };

    // Handle the try again action for error dialog
    const handleTryAgain = () => {
        setShowErrorDialog(false);
        setErrorMessage('');
        // You could retry submission here if needed
    };

    // Format error message for display
    const formatErrorMessage = (error: any): string => {
        if (typeof error === 'string') return error;
        
        if (error.message) {
            return error.message;
        }
        
        if (error.status && error.path) {
            return `Error ${error.status}: ${error.message || 'An error occurred'} (${error.path})`;
        }
        
        return JSON.stringify(error, null, 2);
    };

    // Updated handleFinalSubmission function with error handling
    const handleFinalSubmission = async () => {
        try {
            setIsSubmitting(true);
            // Get all form data from localStorage
            const data1 = localStorage.getItem('addProduct_stepOne_selections');
            const data2 = localStorage.getItem('addProduct_stepTwo_data');
            const data3 = localStorage.getItem('addProduct_stepThree_data');
            const data4 = localStorage.getItem('addProduct_stepFour_data');
        
            console.log("Parsed data from localStorage:");
            console.log("Step One:", data1);
            console.log("Step Two:", data2);
            console.log("Step Three:", data3);
            console.log("Step Four:", data4);

            // Check if we have all required data
            if (!data1 || !data2 || !data3 || !data4) {
                const errorMsg = 'Missing required data in localStorage';
                console.error(errorMsg, {
                    stepOne: !!data1,
                    stepTwo: !!data2,
                    stepThree: !!data3,
                    stepFour: !!data4
                });
                setErrorMessage(errorMsg);
                setShowErrorDialog(true);
                setIsSubmitting(false);
                return;
            }

            // Parse all data
            const storedData1 = JSON.parse(data1) as StepOneData;
            const storedData2 = JSON.parse(data2) as StepTwoData;
            const storedData3 = JSON.parse(data3) as StepThreeData;
            const storedData4 = JSON.parse(data4) as StepFourData;
        
            // Extract ONLY feature IDs to send to the API
            const featureIds = [];
            
            if (storedData2.selectedFeatures && Array.isArray(storedData2.selectedFeatures)) {
                for (const featureItem of storedData2.selectedFeatures) {
                    if (featureItem && typeof featureItem === 'object') {
                        // Get the feature ID, whether it's directly available or inside a feature object
                        let featureId = null;
                        
                        if (featureItem.feature && featureItem.feature.id) {
                            featureId = featureItem.feature.id;
                        } else if (featureItem.featureId) {
                            featureId = parseInt(featureItem.featureId, 10);
                        }
                        
                        if (featureId) {
                            featureIds.push(featureId);
                        }
                    }
                }
            }

            console.log("Extracted feature IDs:", featureIds);

            // Process all images into a string array
            const imageUrls: string[] = [];
            
            // Add cover image
            if (storedData3.coverImage && Array.isArray(storedData3.coverImage) && storedData3.coverImage.length > 0) {
                imageUrls.push(storedData3.coverImage[0]);
                console.log("Added cover image:", storedData3.coverImage[0]);
            }
            
            // Add car images
            if (storedData3.carImages && Array.isArray(storedData3.carImages)) {
                storedData3.carImages.forEach((url: string) => {
                    if (url) {
                        imageUrls.push(url);
                    }
                });
                console.log(`Added ${storedData3.carImages.length} car images`);
            }
            
            // Add additional images
            if (storedData3.additionalImages && Array.isArray(storedData3.additionalImages)) {
                storedData3.additionalImages.forEach((url: string) => {
                    if (url) {
                        imageUrls.push(url);
                    }
                });
                console.log(`Added ${storedData3.additionalImages.length} additional images`);
            }
            
            // Add document images
            if (storedData3.documents && Array.isArray(storedData3.documents)) {
                storedData3.documents.forEach((url: string) => {
                    if (url) {
                        imageUrls.push(url);
                    }
                });
                console.log(`Added ${storedData3.documents.length} document images`);
            }
            
            // Create the car listing submission with a FLATTENED structure
            const createCarListingDto = {
                // Basic vehicle details from step 1
                makeId: Number(storedData1.marka),
                modelId: Number(storedData1.model),
                trimId: Number(storedData1.trim) || null,
                year: Number(storedData1.year),
                
                // Location details from step 1
                address: storedData1.address,
                city: storedData1.city,
                governorate: storedData1.governorate,
                
                // Pricing from step 2
                // Convert currency string to Currency enum
                currency: Currency[storedData2.currency as keyof typeof Currency] || Currency.SYP,
                price: Number(storedData2.price),
                
                // Listing metadata
                status: 'ACTIVE',
                isFeatured: false,
                isSold: false,
                
                // Listing content from step 4
                title: storedData4.adTitle,
                description: storedData4.adDescription,
                
                // Using featureIds to match the schema
                featureIds: featureIds,
                
                // Images
                images: imageUrls,
                primaryImageIndex: imageUrls.length > 0 ? 0 : undefined,
                
                // Car details - FLATTENED structure
                mileage: Number(storedData2.mileage) || 0,
                fuelType: storedData2.fuelType as FuelType || null,
                transmission: storedData2.transmission as Transmission || null,
                engineSize: Number(storedData2.engineSize) || 0,
                enginePower: Number(storedData2.enginePower) || 0,
                bodyType: storedData2.bodyType as BodyType || null,
                doors: Number(storedData2.doors) || 0,
                colorExterior: storedData2.colorExterior || null,
                colorInterior: storedData2.colorInterior || null,
                vin: storedData2.vin?.toString() || null,
                plateNumber: storedData2.plateNumber?.toString() || null
            };
            
            console.log("Submitting car listing with FLATTENED structure:", createCarListingDto);
            
            // Call the API with the flattened DTO
            const response = await createCarListing(createCarListingDto);
            console.log("API response:", response);
            
            if (response.success) {
                // Show success dialog on successful response
                localStorage.removeItem('')
                localStorage.removeItem('addProduct_stepOne_selections');
                localStorage.removeItem('addProduct_stepTwo_data');
                localStorage.removeItem('addProduct_stepThree_data');
                localStorage.removeItem('addProduct_stepFour_data');
                setShowSuccessDialog(true);
            } else {
                // Show error dialog on unsuccessful response
                setErrorMessage(formatErrorMessage(response));
                setShowErrorDialog(true);
            }
            
            return response;
        } catch (error) {
            console.error("Error submitting form:", error);
            setErrorMessage(formatErrorMessage(error));
            setShowErrorDialog(true);
            return null;
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleBack = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
        if(currentIndex === 0) {
            router.back();
        }
    };

    // Update validation state
    const updateStepValidation = useCallback((step: string, isValid: boolean) => {
        setStepValidation(prev => {
            // Only update if the value has changed
            if (prev[step as keyof typeof prev] === isValid) {
                return prev;
            }
            return {
                ...prev,
                [step]: isValid
            };
        });
        
        // If validation becomes invalid, also mark step as attempted
        if (!isValid) {
            setValidationAttempted(prev => ({
                ...prev,
                [step]: true
            }));
        }
    }, []);

    // Add function to update form data for each step
    const updateStepData = useCallback((step: string, data: any) => {
        setFormData(prev => ({
            ...prev,
            [step]: data
        }));
    }, []);

    // Get required fields message based on locale
    const getRequiredFieldsMessage = () => {
        return direction === 'ltr' 
            ? "Please select all required fields before proceeding" 
            : "يرجى تحديد جميع الحقول المطلوبة قبل المتابعة";
    };

    // Success dialog texts based on locale
    const successDialogTexts = {
        title: isArabic ? "تم النشر بنجاح!" : "Listing Published Successfully!",
        description: isArabic 
            ? "تم نشر سيارتك بنجاح. يمكنك الآن الذهاب إلى الصفحة الرئيسية أو الذهاب إلى صفحة ملفك الشخصي لمشاهدة إعلانك." 
            : "Your car has been successfully listed. You can now go to the home page or go to your profile page to view your listing.",
        homeButtonText: isArabic ? "الصفحة الرئيسية" : "Home Page",
        profileButtonText: isArabic ? "صفحة الملف الشخصي" : "Profile Page"
    };

    // Error dialog texts based on locale
    const errorDialogTexts = {
        title: isArabic ? "حدث خطأ!" : "Error Occurred!",
        description: isArabic 
            ? "حدث خطأ أثناء نشر إعلان سيارتك. يرجى التحقق من التفاصيل أدناه ومحاولة مرة أخرى." 
            : "An error occurred while publishing your car listing. Please check the details below and try again.",
        tryAgainText: isArabic ? "حاول مرة أخرى" : "Try Again"
    };

    // Custom text for the "Next" button on the last step
    const getNextButtonText = (step: string) => {
        if (step === steps[steps.length - 1]) { // if it's the last step
            return direction === 'ltr' ? 'Submit' : 'إرسال';
        }
        return direction === 'ltr' ? 'Next' : 'التالي';
    };

    return (
        <Box variant="column" className="w-full flex flex-col justify-start items-start">
            {/* Fix the type error by explicitly setting value as a string */}
            <Tabs value={currentStep} className="w-full flex flex-col justify-start items-start">
                <TabsList className="bg-transparent flex h-auto gap-4 md:gap-6 lg:gap-8 flex-wrap w-full xs:w-full justify-start items-center xs:justify-center" dir={direction}>
                    {steps.map((step, index) => (
                        <StepTrigger totalSteps={steps.length} key={step} step={step} index={index} />
                    ))}
                </TabsList>

                <div className="w-full mt-6 h-full">
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="productType"
                        isNextDisabled={validationAttempted.productType && !stepValidation.productType || isSubmitting}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepOne 
                            onValidationChange={(isValid) => updateStepValidation('productType', isValid)}
                        />
                    </StepContent>
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="location"
                        isNextDisabled={validationAttempted.location && !stepValidation.location || isSubmitting}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                   
                    >
                        <AddProductStepTwo 
                            onValidationChange={(isValid) => updateStepValidation('location', isValid)}
                        />
                    </StepContent>
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="productInfo"
                        isNextDisabled={validationAttempted.productInfo && !stepValidation.productInfo || isSubmitting}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepThree   
                            onValidationChange={(isValid) => updateStepValidation('productInfo', isValid)}
                        />
                    </StepContent>
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="adsInfo"
                        isNextDisabled={validationAttempted.adsInfo && !stepValidation.adsInfo || isSubmitting}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepFour   
                            onValidationChange={(isValid) => updateStepValidation('adsInfo', isValid)}
                        />    
                    </StepContent>
                </div>
            </Tabs>

            {/* Success Dialog */}
            <SuccessDialog
                open={showSuccessDialog}
                onOpenChange={setShowSuccessDialog}
                title={successDialogTexts.title}
                description={successDialogTexts.description}
                homeButtonText={successDialogTexts.homeButtonText}
                profileButtonText={successDialogTexts.profileButtonText}
            />

            {/* Error Dialog */}
            <ErrorDialog
                open={showErrorDialog}
                onOpenChange={setShowErrorDialog}
                title={errorDialogTexts.title}
                description={errorDialogTexts.description}
                errorMessage={errorMessage}
                tryAgainText={errorDialogTexts.tryAgainText}
                onTryAgain={handleTryAgain}
            />
        </Box>
    );
};

export default Steps;