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

    // Fetch car listings with empty params to get counts (no pagination to get all)
    const { data: carListingsData, isLoading } = useCarListings({
        page: 1,
        pageSize: 999, 
    });
    
    // Get body type options with translations
    const bodyTypeOptions = getBodyTypeOptions(t);
    
    // Count cars per body type based on the car listings data
    const categoriesWithCounts = useMemo(() => {
        // Extract car listings data safely, checking all possible structures
        let carListings = [];
        const apiData = carListingsData as any;
        
        if (Array.isArray(apiData?.data)) {
            carListings = apiData.data;
        } else if (apiData?.data?.data && Array.isArray(apiData.data.data)) {
            carListings = apiData.data.data;
        } else if (apiData?.items && Array.isArray(apiData.items)) {
            carListings = apiData.items;
        } else {
            // No valid data structure found, use empty array
            console.warn('Could not extract car listings data from API response');
        }
        
        // Create a map to count cars per body type
        const bodyCounts: Record<string, number> = {};
        
        // Initialize all body types with 0 count
        bodyTypeOptions.forEach(option => {
            bodyCounts[option.value] = 0;
        });
        
        // Count cars for each body type
        carListings.forEach((car: any) => {
            // Handle both possible data structures
            // 1. If details is a nested object
            if (car.details && car.details.bodyType) {
                const bodyType = car.details.bodyType;
                if (bodyCounts[bodyType] !== undefined) {
                    bodyCounts[bodyType]++;
                }
            } 
            // 2. If bodyType is directly on the car object
            else if (car.bodyType) {
                const bodyType = car.bodyType;
                if (bodyCounts[bodyType] !== undefined) {
                    bodyCounts[bodyType]++;
                }
            }
        });

        
        // Create categories array with counts and images
        return bodyTypeOptions.map(option => {
            // Default count is 0 if no count found
            const count = bodyCounts[option.value] || 0;
            
            return {
                title: option.label,
                carCount: count.toString(),
                // Map body types to different icon images
                image: getImageForBodyType(option.value),
                value: option.value
            };
        });
    }, [carListingsData, bodyTypeOptions]);
    
    // Helper function to map body types to appropriate images
    function getImageForBodyType(bodyType: string): string {
        const imageMap: Record<string, string> = {
            'sedan': '/assets/icons/001-car.png',
            'suv': '/assets/icons/015-suv.png',
            'coupe': '/assets/icons/004-van.png',
            'hatchback': '/assets/icons/019-MVP.png',
            'pickup': '/assets/icons/004-van.png',
            'van': '/assets/icons/001-car.png',
            'convertible': '/assets/icons/019-MVP.png',
            'wagon': '/assets/icons/004-van.png',
            'truck': '/assets/icons/025-bus.png',
            'minivan': '/assets/icons/001-car.png',
            'other' : '/assets/icons/025-bus.png'
        };
        
        // Return specific image if available, otherwise use default
        return imageMap[bodyType] ;
    }
    
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