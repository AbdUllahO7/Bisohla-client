'use client';
import React, { useEffect, useState, useRef } from 'react';
import Text from '@/components/text/text';
import {
    Card,
    CardDescription,
    CardFooter,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import Image from 'next/image';
import {Link} from "@/i18n/routing"
import { Button } from '@/components/ui/button';
import { CarCardItemPropsProfile } from '@/types/homePageTypes';
import { AlertTriangle, Edit, HeartIcon, Trash2 } from 'lucide-react';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { toggleCarListingFavorite } from '@/core/infrastructure-adapters/actions/users/car.user.actions';
import { useDeleteCarListing } from '@/core/infrastructure-adapters/use-actions/users/car.user.use-actions';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useLocale, useTranslations } from 'next-intl';
import clsx from 'clsx';

// Extended props interface to include the callback, favorite status and authentication
interface ExtendedCarCardItemPropsProfile extends CarCardItemPropsProfile {
    onFavoriteToggle?: (productId: number, isFavorite: boolean) => void;
    isMarkedFavorite?: boolean;
    isAuthenticated?: boolean; // Add prop to receive auth status from parent
    userProdcut?:boolean;
    onDelete?: (productId: number) => void; // Optional callback for after successful deletion
}

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
    onFavoriteToggle,
    isMarkedFavorite = false,
    isAuthenticated: isAuthenticatedProp,
    onDelete
}) => {
    // Use the auth prop if provided, otherwise start with undefined and check later
    const [isAuthenticated, setIsAuthenticated] = useState(isAuthenticatedProp !== undefined ? isAuthenticatedProp : false);
    const [favoriteStatus, setFavoriteStatus] = useState(isMarkedFavorite);
    const [isProcessing, setIsProcessing] = useState(false);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const authChecked = useRef(false);
    
    // Get locale and direction
    const locale = useLocale();
    const direction = locale === "ar" ? "rtl" : "ltr";
    // Get translations
    const t = useTranslations('common');
    
    // Use the delete mutation hook
    const deleteCarListingMutation = useDeleteCarListing();
    
    // Only check authentication if it's not provided as a prop
    useEffect(() => {
        const verifyAuth = async () => {
            // Skip auth check if prop is provided
            if (isAuthenticatedProp !== undefined) {
                return;
            }
            
            // Only check auth once
            if (!authChecked.current) {
                try {
                    const authResponse = await checkAuth();
                    setIsAuthenticated(authResponse.success);
                    authChecked.current = true;
                } catch (error) {
                    console.error("Auth check failed:", error);
                    setIsAuthenticated(false);
                    authChecked.current = true;
                }
            }
        };
        
        verifyAuth();
    }, [isAuthenticatedProp]);
    
    // Update authentication status if prop changes
    useEffect(() => {
        if (isAuthenticatedProp !== undefined) {
            setIsAuthenticated(isAuthenticatedProp);
        }
    }, [isAuthenticatedProp]);
    
    // Update internal state when the favorite prop changes
    // Use a ref to track previous value to avoid unnecessary updates
    const prevFavoriteRef = useRef(isMarkedFavorite);
    useEffect(() => {
        if (prevFavoriteRef.current !== isMarkedFavorite) {
            setFavoriteStatus(isMarkedFavorite);
            prevFavoriteRef.current = isMarkedFavorite;
        }
    }, [isMarkedFavorite]);

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
                setFavoriteStatus(isMarkedFavorite);
                
                if (onFavoriteToggle) {
                    onFavoriteToggle(Number(ProductId), isMarkedFavorite);
                }
            } finally {
                setIsProcessing(false);
            }
        } else if (!isAuthenticated) {
            // Could redirect to login page here
            // window.location.href = '/login';
        }
    };
    
    // Handle delete button click - show confirmation dialog
    const handleDeleteClick = (e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setShowDeleteDialog(true);
    };
    
    // Handle confirm delete action
    const handleConfirmDelete = async () => {
        if (!ProductId) return;
        
        try {
            setIsDeleting(true);
            await deleteCarListingMutation.mutateAsync({ id: Number(ProductId) });
            
            // Close the dialog
            setShowDeleteDialog(false);
            
            // Notify parent of deletion if callback provided
            if (onDelete) {
                onDelete(Number(ProductId));
            }
        } catch (error) {
            console.error("Failed to delete car listing:", error);
        } finally {
            setIsDeleting(false);
        }
    };
    
    // Handle cancel delete
    const handleCancelDelete = () => {
        setShowDeleteDialog(false);
    };
    
    // RTL-aware positioning classes
    const heartButtonClass = clsx(
        "absolute top-2 bg-white p-2 rounded-full shadow-md z-10",
        locale === "ar" ? "right-2" : "left-2"
    );
    
    const typeTagClass = clsx(
        "absolute bottom-40 bg-white px-2 py-1 rounded-lg shadow-md text-primary text-sm",
        locale === "ar" ? "right-2" : "left-2"
    );
    
    const iconMarginClass = clsx(
        locale === "ar" ? "ml-2" : "mr-2"
    );
    
    return (
        <div className="w-full" dir={direction}>
            <Card className={`group border-none rounded-lg bg-white w-full shadow-lg relative `}>
                {/* Heart Icon for Favorites with favorite status directly from props */}
                {isFavorites && (
                    <Button 
                        className={heartButtonClass}
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
                )}
                
                <Text className={typeTagClass}>
                    {type === "for_sale" ? t('sale') : t('rent')}
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
                        <Button 
                            className="bg-red-500 hover:bg-red-600 px-4 py-2 text-white rounded-lg flex-1 text-center"
                            onClick={handleDeleteClick}
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <span className="flex items-center justify-center">
                                    <svg className={`animate-spin ${locale === "ar" ? "-mr-1 ml-2" : "-ml-1 mr-2"} h-4 w-4 text-white`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('deleting')}
                                </span>
                            ) : (
                                <span className="flex items-center justify-center">
                                    <Trash2 className={iconMarginClass} size={16} />
                                    {t('delete')}
                                </span>
                            )}
                        </Button>
                        
                        {/* Only show Edit button if user is authenticated */}
                        {isAuthenticated && (
                            <Link href={`/products/EditProduct/${ProductId}`} className="bg-primary-light px-4 py-2 text-white rounded-lg flex-1 text-center flex items-center justify-center">
                                <Edit className={iconMarginClass} size={16} />
                                {t('edit')}
                            </Link>
                        )}
                    </CardFooter>
                )}
            </Card>
            
            {/* Delete Confirmation Dialog - Enhanced Design */}
            <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
                <AlertDialogContent dir={direction} className="bg-white rounded-lg p-0 max-w-md shadow-xl">
                    <div className="bg-red-50 p-4 rounded-t-lg border-b border-red-100">
                        <AlertDialogHeader>
                            <div className="flex items-center">
                                <div className="flex-shrink-0">
                                    <AlertTriangle className="h-6 w-6 text-red-500" aria-hidden="true" />
                                </div>
                                <div className={`${locale === "ar" ? "mr-3" : "ml-3"}`}>
                                    <AlertDialogTitle className="text-lg font-medium text-red-800">
                                        {t('deleteConfirmation')}
                                    </AlertDialogTitle>
                                </div>
                            </div>
                        </AlertDialogHeader>
                    </div>
                    
                    <div className="p-6">
                        <AlertDialogDescription className="text-sm text-gray-600">
                            {t('deleteWarning')}
                        </AlertDialogDescription>
                        
                        <div className="mt-2">
                            <div className="rounded-md bg-gray-50 p-4">
                                <div className="flex">
                                    <div className={`${locale === "ar" ? "mr-3" : "ml-3"} mt-2 text-sm`}>
                                        <h3 className="font-medium text-gray-800">{title}</h3>
                                        <p className="text-gray-500">{marka}</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    <AlertDialogFooter className="bg-gray-50 px-6 py-4 rounded-b-lg flex flex-row-reverse sm:flex-row gap-2">
                        <AlertDialogCancel 
                            onClick={handleCancelDelete}
                            className={`inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 ${locale === "ar" ? "sm:ml-3" : "sm:mr-3"} w-full sm:w-auto`}
                        >
                            {t('cancel')}
                        </AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleConfirmDelete}
                            className="inline-flex justify-center rounded-md border border-transparent bg-red-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2 w-full sm:w-auto"
                            disabled={isDeleting}
                        >
                            {isDeleting ? (
                                <span className="flex items-center">
                                    <svg className={`animate-spin h-4 w-4 text-white ${locale === "ar" ? "ml-2 -mr-1" : "mr-2 -ml-1"}`} xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                    {t('deleting')}
                                </span>
                            ) : (
                                <span className="flex items-center">
                                    <Trash2 className={`h-4 w-4 ${locale === "ar" ? "ml-2 -mr-1" : "mr-2 -ml-1"}`} />
                                    {t('confirmDelete')}
                                </span>
                            )}
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </div>
    );
};