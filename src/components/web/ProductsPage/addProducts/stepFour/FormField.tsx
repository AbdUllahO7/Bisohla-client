'use client'
import React from 'react';
import Box from '@/components/box/box';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import Text from '@/components/text/text';
import { FormFieldProps } from './types';

// Component for text input fields
const FormField: React.FC<FormFieldProps> = ({
    label,
    id,
    placeholder,
    value,
    onChange,
    onBlur,
    errorMessage,
    required = false
}) => {
    return (
        <Box variant="column" className='w-full items-start'>
            <Label htmlFor={id}>
                {label}
                {required && <span className="text-red-500">*</span>}
            </Label>
            <Input 
                type="text" 
                id={id} 
                placeholder={placeholder} 
                className='w-full'
                value={value}
                onChange={(e) => onChange(e.target.value)}
                onBlur={onBlur}
            />
            {errorMessage && (
                <Text className="text-red-500 text-sm mt-1">
                    {errorMessage}
                </Text>
            )}
        </Box>
    );
};

export default FormField;