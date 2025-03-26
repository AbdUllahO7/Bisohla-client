'use client'
import React, { useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { DatePickerForm } from '@/components/DatePicke';
import { PublicationDateProps } from './types';

// Publication date component
const PublicationDate: React.FC<PublicationDateProps> = ({ 
    direction, 
    onDateChange, 
    showError 
}) => {
    // Listen for any custom events that might be emitted by DatePickerForm
    useEffect(() => {
        // In case the DatePickerForm uses custom events to communicate date changes
        const handleDatePickerEvent = (event: CustomEvent) => {
            if (event.detail && event.detail.date && onDateChange) {
                onDateChange(event.detail.date);
            }
        };
        
        window.addEventListener('datepicker:change' as any, handleDatePickerEvent as EventListener);
        
        return () => {
            window.removeEventListener('datepicker:change' as any, handleDatePickerEvent as EventListener);
        };
    }, [onDateChange]);

    return (
        <Box className="w-full overflow-x-auto pb-2">
            <DatePickerForm 
                title={direction === "ltr" ? 'Publication date': 'تاريخ النشر'} 
                placeHolder={direction === "ltr" ? 'Pick a date ' : 'اختر تاريخا'}
            />
            {showError && (
                <Text className="text-red-500 text-sm mt-1">
                    {direction === "ltr" ? 'Publication date is required' : 'تاريخ النشر مطلوب'}
                </Text>
            )}
        </Box>
    );
};

export default PublicationDate;