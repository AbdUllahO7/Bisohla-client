'use client'
import React from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";
import { Textarea } from "@/components/ui/textarea";

interface StoryFieldProps {
    title: string;
    placeholder: string;
    value: string;
    onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void;
    direction: string;
}

const StoryField: React.FC<StoryFieldProps> = ({
    title,
    placeholder,
    value,
    onChange,
    direction
}) => {
    return (
        <Box className="min-w-[250px] py-5 col-span-2 px-5" variant="column">
            <Text className="text-primary font-bold text-xl border-b border-primary-foreground pb-2">
                {title}
            </Text>
            <Textarea
                className="px-5 border-gray-100 mt-4"
                placeholder={placeholder}
                id="message-2"
                cols={20}
                rows={17}
                value={value}
                onChange={onChange}
                dir={direction}
            />
        </Box>
    );
};

export default React.memo(StoryField);