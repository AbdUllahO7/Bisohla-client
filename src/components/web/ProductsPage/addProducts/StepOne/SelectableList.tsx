import React from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";

// Option interface to use instead of directly using SelectCarMakeDto
interface Option {
    value: string;
    label: string;
}

interface SelectableListProps {
    title: string;
    type: "marka" | "model" | "year" | "trim" | 'governorate' | 'city';
    options: Option[];
    selectedValue: string;
    direction: string; // Changed to string to accept any string value
    onSelect: (type: "marka" | "model" | "year" | "trim" | 'governorate' | 'city', value: string) => void;
    required?: boolean;
}

const SelectableList: React.FC<SelectableListProps> = ({ 
    title, 
    type, 
    options, 
    selectedValue, 
    direction, 
    onSelect,
    required = true // Make required by default
}) => {
    // Ensure direction is always a valid value for components that expect "rtl" | "ltr"
    const safeDirection = (direction === "rtl" || direction === "ltr") ? direction : "ltr";
    
    return (
        <Box className="min-w-[250px] px-5 py-5" variant="column">
            <Box variant="row" className="flex items-center border-b border-primary-foreground pb-2">
                <Text className="text-primary font-bold text-xl">
                    {title}
                </Text>
                {required && (
                    <Text className="text-red-500 ml-1 text-lg">*</Text>
                )}
                {required && !selectedValue && (
                    <Text className="text-red-500 text-xs ml-2">
                        {safeDirection === "ltr" ? "(Required)" : "(مطلوب)"}
                    </Text>
                )}
            </Box>
            <Box variant="column" className={`min-w-[250px] max-w-[250px] border ${!selectedValue && required ? 'border-red-300' : 'border-gray-200'} px-5 rounded-lg mt-2`}>
                <ScrollArea className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full" dir={safeDirection}>
                    <Box variant="column" className="w-full mt-2">
                        {options && options.length > 0 ? (
                            options.map((option) => (
                                <Button
                                    key={option.value}
                                    onClick={() => onSelect(type, option.value)}
                                    className={`w-full py-6 px-4 text-primary bg-white font-semibold border-b border-b-gray-200 hover:bg-primary hover:text-white duration-500 ${selectedValue === option.value ? "bg-primary-foreground text-primary" : ""}`}
                                >
                                    <span className={`w-full ${safeDirection === "ltr" ? "text-left" : "text-right"}`}>{option.label}</span>
                                </Button>
                            ))
                        ) : (
                            <Text className="p-4 text-gray-500">
                                {safeDirection === "ltr" ? 
                                    `No options available${required ? " (selection required)" : ""}` : 
                                    `لا توجد خيارات متاحة${required ? " (الاختيار مطلوب)" : ""}`}
                            </Text>
                        )}
                    </Box>
                </ScrollArea>
            </Box>
                        
        </Box>
    );
};

export default SelectableList;