'use client'
import React from "react";
import Box from "@/components/box/box";
import Text from "@/components/text/text";

interface ErrorMessageProps {
    message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
    return (
        <Box className="w-full p-4 bg-red-50 border border-red-200 rounded-lg mb-4">
            <Text className="text-red-600 font-semibold">{message}</Text>
        </Box>
    );
};

export default ErrorMessage;