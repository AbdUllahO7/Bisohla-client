'use client'
import React from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Textarea } from "@/components/ui/textarea";

interface AddressFieldProps {
    title: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    direction: string;
    required?: boolean;
}

const AddressField: React.FC<AddressFieldProps> = ({
    title,
    placeholder,
    value,
    onChange,
    direction,
    required = false
}) => {
    return (
        <Box className="py-5" variant="column">
            <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">
                {title} {required && <span className="text-red-500">*</span>}
            </Text>
            <Box className="mt-4" variant="column">
                <Textarea
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-primary"
                    placeholder={placeholder}
                    value={value}
                    onChange={onChange}
                    cols={30}
                    rows={13}
                    dir={direction}
                />
            </Box>
        </Box>
    );
};

export default React.memo(AddressField);