'use client';

import Box from '@/components/box/box';
import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import CategoryCarousel from '../design/CategoryCarousel';
import { getBodyTypeOptions } from '@/core/entities/enums/cars.enums';
import { useGetBodyTypeCategoryCounts } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { useFilters } from '@/providers/filters.provider';

const Categories = () => {
  const t = useTranslations('addProduct.enteredData.stepTow');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // Use filter context to apply category filters
  const { updateFilter } = useFilters();

  // Fetch body type category counts from backend
  const { data: bodyTypeCategoryCounts, isLoading } =
    useGetBodyTypeCategoryCounts();

  // Get body type options with translations
  const bodyTypeOptions = getBodyTypeOptions(t);

  // Process the backend data to match the frontend format
  const categoriesWithCounts = useMemo(() => {
    if (!bodyTypeCategoryCounts?.data) {
      return [];
    }

    // Create a map from backend data for quick lookup
    const countsMap = new Map<string, number>();
    bodyTypeCategoryCounts.data.forEach((item: any) => {
      countsMap.set(item.bodyType, item.count);
    });

    // Map body type options with their counts
    return bodyTypeOptions.map((option) => {
      const count = countsMap.get(option.value) || 0;

      return {
        title: option.label,
        carCount: count.toString(),
        // Map body types to different icon images
        image: getImageForBodyType(option.value),
        value: option.value,
        // Add click handler to filter by body type
        onClick: () => {
          updateFilter('bodyType', option.value);
        },
      };
    }); // Only show categories with cars
  }, [bodyTypeCategoryCounts, bodyTypeOptions, updateFilter]);

  // Helper function to map body types to appropriate images
  function getImageForBodyType(bodyType: string): string {
    const imageMap: Record<string, string> = {
      sedan: '/assets/icons/001-car.png',
      suv: '/assets/icons/015-suv.png',
      coupe: '/assets/icons/004-van.png',
      hatchback: '/assets/icons/019-MVP.png',
      pickup: '/assets/icons/004-van.png',
      van: '/assets/icons/001-car.png',
      convertible: '/assets/icons/019-MVP.png',
      wagon: '/assets/icons/004-van.png',
      truck: '/assets/icons/025-bus.png',
      minivan: '/assets/icons/001-car.png',
      other: '/assets/icons/025-bus.png',
    };

    // Return specific image if available, otherwise use default
    return imageMap[bodyType] || '/assets/icons/001-car.png';
  }

  return (
    <Box className="w-full xs:mt-10 lg:m-0">
      <CategoryCarousel
        data={categoriesWithCounts}
        direction={direction}
        isLoading={isLoading}
      />
    </Box>
  );
};

export default Categories;
