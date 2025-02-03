'use client'
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Textarea } from '@/components/ui/textarea';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState } from 'react';

const AddProductStepOne = () => {
    const t = useTranslations('addProduct');
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';
    const [selectedMarka, setSelectedMarka] = useState<string | null>(null);
    const [selectedYear, setSelectedYear] = useState<string | null>(null);
    const [selectedModel, setSelectedModel] = useState<string | null>(null);

    // Default car brands
    const [carMarka, setCarMarka] = useState([
        { value: 'toyota', label: t('enteredData.branda.options.productMarka.toyota') },
        { value: 'honda', label: t('enteredData.branda.options.productMarka.honda') },
        { value: 'ford', label: t('enteredData.branda.options.productMarka.ford') },
        { value: 'bmw', label: t('enteredData.branda.options.productMarka.bmw') },
        { value: 'mercedes', label: t('enteredData.branda.options.productMarka.mercedes') },
        { value: 'audi', label: t('enteredData.branda.options.productMarka.audi') },
        { value: 'nissan', label: t('enteredData.branda.options.productMarka.nissan') },
        { value: 'chevrolet', label: t('enteredData.branda.options.productMarka.chevrolet') }
    ]);

    // Made Year options
    const [madeYear, setMadeYear] = useState([
        { value: '2020', label: t('enteredData.madeYear.options.2020') },
        { value: '2021', label: t('enteredData.madeYear.options.2021') },
        { value: '2022', label: t('enteredData.madeYear.options.2022') },
        { value: '2023', label: t('enteredData.madeYear.options.2023') },
        { value: '2024', label: t('enteredData.madeYear.options.2024') }
    ]);

    // Car model options
    const [carModel, setCarModel] = useState([
        { value: 'sedan', label: t('enteredData.model.options.sedan') },
        { value: 'suv', label: t('enteredData.model.options.suv') },
        { value: 'truck', label: t('enteredData.model.options.truck') },
        { value: 'coupe', label: t('enteredData.model.options.coupe') }
    ]);

    const handleSelectChange = (type: string, value: string) => {
        if (type === 'marka') setSelectedMarka(value);
        if (type === 'year') setSelectedYear(value);
        if (type === 'model') setSelectedModel(value);
    };

    // onChange handlers for input fields
    const handleMarkaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedMarka(e.target.value);
    };

    const handleModelChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedModel(e.target.value);
    };

    const handleYearChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSelectedYear(e.target.value);
    };

    return (
        <Box className="w-full justify-start items-center bg-white  rounded-lg flex-wrap xs:justify-center" variant="row" dir={direction}>
            <Box className="min-w-[250px] px-5 py-5 justify-start items-start" variant="column">
                <Text className='text-primary font-bold text-xl'>
                    {t('enteredData.branda.title')}
                </Text>
                <Box variant="column" className='border border-gray-200 px-5 rounded-lg'>
                    <Box className="mt-4 mb-4">
                        <Input 
                            type="text" 
                            placeholder={""}  
                            value={selectedMarka || ''} 
                            onChange={handleMarkaChange} 
                        />
                        <Button className='bg-primary-foreground text-primary' type="submit">
                            {direction === 'ltr' ? 'Add' : "إضافة"}
                        </Button>
                    </Box>
                    <ScrollArea
                        className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        dir={direction}
                    >
                        <Box variant="column" className="w-full justify-start items-start" dir={direction}>
                            {/* Display each car brand */}
                            {carMarka.map((marka) => (
                                <Button
                                    key={marka.value}
                                    onClick={() => handleSelectChange('marka', marka.value)}
                                    className={`w-full py-6 px-4 text-primary font-semibold border-b bg-transparent border-b-gray-200 ${selectedMarka === marka.value ? 'bg-primary-foreground text-primary' : ''}`}
                                >
                                    <span className={`w-full ${direction === 'ltr' ? 'text-left' : 'text-right'}`} >
                                        {marka.label}
                                    </span>
                                </Button>
                            ))}
                        </Box>
                    </ScrollArea>
                </Box>
            </Box>

            {/* Similar implementation for Model and Year Inputs */}
            <Box className="min-w-[250px] px-5 py-5 justify-start items-start" variant="column">
                <Text className='text-primary font-bold text-xl'>
                    {t('enteredData.model.title')}
                </Text>
                <Box variant="column" className='border border-gray-200 px-5 rounded-lg'>
                    <Box className="mt-4 mb-4">
                        <Input 
                            type="text" 
                            placeholder={""}  
                            value={selectedModel || ''} 
                            onChange={handleModelChange} 
                        />
                        <Button className='bg-primary-foreground text-primary' type="submit">
                            {direction === 'ltr' ? 'Add' : "إضافة"}
                        </Button>
                    </Box>
                    <ScrollArea
                        className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        dir={direction}
                    >
                        <Box variant="column" className="w-full justify-start items-start" dir={direction}>
                            {/* Display each car model */}
                            {carModel.map((model) => (
                                <Button
                                    key={model.value}
                                    onClick={() => handleSelectChange('model', model.value)}
                                    className={`w-full py-6 px-4 text-primary font-semibold border-b bg-transparent border-b-gray-200 ${selectedModel === model.value ? 'bg-primary-foreground text-primary' : ''}`}
                                >
                                    <span className={`w-full ${direction === 'ltr' ? 'text-left' : 'text-right'}`} >
                                        {model.label}
                                    </span>
                                </Button>
                            ))}
                        </Box>
                    </ScrollArea>
                </Box>
            </Box>

            <Box className="min-w-[250px] px-5 py-5 justify-start items-start" variant="column">
                <Text className='text-primary font-bold text-xl'>
                    {t('enteredData.madeYear.title')}
                </Text>
                <Box variant="column" className='border border-gray-200 px-5 rounded-lg'>
                    <Box className="mt-4 mb-4">
                        <Input 
                            type="text" 
                            placeholder={""}  
                            value={selectedYear || ''} 
                            onChange={handleYearChange} 
                        />
                        <Button className='bg-primary-foreground text-primary' type="submit">
                            {direction === 'ltr' ? 'Add' : "إضافة"}
                        </Button>
                    </Box>
                    <ScrollArea
                        className="h-[300px] w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        dir={direction}
                    >
                        <Box variant="column" className="w-full justify-start items-start" dir={direction}>
                            {/* Display each car year */}
                            {madeYear.map((year) => (
                                <Button
                                    key={year.value}
                                    onClick={() => handleSelectChange('year', year.value)}
                                    className={`w-full py-6 px-4 text-primary font-semibold border-b bg-transparent border-b-gray-200 ${selectedYear === year.value ? 'bg-primary-foreground text-primary' : ''}`}
                                >
                                    <span className={`w-full ${direction === 'ltr' ? 'text-left' : 'text-right'}`} >
                                        {year.label}
                                    </span>
                                </Button>
                            ))}
                        </Box>
                    </ScrollArea>
                </Box>
            </Box>

            <Box className="min-w-[250px] py-5 justify-start items-start " variant="column">
                <Text className='text-primary font-bold text-xl'>
                    {direction === 'ltr' ? 'Story of car' : 'قصة السيارة'}
                </Text>
                    <Textarea className=' px-5 border-gray-100' placeholder={`${direction === 'ltr' ? 'Write your message here ' : 'اكتب رسالتك هنا'}`} id="message-2" cols={20} rows={17}/>
                        
            </Box>


        </Box>
    );
};

export default AddProductStepOne;
