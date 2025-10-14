'use client';
import React, { useEffect, useState } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';
import CardAds from '../design/CardAds';
import { LatestOffersProps } from '@/types/homePageTypes';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { useSession } from '@/hooks/auth/use-session';
import { RentProductCard } from '../design/RentProductCard';
import SectionHeader from '@/components/SectionHeader';
import { CarFrontIcon } from 'lucide-react';

const LatestOffers: React.FC<LatestOffersProps> = ({ count, title, showTitle = true, container = true }) => {
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
        <div className="relative overflow-hidden py-16">
            {/* Animated Background Elements */}
            <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
                {/* Large Gradient Orbs */}
          
                <div 
                    className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-float"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(171, 222, 59, 0.3) 0%, transparent 70%)',
                        animationDelay: '2s'
                    }}
                ></div>
                <div 
                    className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-20 animate-float"
                    style={{ 
                        background: 'radial-gradient(circle, rgba(44, 60, 57, 0.2) 0%, transparent 70%)',
                        animationDelay: '4s'
                    }}
                ></div>

                {/* Decorative Grid Pattern */}
                <div 
                    className="absolute inset-0 opacity-[0.02]"
                    style={{
                        backgroundImage: `linear-gradient(#198341 1px, transparent 1px), linear-gradient(90deg, #198341 1px, transparent 1px)`,
                        backgroundSize: '50px 50px'
                    }}
                ></div>

              
                {/* Animated Dots */}
                <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse"></div>
                <div className="absolute top-40 right-1/3 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse" style={{ animationDelay: '1s' }}></div>
                <div className="absolute bottom-32 left-1/2 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse" style={{ animationDelay: '2s' }}></div>
                <div className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse" style={{ animationDelay: '3s' }}></div>
            </div>

            {/* Content with Glass Effect */}
            <Box variant={`${container ? "container" : 'center'}`} className="relative z-10">
                <Box variant="column">
                    {showTitle && (
                        <div className="relative">
                            {/* Glow Effect Behind Header */}
                            <div 
                                className="absolute -top-10 left-0 right-0 h-40 opacity-30 blur-3xl -z-10"
                                style={{
                                    background: 'radial-gradient(ellipse at center, rgba(171, 222, 59, 0.4) 0%, transparent 70%)'
                                }}
                            ></div>
                            
                            <SectionHeader
                                title={title ? title : t('latestOffers.title')} 
                                icon={CarFrontIcon}
                                showMoreLink='products'
                                showMoreText={t('latestOffers.showMore')}
                            />
                        </div>
                    )}
                    
                    {/* Show loading skeleton */}
                    {isLoading && <ProductSkeleton count={count || 8} showTitle={false} />}
                    
                    {/* Show error state */}
                    {error && (
                        <Box className="w-full py-8 px-6 rounded-2xl backdrop-blur-sm" 
                             variant="center"
                             style={{ 
                                 background: 'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.1) 100%)',
                                 border: '1px solid rgba(255, 0, 0, 0.2)'
                             }}>
                            <Text className="text-red-500 font-semibold">Failed to load car listings</Text>
                        </Box>
                    )}

                    {/* Show empty state */}
                    {!isLoading && !error && carListings.length === 0 && (
                        <Box className="w-full py-12 px-6 rounded-2xl backdrop-blur-sm" 
                             variant="center"
                             style={{ 
                                 background: 'linear-gradient(135deg, rgba(171, 222, 59, 0.05) 0%, rgba(25, 131, 65, 0.05) 100%)',
                                 border: '2px dashed rgba(25, 131, 65, 0.3)'
                             }}>
                            <div className="text-center">
                                <CarFrontIcon className="w-16 h-16 mx-auto mb-4 opacity-30" style={{ color: '#198341' }} />
                                <Text className="text-gray-500 text-lg">No car listings available</Text>
                            </div>
                        </Box>
                    )}
                    
                    {/* Display actual cards when data is loaded */}
                    {!isLoading && !error && carListings.length > 0 && (
                        <Box 
                            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showTitle ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-6 sm:w-[90%] xs:w-[90%] lg:w-full`} 
                            variant="center"
                        >
                            {carListings.map((card, index) => (
                                <React.Fragment key={card.id || index}>
                                    {/* Card with Fade-in Animation */}
                                    <div 
                                        className="animate-fadeInUp"
                                        style={{ 
                                            animationDelay: `${index * 0.1}s`,
                                            animationFillMode: 'both'
                                        }}
                                    >
                                        <RentProductCard
                                            title={card.title}
                                            marka={card.make?.name || card.marka}
                                            price={card.price}
                                            type={card.listingType}
                                            imageSrc={card.images?.find((img: { isPrimary: boolean; url: string; }) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc}
                                            ProductId={card.id}
                                            details={card.details || []}
                                            priceWord={t('latestOffers.price')}
                                            isMarkedFavorite={favoriteStatuses[card.id] !== undefined ? favoriteStatuses[card.id] : (card.isFavorite || false)}
                                            onFavoriteToggle={handleFavoriteToggle} 
                                        />
                                    </div>
                                    {/* Render CardAds only after the first two cards */}
                                    {index === 1 && (
                                        <Box variant="center" className="justify-center items-center animate-fadeInUp"
                                             style={{ 
                                                 animationDelay: `${index * 0.1}s`,
                                                 animationFillMode: 'both'
                                             }}>
                                            <CardAds isRent={false} />
                                        </Box>
                                    )}
                                </React.Fragment>
                            ))}
                        </Box>
                    )}
                </Box>
            </Box>

            {/* CSS Animations */}
            <style jsx>{`
                @keyframes float {
                    0%, 100% {
                        transform: translate(0, 0) scale(1);
                    }
                    25% {
                        transform: translate(20px, -20px) scale(1.05);
                    }
                    50% {
                        transform: translate(-15px, -40px) scale(0.95);
                    }
                    75% {
                        transform: translate(-25px, -15px) scale(1.02);
                    }
                }

                .animate-float {
                    animation: float 20s ease-in-out infinite;
                }

                @keyframes fadeInUp {
                    from {
                        opacity: 0;
                        transform: translateY(30px);
                    }
                    to {
                        opacity: 1;
                        transform: translateY(0);
                    }
                }

                .animate-fadeInUp {
                    animation: fadeInUp 0.8s ease-out;
                    opacity: 0;
                }

                /* Pulse animation for dots */
                @keyframes pulse {
                    0%, 100% {
                        opacity: 0.4;
                        transform: scale(1);
                    }
                    50% {
                        opacity: 0.8;
                        transform: scale(1.5);
                    }
                }

                .animate-pulse {
                    animation: pulse 3s ease-in-out infinite;
                }
            `}</style>
        </div>
    );
};

export default LatestOffers;