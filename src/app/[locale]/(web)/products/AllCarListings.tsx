'use client';
import React, { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useTranslations } from 'next-intl';

import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import { ProductCardItem } from '@/components/web/design/ProductCardItem';

// Define interfaces for the data structure
interface CarImage {
  isPrimary: boolean;
  url: string;
}

interface CarMake {
  name: string;
}

interface CarListing {
  id: number; // Changed to number to match ProductCardItemPropsProfile
  title: string;
  make?: CarMake;
  marka?: string;
  price: number;
  listingType: string;
  images?: CarImage[];
  imageSrc?: string;
  gaz?: string;
  type?: string;
}

interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}

interface ApiResponse {
  data?: CarListing[] | {
    data: CarListing[];
    currentPage?: number;
    totalPages?: number;
    hasNextPage?: boolean;
    hasPreviousPage?: boolean;
    totalItems?: number;
  };
  currentPage?: number;
  totalPages?: number;
  hasNextPage?: boolean;
  hasPreviousPage?: boolean;
  totalItems?: number;
  meta?: {
    currentPage?: number;
    totalPages?: number;
    total?: number;
  };
}

// Interface matching the ProductCardItem component props
interface CarCardItemPropsProfile {
  title: string;
  marka: string;
  imageSrc: string;
  priceWord: string;
  price: number;
  details?: {
    gaz: string,
    type: string
  };
  ProductId: number;
  isFavorites: boolean;
  type?: string;
}

interface AllCarListingsProps {
  pageSize?: number;
  showTitle?: boolean;
  container?: boolean;
}

const AllCarListings: React.FC<AllCarListingsProps> = ({ 
  pageSize = 8, 
  showTitle = false, 
  container = true 
}) => {
  const t = useTranslations('homePage');
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  // Fetch all car listings with pagination
  const { data, isLoading, error } = useCarListings({
    page: currentPage,
    pageSize: pageSize,
    sortBy: 'createdAt',
    sortDirection: 'desc'
  });
  
  useEffect(() => {
    console.log("Full data response:", data);
  }, [data]);
  
  // Extract car listings array safely
  const carListings = React.useMemo<CarListing[]>(() => {
    const apiData = data as ApiResponse | undefined;
    
    // Check if data.data is an array of listings
    if (Array.isArray(apiData?.data)) {
      return apiData.data as CarListing[];
    }
    // Check if data.data.data is an array of listings (nested structure)
    else if (apiData?.data && 'data' in apiData.data && Array.isArray((apiData.data as any).data)) {
      return (apiData.data as any).data as CarListing[];
    }
    return [];
  }, [data]);
  
  useEffect(() => {
    console.log("Extracted car listings:", carListings);
  }, [carListings]);
  
  // Get pagination information
  const paginationInfo = React.useMemo<PaginationInfo>(() => {
    const apiData = data as ApiResponse | undefined;
    
    // Check direct properties first
    if (apiData?.currentPage !== undefined) {
      return {
        currentPage: apiData.currentPage,
        totalPages: apiData.totalPages || 1,
        hasNextPage: apiData.hasNextPage || false,
        hasPreviousPage: apiData.hasPreviousPage || false,
        totalItems: apiData.totalItems || 0
      };
    }
    // Then check if pagination info is nested in data
    else if (apiData?.data && typeof apiData.data === 'object' && !Array.isArray(apiData.data) && 'currentPage' in apiData.data) {
      const nestedData = apiData.data as any;
      return {
        currentPage: nestedData.currentPage,
        totalPages: nestedData.totalPages || 1,
        hasNextPage: nestedData.hasNextPage || false,
        hasPreviousPage: nestedData.hasPreviousPage || false,
        totalItems: nestedData.totalItems || 0
      };
    }
    // Finally check for meta data structure
    else if (apiData?.meta) {
      return {
        currentPage: apiData.meta.currentPage || 1,
        totalPages: apiData.meta.totalPages || 1,
        hasNextPage: (apiData.meta.currentPage || 1) < (apiData.meta.totalPages || 1),
        hasPreviousPage: (apiData.meta.currentPage || 1) > 1,
        totalItems: apiData.meta.total || 0
      };
    }
    
    // Default values
    return {
      currentPage: 1,
      totalPages: 1,
      hasNextPage: false,
      hasPreviousPage: false,
      totalItems: carListings.length
    };
  }, [data, carListings]);
  
  useEffect(() => {
    console.log("Pagination info:", paginationInfo);
  }, [paginationInfo]);
  
  // Handle page changes
  const handlePreviousPage = (): void => {
    if (paginationInfo.hasPreviousPage) {
      setCurrentPage(currentPage - 1);
    }
  };
  
  const handleNextPage = (): void => {
    if (paginationInfo.hasNextPage) {
      setCurrentPage(currentPage + 1);
    }
  };

  // Generate page buttons - show current page and up to 2 pages on each side
  const generatePageButtons = (): React.ReactNode[] => {
    const buttons: React.ReactNode[] = [];
    const { totalPages } = paginationInfo;
    
    // If only one page, don't show pagination
    if (totalPages <= 1) {
      return [];
    }
    
    // Determine range of pages to show
    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);
    
    // Adjust if we're at the end
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
    }
    
    // Adjust if we're at the beginning
    if (endPage - startPage < 4) {
      endPage = Math.min(totalPages, startPage + 4);
    }
    
    // Add first page button if not in range
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => setCurrentPage(1)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
        >
          1
        </button>
      );
      
      // Add ellipsis if there's a gap
      if (startPage > 2) {
        buttons.push(
          <span key="ellipsis-start" className="mx-1">...</span>
        );
      }
    }
    
    // Add page buttons
    for (let i = startPage; i <= endPage; i++) {
      buttons.push(
        <button
          key={i}
          onClick={() => setCurrentPage(i)}
          className={`w-8 h-8 flex items-center justify-center rounded-md ${
            i === currentPage
              ? 'bg-primary text-white'
              : 'hover:bg-gray-100'
          }`}
        >
          {i}
        </button>
      );
    }
    
    // Add last page button if not in range
    if (endPage < totalPages) {
      // Add ellipsis if there's a gap
      if (endPage < totalPages - 1) {
        buttons.push(
          <span key="ellipsis-end" className="mx-1">...</span>
        );
      }
      
      buttons.push(
        <button
          key="last"
          onClick={() => setCurrentPage(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };
  
  return (
    <Box variant={container ? "container" : "center"} className="mb-5">
      <Box variant="column">
        {showTitle && (
          <Box variant="column" className="mb-4">
            <Text variant="h3" className="font-bold text-[20px] font-cairo">
              {t('allCars.title', { defaultValue: 'All Cars' })}
            </Text>
          </Box>
        )}
        
        {/* Show loading state */}
        {isLoading && (
          <Box className="w-full py-4" variant="center">
            <Text>Loading...</Text>
          </Box>
        )}
        
        {/* Show error state */}
        {error && (
          <Box className="w-full py-4" variant="center">
            <Text className="text-red-500">Failed to load car listings</Text>
          </Box>
        )}
        
        {/* Show empty state */}
        {!isLoading && !error && carListings.length === 0 && (
          <Box className="w-full py-4" variant="center">
            <Text>No car listings available</Text>
          </Box>
        )}
        
        {/* Display Cards */}
        {!isLoading && !error && carListings.length > 0 && (
          <>
            <Box 
              className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 w-full"
              variant="center"
            >
              {carListings.map((card, index) => (
                <React.Fragment key={card.id || index}>
                  <ProductCardItem
                    title={card.title}
                    marka={card.make?.name || card.marka || ''}
                    price={card.price}
                    type={card.listingType}
                    imageSrc={card.images?.find((img: CarImage) => img.isPrimary)?.url || card.images?.[0]?.url || card.imageSrc || ''}
                    ProductId={card.id}
                    priceWord={t('latestOffers.price')}
                    isFavorites={true}
                    details={card.gaz ? {
                      gaz: card.gaz,
                      type: card.type || ''
                    } : undefined}
                  />
                </React.Fragment>
              ))}
            </Box>
            
            {/* Pagination controls - only show if we have more than one page */}
            {paginationInfo.totalPages > 1 && (
              <>
                <Box variant="row" className="justify-center items-center mt-8 gap-2">
                  {/* Previous button */}
                  <button
                    onClick={handlePreviousPage}
                    disabled={!paginationInfo.hasPreviousPage}
                    className={`px-3 py-2 rounded-lg ${
                      !paginationInfo.hasPreviousPage 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Previous
                  </button>
                  
                  {/* Page number buttons */}
                  <Box variant="row" className="mx-2">
                    {generatePageButtons()}
                  </Box>
                  
                  {/* Next button */}
                  <button
                    onClick={handleNextPage}
                    disabled={!paginationInfo.hasNextPage}
                    className={`px-3 py-2 rounded-lg ${
                      !paginationInfo.hasNextPage 
                        ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
                        : 'bg-primary text-white hover:bg-primary-dark'
                    }`}
                  >
                    Next
                  </button>
                </Box>
                
                {/* Items info */}
                <Box variant="center" className="mt-4">
                  <Text className="text-sm text-gray-500">
                    Showing {((paginationInfo.currentPage - 1) * pageSize) + 1} to {Math.min(paginationInfo.currentPage * pageSize, paginationInfo.totalItems)} of {paginationInfo.totalItems} items
                  </Text>
                </Box>
              </>
            )}
          </>
        )}
      </Box>
    </Box>
  );
};

export default AllCarListings;