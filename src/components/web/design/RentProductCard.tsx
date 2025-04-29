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
import { CarCardItemProps } from '@/types/homePageTypes';
import Box from '@/components/box/box';
import { Fuel, HeartIcon, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { 
    checkIsCarListingFavorite,
    toggleCarListingFavorite
} from '@/core/infrastructure-adapters/actions/users/car.user.actions';

// CardItem Component
export const RentProductCard: React.FC<CarCardItemProps> = ({ 
    title, 
    marka, 
    price, 
    imageSrc, 
    priceWord, 
    details, 
    ProductId, 
    type 
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [isMarkedFavorite, setIsMarkedFavorite] = useState(false);
    const [isProcessing, setIsProcessing] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

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
                        console.log('Checking favorite status for RentProductCard ProductId:', ProductId);
                        // Make sure ProductId is valid
                        if (ProductId) {
                            // Check if this specific car is in user's favorites
                            const favoriteResponse = await checkIsCarListingFavorite(Number(ProductId));
                            console.log('Favorite response for rent product:', favoriteResponse);
                            
                            // FIXED: Improved detection of favorite status by handling different response formats
                            const isFavorite = favoriteResponse.success && 
                              (favoriteResponse.data === true || favoriteResponse.data?.isFavorite === true);
                            
                            console.log('Calculated favorite status for rent product:', isFavorite);
                            setIsMarkedFavorite(isFavorite);
                        } else {
                            console.error('Invalid ProductId for rent product:', ProductId);
                        }
                    } catch (favoriteError) {
                        console.error('Error checking favorite status for rent product:', favoriteError);
                    }
                }
            } catch (error) {
                console.error("Auth check failed for rent product:", error);
                setIsAuthenticated(false);
            } finally {
                setIsInitialLoading(false);
            }
        };
        
        verifyAuth();
    }, [ProductId]);

    const handleFavoriteClick = async (e) => {
        e.preventDefault(); // Prevent the link navigation
        e.stopPropagation(); // Stop the event from bubbling up
        
        // Only allow favorite action if authenticated
        if (isAuthenticated && !isProcessing) {
            setIsProcessing(true);
            
            try {
                console.log('Toggling favorite for rent product ID:', ProductId);
                // Call the toggle API with the car listing ID
                const response = await toggleCarListingFavorite({
                    carListingId: Number(ProductId)
                });
                
                if (response.success) {
                    // FIXED: Improved handling of toggle response for different formats
                    const newFavoriteStatus = response.data?.isFavorite !== undefined 
                        ? response.data.isFavorite 
                        : response.data === true || !isMarkedFavorite;
                    
                    console.log('New favorite status for rent product:', newFavoriteStatus);
                    setIsMarkedFavorite(newFavoriteStatus);
                } else {
                    console.error("Failed to toggle favorite for rent product:", response.message);
                }
            } catch (error) {
                console.error("Failed to toggle favorite status for rent product:", error);
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
            <Card className="border-none bg-white relative group hover:-translate-y-3 duration-500">
                {/* Heart Icon with favorite status */}
                <Button 
                    className="absolute top-12 left-2 bg-white p-2 rounded-full shadow-md z-20"
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
                
                <Text className="absolute bottom-32 left-2 bg-white px-2 py-1 rounded-lg shadow-md text-primary text-sm">
                    {type === "for_rent" ? "Rent" : 'Sale'}
                </Text>
                
                <Box className="flex justify-between p-[8px] rounded-t-[10px] bg-primary-light group-hover:bg-primary duration-500">
                    <Text className="mid font-cairo text-[500] text-[#EFEFEF] text-[14px]">{priceWord}</Text>
                    <Text className="mid font-cairo text-white-light font-bold">{price}</Text>
                </Box>
                
                <Link href={`/products/product/${ProductId}`} className="block">
                    <CardHeader className="p-0">
                        <CardTitle className="w-full">
                            <Image
                                src={imageSrc}
                                alt={title}
                                width={220}
                                height={300}
                                className="w-full h-48"
                            />
                        </CardTitle>
                        <CardDescription className='p-[8px]'>
                            <Text variant="h4" className="text-primary pr-2 pl-2">
                                {title}
                            </Text>
                            <Text variant="mid" className="text-primary pr-2 pl-2">
                                {marka}
                            </Text>
                        </CardDescription>
                    </CardHeader>
                </Link>
                
                <CardFooter className="flex justify-start p-[8px] gap-4">
                    {/* Display details */}
                    <Text variant="small" className="text-gray-500 pr-2 pl-2 flex justify-center items-center gap-2">
                        <Fuel/>
                        {details?.fuelType}
                    </Text>
                    <Text variant="small" className="text-gray-500 pr-2 pl-2 flex justify-center items-center gap-2">
                        <LifeBuoy/>
                        {details?.transmission}
                    </Text>
                </CardFooter>
            </Card>
        </div>
    );
};