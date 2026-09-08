'use client';

import React, { useState, useEffect } from 'react';
import { useTranslations } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import { ChevronDown, X, Search, Store, AlertCircle, RefreshCw, UserCheck } from 'lucide-react';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetSellers } from '@/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions';
import { getUserProfileInfo } from '@/core/infrastructure-adapters/actions/visitors/public-profile.actions';
import SellerRowCard from '@/components/web/design/SellerRowCard';
import Pagination from '@/components/shared/Pagination';
import { cn } from '@/lib/utils';

export interface SellerFilterPickerProps {
  selectedSellerId: number | null;
  onSelectSeller: (id: number | null) => void;
  className?: string;
}

export const SellerFilterPicker: React.FC<SellerFilterPickerProps> = ({
  selectedSellerId,
  onSelectSeller,
  className,
}) => {
  const tFilter = useTranslations('listing.filters');
  const tList = useTranslations('sellers.list');

  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);
  const [page, setPage] = useState<number>(1);
  const [resolvedSellerName, setResolvedSellerName] = useState<string | null>(null);

  // Load-bearing: resolve seller name by ID when restored from URL (§6.5)
  useEffect(() => {
    let isCancelled = false;

    if (selectedSellerId) {
      getUserProfileInfo(selectedSellerId)
        .then((res) => {
          if (!isCancelled && res.success && res.data) {
            setResolvedSellerName(res.data.name);
          }
        })
        .catch(() => {
          if (!isCancelled) setResolvedSellerName(null);
        });
    } else {
      setResolvedSellerName(null);
    }

    return () => {
      isCancelled = true;
    };
  }, [selectedSellerId]);

  const pageSize = 15;
  const { data, isLoading, isError, refetch } = useGetSellers(
    page,
    pageSize,
    debouncedSearch,
    isOpen, // Only fetch when dialog is open
  );

  const sellers = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalItems = data?.data?.totalItems || 0;
  const hasNextPage = data?.data?.hasNextPage || false;
  const hasPreviousPage = data?.data?.hasPreviousPage || false;

  const handleOpenDialog = () => {
    setSearchTerm('');
    setPage(1);
    setIsOpen(true);
  };

  const handleToggleSeller = (seller: { id: number; name: string }) => {
    if (selectedSellerId === seller.id) {
      // Toggle off: clear selection
      onSelectSeller(null);
      setResolvedSellerName(null);
    } else {
      // Select seller
      onSelectSeller(seller.id);
      setResolvedSellerName(seller.name);
      setIsOpen(false);
    }
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    onSelectSeller(null);
    setResolvedSellerName(null);
  };

  const isFilterActive = selectedSellerId !== null;

  return (
    <div className={cn('space-y-1.5', className)}>
      <label className="text-xs font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-1.5">
        <Store className="w-3.5 h-3.5 text-[#198341] dark:text-[#ABDE3B]" />
        {tFilter('seller_label', { defaultValue: 'Seller' })}
      </label>

      {/* Trigger Button */}
      <div
        onClick={handleOpenDialog}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault();
            handleOpenDialog();
          }
        }}
        className={cn(
          'w-full h-11 px-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all select-none text-xs font-medium',
          isFilterActive
            ? 'border-[#198341] bg-[#198341]/5 text-slate-900 dark:text-white dark:border-[#ABDE3B]/40'
            : 'border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-slate-500 dark:text-zinc-400 hover:border-slate-300 dark:hover:border-zinc-700',
        )}
      >
        <div className="flex items-center gap-2 truncate flex-1 min-w-0">
          {isFilterActive && (
            <UserCheck className="w-3.5 h-3.5 text-[#198341] dark:text-[#ABDE3B] flex-shrink-0" />
          )}
          <span className="truncate">
            {resolvedSellerName ||
              (isFilterActive
                ? `Seller #${selectedSellerId}`
                : tFilter('seller_placeholder', { defaultValue: 'Any seller' }))}
          </span>
        </div>

        <div className="flex items-center gap-1 flex-shrink-0 ms-2">
          {isFilterActive && (
            <button
              type="button"
              onClick={handleClear}
              aria-label={tFilter('seller_clear_a11y', {
                defaultValue: 'Clear the selected seller',
              })}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-white hover:bg-slate-200/50 dark:hover:bg-zinc-800 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
          <ChevronDown className="w-4 h-4 text-slate-400" />
        </div>
      </div>

      {/* Picker Dialog */}
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent className="max-w-lg w-full max-h-[85vh] p-0 flex flex-col overflow-hidden rounded-2xl">
          <DialogHeader className="p-4 border-b dark:border-zinc-800 space-y-3">
            <DialogTitle className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-[#198341] dark:text-[#ABDE3B]" />
              {tFilter('seller_label', { defaultValue: 'Seller' })}
            </DialogTitle>

            {/* Search Input */}
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute start-3 top-1/2 -translate-y-1/2 pointer-events-none" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setPage(1);
                }}
                placeholder={tList('search_placeholder', {
                  defaultValue: 'Search sellers by name',
                })}
                className="ps-9 pe-4 h-10 rounded-xl bg-slate-50 dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-xs focus-visible:ring-1 focus-visible:ring-[#198341]"
              />
            </div>
          </DialogHeader>

          {/* List Area */}
          <div className="flex-1 overflow-y-auto p-2 divide-y divide-slate-100 dark:divide-zinc-800/60 min-h-[300px]">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <div
                  key={`seller-picker-skel-${i}`}
                  className="flex items-center justify-between h-16 px-3"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="w-10 h-10 rounded-full" />
                    <div className="space-y-1.5 flex-1 max-w-xs">
                      <Skeleton className="h-3.5 w-32" />
                      <Skeleton className="h-3 w-16" />
                    </div>
                  </div>
                </div>
              ))
            ) : isError ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-3">
                <AlertCircle className="w-7 h-7 text-red-500" />
                <p className="text-xs font-semibold text-slate-800 dark:text-zinc-200">
                  {tList('error_title', { defaultValue: 'Could not load sellers' })}
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => refetch()}
                  className="h-8 text-xs rounded-xl gap-1.5"
                >
                  <RefreshCw className="w-3 h-3" />
                  {tList('error_cta', { defaultValue: 'Try again' })}
                </Button>
              </div>
            ) : sellers.length === 0 ? (
              <div className="py-12 text-center flex flex-col items-center justify-center space-y-2 px-4">
                <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <p className="text-xs font-bold text-slate-800 dark:text-zinc-200">
                  {debouncedSearch
                    ? tList('empty_search_title', { defaultValue: 'No sellers match your search' })
                    : tList('empty_title', { defaultValue: 'No sellers yet' })}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-zinc-500">
                  {debouncedSearch
                    ? tList('empty_search_subtitle', { defaultValue: 'Try a different name.' })
                    : tList('empty_subtitle', {
                        defaultValue: 'Sellers appear here once they publish their listings.',
                      })}
                </p>
              </div>
            ) : (
              sellers.map((seller) => {
                const isSelected = selectedSellerId === seller.id;
                return (
                  <SellerRowCard
                    key={seller.id}
                    userId={seller.id}
                    name={seller.name}
                    profileUrl={seller.profileUrl}
                    listingsCount={seller.listingsCount}
                    selected={isSelected}
                    showChevron={false}
                    onClick={() => handleToggleSeller(seller)}
                  />
                );
              })
            )}
          </div>

          {/* Footer with Pagination */}
          {!isLoading && !isError && totalPages > 1 && (
            <div className="p-3 border-t dark:border-zinc-800 flex justify-center">
              <Pagination
                currentPage={page}
                totalPages={totalPages}
                hasNextPage={hasNextPage}
                hasPreviousPage={hasPreviousPage}
                totalItems={totalItems}
                pageSize={pageSize}
                onPageChange={(p) => setPage(p)}
              />
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SellerFilterPicker;
