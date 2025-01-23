'use client'
import Box from '@/components/box/box';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import React, { useState } from 'react';
import {
    Accordion,
    AccordionContent,
    AccordionItem,
    AccordionTrigger,
} from '@/components/ui/accordion';
import SelectDropdown from '@/components/SelectDropdown';
import { Checkbox } from '@/components/ui/checkbox';
import Image from 'next/image';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Button } from '@/components/ui/button';

type FilterOptionDropdownProps = {
    title?: string;
    options: { value: string; label: string }[];
    placeholder: string;
};

type FilterCheckboxItemProps = {
    id: string;
    imageSrc?: string;
    label: string;
};

const FilterOptionDropdown: React.FC<FilterOptionDropdownProps> = ({ title, options, placeholder }) => (
    <Box className="mb-4 w-full">
        <Label className="font-bold mb-2">{title}</Label>
        <SelectDropdown
            options={options}
            placeholder={placeholder}
            SelectTriggerStyle="border-0 outline-none shadow-none p-0"
            className="w-full"
        />
    </Box>
);

const FilterCheckboxItem: React.FC<FilterCheckboxItemProps> = ({ id, imageSrc, label }) => (
    <AccordionContent className="flex items-center">
        <Checkbox id={id} />
        <Label
            htmlFor={id}
            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 pl-2 pr-2 flex"
        >
            {/* Render Image conditionally */}
            {imageSrc && (
            <Image 
                src={imageSrc} 
                alt={label} 
                width={20} 
                height={20} 
                className="block" 
            />
            )}
            <Text variant="mid" className="pl-2 pr-2">
            {label}
            </Text>
        </Label>
    </AccordionContent>
);


const Filter: React.FC = () => {
    const t = useTranslations('carsPage')
    // State management for filters
    const [searchText, setSearchText] = useState('');
    const [selectedCity, setSelectedCity] = useState('');
    const [selectedState, setSelectedState] = useState('');
    const [selectedCarMarka, setSelectedCarMarka] = useState<string[]>([]);
    const [selectedCarModelMin, setSelectedCarModelMin] = useState('');
    const [selectedCarModelMax, setSelectedCarModelMax] = useState('');
    const [selectedPriceMin, setSelectedPriceMin] = useState('');
    const [selectedPriceMax, setSelectedPriceMax] = useState('');
    const [selectedCurrency, setSelectedCurrency] = useState('');
    const [selectedControlType, setSelectedControlType] = useState('');
    const [selectedFuelType, setSelectedFuelType] = useState('');

    // Reset function
    const resetFilters = () => {
        setSearchText('');
        setSelectedCity('');
        setSelectedState('');
        setSelectedCarMarka([]);
        setSelectedCarModelMin('');
        setSelectedCarModelMax('');
        setSelectedPriceMin('');
        setSelectedPriceMax('');
        setSelectedCurrency('');
        setSelectedControlType('');
        setSelectedFuelType('');
    };

    const citiesOptions = [
        { value: 'Damascus', label: t('filter.filterOptions.address.options.Damascus') },
        { value: 'Idlib', label: t('filter.filterOptions.address.options.Idlib') },
        { value: 'Aleppo', label: t('filter.filterOptions.address.options.Aleppo') },
        { value: 'Homs', label: t('filter.filterOptions.address.options.Homs') },
    ];

    const statesOptions = [
        { value: 'dm', label: t('filter.filterOptions.states.options.Damascus') },
        { value: 'ds', label: t('filter.filterOptions.states.options.Idlib') },
        { value: 'as', label: t('filter.filterOptions.states.options.Aleppo') },
        { value: 'ho', label: t('filter.filterOptions.states.options.Homs') },
    ];

    const carMarkaItems = [
        {
            id: 'mercedes',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Mercedes'),
        },
        {
            id: 'bmw',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw1',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw2',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw3',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw5',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw6',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw7',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw8',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
        {
            id: 'bmw9',
            imageSrc: '/assets/icons/BMW.png',
            label: t('filter.filterOptions.CarMarka.Bmw'),
        },
    ];

    const CarModelsOptions = [
        { value: '2020' , label: '2020'},
        { value: '2021', label: '2021'},
        { value: '2022' , label: '2022'},
        { value: '2023' , label: '2023'},
    ];
    const priceRanges = [
        {
            value: '20000',
            label:'10000',
        },
        {
            value: '30000',
            label: '30000',
        },
        {
            value: '40000',
            label: '40000',
        },
    ];
    const ControlType = [
        {
            id :'1',
            value: 'Auto',
            label: t('filter.filterOptions.ControlType.auto'),
        },
        {
            id:'2',
            value: 'Normal',
            label: t('filter.filterOptions.ControlType.normal'),
        },

    ];
    const FuelType = [
        {
            id :'1',
            value: 'Gasoline',
            label: t('filter.filterOptions.FuelType.gasoline'),
        },
        {
            id:'2',
            value: 'Diesel',
            label: t('filter.filterOptions.FuelType.diesel'),
        },

    ];

return (
    <Box variant="column" className="w-full">
        <Box variant="column" className="w-full p-4 bg-white rounded-lg">
           {/* Search */}
            <Box variant="column" className="justify-start items-start w-full">
                    <Label className="text-xl font-bold" htmlFor="search">
                        {t('filter.title')}
                    </Label>
                    <Box className="bg-background w-full rounded-2xl pr-2 pl-2 flex items-center">
                        <Input
                            type="text"
                            id="search"
                            placeholder={t('filter.searchInput')}
                            value={searchText}
                            onChange={(e) => setSearchText(e.target.value)}
                            className="border-none flex-1"
                        />
                        <Search />
                    </Box>
                </Box>

            {/* Address Filter */}
            <div className="justify-start items-start w-full">
            <Accordion type="single" collapsible className='pr-4 pl-4'>
                <AccordionItem value="address" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.address.filterOptionsTitle')}
                </AccordionTrigger>
                <AccordionContent className='w-full'>
                    <FilterOptionDropdown
                        options={citiesOptions}
                        placeholder={t('filter.filterOptions.address.placeHolder')}
                    />
                    <FilterOptionDropdown
                        options={statesOptions}
                        placeholder={t('filter.filterOptions.states.placeHolder')}
                    />
                </AccordionContent>
                </AccordionItem>
            </Accordion>
            </div>

            {/* Car Marka Filter */}
            <ScrollArea className="h-[250px]  justify-start items-start w-full text-primary border-b border-gray-200" dir='tlr'>
           {/* Car Marka Filter */}
                    <ScrollArea className="h-[250px] justify-start items-start w-full text-primary border-b border-gray-200" dir="tlr">
                        <Accordion 
                            type="single" 
                            collapsible 
                            defaultValue="car-marka"  // Set the default open accordion item
                            className="pr-4 pl-4"
                        >
                            <AccordionItem value="car-marka" className="border-none">
                            <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                                {t('filter.filterOptions.CarMarka.filterOptionsTitle')}
                            </AccordionTrigger>
                            {carMarkaItems.map((item) => (
                                <FilterCheckboxItem
                                key={item.id}
                                id={item.id}
                                imageSrc={item.imageSrc}
                                label={item.label}
                                />
                            ))}
                            </AccordionItem>
                        </Accordion>
                    </ScrollArea>

            </ScrollArea>


            {/* Car models */}
            <div className="justify-start items-start w-full">
            <Accordion type="single" collapsible className='pr-4 pl-4'>
                <AccordionItem value="address" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.CarModels.title')}
                </AccordionTrigger>
                <AccordionContent className='w-full flex'>
                    <FilterOptionDropdown
                        options={CarModelsOptions}
                        placeholder={t('filter.filterOptions.CarModels.lessYear')}
                    />
                    <FilterOptionDropdown
                        options={CarModelsOptions}
                        placeholder={t('filter.filterOptions.CarModels.highestYear')}
                    />
                </AccordionContent>
                </AccordionItem>
            </Accordion>
            </div>


            {/* Car models */}
            <div className="justify-start items-start w-full">
                <Accordion type="single" collapsible className='pr-4 pl-4'>
                    <AccordionItem value="address" className="border-none">
                    <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                        {t('filter.filterOptions.CarPrice.title')}
                    </AccordionTrigger>
                    <AccordionContent className='w-full flex flex-wrap'>
                            <Box className='w-full'>
                                <FilterOptionDropdown
                                options={priceRanges}
                                placeholder={t('filter.filterOptions.CarPrice.lessPrice')}
                                    />
                                <FilterOptionDropdown
                                    options={priceRanges}
                                    placeholder={t('filter.filterOptions.CarPrice.highestPrice')}
                                />
                            </Box>
                        <Box className='block w-full'>
                        <FilterOptionDropdown
                            options={priceRanges}
                            placeholder={t('filter.filterOptions.CarPrice.currency')}
                        />
                        </Box>
                    </AccordionContent>
                    </AccordionItem>
                </Accordion>
            </div>
                            
            {/* Control type  */}
            <div className="justify-start items-start w-full">
            <Accordion 
                type="single" 
                collapsible 
                defaultValue="car-marka"  // Set the default open accordion item
                className="pr-4 pl-4"
            >
                <AccordionItem value="car-marka" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.ControlType.title')}
                </AccordionTrigger>
                {ControlType.map((item) => (
                    <FilterCheckboxItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                    />
                ))}
                </AccordionItem>
            </Accordion>
            </div>

                 {/* Fuel type  */}
            <div className="justify-start items-start w-full">
            <Accordion 
                type="single" 
                collapsible 
                defaultValue="car-marka"  // Set the default open accordion item
                className="pr-4 pl-4"
            >
                <AccordionItem value="car-marka" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.FuelType.title')}
                </AccordionTrigger>
                {FuelType.map((item) => (
                    <FilterCheckboxItem
                        key={item.id}
                        id={item.id}
                        label={item.label}
                    />
                ))}
                </AccordionItem>
            </Accordion>
            </div>
        </Box>

        <Box variant="column" className='bg-white w-full p-4 rounded-lg'>
                <Button className='w-full bg-primary-foreground text-primary font-bold'>
                    {t('filter.filterOptions.search')}
                </Button>
                <Button className='bg-transparent text-primary shadow-none'>
                    {t('filter.filterOptions.resetSearch')}

                </Button>
        </Box>
    </Box>
    );
};

export default Filter;
