import React from "react";
import { TabsTrigger } from "@/components/ui/tabs";
import { useTranslations } from "next-intl";

interface StepTriggerProps {
    step: string;
    index: number;
    totalSteps: number;
}

export const StepTrigger: React.FC<StepTriggerProps> = ({ step, index, totalSteps }) => {
    const t = useTranslations("addProduct");

    return (
        <>
            <TabsTrigger
                className="group bg-white font-bold px-6 md:px-8 py-4 md:py-5 min-w-[150px] md:min-w-[180px] lg:min-w-[220px] min-h-[110px] md:min-h-[130px] flex-col gap-2 md:gap-4 items-center transition-colors text-primary data-[state=active]:bg-white"
                value={step}
            >
                <span className="min-h-[60px] min-w-[60px] md:min-h-[75px] md:min-w-[75px] rounded-full flex justify-center items-center transition-colors bg-gray-200 group-data-[state=active]:bg-primary-foreground">
                    <span className="text-primary font-bold text-xl md:text-2xl">{index + 1}</span>
                </span>
                <span className="transition-colors text-primary text-sm md:text-base">
                    {t("steps.carType")}
                </span>
            </TabsTrigger>

            {index < totalSteps - 1 && <span className="hidden lg:block text-primary font-bold text-2xl">------</span>}
        </>
    );
};
