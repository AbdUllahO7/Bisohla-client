'use client'
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useLocale } from 'next-intl';
import React, { useEffect } from 'react';
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { DatePickerForm } from '@/components/DatePicke';

const AddProductStepFour = () => {
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    return (
        <Box className="w-full bg-white rounded-lg pb-10" variant="column" dir={direction}>
            {/* Header */}
            <Box className="bg-gray-100 px-4 py-4 md:px-5 md:py-5 w-full flex justify-center">
                <Text className="font-bold text-primary text-lg md:text-xl">
                    {direction === "ltr" ? "Ad Information" : "معلومات الإعلان"}
                </Text>
            </Box>

            {/* Main Content */}
            <Box variant="row" className='flex-col md:flex-row justify-center items-center w-full pt-6 md:pt-10 gap-6 md:gap-10 px-4 md:px-4'>
                {/* Left Section - Form Fields */}
                <Box className='w-full md:w-[700px] justify-start items-start gap-4 md:gap-8' variant="column">
                    {/* Ad Title */}
                    <Box variant="column" className='w-full items-start'>
                        <Label htmlFor="adTitle">{direction === "ltr" ? 'Ad Title' : 'عنوان الإعلان'}</Label>
                        <Input 
                            type="text" 
                            id="adTitle" 
                            placeholder={direction === "ltr" ? 'Ad Title' : 'عنوان الإعلان'} 
                            className='w-full'
                        />
                    </Box>

                    {/* Ad Description */}
                    <Box variant="column" className='w-full items-start'>
                        <Label htmlFor="adDescription">{direction === "ltr" ? 'Ad Description' : 'وصف الإعلان'}</Label>
                        <Input 
                            type="text" 
                            id="adDescription" 
                            placeholder={direction === "ltr" ? 'Ad Description' : 'وصف الإعلان'} 
                            className='w-full'
                        />
                    </Box>

                    {/* Switch Section */}
                    <Box variant="row" dir={direction} className="flex-wrap items-center gap-2 w-full">
                        <Box className="flex items-center gap-2">
                            <Switch 
                                id="airplane-mode" 
                                className={`${direction === 'rtl' ? '[&_[data-state=checked]]:translate-x-[-20px] rtl:scale-x-[-1]' : '[&>span]:start-0 [&>span]:data-[state=checked]:start-[20px]'}`}
                                dir={direction}
                            />
                            <Label 
                                htmlFor="airplane-mode" 
                                className={direction === 'rtl' ? 'mr-1' : 'ml-1 text-sm md:text-base'}
                            >
                                {direction === "ltr" ? 'Schedule Publishing' : 'تحديد وقت النشر'}
                            </Label>
                        </Box>
                    </Box>
                </Box>

                {/* Right Section - Status & Calendar */}
                <Box variant="column" className='w-full md:w-auto border border-gray-100 p-4 md:p-5 gap-4 md:gap-8 rounded-lg items-start'>
                    {/* Status Select */}
                    <Box variant="column" className='w-full items-start'>
                        <Text className='font-bold text-primary mb-2 md:mb-3'>
                            {direction === 'ltr' ? 'Ad Status' : 'حالة الإعلان'}
                        </Text>
                        <Box variant="column" className='w-full items-start'>
                            <Label htmlFor="statusSelect">{direction === "ltr" ? 'Status' : 'الحالة'}</Label>
                            <Select>
                                <SelectTrigger className="w-full md:w-[180px]">
                                    <SelectValue placeholder={direction === "ltr" ? 'Publish' : 'نشر'} />
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
                    </Box>

                    {/* Calendar */}
                    <Box className='w-full overflow-x-auto pb-2'>
                        <DatePickerForm title={direction === "ltr" ? 'Specify publication date': 'تحديد تاريخ النشر'} placeHolder={direction === "ltr" ? 'Pick a date ' : 'اختر تاريخا'}/>
                    </Box>
                </Box>
            </Box>
        </Box>
    );
};

export default AddProductStepFour;