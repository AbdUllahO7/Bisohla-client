'use client'
import Box from '@/components/box/box'
import React, { useState } from 'react'
import { Tabs, TabsList } from "@/components/ui/tabs";
import { useLocale } from 'next-intl';
import AddProductStepOne from './AddProductStepOne';
import { StepContent } from './StepContent';
import { StepTrigger } from './StepTrigger';
import AddProductStepTow from './AddProductStepTow';
import AddProductStepThree from './AddProductStepThree';
import AddProductStepFour from './AddProductStepFowr';

const Steps = () => {
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    const steps = ['productType', 'location', 'productInfo', 'adsInfo'];
    const [currentStep, setCurrentStep] = useState(steps[0]);

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
    };



    return (
        <Box variant="column" className="w-full flex flex-col justify-start items-start">
            <Tabs value={currentStep} className="w-full flex flex-col justify-start items-start">
                <TabsList className="bg-transparent flex h-auto gap-4 md:gap-6 lg:gap-8 flex-wrap w-full justify-start items-center xs:justify-center" dir={direction}>
                    {steps.map((step, index) => (
                        <StepTrigger totalSteps = {steps.length} key={step} step={step} index={index} />
                    ))}
                </TabsList>

                <div className="w-full mt-6 h-full">
                    <StepContent handleBack={handleBack} handleNext={handleNext} direction = {direction} step="productType">
                        <AddProductStepOne />
                    </StepContent>
                    <StepContent handleBack={handleBack} handleNext={handleNext} direction = {direction} step="location">
                        <AddProductStepTow />
                    </StepContent>
                    <StepContent handleBack={handleBack} handleNext={handleNext} direction = {direction} step="productInfo">
                            <AddProductStepThree />
                    </StepContent>
                    <StepContent handleBack={handleBack} handleNext={handleNext} direction = {direction} step="adsInfo">
                        <AddProductStepFour />    
                    </StepContent>
                </div>
            </Tabs>
        </Box>
    );
};

export default Steps;