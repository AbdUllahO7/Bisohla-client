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

const Steps = () => {
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    const router = useRouter(); 

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

    // Function to handle the final submission
    const handleFinalSubmission = async () => {
        try {
        
            console.log(localStorage.getItem('addProduct_stepOne_selections'))
            console.log(localStorage.getItem('addProduct_stepTwo_data'))
            console.log(localStorage.getItem('addProduct_stepThree_data'))
            console.log(localStorage.getItem('addProduct_stepFour_data'))

            localStorage.setItem('addProduct_stepFour_data' , "")
            localStorage.setItem('addProduct_stepOne_selections' , "")
            localStorage.setItem('addProduct_stepTwo_data' , "")
            localStorage.setItem('addProduct_stepThree_data' , "")

        } catch (error) {
            console.error("Error submitting form:", error);
        
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