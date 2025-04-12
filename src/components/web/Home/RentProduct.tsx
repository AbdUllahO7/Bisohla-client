'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import Link from 'next/link';
import React from 'react';
import { RentProductCard } from '../design/RentProductCard';
import CardAds from '../design/CardAds';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
// Import the necessary hook for fetching rental car data

const RentProduct = () => {
    const t = useTranslations('homePage');
    
    // Fetch rental car listings data
    const { data, isLoading, error } = useCarListings({});
    
    console.log("rent data structure:", data);
    
    // Extract rental car listings array safely and limit to 9 items
    const rentListings = React.useMemo(() => {
        let listings: Array<any> = [];
        // If data.data is an array, use it
        if (Array.isArray(data?.data)) {
            listings = data.data;
        }
        // If data.data.data is an array (nested structure), use it
        else if (Array.isArray(data?.data?.data)) {
            listings = data.data.data;
        }
        // Limit to 9 items
        return listings.slice(0, 9);
    }, [data]);

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
                {isLoading && (
                    <Box className="w-full py-4" variant="center">
                        <Text>Loading...</Text>
                    </Box>
                )}
                
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
                        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[80%] lg:w-full" 
                        variant="center"
                    >
                        {rentListings.map((product, index) => (
                            <React.Fragment key={product.id || index}>
                                <RentProductCard
                                    title={product.title}
                                    marka={product.make?.name || product.marka}
                                    price={product.price}
                                    imageSrc={product.images?.find((img: { isPrimary: boolean; url: string }) => img.isPrimary)?.url || product.images?.[0]?.url || product.imageSrc}
                                    priceWord={t('rentProduct.price')}
                                    details={product.details || []}
                                    ProductId={product.id}
                                />
                                {index === 3 && (
                                    <Box variant="center" className="justify-center items-center">
                                        <CardAds isRent={false} />
                                    </Box>
                                )}
                            </React.Fragment>
                        ))}
                    </Box>
                )}
            </Box>
        </Box>
    );
};

export default RentProduct;