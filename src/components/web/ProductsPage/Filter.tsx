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
import { getCarMarkaItems, getCarModelsOptions, getCitiesOptions, getControlType, getFuelType, getPriceRanges, getStatesOptions } from '@/constants/filterData';

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
    <AccordionContent className="flex items-center pr-4 pl-4">
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
    const t = useTranslations('productsPage')
    // State management for filters
    const [searchText, setSearchText] = useState('');


    const citiesOptions = getCitiesOptions(t);
    const ControlType = getControlType(t);
    const statesOptions = getStatesOptions(t);
    const carMarkaItems = getCarMarkaItems(t);
    const priceRanges = getPriceRanges; 
    const CarModelsOptions = getCarModelsOptions;
    const FuelType = getFuelType(t);




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
         {/* Car Marka Filter */}
            <div className="w-full ">
                {/* Constant AccordionTrigger (placed outside ScrollArea but still inside Accordion) */}
                <Accordion type="single" collapsible defaultValue="car-marka" className="">
                    <AccordionItem value="car-marka" className="border-none">
                    <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                        {t('filter.filterOptions.productMarka.filterOptionsTitle')}
                    </AccordionTrigger>

                    {/* Scrollable Content (Items inside Accordion) */}
                    <ScrollArea
                        className="h-[250px]  w-full overflow-y-auto scrollbar-thin scrollbar-thumb-[#198341] scrollbar-track-[#e5e7eb] scrollbar-thumb-rounded-full scrollbar-track-rounded-full"
                        dir="tlr"
                    >
                        {carMarkaItems.map((item) => (
                            <FilterCheckboxItem key={item.id} id={item.id} imageSrc={item.imageSrc} label={item.label} />
                        ))}
                    </ScrollArea>
                    </AccordionItem>
                </Accordion>
                </div>


            {/* Car models */}
            <div className="justify-start items-start w-full">
            <Accordion type="single" collapsible className='pr-4 pl-4'>
                <AccordionItem value="address" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.productModels.title')}
                </AccordionTrigger>
                <AccordionContent className='w-full flex'>
                    <FilterOptionDropdown
                        options={CarModelsOptions}
                        placeholder={t('filter.filterOptions.productModels.lessYear')}
                    />
                    <FilterOptionDropdown
                        options={CarModelsOptions}
                        placeholder={t('filter.filterOptions.productModels.highestYear')}
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
                        {t('filter.filterOptions.productPrice.title')}
                    </AccordionTrigger>
                    <AccordionContent className='w-full flex flex-wrap'>
                            <Box className='w-full'>
                                <FilterOptionDropdown
                                options={priceRanges}
                                placeholder={t('filter.filterOptions.productPrice.lessPrice')}
                                    />
                                <FilterOptionDropdown
                                    options={priceRanges}
                                    placeholder={t('filter.filterOptions.productPrice.highestPrice')}
                                />
                            </Box>
                        <Box className='block w-full'>
                        <FilterOptionDropdown
                            options={priceRanges}
                            placeholder={t('filter.filterOptions.productPrice.currency')}
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
