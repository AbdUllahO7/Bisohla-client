'use client'
import Box from '@/components/box/box'
import Text from '@/components/text/text'
import { useLocale } from 'next-intl';
import React, { useEffect, useState } from 'react'
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table"
import { Circle, Plus } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import ImageUpload from '@/lib/ImageUpload';
import { MultiImageUpload } from '@/lib/MlutiImageUpload';

const AddProductStepThree = () => {
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [uploadedImageUrl, setUploadedImageUrl] = useState('');
    const [imageLoadingState, setImageLoadingState] = useState(false);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);
    
    // Data array for table rows
    const carSections = [
        { id: 1, name: direction === 'ltr' ? '1- Front bumper' : '1- المصد الأمامي' },
        { id: 2, name: direction === 'ltr' ? '2- Hood' : '2- غطاء المحرك' },
        { id: 3, name: direction === 'ltr' ? '3- Left door' : '3- الباب الأيسر' },
        { id: 4, name: direction === 'ltr' ? '4- Right door' : '4- الباب الأيمن' },
        { id: 5, name: direction === 'ltr' ? '5- Rear bumper' : '5- المصد الخلفي' },
        { id: 6, name: direction === 'ltr' ? '6- Roof' : '6- السقف' },
    ];

    return (
        <Box variant="container" className='pr-0'>
            {/* table */}
            <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center" variant="row" dir={direction}>
                <Box className="bg-gray-100 px-5 py-5 w-full flex justify-center">
                    <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Information" : "معلومات السيارة"}
                    </Text>
                </Box>

                {/* Scrollable Table Container */}
                <div className="w-full overflow-x-auto pb-4">
                    <Table className="min-w-[800px] lg:w-full text-center mx-auto">
                        <TableHeader className='pb-2'>
                            <TableRow className="text-center hover:bg-transparent border-gray-200 border-1 mb-10">
                                {/* Table Heads - Keep original styling */}
                                <TableHead className="min-w-[150px] text-start">{direction === "ltr" ? "Car section name" : "اسم قسم السيارة"}</TableHead>
                                <TableHead className="min-w-[160px] ">
                                    <Text className="bg-primary-light text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base">
                                        <Circle size={20} className="text-primary" />
                                        {direction === "ltr" ? 'No defect' : 'لا يوجد عيب'}
                                    </Text>
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    <Text className="bg-secondary-purple text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base">
                                        <Circle size={20} className="text-primary" />
                                        {direction === "ltr" ? 'Just boya' : 'فقط بويا'}
                                    </Text>
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    <Text className="bg-secondary-indigo text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base">
                                        <Circle size={20} className="text-primary" />
                                        {direction === "ltr" ? 'Repair & paint' : 'تصليح وبويا'}
                                    </Text>
                                </TableHead>
                                <TableHead className="min-w-[160px]">
                                    <Text className="bg-secondary-pink text-white justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base">
                                        <Circle size={20} className="text-primary" />
                                        {direction === "ltr" ? 'Change piece' : 'تغيير القطعة'}
                                    </Text>
                                </TableHead>
                                <TableHead className="min-w-[120px]">
                                    <Text className="text-primary justify-center font-bold py-2 rounded-3xl flex gap-2 items-center mx-auto text-sm md:text-base">
                                        {direction === "ltr" ? 'Details' : 'التفاصيل'}
                                    </Text>
                                </TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody >
                            {carSections.map((section) => (
                                <TableRow key={section.id} className="text-center hover:bg-transparent border-gray-300 hover:bg-background group duration-500">
                                    <TableCell className="font-medium text-sm md:text-base text-start">{section.name}</TableCell>
                                    <TableCell> 
                                        <Checkbox 
                                            id={`no-defect-${section.id}`} 
                                            className='rounded-full h-5 w-5 '
                                        /> 
                                    </TableCell>
                                    <TableCell> 
                                        <Checkbox 
                                            id={`just-boya-${section.id}`} 
                                            className='rounded-full h-5 w-5 '
                                        /> 
                                    </TableCell>
                                    <TableCell> 
                                        <Checkbox 
                                            id={`repair-paint-${section.id}`} 
                                            className='rounded-full h-5 w-5'
                                        /> 
                                    </TableCell>
                                    <TableCell> 
                                        <Checkbox 
                                            id={`change-piece-${section.id}`} 
                                            className='rounded-full h-5 w-5'
                                        /> 
                                    </TableCell>
                                    <TableCell> 
                                        <Button 
                                            className='bg-background text-primary-light border hover:bg-primary duration-500 hover:text-white border-primary text-sm md:text-base px-3 py-2'
                                            size="sm"
                                        >
                                            {direction === 'ltr' ? 'Add' : 'إضافة'}
                                                <Plus/>

                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                </div>
            </Box>
            {/* photos */}

            <Box className="w-full md:justify-center items-start bg-white rounded-lg flex-wrap xs:justify-center pb-10" variant="row" dir={direction}>

                <Box className="bg-gray-100 px-5 py-5 w-full flex justify-start">
                    <Text className="font-bold text-primary">
                        {direction === "ltr" ? "Car Photos" : "صور السيارة"}
                    </Text>
                </Box>

                <Box className='flex-wrap h-full justify-start w-full gap-10 p-4' variant="row">
                <Box className="xl:w-[700px] h-[300px]  md:w-[100%] xs:w-[100%]" variant="column">
                <ImageUpload
                            imageFile={imageFile}
                            setImageFile={setImageFile}
                            setUploadedImageUrl={setUploadedImageUrl}
                            setImageLoadingState={setImageLoadingState}
                            imageLoadingState={imageLoadingState}
                            urlToUpload=''
                            isEditMode ={false}
                            className="border  border-dashed flex justify-center items-center min-h-[200px] border-primary px-5 py-5"
                            isCustomStyling={true}
                            labelText={direction === "ltr" ? "Cover image" : 'صورة الغلاف'}
                            labelDescription={direction === "ltr" ? "You can enter one image" : "يمكنك ادخال الى صورة واحد"}
                        />
                    </Box>
                    <Box className="xl:w-[700px] h-[300px]  md:w-[100%] xs:w-[100%]" variant="column">
                    <MultiImageUpload
                            imageFiles={imageFiles}
                            setImageFiles={setImageFiles}
                            setImageLoadingState={setImageLoadingState}
                            imageLoadingState={imageLoadingState}
                            isEditMode ={false}
                            className="border  border-dashed flex justify-center items-center min-h-[200px] border-primary px-5 py-5"
                            isCustomStyling={true}
                            labelText={direction === "ltr" ? "Cover Files" : 'ملفات السيارة'}
                            labelDescription={direction === "ltr" ? "You can enter 10 file" : "يمكنك ادخال الى 10 ملف"}
                        />
                    </Box>
                    <Box className="xl:w-[700px] h-[300px]  md:w-[100%] xs:w-[100%]" variant="column">
                    <MultiImageUpload
                            imageFiles={imageFiles}
                            setImageFiles={setImageFiles}
                            setImageLoadingState={setImageLoadingState}
                            imageLoadingState={imageLoadingState}
                            isEditMode ={false}
                            className="border  border-dashed flex justify-center items-center min-h-[200px] border-primary px-5 py-5"
                            isCustomStyling={true}
                            labelText={direction === "ltr" ? "Cover Files" : 'ملفات السيارة'}
                            labelDescription={direction === "ltr" ? "You can enter 10 file" : "يمكنك ادخال الى 10 ملف"}
                        />
                    </Box>
                    <Box className="xl:w-[700px] h-[300px] min-h-[200px]  md:w-[100%] xs:w-[100%]" variant="column">
                    <MultiImageUpload
                            imageFiles={imageFiles}
                            setImageFiles={setImageFiles}
                            setImageLoadingState={setImageLoadingState}
                            imageLoadingState={imageLoadingState}
                            isEditMode ={false}
                            className="border  border-dashed min-h-[200px] flex justify-center items-center border-primary px-5 py-5"
                            isCustomStyling={true}
                            labelText={direction === "ltr" ? "Car image" : 'صور السيارة'}
                            labelDescription={direction === "ltr" ? "You can enter 10 image" : "يمكنك ادخال الى 10 صور"}
                        />
                    </Box>
                </Box>


            </Box>
        </Box>
    );
}


export default AddProductStepThree
