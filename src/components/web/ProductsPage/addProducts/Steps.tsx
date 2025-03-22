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
import { useSession } from '@/hooks/auth/use-session';
// Import the Currency enum from your project
import { Currency } from '@/core/entities/enums/currency.enum'; // Adjust the import path as needed

// Type definitions
interface ImageItem {
    url: string;
    isPrimary: boolean;
}

interface SectionStatus {
    [key: string]: boolean;
}

interface StepOneData {
    marka: string;
    model: string;
    year: string;
    trim: string;
}

interface StepTwoData {
    currency: string;
    price: string | number;
    colorExterior: string;  
    colorInterior: string;  
    fuelType: string;
    bodyType: string;
    transmission: string;
    doors : string | number,
    plateNumber : string | number,
    mileage : string | number,
    enginePower : string | number, 
    engineSize : string | number,
    vin : string | number,
    selectedFeatures: {
        [category: string]: string[];
    };
}

interface StepThreeData {
    coverImage: string[];
    carImages: string[];
    additionalImages: string[];
    documents: string[];
    governorate: string;
    city: string;
    address: string;
    sectionStatus: SectionStatus;
}

interface StepFourData {
    adTitle: string;
    adDescription: string;
}

interface Feature {
    name: string;
    category: string;
}

// Update CarListingDTO to use Currency enum type
interface CarListingDTO {
    makeId: number;
    modelId: number;
    year: number;
    trimId: number;
    currency: Currency; // Changed from string to Currency enum
    price: number;
    colorExterior: string;  
    colorInterior: string;  
    fuelType: string;
    bodyType: string;
    transmission: string;
    title: string;
    description: string;
    governorate: string;
    city: string;
    address: string;
    sectionStatus: SectionStatus;
    images: string[];
    primaryImageIndex?: number;
    features: Feature[];
    doors : string | number,
    plateNumber : string | number,
    mileage : string | number,
    enginePower : string | number, 
    engineSize : string | number,
    vin : string | number,
}

const Steps = () => {
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    const router = useRouter(); 

    const { user } = useSession();
    console.log(user)
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

    // Function to handle the final submission with fixed feature processing
    const handleFinalSubmission = async () => {
        try {
            if (!user) {
                console.error("User not authenticated or missing user ID");
                // Handle unauthenticated user (redirect to login or show message)
                return;
            }

            console.log("Reading localStorage data for submission");
            
            // Get all form data from localStorage
            const data1 = localStorage.getItem('addProduct_stepOne_selections');
            const data2 = localStorage.getItem('addProduct_stepTwo_data');
            const data3 = localStorage.getItem('addProduct_stepThree_data');
            const data4 = localStorage.getItem('addProduct_stepFour_data');

            // Check if we have all required data
            if (!data1 || !data2 || !data3 || !data4) {
                console.error('Missing required data in localStorage:', {
                    stepOne: !!data1,
                    stepTwo: !!data2,
                    stepThree: !!data3,
                    stepFour: !!data4
                });
                return;
            }

            // Parse all data
            const storedData1 = JSON.parse(data1) as StepOneData;
            const storedData2 = JSON.parse(data2) as StepTwoData;
            const storedData3 = JSON.parse(data3) as StepThreeData;
            const storedData4 = JSON.parse(data4) as StepFourData;

            console.log("Step Three Data (contains images):", storedData3);

            // Process all images into a single array
            const allImages: string[] = [];
            
            // Add cover image as primary (if exists)
            if (storedData3.coverImage && Array.isArray(storedData3.coverImage) && storedData3.coverImage.length > 0) {
                allImages.push(storedData3.coverImage[0]);
                console.log("Added cover image as primary:", storedData3.coverImage[0]);
            }
            
            // Add car images
            if (storedData3.carImages && Array.isArray(storedData3.carImages)) {
                storedData3.carImages.forEach((url: string) => {
                    if (url) {
                        allImages.push(url);
                    }
                });
                console.log(`Added ${storedData3.carImages.length} car images`);
            }
            
            // Add additional images
            if (storedData3.additionalImages && Array.isArray(storedData3.additionalImages)) {
                storedData3.additionalImages.forEach((url: string) => {
                    if (url) {
                        allImages.push(url);
                    }
                });
                console.log(`Added ${storedData3.additionalImages.length} additional images`);
            }
            
            // Add document images
            if (storedData3.documents && Array.isArray(storedData3.documents)) {
                storedData3.documents.forEach((url: string) => {
                    if (url) {
                        allImages.push(url);
                    }
                });
                console.log(`Added ${storedData3.documents.length} document images`);
            }
            
            // Primary image is the first one (index 0) if it exists
            const primaryImageIndex = storedData3.coverImage && 
                Array.isArray(storedData3.coverImage) && 
                storedData3.coverImage.length > 0 ? 0 : undefined;
            
            // FIXED: Properly process the features into the format expected by the backend
            const features = [];
            
            if (storedData2.selectedFeatures && typeof storedData2.selectedFeatures === 'object') {
                for (const [category, featureIds] of Object.entries(storedData2.selectedFeatures)) {
                    if (Array.isArray(featureIds)) {
                        for (const featureName of featureIds) {
                            features.push({
                                name: featureName,
                                category: category
                            });
                        }
                    }
                }
            }
            
            console.log("Processed features:", features);
            
            // Create the DTO object with all required properties
            const createCarListingDto: CarListingDTO = {
                // Vehicle details from step 1 - Convert strings to numbers
                makeId: Number(storedData1.marka),
                modelId: Number(storedData1.model),
                year: Number(storedData1.year),
                trimId: Number(storedData1.trim) ,
                
                // Vehicle details from step 2
                currency: storedData2.currency as Currency,
                price: Number(storedData2.price),
                colorExterior: storedData2.colorExterior,
                colorInterior: storedData2.colorInterior,
                fuelType: storedData2.fuelType,
                bodyType: storedData2.bodyType,
                transmission: storedData2.transmission,
                
                doors: Number(storedData2.doors),
                vin: storedData2.vin,
                mileage: Number(storedData2.mileage),
                enginePower: Number(storedData2.enginePower),
                engineSize: Number(storedData2.engineSize),
                plateNumber: storedData2.plateNumber,
                
                // Details from step 4
                title: storedData4.adTitle,
                description: storedData4.adDescription,
                
                // Add location details from step 3
                governorate: storedData3.governorate,
                city: storedData3.city,
                address: storedData3.address,
                
                // Section status data from step 3
                sectionStatus: storedData3.sectionStatus || {},
                
                // Images with primary image index
                images: allImages,
                primaryImageIndex: primaryImageIndex,
                
                // FIXED: Features in the format expected by the backend
                features: features,
            };
            
            console.log("Submitting car listing DTO:", createCarListingDto);
            
            // Call the API with the complete DTO
            const response = await createCarListing(createCarListingDto);
            console.log("Listing created successfully:", response);
            
            // Clear saved data after successful submission (optional)
            // localStorage.removeItem('addProduct_stepOne_selections');
            // localStorage.removeItem('addProduct_stepTwo_data');
            // localStorage.removeItem('addProduct_stepThree_data');
            // localStorage.removeItem('addProduct_stepFour_data');
            
            return response;
        } catch (error) {
            console.error("Error submitting form:", error);
            throw error; // Allow the calling component to handle the error
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
                        isNextDisabled={validationAttempted.productType && !stepValidation.productType}
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
                        isNextDisabled={validationAttempted.location && !stepValidation.location}
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
                        isNextDisabled={validationAttempted.productInfo && !stepValidation.productInfo}
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
                        isNextDisabled={validationAttempted.adsInfo && !stepValidation.adsInfo}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepFour   
                            onValidationChange={(isValid) => updateStepValidation('adsInfo', isValid)}
                        />    
                    </StepContent>
                </div>
            </Tabs>
        </Box>
    );
};

export default Steps;