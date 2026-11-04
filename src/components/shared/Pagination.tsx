'use client';
import React from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
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
      const isFirstCurrent = currentPage === 1;
      buttons.push(
        <button
          key="first"
          onClick={() => onPageChange(1)}
          aria-current={isFirstCurrent ? 'page' : undefined}
          aria-label="Go to page 1"
          className={`w-11 h-11 flex items-center justify-center rounded-full text-sm transition font-bold ${
            isFirstCurrent
              ? 'bg-[#198341] text-white shadow-md border-2 border-[#198341]'
              : 'border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700'
          }`}
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
          className={`w-11 h-11 flex items-center justify-center rounded-full text-sm transition font-bold ${
            isCurrent
              ? 'bg-[#198341] text-white shadow-md border-2 border-[#198341]'
              : 'bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-300 hover:shadow-md border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700'
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

      const isLastCurrent = currentPage === totalPages;
      buttons.push(
        <button
          key="last"
          onClick={() => onPageChange(totalPages)}
          aria-current={isLastCurrent ? 'page' : undefined}
          aria-label={`Go to page ${totalPages}`}
          className={`w-11 h-11 flex items-center justify-center rounded-full text-sm transition font-bold ${
            isLastCurrent
              ? 'bg-[#198341] text-white shadow-md border-2 border-[#198341]'
              : 'border border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-gray-700 dark:text-zinc-200 shadow-sm hover:shadow-md hover:border-gray-300 dark:hover:border-zinc-700'
          }`}
        >
          {totalPages}
        </button>,
      );
    }

    return buttons;
  };

  if (totalPages <= 1) return null;

  // Handlers with safe fallbacks
  const canGoPrev = hasPreviousPage || currentPage > 1;
  const canGoNext = hasNextPage || currentPage < totalPages;

  const goPrev = () => {
    if (canGoPrev) onPageChange(Math.max(1, currentPage - 1));
  };
  const goNext = () => {
    if (canGoNext) onPageChange(Math.min(totalPages, currentPage + 1));
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
          disabled={!canGoPrev}
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
            !canGoPrev
              ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-550 cursor-not-allowed border border-gray-100 dark:border-zinc-800'
              : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:shadow-md border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer'
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
          disabled={!canGoNext}
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
            !canGoNext
              ? 'bg-gray-100 dark:bg-zinc-800 text-gray-400 dark:text-zinc-550 cursor-not-allowed border border-gray-100 dark:border-zinc-800'
              : 'bg-white dark:bg-zinc-900 text-gray-600 dark:text-zinc-300 hover:shadow-md border border-gray-100 dark:border-zinc-800 hover:border-gray-300 dark:hover:border-zinc-700 cursor-pointer'
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
