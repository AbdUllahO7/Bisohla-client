'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { useLocale, useTranslations } from 'next-intl';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { getCarFavorites } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { UserFavoriteCarListing } from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { getSession } from '@/lib/session';
import { ListingType } from '@/core/entities/enums/cars.enums';
import { CarDetails } from '@/core/entities/models/cars/cars.dto';
import { useSession } from '@/hooks/auth/use-session';

// Define a type for the transformed favorite listings
interface FavoriteListing {
    id: number;
    title: string;
    marka: string;
    price: number;
    type: ListingType; // Use the specific enum type
    imageSrc: string;
    details: CarDetails; // Use your CarDetails type
}

const UserFavorites = () => {
    const t = useTranslations('homePage');
    const [favorites, setFavorites] = useState<UserFavoriteCarListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [favoriteStatuses, setFavoriteStatuses] = useState<Record<number, boolean>>({});
    const session = useSession();
    const isInitialFetch = useRef(true);
    const locale = useLocale()
    
    // Function to fetch favorites - only fetch once initially
    const fetchFavorites = useCallback(async () => {
        // Skip if not initial fetch
        if (!isInitialFetch.current) return;
        
        try {
            setIsLoading(true);
            
            // Get the current user session
            const userSession = await getSession();
            
            // Verify authentication
            const authResult = await checkAuth();
            if (!authResult.success) {
                setError("You must be logged in to view favorites");
                setIsLoading(false);
                return;
            }
            
            // Make sure user ID exists
            const userId = userSession?.user?.id || session?.user?.id;
            if (!userId) {
                setError("User ID not found in session");
                setIsLoading(false);
                return;
            }
            
            // Fetch favorites for the current user
            const response = await getCarFavorites({
                userId: userId,
                page: 1,
                where: [
                    {
                        field: 'userId',
                        operator: 'eq',
                        value: userId
                    }
                ]
            });
            
            if (response.success && response.data?.data && Array.isArray(response.data.data)) {
                setFavorites(response.data.data);
                
                // Initialize favorite statuses from fetched data
                const newFavoriteStatuses: Record<number, boolean> = {};
                response.data.data.forEach(favorite => {
                    if (favorite.carListing && favorite.carListing.id) {
                        newFavoriteStatuses[favorite.carListing.id] = true;
                    }
                });
                
                setFavoriteStatuses(newFavoriteStatuses);
                isInitialFetch.current = false;
            } else {
                setError("Failed to load favorites");
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError("An error occurred while fetching favorites");
        } finally {
            setIsLoading(false);
        }
    }, [session]);
    
    // Fetch favorites only on component mount 
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites]);
    
    // Function to safely check if an image is primary
    const isPrimaryImage = (img: any): img is { isPrimary: boolean; url: string } => {
        return img && typeof img === 'object' && 'isPrimary' in img && 'url' in img;
    };
    
    // Type guard for nullable transformed favorites
    const isValidFavoriteListing = (item: FavoriteListing | null): item is FavoriteListing => {
        return item !== null;
    };
    
    // Transform favorites data for display
    const favoriteListings = React.useMemo(() => {
        const transformedListings = favorites
            .map(favorite => {
                const listing = favorite.carListing;
                if (!listing) return null;
                
                // Safely find primary image or first image
                let imageSrc = '/placeholder-car.jpg';
                if (listing.images && Array.isArray(listing.images)) {
                    const primaryImage = listing.images.find(img => isPrimaryImage(img) && img.isPrimary);
                    if (primaryImage && 'url' in primaryImage) {
                        imageSrc = primaryImage.url;
                    } else if (listing.images.length > 0 && 'url' in listing.images[0]) {
                        imageSrc = listing.images[0].url;
                    }
                }
                
                return {
                    id: listing.id,
                    title: listing.title,
                    marka: listing.make?.name || '',
                    price: listing.price || 0,
                    type: listing.listingType as ListingType, // Cast to ensure type safety
                    imageSrc,
                    details: listing.details || {} as CarDetails
                } as FavoriteListing;
            })
            .filter(isValidFavoriteListing); // Use the type guard
            
        return transformedListings;
    }, [favorites]);
    
    // Handler for when a favorite is toggled - No API calls here, just UI updates
    const handleFavoriteToggle = useCallback((productId: number, isFavorite: boolean) => {
        // Update favorite statuses
        setFavoriteStatuses(prev => ({
            ...prev,
            [productId]: isFavorite
        }));
        
        if (!isFavorite) {
            // If removed from favorites, remove it from the local state immediately
            setFavorites(prevFavorites => 
                prevFavorites.filter(fav => fav.carListing && fav.carListing.id !== productId)
            );
        }
    }, []);

    return (
        <Box variant="container" dir={locale === 'en' ? 'ltr' :'rtl'}>
            <Text variant="large" className='text-2xl text-primary-dark font-bold mb-6'>{locale === 'en' ? 'My Favorites': 'المفضلة' }</Text>
            
            {/* Loading state */}
            {isLoading && (
                <ProductSkeleton count={10} showTitle={false} />
            )}
            
            {/* Error state */}
            {!isLoading && error && (
                <Box className="w-full py-8 text-center" variant="center">
                    <Text className="text-red-500">{error}</Text>
                    {error === "You must be logged in to view favorites" && (
                        <Box className="mt-4">
                            <a href="/login" className="bg-primary text-white px-4 py-2 rounded-lg">
                                Log In
                            </a>
                        </Box>
                    )}
                </Box>
            )}
            
            {/* Empty state */}
            {!isLoading && !error && favoriteListings.length === 0 && (
                <Box className="w-full py-8 text-center" variant="center">
                    <Text className="text-gray-600">You haven't added any cars to your favorites yet.</Text>
                    <Box className="mt-4">
                        <a href="/products" className="bg-primary text-white px-4 py-2 rounded-lg">
                            Browse Cars
                        </a>
                    </Box>
                </Box>
            )}
            
            {/* Display favorites */}
            {!isLoading && !error && favoriteListings.length > 0 && (
                <Box 
                    className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 sm:w-[80%] xs:w-[100%] lg:w-full" 
                    variant="center"
                >
                    {favoriteListings.map((card) => {
                   
                        const isFavorite = favoriteStatuses[card.id] !== undefined 
                            ? favoriteStatuses[card.id] 
                            : true;
                        
                        return (
                            <React.Fragment key={card.id}>
                                <ProductCardItem
                                    title={card.title}
                                    marka={card.marka}
                                    price={card.price}
                                    type={card.type}
                                    imageSrc={card.imageSrc}
                                    ProductId={card.id}
                                    priceWord={t('latestOffers.price')}
                                    isFavorites={true}
                                    isMarkedFavorite={isFavorite}
                                    onFavoriteToggle={handleFavoriteToggle}
                                />
                            </React.Fragment>
                        );
                    })}
                </Box>
            )}
        </Box>
    );
};

export default UserFavorites;