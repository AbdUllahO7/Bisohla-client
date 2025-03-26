'use client'
import React from 'react';
import Box from '@/components/box/box';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { StatusSelectProps } from './types';

// Status selection component
const StatusSelect: React.FC<StatusSelectProps> = ({ value, onChange, direction }) => {
    return (
        <Box variant="column" className='w-full items-start'>
            <Label htmlFor="statusSelect">
                {direction === "ltr" ? 'Status' : 'الحالة'}
                <span className="text-red-500">*</span>
            </Label>
            <Select 
                value={value}
                onValueChange={onChange}
                defaultValue="publish"
            >
                <SelectTrigger className="w-full md:w-[180px]" id="statusSelect">
                    <SelectValue placeholder={direction === "ltr" ? 'Select status' : 'اختر الحالة'} />
                </SelectTrigger>
                <SelectContent>
                    <SelectGroup>
                        <SelectItem value="publish">{direction === "ltr" ? 'Publish' : 'نشر'}</SelectItem>
                        <SelectItem value="draft">{direction === "ltr" ? 'Draft' : 'مسودة'}</SelectItem>
                        <SelectItem value="archived">{direction === "ltr" ? 'Archived' : 'مؤرشف'}</SelectItem>
                    </SelectGroup>
                </SelectContent>
            </Select>   
        </Box>
    );
};

export default StatusSelect;