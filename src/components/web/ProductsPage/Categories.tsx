import Box from '@/components/box/box';
import { useLocale, useTranslations } from 'next-intl';
import React from 'react';
import CategoryCarousel from '../design/CategoryCarousel';
import { getBodyTypeOptions } from '@/core/entities/enums/cars.enums';

const Categories = () => {
    const t = useTranslations('addProduct.enteredData.stepTow');
    const locale = useLocale(); // Get current locale
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction

    // Get body type options with translations
    const bodyTypeOptions = getBodyTypeOptions(t);
    
    // Create categories array using body types
    const categories = bodyTypeOptions.map(option => ({
        title: option.label,
        carCount: '0', // You might want to fetch actual counts from your API
        image: `/assets/icons/001-car.png`, // Assuming you have these icons
        value: option.value // Store the actual value for filtering
    }));

    return (
        <Box className="xs:w-[300px] md:w-[600px] lg:w-full xs:mt-10 lg:m-0">
            <CategoryCarousel data={categories} direction={direction} />
        </Box>
    );
};

export default Categories;