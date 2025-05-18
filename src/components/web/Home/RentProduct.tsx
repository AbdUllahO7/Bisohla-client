'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import {Link} from "@/i18n/routing"
import React, { useState, useEffect, useCallback } from 'react';
import { RentProductCard } from '../design/RentProductCard';
import CardAds from '../design/CardAds';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';

const RentProduct = () => {
    const t = useTranslations('homePage');
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({});
    const session = useSession();
    
    // Verify authentication status on component mount
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                const authResponse = await checkAuth();
                setIsAuthenticated(authResponse.success);
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            }
        };
        
        verifyAuth();
    }, []);
    
    // Handle favorite status update from child component
    const handleFavoriteToggle = useCallback((productId: number, isFavorite: boolean) => {
        setFavoriteStatuses(prev => ({
            ...prev,
            [productId]: isFavorite
        }));
    }, []);
    
    // Fetch rental car listings data with filter for listingType = 'for_rent'
    const { data, isLoading, error } = useCarListings({
        userId : session.user?.id,
        filterGroups: [
            {
                operator: 'and',
                filters: [
                    {
                        field: 'listingType',
                        operator: 'eq',
                        value: 'for_rent'
                    }
                ]
            }
        ],
        // Also keep the where filter for compatibility
        where: [
            {
                field: 'listingType',
                operator: 'eq',
                value: 'for_rent'
            }
        ]
    });
    
    // Extract rental car listings array safely and limit to 9 items
    const rentListings = React.useMemo(() => {
        // Define the type for the listings array
        let listings: Array<any> = [];
        
        // If data.data is an array, use it
        if (Array.isArray(data?.data)) {
            listings = data.data;
        }
        // If data.data.data is an array (nested structure), use it
        else if (Array.isArray(data?.data?.data)) {
            listings = data.data.data;
        }
        
        // Initialize favorite statuses from backend data if not already set
        const newFavoriteStatuses: Record<number, boolean> = {};
        listings.forEach(item => {
            if (item.id && favoriteStatuses[item.id] === undefined) {
                newFavoriteStatuses[item.id] = !!item.isFavorite;
            }
        });
        
        // Update favorite statuses state if we have new items
        if (Object.keys(newFavoriteStatuses).length > 0) {
            setFavoriteStatuses(prev => ({...prev, ...newFavoriteStatuses}));
        }
        
        // Limit to 9 items
        return listings.slice(0, 9);
    }, [data, favoriteStatuses]);


    return (
        <Box variant="container" className="">
            <Box variant="column">
                <Box variant="column" className="">
                    <Text variant="h3" className="font-bold text-[20px] font-cairo">
                        {t('rentProduct.title')}
                    </Text>
                    <Link href="/AllCities">
                        <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                            {t('rentProduct.showMore')}
                        </Text>
                    </Link>
                </Box>
                
                {/* Show loading state */}
                {isLoading && <ProductSkeleton showTitle={false} />}
                
                {/* Show error state */}
                {error && (
                    <Box className="w-full py-4" variant="center">
                        <Text className="text-red-500">Failed to load rental listings</Text>
                    </Box>
                )}

                {/* Show empty state */}
                {!isLoading && !error && rentListings.length === 0 && (
                    <Box className="w-full py-4" variant="center">
                        <Text>No rental listings available</Text>
                    </Box>
                )}
                
                {/* Display Rental Cards */}
                {!isLoading && !error && rentListings.length > 0 && (
                    <Box 
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[90%] xs:w-[90%] lg:w-full" 
                        variant="center"
                    >
                        {rentListings.map((product, index) => {
                            // Get favorite status from local state or fallback to API data
                            const isFavorite = favoriteStatuses[product.id] !== undefined 
                                ? favoriteStatuses[product.id] 
                                : !!product.isFavorite;
                                
                            
                            return (
                                <React.Fragment key={product.id || index}>
                                    <RentProductCard
                                        title={product.title}
                                        marka={product.make?.name || product.marka}
                                        type={product.listingType}
                                        price={product.price}
                                        imageSrc={product.images?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)?.url || product.images?.[0]?.url || product.imageSrc}
                                        priceWord={t('rentProduct.price')}
                                        details={product.details || []}
                                        ProductId={product.id}
                                        isMarkedFavorite={isFavorite}
                                        onFavoriteToggle={handleFavoriteToggle}
                                    />
                                    {index === 3 && (
                                        <Box variant="center" className="justify-center items-center">
                                            <CardAds isRent={false} />
                                        </Box>
                                    )}
                                </React.Fragment>
                            );
                        })}
                    </Box>
                )}
                
               
            </Box>
        </Box>
    );
};

export default RentProduct;