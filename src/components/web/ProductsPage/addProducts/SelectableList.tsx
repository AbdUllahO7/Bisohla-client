import React from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Plus } from "lucide-react";

interface Option {
    value: string;
    label: string;
}

interface SelectableListProps {
    title: string;
    type: "marka" | "model" | "year"; // ✅ Fix here
    options: Option[];
    selectedValue: string;
    direction: "ltr" | "rtl";
    onSelect: (type: "marka" | "model" | "year", value: string) => void; // ✅ Fix here
}

const SelectableList: React.FC<SelectableListProps> = ({ title, type, options, selectedValue, direction, onSelect }) => {
    return (
        <Box className="min-w-[250px] px-5 py-5" variant="column">
            <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">{title}</Text>
            <Box variant="column" className="border border-gray-200 px-5 rounded-lg">
                <Box className="mt-4 mb-4 flex items-center gap-2">
                    <Input type="text" value={selectedValue} onChange={(e) => onSelect(type, e.target.value)} />
                    <Button className="bg-primary-foreground text-primary hover:bg-primary-dark duration-500 hover:text-white">{direction === "ltr" ? "Add" : "إضافة"} <Plus/></Button>
                </Box>
                <ScrollArea className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full" dir={direction}>
                    <Box variant="column" className="w-full">
                        {options.map((option) => (
                            <Button
                                key={option.value}
                                onClick={() => onSelect(type, option.value)}
                                className={`w-full py-6 px-4 text-primary bg-white font-semibold border-b border-b-gray-200 hover:bg-primary hover:text-white duration-500 ${selectedValue === option.value ? "bg-primary-foreground text-primary" : ""}`}
                            >
                                <span className={`w-full ${direction === "ltr" ? "text-left" : "text-right"}`}>{option.label}</span>
                            </Button>
                        ))}
                    </Box>
                </ScrollArea>
            </Box>
        </Box>
    );
};

export default SelectableList;
