import React from "react";
import Box from "@/components/ui/box";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight, Send } from "lucide-react";
import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

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
        <TabsContent value={step} className="focus-visible:outline-none focus-visible:ring-0">
            <motion.div
                initial={{ opacity: 0, x: direction === "rtl" ? -25 : 25 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: direction === "rtl" ? 25 : -25 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
            >
                {children}
            </motion.div>
            
            <Box variant="row" className="w-full justify-between items-center bg-white mt-10 px-5 py-5 rounded-2xl border border-slate-100 shadow-sm xs:mb-5" dir={direction}>
                <div className="flex flex-col items-start">
                    <Button 
                        className="bg-slate-100 text-slate-700 font-bold px-7 h-11 min-w-[150px] hover:bg-slate-200 duration-300 rounded-xl" 
                        onClick={handleBack}
                    >
                        {direction === "ltr" ? <ArrowLeft className="mr-2 h-4 w-4"/> : <ArrowRight className="ml-2 h-4 w-4"/>}
                        {direction === "ltr" ? "Back" : "العودة"}
                    </Button>
                </div>
                
                <div className="flex flex-col items-end">
                    <motion.div
                        animate={!isNextDisabled ? { scale: [1, 1.025, 1] } : { scale: 1 }}
                        transition={{ repeat: !isNextDisabled ? Infinity : 0, duration: 2, ease: "easeInOut" }}
                    >
                        <Button 
                            className={cn(
                                isLastStep ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-primary hover:bg-primary-light',
                                "text-white font-bold px-7 h-11 min-w-[150px] duration-300 disabled:opacity-40 disabled:cursor-not-allowed rounded-xl shadow-sm relative transition-all",
                                !isNextDisabled && "ring-4 ring-emerald-500/20 shadow-md shadow-emerald-500/10"
                            )} 
                            onClick={handleNext}
                            disabled={isNextDisabled}
                        >
                            {nextButtonText || (direction === "ltr" ? (isLastStep ? "Submit" : "Next") : (isLastStep ? "إرسال" : "التالي"))}
                            {isLastStep ? 
                                <Send className={direction === "ltr" ? "ml-2 h-4 w-4" : "mr-2 h-4 w-4"}/> : 
                                (direction === "ltr" ? <ArrowRight className="ml-2 h-4 w-4"/> : <ArrowLeft className="mr-2 h-4 w-4"/>)
                            }
                        </Button>
                    </motion.div>
                    {isNextDisabled && requiredFieldsMessage && (
                        <span className="text-red-500 text-xs mt-2 font-semibold">
                            {requiredFieldsMessage}
                        </span>
                    )}
                </div>
            </Box>
        </TabsContent>
    );
};