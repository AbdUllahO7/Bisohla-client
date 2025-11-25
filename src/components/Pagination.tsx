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

const ChevronLeft = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M15 18l-6-6 6-6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ChevronRight = ({ size = 16 }: { size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" aria-hidden>
    <path
      d="M9 6l6 6-6 6"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

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
  const isRTL = locale === 'ar';

  // Generate page buttons with compact windowing and ellipses
  const generatePageButtons = (): React.ReactNode[] => {
    const buttons: React.ReactNode[] = [];

    if (totalPages <= 1) return [];

    let startPage = Math.max(1, currentPage - 2);
    let endPage = Math.min(totalPages, currentPage + 2);

    // Make sure we try to show up to 5 pages
    if (endPage - startPage < 4) {
      startPage = Math.max(1, endPage - 4);
      endPage = Math.min(totalPages, startPage + 4);
    }

    // First
    if (startPage > 1) {
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          aria-label="Go to page 1"
          className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition"
        >
          1
        </button>,
      );

      if (startPage > 2) {
        buttons.push(
          <span
            key="start-ellipsis"
            className="mx-1 text-sm text-gray-400 select-none"
          >
            •••
          </span>,
        );
      }
    }

    for (let i = startPage; i <= endPage; i++) {
      const isCurrent = i === currentPage;
      buttons.push(
        <button
          key={i}
          onClick={() => onPageChange(i)}
          aria-current={isCurrent ? 'page' : undefined}
          aria-label={isCurrent ? `Current page, page ${i}` : `Go to page ${i}`}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-sm transition font-bold
            ${
              isCurrent
                ? 'bg-primary-foreground text-white shadow'
                : 'bg-white text-gray-700 hover:shadow-md border border-gray-100'
            }`}
        >
          {i}
        </button>,
      );
    }

    if (endPage < totalPages) {
      if (endPage < totalPages - 1) {
        buttons.push(
          <span
            key="end-ellipsis"
            className="mx-1 text-sm text-gray-400 select-none"
          >
            •••
          </span>,
        );
      }

      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          aria-label={`Go to page ${totalPages}`}
          className="w-11 h-11 flex items-center justify-center rounded-full border border-gray-200 bg-white shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-offset-1 focus:ring-primary transition"
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  if (totalPages <= 1) return null;

  // handlers with safety
  const goPrev = () => {
    if (hasPreviousPage) onPageChange(Math.max(1, currentPage - 1));
  };
  const goNext = () => {
    if (hasNextPage) onPageChange(Math.min(totalPages, currentPage + 1));
  };

  return (
    <Box variant="column" className={`items-center ${className}`}>
      <Box
        variant="row"
        className={`justify-center items-center mt-8 gap-3`}
        role="navigation"
        aria-label="Pagination Navigation"
      >
        {/* Prev chevron button (circular) */}
        <button
          onClick={goPrev}
          disabled={!hasPreviousPage}
          aria-label={
            isRTL
              ? locale === 'ar'
                ? 'التالي'
                : 'Next'
              : locale === 'ar'
              ? 'السابق'
              : 'Previous'
          }
          className={`w-11 h-11 flex items-center justify-center rounded-full transition ${
            !hasPreviousPage
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
              : 'bg-white text-gray-600 hover:shadow-md border border-gray-100'
          }`}
        >
          {/* flip chevron depending on locale so direction looks correct in RTL */}
          {isRTL ? <ChevronRight /> : <ChevronLeft />}
        </button>

        {/* Page number buttons */}
        <Box variant="row" className="flex items-center gap-2 mx-1">
          {generatePageButtons()}
        </Box>

        {/* Next chevron button (circular) */}
        <button
          onClick={goNext}
          disabled={!hasNextPage}
          aria-label={
            isRTL
              ? locale === 'ar'
                ? 'السابق'
                : 'Previous'
              : locale === 'ar'
              ? 'التالي'
              : 'Next'
          }
          className={`w-11 h-11 flex items-center justify-center rounded-full transition ${
            !hasNextPage
              ? 'bg-gray-100 text-gray-400 cursor-not-allowed border border-gray-100'
              : 'bg-white text-gray-600 hover:shadow-md border border-gray-100'
          }`}
        >
          {isRTL ? <ChevronLeft /> : <ChevronRight />}
        </button>
      </Box>

      {/* Items info */}
      {/* {showItemsInfo && (
        <Box
          variant="center"
          className={`mt-3 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {locale === 'ar' ? (
            <Text className="text-sm text-gray-500 font-cairo">
              عرض {(currentPage - 1) * pageSize + 1} إلى{' '}
              {Math.min(currentPage * pageSize, totalItems)} من {totalItems}{' '}
              عنصر
            </Text>
          ) : (
            <Text className="text-sm text-gray-500">
              Showing {(currentPage - 1) * pageSize + 1} to{' '}
              {Math.min(currentPage * pageSize, totalItems)} of {totalItems}{' '}
              items
            </Text>
          )}
        </Box>
      )} */}
    </Box>
  );
};

export default Pagination;
