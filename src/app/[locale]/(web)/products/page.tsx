'use client';

import { useState, useCallback } from 'react';
import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Header from '@/components/web/ProductsPage/Header';
import AllCarListings from './AllCarListings';
import SmartBreadcrumb from '@/components/smart-breadcrumbs';

// Import the filter provider

// Import types
import type { QueryParams } from '@/core/entities/api/api';
import { FilterProvider, useFilters } from '@/providers/filters.provider';
import ProductsFilter from '@/components/web/ProductsPage/Filter';

// Inner component that uses the filter context
const ProductsContent = () => {
  const { queryParams } = useFilters();
  const [totalItems, setTotalItems] = useState<number>(0);
  const [currentSort, setCurrentSort] = useState({
    sortBy: 'publishedAt',
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

  // Merge current sort with filter query params
  const finalQueryParams: QueryParams = {
    ...queryParams,
    sortBy: currentSort.sortBy,
    sortDirection: currentSort.sortDirection,
  };

  return (
    <Box
      variant="row"
      className="bg-background flex-wrap overflow-hidden pb-10"
    >
      {/* Breadcrumb Navigation - Positioned at the top */}
      <Box variant="container" className="w-full mb-2 overflow-hidden pt-5">
        <SmartBreadcrumb
          items={[
            {
              label: 'Cars',
              arLabel: 'السيارات',
              // No href since this is the current page
            },
          ]}
          variant="default"
          separator="default"
        />
      </Box>

      {/* Header Section with sort functionality */}
      <Box className="w-full shadow-xl pb-3 pt-3 relative overflow-hidden bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white before:absolute before:inset-0 before:bg-[linear-gradient(90deg,transparent_0%,transparent_48%,#198341/10_49%,#198341/10_51%,transparent_52%,transparent_100%)] before:pointer-events-none">
        {/* Decorative Corner Accents */}
        <div className="absolute top-0 left-0 w-20 h-20 bg-gradient-to-br from-[#198341]/20 to-transparent rounded-br-full pointer-events-none"></div>
        <div className="absolute bottom-0 right-0 w-20 h-20 bg-gradient-to-tl from-[#ABDE3B]/20 to-transparent rounded-tl-full pointer-events-none"></div>

        {/* Top Border Accent */}
        <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>

        <Header
          onSortChange={handleSortChange}
          totalItems={totalItems}
          currentSort={currentSort}
        />
      </Box>

      {/* Main Content Section */}
      <Box
        variant="container"
        className="flex flex-col xl:flex-row justify-between items-start gap-6"
      >
        {/* Filter Section - Fixed position on desktop */}
        <div className="w-full xl:w-[360px] xl:flex-shrink-0 relative">
          <div className="xl:sticky xl:top-5 w-full">
            <ProductsFilter />
          </div>
        </div>

        {/* Categories and Content Section */}
        <Box className="w-full xl:w-[70%] xs:w-[100%]" variant="column">
          <Categories />
          {/* Use the AllCarListings component with queryParams from provider */}
          <AllCarListings
            showTitle={false}
            pageSize={16}
            queryParams={finalQueryParams}
            onTotalItemsChange={handleTotalItemsChange}
            container={false}
          />
        </Box>
      </Box>
    </Box>
  );
};

// Main Products component with provider wrapper
const Products = () => {
  return (
    <FilterProvider>
      <ProductsContent />
    </FilterProvider>
  );
};

export default Products;
