'use client';
import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import CardAds from '../design/CardAds';
import { ProductCardItem } from '../design/ProductCardItem';
import { LatestOffersProps } from '@/types/homePageTypes';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';

const LatestOffers: React.FC<LatestOffersProps> = ({ count, showTitle = true, container = true }) => {
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
    
    // Fetch car listings data with filter for listingType = 'for_sale'
    const { data, isLoading, error } = useCarListings({
        page: 1,
        userId: session.user.id,
        filterGroups: [
            {
                operator: 'and',
                filters: [
                    {
                        field: 'listingType',
                        operator: 'eq',
                        value: 'for_sale'
                    }
                ]
            }
        ],
        where: [
            {
                field: 'listingType',
                operator: 'eq',
                value: 'for_sale'
            }
        ]
    });



    // Extract car listings array safely and limit to count items
    const carListings = React.useMemo(() => {
        let listings: Array<any> = [];
        // If data.data is an array, use it
        if (Array.isArray(data?.data)) {
            listings = data.data;
        }
        // If data.data.data is an array (nested structure), use it
        else if (Array.isArray(data?.data?.data)) {
            listings = data.data.data;
        }
        
        // Initialize favorite statuses from backend data
        const newFavoriteStatuses: Record<number, boolean> = {};
        listings.forEach(item => {
            if (item.id) {
                // Only set if not already in our state
                if (favoriteStatuses[item.id] === undefined) {
                    newFavoriteStatuses[item.id] = item.isFavorite || false;
                }
            }
        });
        
        // Update favorite statuses state if we have new items
        if (Object.keys(newFavoriteStatuses).length > 0) {
            setFavoriteStatuses(prev => ({...prev, ...newFavoriteStatuses}));
        }
        
        // Limit to count items if provided, otherwise 9
        const limit = count || 9;
        return listings.slice(0, limit);
    }, [data, count]);
    
    // Handle favorite status update from child component
    const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
        setFavoriteStatuses(prev => ({
            ...prev,
            [productId]: isFavorite
        }));
    };
    
    return (
        <Box variant={`${container ? "container" : 'center'}`} className="mb-5 mt-[50px]">
            <Box variant="column">
                {showTitle && (
                    <Box variant="column" className="">
                        <Text variant="h3" className="font-bold text-[20px] font-cairo">
                            {t('latestOffers.title')}
                        </Text>
                        <Link href="/products">
                            <Text variant="mid" className="text-[20px] font-cairo text-primary-light">
                                {t('latestOffers.showMore')}
                            </Text>
                        </Link>
                    </Box>
                )}
                
                {/* Show loading skeleton */}
                {isLoading && <ProductSkeleton count={count || 8} showTitle={false} />}
                
                {/* Show error state */}
                {error && (
                    <Box className="w-full py-4" variant="center">
                        <Text className="text-red-500">Failed to load car listings</Text>
                    </Box>
                )}

                {/* Show empty state */}
                {!isLoading && !error && carListings.length === 0 && (
                    <Box className="w-full py-4" variant="center">
                        <Text>No car listings available</Text>
                    </Box>
                )}
                
                {/* Display actual cards when data is loaded */}
                {!isLoading && !error && carListings.length > 0 && (
                    <Box 
                        className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showTitle ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4 sm:w-[80%] xs:w-[80%] lg:w-full`} 
                        variant="center"
                    >
                        {carListings.map((card, index) => (
                            <React.Fragment key={card.id || index}>
                                <ProductCardItem
                                    title={card.title}
                                    marka={card.make?.name || card.marka}
                                    price={card.price}
                                    type={card.listingType}
                                    imageSrc={card.images?.find((img: { isPrimary: boolean; url: string; }) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc}
                                    ProductId={card.id}
                                    priceWord={t('latestOffers.price')}
                                    isFavorites={true}
                                    isMarkedFavorite={favoriteStatuses[card.id] !== undefined ? favoriteStatuses[card.id] : (card.isFavorite || false)}
                                    onFavoriteToggle={handleFavoriteToggle} 
                                    />
                                {/* Render CardAds only after the first two cards */}
                                {index === 1 && (
                                    <Box variant="center" className="justify-center items-center">
                                        <CardAds isRent={false} />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
                
                {/* Show authentication prompt if not logged in */}
                {!isAuthenticated && !isLoading && (
                    <Box className="mt-4 p-4 bg-gray-100 rounded-lg" variant="center">
                        <Text className="text-gray-700">
                            <Link href="/login" className="text-primary hover:underline">
                                Login
                            </Link> or <Link href="/register" className="text-primary hover:underline">
                                Register
                            </Link> to save your favorite listings
                        </Text>
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default LatestOffers;