import Box from '@/components/box/box';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Search } from 'lucide-react';
import React from 'react';
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

type FilterOptionDropdownProps = {
    title?: string;
    options: { value: string; label: string }[];
    placeholder: string;
};

type FilterCheckboxItemProps = {
    id: string;
    imageSrc: string;
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
        <Image src={imageSrc} alt={label} width={20} height={20} />
        <Text variant="mid" className="pl-2 pr-2">
            {label}
        </Text>
        </Label>
    </AccordionContent>
);

const Filter: React.FC = () => {
    const t = useTranslations('carsPage')

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
        label: t('filter.filterOptions.CarsMarka.Mercedes'),
        },
        {
        id: 'bmw',
        imageSrc: '/assets/icons/BMW.png',
        label: t('filter.filterOptions.CarsMarka.Bmw'),
        },
    ];

return (
    <Box variant="column" className="w-full">
        <Box variant="column" className="w-full p-4">
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
                className="border-none flex-1"
                />
                <Search />
            </Box>
            </Box>

            {/* Address Filter */}
            <div className="justify-start items-start w-full">
            <Accordion type="single" collapsible>
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
            <div className="justify-start items-start w-full">
            <Accordion type="single" collapsible>
                <AccordionItem value="car-marka" className="border-none">
                <AccordionTrigger className="hover:no-underline font-cairo font-bold text-primary">
                    {t('filter.filterOptions.CarsMarka.filterOptionsTitle')}
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
            </div>
        </Box>
    </Box>
    );
};

export default Filter;
