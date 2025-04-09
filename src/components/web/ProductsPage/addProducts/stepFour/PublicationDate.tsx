'use client'
import React, { useCallback, useRef, useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { PublicationDateProps } from './types';
import { DatePickerForm } from '@/components/DatePicke';

// Publication date component
const PublicationDate: React.FC<PublicationDateProps> = ({ 
    direction, 
    onDateChange, 
    showError,
    initialDate
}) => {
    // Track client-side rendering
    const [isMounted, setIsMounted] = useState(false);
    
    // Keep track of the last emitted date to prevent duplicate updates
    const lastEmittedDate = useRef<string | null>(initialDate);
    
    // Handle date change coming from the DatePickerForm component
    const handleDateChange = useCallback((date: string | null) => {
        if (onDateChange && date !== lastEmittedDate.current) {
            lastEmittedDate.current = date;
            onDateChange(date);
        }
    }, [onDateChange]);

    // Set mounted state on client
    useEffect(() => {
        setIsMounted(true);
    }, []);

    return (
        <Box className="w-full overflow-x-auto pb-2">
            <DatePickerForm 
                title={direction === "ltr" ? 'Publication date': 'تاريخ النشر'} 
                placeHolder={direction === "ltr" ? 'Pick a date ' : 'اختر تاريخا'}
                onChange={handleDateChange}
                initialDate={isMounted ? initialDate : undefined}
                allowFutureDates={true}
                allowPastDates={true}
            />
            {isMounted && showError && (
                <Text className="text-red-500 text-sm mt-1">
                    {direction === "ltr" ? 'Publication date is required' : 'تاريخ النشر مطلوب'}
                </Text>
            )}
        </Box>
    );
};

export default PublicationDate;