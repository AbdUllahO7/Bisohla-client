'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useCallback, useMemo, useEffect } from 'react';
import { useMyCarListings } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import type { QueryParams } from '@/core/entities/api/api';
import Filter from '@/components/web/ProductsPage/Filter';
import Pagination from '@/components/Pagination';

const UserProductPage = () => {
    const t = useTranslations('homePage');
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    const session = useSession();
    const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({});
    const [currentPage, setCurrentPage] = useState(1);
    const pageSize = 8; // Adjust as needed
    const [filterParams, setFilterParams] = useState<QueryParams>({
        page: 1,
        pageSize: pageSize,
        sortBy: 'createdAt',
        sortDirection: 'desc'
    });

    // Fetch user's car listings using the hook
    const { data, isLoading, error, refetch } = useMyCarListings({
        userId: session?.user?.id,
        page: filterParams.page || 1,
        pageSize: filterParams.pageSize || pageSize,
        sortBy: filterParams.sortBy || 'createdAt',
        sortDirection: filterParams.sortDirection || 'desc',
        filterGroups: filterParams.filterGroups,
        searchTerm: filterParams.searchTerm
    });
    
    // Handle filter changes
    const handleFilterChange = useCallback((params: QueryParams) => {
        // Preserve the current page when applying filters
        setFilterParams(prev => ({
            ...params,
            pageSize: prev.pageSize
        }));
        
        // Reset to first page when filters are applied
        setCurrentPage(1);
    }, []);
    
    // Handle favorite status updates
    const handleFavoriteToggle = useCallback((productId: number, isFavorite: boolean) => {
        setFavoriteStatuses(prev => ({
            ...prev,
            [productId]: isFavorite
        }));
    }, []);

    // Handle successful deletion
    const handleDelete = useCallback((productId: number) => {
        // Refresh the listings to remove the deleted item
        refetch();
    }, [refetch]);

    // Handle page change from pagination
    const handlePageChange = useCallback((page: number) => {
        setCurrentPage(page);
        setFilterParams(prev => ({
            ...prev,
            page: page
        }));
    }, []);
    
    // Reset filters effect
    useEffect(() => {
        // When the page loads, ensure filter params are synchronized with current page
        setFilterParams(prev => ({
            ...prev,
            page: currentPage
        }));
    }, [currentPage]);
    
    // Prepare car listings for display
    const carListings = useMemo(() => {
        let listings: any[] = [];
        
        // Handle nested data structure if needed
        if (Array.isArray(data?.data)) {
            listings = data.data;
        } else if (Array.isArray(data?.data?.data)) {
            listings = data.data.data;
        }
        
        // Initialize favorite statuses from backend data if not already set
        const newFavoriteStatuses: Record<number, boolean> = {};
        listings.forEach(item => {
            if (item.id && favoriteStatuses[item.id] === undefined) {
                newFavoriteStatuses[item.id] = !!item.isFavorite;
            }
        });
        
        // Update favorite statuses if we have new ones
        if (Object.keys(newFavoriteStatuses).length > 0) {
            setFavoriteStatuses(prev => ({...prev, ...newFavoriteStatuses}));
        }
        
        return listings;
    }, [data, favoriteStatuses]);

    // Extract pagination metadata from response
    const paginationMeta = useMemo(() => {
        interface PaginationMeta {
            currentPage?: number;
            totalPages?: number;
            hasNextPage?: boolean;
            hasPreviousPage?: boolean;
            totalItems?: number;
        }
        const meta = (data?.data || data || {}) as PaginationMeta;
        return {
            currentPage: meta.currentPage || currentPage,
            totalPages: meta.totalPages || 1,
            hasNextPage: meta.hasNextPage || false,
            hasPreviousPage: meta.hasPreviousPage || false,
            totalItems: meta.totalItems || carListings.length,
        };
    }, [data, currentPage, carListings.length]);

    return (
        <Box variant="container" className="flex flex-col md:flex-row gap-6">
            {/* Filter Section - Shows on Medium screens and above */}
            <Box className="md:w-1/4 lg:w-1/5 hidden md:block sticky top-24 self-start">
                <Filter onChange={handleFilterChange} />
            </Box>
            
            {/* Content Section */}
            <Box className="md:w-3/4 lg:w-4/5 flex flex-col">
                {/* Header with filter toggle for mobile */}
                <Box className="flex justify-between items-center mb-6">
                    <Text variant="large" dir={direction} className='text-2xl text-primary-dark font-bold'>
                        {direction === 'ltr' ? 'My Cars' : ' سياراتي' }
                    </Text>
                    
                    {/* Mobile Filter Button - Only visible on small screens */}
                    <button className="md:hidden bg-primary text-white p-2 rounded-lg flex items-center">
                        <svg 
                            xmlns="http://www.w3.org/2000/svg" 
                            viewBox="0 0 24 24" 
                            fill="none" 
                            stroke="currentColor" 
                            strokeWidth="2" 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            className="h-4 w-4 mr-2"
                        >
                            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/>
                        </svg>
                        {direction === 'ltr' ? 'Filter' : 'تصفية'}
                    </button>
                </Box>
                
                {/* Loading state */}
                {isLoading && (
                    <ProductSkeleton count={10} showTitle={false} />
                )}
                
                {/* Error state */}
                {error && (
                    <Box className="w-full py-4" variant="center">
                        <Text className="text-red-500">Failed to load your listings</Text>
                    </Box>
                )}
                
                {/* Empty state */}
                {!isLoading && !error && carListings.length === 0 && (
                    <Box className="w-full py-8 text-center" variant="center">
                        <Text className="text-gray-600">You haven't created any listings yet.</Text>
                        <Box className="mt-4">
                            <a href="/products/create" className="bg-primary text-white px-4 py-2 rounded-lg">
                                Create New Listing
                            </a>
                        </Box>
                    </Box>
                )}
                
                {/* Display products */}
                {!isLoading && !error && carListings.length > 0 && (
                    <Box className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 w-full">
                        {carListings.map((card) => {
                            // Get favorite status from local state or fallback to backend data
                            const isFavorite = favoriteStatuses[card.id] !== undefined 
                                ? favoriteStatuses[card.id] 
                                : !!card.isFavorite;
                                
                            return (
                                <React.Fragment key={card.id}>
                                    <ProductCardItem
                                        title={card.title}
                                        marka={card.make?.name || ''}
                                        price={card.price || 0}
                                        type={card.listingType}
                                        imageSrc={card.images?.find((img: { isPrimary: any; }) => img.isPrimary)?.url || card.images?.[0]?.url || '/placeholder-car.jpg'}
                                        ProductId={card.id}
                                        priceWord={t('latestOffers.price')}
                                        isFavorites={false}
                                        isMarkedFavorite={isFavorite}
                                        onFavoriteToggle={handleFavoriteToggle}
                                        isAuthenticated={true}
                                        onDelete={handleDelete}
                                    />
                                </React.Fragment>
                            );
                        })}
                    </Box>
                )}
                
                {/* Pagination component */}
                {!isLoading && !error && carListings.length > 0 && (
                    <Pagination
                        currentPage={paginationMeta.currentPage}
                        totalPages={paginationMeta.totalPages}
                        hasNextPage={paginationMeta.hasNextPage}
                        hasPreviousPage={paginationMeta.hasPreviousPage}
                        totalItems={paginationMeta.totalItems}
                        pageSize={pageSize}
                        onPageChange={handlePageChange}
                        showItemsInfo={true}
                        className="mt-8"
                    />
                )}
            </Box>
            
            {/* Mobile Filter Component
                 This would be shown/hidden with state when the mobile filter button is clicked
                 For this implementation, you'd need to add a state and a modal or overlay component
            */}
        </Box>
    );
};

export default UserProductPage;