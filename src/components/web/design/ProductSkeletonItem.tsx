'use client';
import React from 'react';
import Box from '@/components/box/box';
import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';

// Individual skeleton card item
export const ProductSkeletonItem = () => {
    return (
        <Card className="border-none rounded-lg bg-white w-full shadow-lg relative">
        {/* Skeleton for the favorite button */}
        <div className="absolute top-2 left-2 bg-gray-200 p-2 rounded-full h-8 w-8 animate-pulse" />
        
        {/* Skeleton for the type label */}
        <div className="absolute bottom-40 left-2 bg-gray-200 w-16 h-6 rounded-lg animate-pulse" />
        
        <CardHeader className="p-0">
            {/* Skeleton for image */}
            <div className="w-full h-48 bg-gray-200 rounded-t-lg animate-pulse" />
            
            <CardDescription className="p-4">
            {/* Skeleton for title */}
            <div className="h-6 bg-gray-200 rounded w-3/4 mb-2 animate-pulse" />
            
            {/* Skeleton for brand/marka */}
            <div className="h-4 bg-gray-200 rounded w-1/2 animate-pulse" />
            </CardDescription>
        </CardHeader>

        {/* Skeleton Footer */}
        <CardFooter className="bg-gray-100 flex justify-between p-4 rounded-b-lg">
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
            <div className="h-4 bg-gray-200 rounded w-1/4 animate-pulse" />
        </CardFooter>
        </Card>
    );
};

// Grid of skeleton items
const ProductSkeleton = ({ count = 8, showTitle = true }) => {
    // Create an array of the specified length to map over
    const skeletonItems = Array.from({ length: count }, (_, i) => i);
    
    return (
        <Box variant="column" className="w-full">
        {/* Skeleton for title area if showTitle is true */}
        {showTitle && (
            <Box variant="column" className="mb-4">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-2 animate-pulse" />
            <div className="h-6 bg-gray-200 rounded w-1/4 animate-pulse" />
            </Box>
        )}
        
        {/* Grid of skeleton cards */}
        <Box 
            className={`grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 ${showTitle ? "lg:grid-cols-5" : "lg:grid-cols-4"} gap-4 sm:w-[80%] xs:w-[80%] lg:w-full`} 
            variant="center"
        >
            {skeletonItems.map((_, index) => (
            <React.Fragment key={index}>
                <ProductSkeletonItem />
                {/* Add CardAds skeleton after first two cards */}
            </React.Fragment>
            ))}
        </Box>
        </Box>
    );
};

export default ProductSkeleton;