import React from "react";
import Box from "@/components/box/box";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";

interface StepContentProps {
    step: string;
    children: React.ReactNode;
    direction: "ltr" | "rtl";
    handleNext: () => void;
    handleBack: () => void;
    isNextDisabled?: boolean;
    requiredFieldsMessage?: string;
    isLastStep?: boolean;
    nextButtonText?: string;
}

export const StepContent: React.FC<StepContentProps> = ({ 
    step, 
    children, 
    direction, 
    handleNext, 
    handleBack,
    isNextDisabled = false,
    requiredFieldsMessage,
    isLastStep = false,
    nextButtonText
}) => {

    return (
        <TabsContent value={step} className="">
            {children}
            <Box variant="row" className="w-full justify-start items-center bg-white mt-10 px-5 py-5 rounded-lg xs:mb-5" dir={direction}>
                <div className="flex flex-col items-start">
                    <Button 
                        className={`${isLastStep ? 'bg-green-600 hover:bg-green-700' : 'bg-primary hover:bg-primary-light'} text-white font-bold px-7 min-w-[150px] duration-500 disabled:opacity-50 disabled:cursor-not-allowed`} 
                        onClick={handleNext}
                        disabled={isNextDisabled}
                    >
                        {nextButtonText || (direction === "ltr" ? (isLastStep ? "Submit" : "Next") : (isLastStep ? "إرسال" : "التالي"))}
                        {isLastStep ? 
                            <Send className={direction === "ltr" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"}/> : 
                            (direction === "ltr" ? <ArrowRight className="ml-2"/> : <ArrowLeft className="mr-2"/>)
                        }
                    </Button>
                    
                </div>
                
                <Button 
                    className="bg-gray-200 text-primary font-bold px-7 min-w-[150px] hover:bg-primary-light duration-500 hover:text-white ml-4" 
                    onClick={handleBack}
                >
                    {direction === "ltr" ? <ArrowLeft className="mr-2"/> : <ArrowRight className="ml-2"/>}
                    {direction === "ltr" ? "Back" : "العودة"}
                </Button>

                {isNextDisabled && requiredFieldsMessage && (
                    <span className="text-red-500 text-sm mt-1 ml-4">
                        {requiredFieldsMessage}
                    </span>
                )}
            </Box>
        </TabsContent>
    );
};