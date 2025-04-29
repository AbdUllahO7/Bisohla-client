'use client';
import React, { useEffect, useState } from 'react';
import Text from '@/components/text/text';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CarCardItemPropsProfile } from '@/types/homePageTypes';
import { HeartIcon } from 'lucide-react';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { 
    checkIsCarListingFavorite,
    toggleCarListingFavorite
} from '@/core/infrastructure-adapters/actions/users/car.user.actions';

// Extended props interface to include the callback
interface ExtendedCarCardItemPropsProfile extends CarCardItemPropsProfile {
    onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
}

// Type for the API response
interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

// Possible response types for toggle favorite
type ToggleFavoriteResponseData = boolean | { isFavorite: boolean } | null | undefined;

// CardItem Component
export const ProductCardItem: React.FC<ExtendedCarCardItemPropsProfile> = ({ 
    title, 
    marka, 
    imageSrc, 
    ProductId, 
    isFavorites, 
    priceWord, 
    price, 
    type,
    onFavoriteToggle
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMarkedFavorite, setIsMarkedFavorite] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    // Function to determine favorite status from different response formats
    const determineFavoriteStatus = (data: ToggleFavoriteResponseData): boolean => {
        if (typeof data === 'boolean') {
            return data;
        } else if (data && typeof data === 'object' && 'isFavorite' in data) {
            return data.isFavorite;
        }
        return false;
    };

    // Check authentication and favorites status when component mounts
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                setIsInitialLoading(true);
                // Check if user is authenticated
                const authResponse = await checkAuth();
                setIsAuthenticated(authResponse.success);
                
                if (authResponse.success) {
                    try {
                        console.log('Checking favorite status for ProductId:', ProductId);
                        // Make sure ProductId is valid
                        if (ProductId) {
                            // Check if this specific car is in user's favorites
                            const favoriteResponse = await checkIsCarListingFavorite(Number(ProductId));
                            console.log('Favorite response:', favoriteResponse?.data);
                            
                            // Handle both response formats
                            const isFavorite = favoriteResponse.success && 
                                determineFavoriteStatus(favoriteResponse.data);
                            
                            setIsMarkedFavorite(isFavorite);
                        } else {
                            console.error('Invalid ProductId:', ProductId);
                        }
                    } catch (favoriteError) {
                        console.error('Error checking favorite status:', favoriteError);
                    }
                }
            } catch (error) {
                console.error("Auth check failed:", error);
                setIsAuthenticated(false);
            } finally {
                setIsInitialLoading(false);
            }
        };
        
        verifyAuth();
    }, [ProductId]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the link navigation
        e.stopPropagation(); // Stop the event from bubbling up
        
        // Only allow favorite action if authenticated
        if (isAuthenticated && !isProcessing) {
            setIsProcessing(true);
            
            try {
                console.log('Toggling favorite for ProductId:', ProductId);
                // Call the toggle API with the car listing ID
                const response = await toggleCarListingFavorite({
                    carListingId: Number(ProductId)
                });
                
                if (response.success) {
                    // Update the local state based on the response using our helper function
                    const newFavoriteStatus = determineFavoriteStatus(response?.data);
                    
                    console.log('New favorite status:', newFavoriteStatus);
                    setIsMarkedFavorite(newFavoriteStatus);
                    
                    // Call the callback if provided
                    if (onFavoriteToggle && ProductId) {
                        onFavoriteToggle(Number(ProductId), newFavoriteStatus);
                    }
                } else {
                    console.error("Failed to toggle favorite:", response.message);
                }
            } catch (error) {
                console.error("Failed to toggle favorite status:", error);
            } finally {
                setIsProcessing(false);
            }
        } else if (!isAuthenticated) {
            console.log("User not authenticated, redirect to login");
            // You could redirect to login page here
            // window.location.href = '/login';
        }
    };
    
    return (
        <div className="w-full">
            <Card className={`group border-none rounded-lg bg-white w-full shadow-lg relative`}>
                {/* Heart Icon for Favorites with loading state and favorite status check */}
                {isFavorites && (
                    <Button 
                        className="absolute top-2 left-2 bg-white p-2 rounded-full shadow-md z-20"
                        onClick={handleFavoriteClick}
                        disabled={!isAuthenticated || isProcessing || isInitialLoading}
                    >
                        {isInitialLoading ? (
                            <HeartIcon size={24} className="text-gray-400 animate-pulse" />
                        ) : (
                            <HeartIcon 
                                size={24} 
                                className={
                                    isProcessing ? 'text-gray-400 animate-pulse' :
                                    !isAuthenticated ? 'text-gray-400' : 
                                    isMarkedFavorite ? 'text-red-500' : 'text-gray-600'
                                } 
                                fill={isMarkedFavorite ? "currentColor" : "none"}
                            />
                        )}
                    </Button>
                )}
                
                <Text className="absolute bottom-40 left-2 bg-white px-2 py-1 rounded-lg shadow-md text-primary text-sm">
                    {type === "for_sale" ? "Sale" : 'Rent'}
                </Text>
                
                {/* Make the card content clickable */}
                <Link href={`/products/product/${ProductId}`} className="block">
                    <CardHeader className="p-0">
                        <CardTitle className="w-full">
                            <Image
                                src={imageSrc}
                                alt={title}
                                width={220}
                                height={300}
                                className="w-full h-48 object-cover rounded-t-lg"
                            />
                        </CardTitle>
                        <CardDescription className="p-4">
                            <Text variant="h4" className="text-primary font-semibold line-clamp-1">
                                {title}
                            </Text>
                            <Text variant="mid" className="text-gray-600">
                                {marka}
                            </Text>
                        </CardDescription>
                    </CardHeader>
                </Link>

                {/* Conditional Footer based on auth state */}
                {isFavorites ? (
                    <Link href={`/products/product/${ProductId}`}>
                        <CardFooter className="bg-[#E4E4E4] flex justify-between p-4 rounded-b-lg group-hover:bg-primary-light duration-500">
                            <Text className="text-primary group-hover:text-white duration-500">{priceWord}</Text>
                            <Text className="text-primary-light font-bold group-hover:text-white duration-500">{price.toString()}</Text>
                        </CardFooter>
                    </Link>
                ) : (
                    <CardFooter className="bg-gray-100 w-full flex flex-wrap gap-2 justify-between p-4 rounded-b-lg">
                        <Link href={`/products/product/${ProductId}`} className="bg-primary px-4 py-2 text-white rounded-lg flex-1 text-center">
                            Details
                        </Link>
                        
                        {/* Only show Edit button if user is authenticated */}
                        {isAuthenticated && (
                            <Link href={`/products/product/${ProductId}`} className="bg-primary-light px-4 py-2 text-white rounded-lg flex-1 text-center">
                                Edit
                            </Link>
                        )}
                    </CardFooter>
                )}
            </Card>
        </div>
    );
};