'use client';

import Box from '@/components/ui/box';
import { useLocale, useTranslations } from 'next-intl';
import React, { useMemo } from 'react';
import CategoryCarousel from '../design/CategoryCarousel';
import { getBodyTypeOptions, SelectOption } from '@/core/entities/enums/cars.enums';
import { useGetBodyTypeCategoryCounts } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { useFilters } from '@/providers/filters.provider';

const Categories = () => {
  const t = useTranslations('addProduct.enteredData.stepTwo');
  const locale = useLocale();
  const direction = locale === 'ar' ? 'rtl' : 'ltr';

  // Use filter context to apply category filters
  const { updateFilter, filterSchema, filters } = useFilters();


  // Fetch body type category counts from backend
  const { data: bodyTypeCategoryCounts, isLoading } =
    useGetBodyTypeCategoryCounts(filters.listingTypeId ?? 1);

  // Get body type options with translations from schema or fallback to enums
  const bodyTypeOptions = useMemo(() => {
    if (filterSchema) {
      const attribute = filterSchema.sections
        .flatMap(s => s.attributes)
        .find(a => a.slug === 'body_type');
        
      if (attribute && attribute.options) {
        return attribute.options.map((opt: any) => ({
          value: opt.id,
          label: opt.label[locale] || opt.label['en'] || opt.id
        }));
      }
    }
    return getBodyTypeOptions(t);
  }, [filterSchema, t, locale]);

  // Process the backend data to match the frontend format
  const categoriesWithCounts = useMemo(() => {
    if (!bodyTypeCategoryCounts?.data) {
      return [];
    }

    const countsMap = new Map<string, number>();
    const rawData = bodyTypeCategoryCounts.data;

    if (Array.isArray(rawData)) {
      // 1. Look for attribute object with attributeSlug === 'body_type'
      const bodyTypeData = rawData.find(
        (attr: any) =>
          attr?.attributeSlug === 'body_type' ||
          attr?.slug === 'body_type' ||
          attr?.attributeId === 10,
      );

      if (bodyTypeData?.counts && Array.isArray(bodyTypeData.counts)) {
        bodyTypeData.counts.forEach((item: any) => {
          const val = String(item?.value ?? item?.id ?? item?.slug ?? '').toLowerCase();
          if (val) {
            countsMap.set(val, Number(item?.count) || 0);
          }
        });
      }

      // 2. Direct array items (FacetCount or BodyTypeCategoryCount format)
      rawData.forEach((item: any) => {
        if (item?.bodyType) {
          countsMap.set(String(item.bodyType).toLowerCase(), Number(item.count) || 0);
        } else if (
          item?.field === 'details.bodyType' ||
          item?.field === 'bodyType' ||
          item?.field === 'attrs.body_type'
        ) {
          countsMap.set(String(item.value).toLowerCase(), Number(item.count) || 0);
        }
      });
    } else if (typeof rawData === 'object' && rawData !== null) {
      Object.entries(rawData).forEach(([key, count]) => {
        countsMap.set(key.toLowerCase(), Number(count) || 0);
      });
    }

    // Map body type options with their counts
    return bodyTypeOptions.map((option: SelectOption) => {
      const optVal = String(option.value).toLowerCase();
      const count =
        countsMap.get(optVal) ??
        (optVal === 'wagon' ? countsMap.get('station_wagon') : undefined) ??
        (optVal === 'station_wagon' ? countsMap.get('wagon') : undefined) ??
        0;

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
      grand_coupe: '/assets/icons/004-van.png',
      hatchback: '/assets/icons/019-MVP.png',
      pickup: '/assets/icons/004-van.png',
      van: '/assets/icons/001-car.png',
      convertible: '/assets/icons/019-MVP.png',
      wagon: '/assets/icons/004-van.png',
      station_wagon: '/assets/icons/004-van.png',
      truck: '/assets/icons/025-bus.png',
      minivan: '/assets/icons/001-car.png',
      cross_over: '/assets/icons/015-suv.png',
      other: '/assets/icons/025-bus.png',
    };

    // Return specific image if available, otherwise use default
    return imageMap[bodyType] || '/assets/icons/001-car.png';
  }

  // Only show for Cars (listingTypeId 1)
  if (filters.listingTypeId !== 1) {
    return null;
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
