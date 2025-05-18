'use client'
import Box from '@/components/box/box';
import Categories from '@/components/web/ProductsPage/Categories';
import Filter from '@/components/web/ProductsPage/Filter';
import Header from '@/components/web/ProductsPage/Header';
import React, { useState, useCallback, useMemo } from 'react';
import AllCarListings from '../products/AllCarListings';
import { QueryParams } from '@/core/entities/api/api';
import { Breadcrumb, BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbSeparator } from '@/components/ui/breadcrumb';
import { useLocale } from 'next-intl';

const RentProducts = () => {
    // Initialize with the special filter for rental cars
    const locale = useLocale()
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
    const [totalItems, setTotalItems] = useState<number>(0);
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

    const handleSortChange = useCallback((sortBy: string, sortDirection: 'asc' | 'desc') => {
        setQueryParams(prevParams => ({
            ...prevParams,
            sortBy,
            sortDirection
        }));
    }, []);
      // Current sort settings - memoized for performance
        const currentSort = useMemo(() => ({
            sortBy: queryParams.sortBy || 'createdAt',
            sortDirection: queryParams.sortDirection || 'desc'
        }), [queryParams.sortBy, queryParams.sortDirection]);
    
  // Callback to update total items count
    const handleTotalItemsChange = useCallback((count: number) => {
        setTotalItems(count);
    }, []);

    return (
        <Box variant="row" className="mt-[10px] bg-background flex-wrap">
            {/* Header Section */}
             <Box variant="container" className="w-full mb-4">
                    <Breadcrumb dir={locale === "ar" ? "rtl" : "ltr"}>
                    <BreadcrumbList dir={locale === "ar" ? "rtl" : "ltr"}>
                        <BreadcrumbItem dir={locale === "ar" ? "rtl" : "ltr"}>
                        <BreadcrumbLink className="hover:text-black text-black" href="/">
                            {locale === "ar" ? "الرئيسية" : "Home"}
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator lang={locale === "ar" ? "ar" : "en"} />
                        <BreadcrumbItem>
                        <BreadcrumbLink className="text-primary hover:text-primary-light" href="#">
                            {locale === "ar" ? "تأجير السيارات" : "Cars for rent"}
                        </BreadcrumbLink>
                        </BreadcrumbItem>
                        <BreadcrumbSeparator lang={locale === "ar" ? "ar" : "en"} />
                        <BreadcrumbItem></BreadcrumbItem>
                    </BreadcrumbList>
                    </Breadcrumb>
                </Box>

                <Box  className=" w-full shadow-xl bg-white pb-3 pt-3" >
                    <Header onSortChange={handleSortChange} totalItems={totalItems} currentSort={currentSort} />

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
                        onTotalItemsChange={handleTotalItemsChange}
                        container={false}
                    />
                </Box>
            </Box>
        </Box>
    );
};

export default RentProducts;