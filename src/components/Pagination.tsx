'use client';
import React from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useLocale } from 'next-intl';

interface PaginationProps {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  showItemsInfo?: boolean;
  className?: string;
}

const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalPages,
  hasNextPage,
  hasPreviousPage,
  totalItems,
  pageSize,
  onPageChange,
  showItemsInfo = true,
  className = '',
}) => {
    const locale = useLocale();
  // Generate page buttons - show current page and up to 2 pages on each side
  const generatePageButtons = (): React.ReactNode[] => {


    const buttons: React.ReactNode[] = [];
    
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
          onClick={() => onPageChange(1)}
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
          onClick={() => onPageChange(i)}
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
          onClick={() => onPageChange(totalPages)}
          className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-gray-100"
        >
          {totalPages}
        </button>
      );
    }
    
    return buttons;
  };

  // Only render if we have more than one page
  if (totalPages <= 1) {
    return null;
  }

  return (
    <Box variant="column" className={`items-center ${className}`}>
      <Box variant="row" className="justify-center items-center mt-8 gap-2">
        {/* Previous button */}
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={!hasPreviousPage}
          className={`px-3 py-2 rounded-lg ${
            !hasPreviousPage 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
          
          {
            locale === 'en' ? 'Previous' : 'السابق'
        }
        </button>
        
        {/* Page number buttons */}
        <Box variant="row" className="mx-2">
          {generatePageButtons()}
        </Box>
        
        {/* Next button */}
        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={!hasNextPage}
          className={`px-3 py-2 rounded-lg ${
            !hasNextPage 
              ? 'bg-gray-200 text-gray-500 cursor-not-allowed' 
              : 'bg-primary text-white hover:bg-primary-dark'
          }`}
        >
        {
            locale === 'en' ? 'Next' : 'التالي'
        }
        </button>
      </Box>
      
      {/* Items info */}
      {showItemsInfo && (
        <Box variant="center" className="mt-4">
         {locale === 'ar' ? (
            <Text className="text-sm text-gray-500 font-cairo">
              عرض {((currentPage - 1) * pageSize) + 1} إلى {Math.min(currentPage * pageSize, totalItems)} من {totalItems} عنصر
            </Text>
          ) : (
            <Text className="text-sm text-gray-500">
              Showing {((currentPage - 1) * pageSize) + 1} to {Math.min(currentPage * pageSize, totalItems)} of {totalItems} items
            </Text>
          )}
        
        </Box>
      )}
    </Box>
  );
};

export default Pagination;