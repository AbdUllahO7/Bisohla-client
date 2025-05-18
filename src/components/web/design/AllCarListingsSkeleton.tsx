'use client';
import React from 'react';
import Box from '@/components/box/box';
import { ProductSkeletonItem } from '@/components/web/design/ProductSkeletonItem'; // Reusing the provided ProductSkeletonItem

interface AllCarListingsSkeletonProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
}

const PaginationSkeleton = () => {
  return (
    <div
      className="flex items-center justify-between w-full max-w-2xl mx-auto mt-4"
      aria-busy="true"
    >
      {/* Previous button */}
      <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
      {/* Page numbers */}
      <div className="flex space-x-2">
        <div className="h-8 w-8 bg-slate-200 rounded-md animate-pulse" />
        <div className="h-8 w-8 bg-slate-200 rounded-md animate-pulse" />
        <div className="h-8 w-8 bg-slate-200 rounded-md animate-pulse" />
      </div>
      {/* Next button */}
      <div className="h-10 w-24 bg-slate-200 rounded-md animate-pulse" />
    </div>
  );
};

const AllCarListingsSkeleton: React.FC<AllCarListingsSkeletonProps> = ({
  pageSize = 8,
  showTitle = false,
  container = false,
}) => {
  return (
    <Box variant={container ? 'container' : 'center'} className="mb-5 w-full    ">
      <Box variant="column" className="w-full">
        {/* Title skeleton */}
        {showTitle && (
          <Box variant="column" className="mb-6 w-full">
            <div className="h-7 w-1/4 bg-slate-200 rounded-md animate-pulse" />
          </Box>
        )}

        {/* Grid of skeleton cards */}
        <Box
          className="grid grid-cols-1 sm:min-w-[300px] xs:min-w-[300px] md:min-w-[600px] xl:min-w-[800px] sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 w-full"
          variant="center"
        >
          {Array.from({ length: pageSize }, (_, index) => (
            <ProductSkeletonItem key={`skeleton-${index}`} />
          ))}
        </Box>

        {/* Pagination skeleton */}
        <PaginationSkeleton />
      </Box>
    </Box>
  );
};

export default AllCarListingsSkeleton;