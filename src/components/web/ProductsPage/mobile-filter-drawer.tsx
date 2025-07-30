'use client';

import React, { useEffect, useRef } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useFilters } from '@/providers/filters.provider';
import { useLocale, useTranslations } from 'next-intl';
import ProductsFilter from './Filter';

interface MobileFilterDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

const MobileFilterDrawer: React.FC<MobileFilterDrawerProps> = ({
  isOpen,
  onClose,
}) => {
  const { filters, resetFilters } = useFilters();
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('productsPage');
  const drawerRef = useRef<HTMLDivElement>(null);

  // Count active filters
  const getActiveFilterCount = (): number => {
    let count = 0;

    if (filters.governorate) count++;
    if (filters.city) count++;
    if (filters.selectedBrands.length > 0) count++;
    if (filters.model) count++;
    if (filters.trim) count++;
    if (filters.minYear) count++;
    if (filters.maxYear) count++;
    if (filters.minPrice) count++;
    if (filters.maxPrice) count++;
    if (filters.currency) count++;
    if (filters.minMileage) count++;
    if (filters.maxMileage) count++;
    if (filters.transmission) count++;
    if (filters.fuelType) count++;
    if (filters.bodyType) count++;
    if (filters.listingType) count++;

    return count;
  };

  const activeFilterCount = getActiveFilterCount();

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when drawer is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      document.body.style.paddingRight = '0px'; // Prevent layout shift
    } else {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    }

    return () => {
      document.body.style.overflow = '';
      document.body.style.paddingRight = '';
    };
  }, [isOpen]);

  const handleResetAndClose = () => {
    resetFilters();
    setTimeout(() => {
      onClose();
    }, 100);
  };

  const handleApplyFilters = () => {
    onClose();
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black/50 z-50 lg:hidden"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer */}
      <div
        ref={drawerRef}
        className={`fixed top-0 ${
          isRTL ? 'left-0' : 'right-0'
        } h-full w-full max-w-sm bg-white z-50 lg:hidden transform transition-transform duration-300 ease-in-out ${
          isOpen
            ? 'translate-x-0'
            : isRTL
            ? '-translate-x-full'
            : 'translate-x-full'
        }`}
        dir={isRTL ? 'rtl' : 'ltr'}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <h2 className="text-lg font-semibold text-gray-900">
              {t('filter.title')}
            </h2>
            {activeFilterCount > 0 && (
              <div className="bg-primary text-white text-xs px-2 py-1 rounded-full min-w-[20px] text-center">
                {activeFilterCount}
              </div>
            )}
          </div>

          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0 hover:bg-gray-100"
          >
            <X className="h-5 w-5" />
            <span className="sr-only">Close filters</span>
          </Button>
        </div>

        {/* Filter Content */}
        <div className="flex-1 overflow-y-auto pb-20">
          <div className="p-4">
            <ProductsFilter />
          </div>
        </div>

        {/* Footer Actions */}
        <div className="absolute bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4 space-y-3">
          <div className="flex gap-3">
            <Button
              variant="outline"
              onClick={handleResetAndClose}
              className="flex-1 h-11 font-medium border-gray-300 hover:bg-gray-50"
              disabled={activeFilterCount === 0}
            >
              <RotateCcw className="h-4 w-4 mr-2" />
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </Button>

            <Button
              onClick={handleApplyFilters}
              className="flex-1 h-11 font-medium bg-primary hover:bg-primary/90 text-white"
            >
              <Check className="h-4 w-4 mr-2" />
              {isRTL ? 'تطبيق الفلاتر' : 'Apply Filters'}
              {activeFilterCount > 0 && (
                <span className="ml-2 bg-white/20 text-white text-xs px-2 py-0.5 rounded-full">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default MobileFilterDrawer;
