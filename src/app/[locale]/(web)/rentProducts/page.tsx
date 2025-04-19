'use client'
import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Filter from '@/components/web/ProductsPage/Filter';
import Header from '@/components/web/ProductsPage/Header';
import AdsSection from '@/components/web/Home/AdsSection';
import React, { useState, useCallback } from 'react';
import AllCarListings from '../products/AllCarListings';
import { QueryParams } from '@/core/entities/api/api';

const RentProducts = () => {
    // Initialize with the special filter for rental cars
    const [queryParams, setQueryParams] = useState<QueryParams>({
        page: 1,
        pageSize: 8,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        where: [
            {
                field: 'listingType',
                operator: 'eq',
                value: 'for_rent'
            }
        ]
    });

    // Use a key to force remount of AllCarListings when needed
    const [listingKey, setListingKey] = useState<number>(0);

    // Handle filter changes from Filter component
    const handleFilterChange = useCallback((newParams: QueryParams) => {
        // Always include the listingType filter, regardless of other filters
        const rentalFilter = {
            field: 'listingType',
            operator: 'eq',
            value: 'for_rent'
        };

        // Ensure we keep the special filter while adding new filters
        const updatedWhere = newParams.where 
            ? [...newParams.where, rentalFilter] 
            : [rentalFilter];

        // Create the updated params
        const updatedParams = {
            ...newParams,
            where: updatedWhere
        };

        setQueryParams(updatedParams);
        
        // If this is a reset, force remount
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
                {/* Filter Section */}
                <div className="w-full lg:w-[300px] lg:flex-shrink-0">
                    <Filter onChange={handleFilterChange} />
                </div>

                {/* Categories and Content Section */}
                <Box className="w-full lg:w-[70%] xs:w-[100%]" variant="column">
                    <Categories />
                    {/* Pass filter parameters to AllCarListings */}
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

export default RentProducts;