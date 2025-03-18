'use client'
import Box from '@/components/box/box'
import React, { useState, useCallback } from 'react'
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import AddProductStepOne from './AddProductStepOne';
import { StepContent } from './StepContent';
import { StepTrigger } from './StepTrigger';
import AddProductStepTow from './AddProductStepTow';
import AddProductStepThree from './AddProductStepThree';
import AddProductStepFour from './AddProductStepFowr';
import { useRouter } from 'next/navigation';
const Steps = () => {
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    const steps = ['productType', 'location', 'productInfo', 'adsInfo'];
    const [currentStep, setCurrentStep] = useState(steps[0]);
    const router = useRouter(); 

    // Add state to track validation for each step
    const [stepValidation, setStepValidation] = useState({
        productType: false,
        location: true,
        productInfo: true,
        adsInfo: true
    });

    const handleNext = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex < steps.length - 1) {
            setCurrentStep(steps[currentIndex + 1]);
        }
    };

    const handleBack = () => {
        const currentIndex = steps.indexOf(currentStep);
        if (currentIndex > 0) {
            setCurrentStep(steps[currentIndex - 1]);
        }
        if(currentIndex === 0 ) {
            router.back();
        
        }
    };

    // Add function to update validation state
    // Use useCallback to ensure stable reference
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
    }, []);

    // Get required fields message based on locale
    const getRequiredFieldsMessage = () => {
        return direction === 'ltr' 
            ? "Please select all required fields before proceeding" 
            : "يرجى تحديد جميع الحقول المطلوبة قبل المتابعة";
    };

    return (
        <Box variant="column" className="w-full flex flex-col justify-start items-start">
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
                        isNextDisabled={!stepValidation.productType}
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
                        isNextDisabled={!stepValidation.location}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepTow />
                    </StepContent>
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="productInfo"
                        isNextDisabled={!stepValidation.productInfo}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepThree />
                    </StepContent>
                    <StepContent 
                        handleBack={handleBack} 
                        handleNext={handleNext} 
                        direction={direction} 
                        step="adsInfo"
                        isNextDisabled={!stepValidation.adsInfo}
                        requiredFieldsMessage={getRequiredFieldsMessage()}
                    >
                        <AddProductStepFour />    
                    </StepContent>
                </div>
            </Tabs>
        </Box>
    );
};

export default Steps;