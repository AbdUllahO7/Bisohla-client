import React from "react";
import Box from "@/components/box/box";
import { Button } from "@/components/ui/button";
import { TabsContent } from "@/components/ui/tabs";
import { ArrowLeft, ArrowRight } from "lucide-react";

interface StepContentProps {
    step: string;
    children: React.ReactNode;
    direction: "ltr" | "rtl";
    handleNext: () => void;
    handleBack: () => void;
}

export const StepContent: React.FC<StepContentProps> = ({ step, children, direction, handleNext, handleBack }) => {

    return (
        <TabsContent value={step} className="">
            {children}
            <Box variant="row" className="w-full justify-start items-center bg-white mt-10 px-5 py-5 rounded-lg xs:mb-5" dir={direction}>
                <Button className="bg-primary text-white font-bold px-7 min-w-[150px] hover:bg-primary-light duration-500" onClick={handleNext}>
                    {direction === "ltr" ? "Next" : "التالي"}
                    {direction === "ltr" ? <ArrowRight/>: <ArrowLeft/>}
                </Button>
                <Button className="bg-gray-200 text-primary font-bold px-7 min-w-[150px] hover:bg-primary-light duration-500 hover:text-white" onClick={handleBack}>
                    {direction === "ltr" ? "Back" : "العودة"}
                    {direction === "ltr" ? <ArrowLeft/>: <ArrowRight/>}
                </Button>
            </Box>
        </TabsContent>
    );
};
