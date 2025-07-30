'use client';

import { useState, useCallback, useMemo } from 'react';
import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Header from '@/components/web/ProductsPage/Header';
import AllCarListings from '../products/AllCarListings';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';

// Import the filter provider

// Import types
import type { QueryParams, FilterGroup } from '@/core/entities/api/api';
import { FilterProvider, useFilters } from '@/providers/filters.provider';
import ProductsFilter from '@/components/web/ProductsPage/Filter';

// Inner component that uses the filter context
const RentProductsContent = () => {
  const { queryParams } = useFilters();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: 'createdAt',
    sortDirection: 'desc' as 'asc' | 'desc',
  });

  // Handle sort change from Header component
  const handleSortChange = useCallback(
    (sortBy: string, sortDirection: 'asc' | 'desc') => {
      setCurrentSort({ sortBy, sortDirection });
    },
    [],
  );

  // Callback to update total items count
  const handleTotalItemsChange = useCallback((count: number) => {
    setTotalItems(count);
  }, []);

  // Override queryParams to always include the rental listing type filter
  const finalQueryParams: QueryParams = useMemo(() => {
    // Create a copy of the query params from the provider
    const baseParams = { ...queryParams };

    // Always ensure we have the rental filter
    const rentalFilterGroup: FilterGroup = {
      operator: 'and',
      filters: [
        {
          field: 'listingType',
          operator: 'eq',
          value: 'for_rent',
        },
      ],
    };

    // Add our rental filter to the existing filter groups
    const existingFilterGroups = baseParams.filterGroups || [];
    const finalFilterGroups = [...existingFilterGroups, rentalFilterGroup];

    return {
      ...baseParams,
      sortBy: currentSort.sortBy,
      sortDirection: currentSort.sortDirection,
      filterGroups: finalFilterGroups,
    };
  }, [queryParams, currentSort]);

  return (
    <Box variant="row" className="bg-background flex-wrap pb-10">
      {/* Breadcrumb Navigation */}
      <Box variant="container" className="w-full mb-2 mt-5">
        <SmartBreadcrumb
          items={[
            {
              label: 'Cars for Rent',
              arLabel: 'سيارات للإيجار',
              // No href since this is the current page
            },
          ]}
          variant="default"
          separator="default"
        />
      </Box>

      {/* Header Section with sort functionality */}
      <Box className="w-full shadow-xl bg-white pb-3 pt-3">
        <Header
          onSortChange={handleSortChange}
          totalItems={totalItems}
          currentSort={currentSort}
        />
      </Box>

      {/* Main Content Section */}
      <Box
        variant="container"
        className="flex flex-col lg:flex-row justify-between items-start gap-6"
      >
        {/* Filter Section - Fixed position on desktop */}
        <div className="w-full lg:w-[300px] lg:flex-shrink-0 relative">
          <div className="lg:sticky lg:top-5 w-full">
            <ProductsFilter />
          </div>
        </div>

        {/* Categories and Content Section */}
        <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
          <Categories />
          {/* Use the AllCarListings component with enhanced queryParams */}
          <AllCarListings
            showTitle={false}
            pageSize={8}
            queryParams={finalQueryParams}
            onTotalItemsChange={handleTotalItemsChange}
            container={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

// Main RentProducts component with provider wrapper
const RentProducts = () => {
  return (
    <FilterProvider>
      <RentProductsContent />
    </FilterProvider>
  );
};

export default RentProducts;
