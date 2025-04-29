'use client';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';
import { useTranslations } from 'next-intl';
import React, { useEffect, useState, useCallback } from 'react';
import { getCarFavorites } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { UserFavoriteCarListing } from '@/core/entities/models/cars/users-favorites-cars.zod.dto';
import { getSession } from '@/lib/session';
import { ListingType } from '@/core/entities/enums/cars.enums';
import { CarDetails } from '@/core/entities/models/cars/cars.dto';

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

// Type for the API response from your actual API
interface ApiResponse<T> {
    success: boolean;
    data?: T;
    message?: string;
}

// Type for pagination info as returned by your API
interface PaginationInfo<T> {
    data: T[];
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
}

const UserFavorites = () => {
    const t = useTranslations('homePage');
    const [favorites, setFavorites] = useState<UserFavoriteCarListing[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    
    // Function to refresh favorites list
    const refreshFavorites = useCallback(() => {
        setRefreshTrigger(prev => prev + 1);
    }, []);
    
    // Function to fetch favorites
    const fetchFavorites = useCallback(async () => {
        try {
            setIsLoading(true);
            
            // Get the current user session
            const session = await getSession();
            console.log('Current user session:', session);
            
            // Verify authentication
            const authResult = await checkAuth();
            if (!authResult.success) {
                setError("You must be logged in to view favorites");
                setIsLoading(false);
                return;
            }
            
            // Make sure user ID exists
            if (!session?.user?.id) {
                setError("User ID not found in session");
                setIsLoading(false);
                return;
            }
            
            // Fetch favorites for the current user
            const response = await getCarFavorites({
                page: 1,
                where: [
                    {
                        field: 'userId',
                        operator: 'eq',
                        value: session.user.id
                    }
                ]
            });
            
            console.log('Favorites response:', response);
            
            if (response.success && response.data?.data && Array.isArray(response.data.data)) {
                setFavorites(response.data.data);
            } else {
                setError("Failed to load favorites");
            }
        } catch (err) {
            console.error('Error fetching favorites:', err);
            setError("An error occurred while fetching favorites");
        } finally {
            setIsLoading(false);
        }
    }, []);
    
    // Fetch favorites on component mount and when refreshTrigger changes
    useEffect(() => {
        fetchFavorites();
    }, [fetchFavorites, refreshTrigger]);
    
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
    
    // Handler for when a favorite is toggled
    const handleFavoriteToggle = (productId: number, isFavorite: boolean) => {
        console.log(`Product ${productId} favorite status toggled to: ${isFavorite}`);
        if (!isFavorite) {
            // If the car was removed from favorites, remove it from the local state
            setFavorites(prevFavorites => 
                prevFavorites.filter(fav => fav.carListing && fav.carListing.id !== productId)
            );
        } else {
            // If a car was added back to favorites, refresh the entire list
            refreshFavorites();
        }
    };

    return (
        <Box variant="container">
            <Text variant="large" className='text-2xl text-primary-dark font-bold mb-6'>My Favorites</Text>
            
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
                    {favoriteListings.map((card) => (
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
                                onFavoriteToggle={handleFavoriteToggle}
                            />
                        </React.Fragment>
                    ))}
                </Box>
            )}
        </Box>
    );
};

export default UserFavorites;