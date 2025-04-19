'use client';
import React, { useState, useCallback } from 'react';
import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Filter from '@/components/web/ProductsPage/Filter';
import Header from '@/components/web/ProductsPage/Header';
import AdsSection from '@/components/web/Home/AdsSection';
import AllCarListings from './AllCarListings';

// Import types
import { QueryParams } from '@/core/entities/api/api';

const Products = () => {
    const [queryParams, setQueryParams] = useState<QueryParams>({
        page: 1,
        pageSize: 8,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });
    
    // Use a key to force remount of AllCarListings when needed
    const [listingKey, setListingKey] = useState<number>(0);

    // Handle filter changes from Filter component
    const handleFilterChange = useCallback((newParams: QueryParams) => {
        setQueryParams(newParams);
        
        // If this is a reset (no where or filterGroups), force remount
        if (!newParams.where && !newParams.filterGroups) {
            setListingKey(prevKey => prevKey + 1);
        }
    }, []);

    return (
        <Box variant="row" className="mt-[30px] bg-background flex-wrap">
            {/* Header Section */}
            <Box className="mt-[50px] w-full" variant="center">
                <Header />
            </Box>

            {/* Main Content Section */}
            <Box 
                variant="container" 
                className="flex flex-col lg:flex-row justify-between items-start gap-6"
            >
                {/* Filter Section - Fixed position on desktop */}
                <div className="w-full lg:w-[300px] lg:flex-shrink-0 relative">
                    {/* On mobile, the filter is full width and not sticky */}
                    {/* On desktop, the filter is fixed width and sticky */}
                    <div className="lg:sticky lg:top-5 w-full">
                        <Filter onChange={handleFilterChange} />
                    </div>
                </div>

                {/* Categories and Content Section */}
                <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
                    <Categories />
                    {/* Use the AllCarListings component with queryParams and key for forced remount */}
                    <AllCarListings 
                        key={listingKey}
                        showTitle={false} 
                        pageSize={8} 
                        queryParams={queryParams}
                    />
                    <AdsSection />
                </Box>
            </Box>
        </Box>
    );
};

export default Products;