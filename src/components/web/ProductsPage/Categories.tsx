'use client';

import Box from '@/components/box/box';
import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import CategoryCarousel from '../design/CategoryCarousel';
import { getBodyTypeOptions } from '@/core/entities/enums/cars.enums';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';

const Categories = () => {
    const t = useTranslations('addProduct.enteredData.stepTow');
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr';

    // Fetch car listings with empty params to get all cars
    const { data: carListingsData, isLoading } = useCarListings({});
    
    // Get body type options with translations
    const bodyTypeOptions = getBodyTypeOptions(t);
    
    // Count cars per body type based on the car listings data
    const categoriesWithCounts = useMemo(() => {
        // Get all car listings - adjusting the path to match your actual data structure
        const carListings = carListingsData?.data?.data || [];
        
        // Create a map to count cars per body type
        const bodyCounts: Record<string, number> = {};
        bodyTypeOptions.forEach(option => {
            bodyCounts[option.value] = 0;
        });
        
        // Count cars for each body type
        carListings.forEach((car: any) => {
            const bodyType = car.details?.bodyType;
            if (bodyType && bodyCounts[bodyType] !== undefined) {
                bodyCounts[bodyType]++;
            }
        });
        
        // Create categories array with counts
        return bodyTypeOptions.map(option => ({
            title: option.label,
            carCount: bodyCounts[option.value].toString(),
            image: `/assets/icons/001-car.png`, // Using the constant image as specified
            value: option.value
        }));
    }, [carListingsData, bodyTypeOptions]);
    
    return (
        <Box className="xs:w-[300px] md:w-[600px] lg:w-full xs:mt-10 lg:m-0">
            <CategoryCarousel 
                data={categoriesWithCounts} 
                direction={direction} 
                isLoading={isLoading} 
            />
        </Box>
    );
};

export default Categories;