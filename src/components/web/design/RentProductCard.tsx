'use client';
import React, { useEffect, useState, useMemo } from 'react';
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
import { ArrowRight, Eye, Fuel, HeartIcon, LifeBuoy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {Link} from "@/i18n/routing"
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleCarListingFavorite } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useTranslations } from "next-intl";
import { getFuelTypeOptions, getTransmissionOptions } from "@/core/entities/enums/cars.enums";

// Extended props interface to include the callback and favorite status
interface ExtendedCarCardItemProps extends CarCardItemProps {
    onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
    isMarkedFavorite?: boolean;
}

// CardItem Component
export const RentProductCard: React.FC<ExtendedCarCardItemProps> = ({ 
    title, 
    marka, 
    price, 
    imageSrc, 
    priceWord, 
    details, 
    ProductId, 
    type,
    onFavoriteToggle,
    isMarkedFavorite = false
}) => {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
    const [isProcessing, setIsProcessing] = useState(false);
      const [isHovered, setIsHovered] = useState(false)

    // Get translators for different namespaces - similar to ProductBasicInfo
    const productT = useTranslations("product");
    const bodyTypeT = useTranslations("addProduct.enteredData.stepTow");

    // Get the translated options from the car enums - similar to ProductBasicInfo
    const transmissionOptions = useMemo(() => getTransmissionOptions(bodyTypeT), [bodyTypeT]);
    const fuelTypeOptions = useMemo(() => getFuelTypeOptions(bodyTypeT), [bodyTypeT]);

    // Find the matching label for the given values - same helper as in ProductBasicInfo
    const getTranslatedLabel = (value: string, options: Array<{ value: string; label: string }>) => {
        const option = options.find((opt) => opt.value === value);
        return option ? option.label : value;
    };

    // Translated values for details
    const translatedFuelType = details?.fuelType ? getTranslatedLabel(details.fuelType, fuelTypeOptions) : "";
    const translatedTransmission = details?.transmission ? getTranslatedLabel(details.transmission, transmissionOptions) : "";
    
    // Check authentication status when component mounts
    useEffect(() => {
        const verifyAuth = async () => {
            try {
                // Check if user is authenticated
                const authResponse = await checkAuth();
                setIsAuthenticated(authResponse.success);
            } catch (error) {
                console.error("Auth check failed for rent product:", error);
                setIsAuthenticated(false);
            }
        };
        
        verifyAuth();
    }, []);
    
    // Update internal state when the prop changes
    useEffect(() => {
        setFavoriteStatus(isMarkedFavorite);
    }, [isMarkedFavorite, ProductId]);

    const handleFavoriteClick = async (e: React.MouseEvent) => {
        e.preventDefault(); // Prevent the link navigation
        e.stopPropagation(); // Stop the event from bubbling up
        
        // Only allow favorite action if authenticated
        if (isAuthenticated && !isProcessing && ProductId) {
            setIsProcessing(true);
            
            try {
                // Store current state for comparison/reversion
                const currentState = favoriteStatus;
                
                // Optimistically update UI
                const newStatus = !currentState;
                setFavoriteStatus(newStatus);
                
                // Notify parent component
                if (onFavoriteToggle) {
                    onFavoriteToggle(Number(ProductId), newStatus);
                }
                
                // Call API
                const response = await toggleCarListingFavorite({
                    carListingId: Number(ProductId)
                });
                
                // Handle API response
                if (response.success) {
                    // Determine the actual status from API
                    let responseStatus: boolean;
                    
                    if (typeof response.data === 'boolean') {
                        responseStatus = response.data;
                    } else if (response.data && typeof response.data === 'object' && 'isFavorite' in response.data) {
                        responseStatus = response.data.isFavorite as boolean;
                    } else {
                        // If response format is unexpected, keep optimistic update
                        responseStatus = newStatus;
                    }
                    
                    
                    // If API returned something different than our optimistic update
                    if (responseStatus !== newStatus) {
                        setFavoriteStatus(responseStatus);
                        
                        if (onFavoriteToggle) {
                            onFavoriteToggle(Number(ProductId), responseStatus);
                        }
                    }
                } else {
                    // API call failed, revert to original state
                    setFavoriteStatus(currentState);
                    
                    if (onFavoriteToggle) {
                        onFavoriteToggle(Number(ProductId), currentState);
                    }
                }
            } catch (error) {
                // Exception occurred, revert to initial state
                console.error(`Exception in toggleFavorite:`, error);
                setFavoriteStatus(isMarkedFavorite);
                
                if (onFavoriteToggle) {
                    onFavoriteToggle(Number(ProductId), isMarkedFavorite);
                }
            } finally {
                setIsProcessing(false);
            }
        } else if (!isAuthenticated) {
            // You could redirect to login page here
            // window.location.href = '/login';
        }
    };

    return (
        <div className="w-full">
            <Card 
            
                className="border-none bg-white relative group hover:shadow-2xl hover:shadow-emerald-500/10 transition-all duration-500 ease-out overflow-hidden"
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={() => setIsHovered(false)}
                style={{
                transform: isHovered ? "translateY(-8px) scale(1.02)" : "translateY(0) scale(1)",
                }}
            >
                {/* Heart Icon with favorite status */}
                <Button 
                    className="absolute top-12 left-2 bg-white p-2 rounded-full shadow-md z-10"
                    onClick={handleFavoriteClick}
                    disabled={!isAuthenticated || isProcessing}
                >
                    <HeartIcon 
                        size={24} 
                        className={
                            isProcessing ? 'text-gray-400 animate-pulse' :
                            !isAuthenticated ? 'text-gray-400' : 
                            favoriteStatus ? 'text-red-500' : 'text-gray-600'
                        } 
                        fill={favoriteStatus ? "currentColor" : "none"}
                    />
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
                             {/* Hover overlay with view icon */}
                            <div className="absolute inset-0 bg-black/10 opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-center">
                            <div className="bg-white/90 backdrop-blur-sm rounded-full p-3 transform scale-75 group-hover:scale-100 transition-transform duration-300">
                                <Eye className="h-6 w-6 text-emerald-600" />
                            </div>
                            </div>
                        </CardTitle>
                        <CardDescription className='p-[8px]'>
                            <Text variant="h4" className="text-primary pr-2 pl-2 line-clamp-1">
                                {title}
                            </Text>
                            <Text variant="mid" className="text-primary pr-2 pl-2">
                                {marka}
                            </Text>
                        </CardDescription>
                    </CardHeader>
                </Link>
                
            <CardFooter className="flex justify-between items-center p-4 pt-0 gap-4">
          <div className="flex gap-4">
            {/* Fuel type with enhanced styling */}
            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-emerald-600 transition-colors duration-300">
              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors duration-300">
                <Fuel className="h-4 w-4" />
              </div>
              <span className="font-medium">{translatedFuelType}</span>
            </div>

            {/* Transmission with enhanced styling */}
            <div className="flex items-center gap-2 text-sm text-gray-600 group-hover:text-emerald-600 transition-colors duration-300">
              <div className="p-1.5 bg-gray-100 rounded-lg group-hover:bg-emerald-100 transition-colors duration-300">
                <LifeBuoy className="h-4 w-4" />
              </div>
              <span className="font-medium">{translatedTransmission}</span>
            </div>
          </div>

          {/* View details arrow - appears on hover */}
          <div className="opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
            <ArrowRight className="h-5 w-5 text-emerald-600" />
          </div>
                </CardFooter>
 <div className="h-1 bg-gradient-to-r from-emerald-500 to-teal-500 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left" />
            </Card>
        </div>
    );
};