'use client';
import React from 'react';
import Box from '@/components/box/box';
import { Card, CardDescription, CardFooter, CardHeader } from '@/components/ui/card';

// Individual skeleton card item
export const ProductSkeletonItem = () => {
  return (
    <Card
      className="border-none rounded-lg bg-white w-full shadow-md relative overflow-hidden"
      aria-busy="true"
    >
      {/* Skeleton for the favorite button */}
      <div className="absolute top-3 left-3 bg-slate-200 p-2 rounded-full h-9 w-9 animate-pulse" />

      {/* Skeleton for the type label */}
      <div className="absolute bottom-44 left-3 bg-slate-200 w-20 h-5 rounded-full animate-pulse" />

      <CardHeader className="p-0">
        {/* Skeleton for image */}
        <div className="w-full aspect-[4/3] bg-slate-200 rounded-t-lg animate-pulse" />
        
        <CardDescription className="p-4">
          {/* Skeleton for title */}
          <div className="h-5 bg-slate-200 rounded-md w-4/5 mb-3 animate-pulse" />
          
          {/* Skeleton for brand/marka */}
          <div className="h-4 bg-slate-200 rounded-md w-3/5 animate-pulse" />
        </CardDescription>
      </CardHeader>

      {/* Skeleton Footer */}
      <CardFooter className="bg-slate-50 flex justify-between p-4 rounded-b-lg">
        <div className="h-4 bg-slate-200 rounded-md w-1/3 animate-pulse" />
        <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse" />
      </CardFooter>
    </Card>
  );
};

// Grid of skeleton items
const ProductSkeleton = ({ count = 8, showTitle = true }) => {
  return (
    <Box variant="column" className="w-full max-w-7xl mx-auto">
      {/* Skeleton for title area if showTitle is true */}
      {showTitle && (
        <Box variant="column" className="mb-6">
          <div className="h-7 bg-slate-200 rounded-md w-1/4 mb-3 animate-pulse" />
          <div className="h-5 bg-slate-200 rounded-md w-1/6 animate-pulse" />
        </Box>
      )}
      
      {/* Grid of skeleton cards */}
      <Box
        className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
        variant="center"
      >
        {Array.from({ length: count }, (_, index) => (
          <ProductSkeletonItem key={`skeleton-${index}`} />
        ))}
      </Box>
    </Box>
  );
};

export default ProductSkeleton;