'use client';

import React, { useState } from 'react';
import { useTranslations } from 'next-intl';
import { useRouter } from '@/i18n/routing';
import { Search, Store, AlertCircle, RefreshCw } from 'lucide-react';
import Box from '@/components/ui/box';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { useDebounce } from '@/hooks/use-debounce';
import { useGetSellers } from '@/core/infrastructure-adapters/use-actions/visitors/public-profile.use-actions';
import SellerRowCard from '@/components/web/design/SellerRowCard';
import Pagination from '@/components/shared/Pagination';

export const SellersDirectory: React.FC = () => {
  const t = useTranslations('sellers.list');
  const router = useRouter();

  const [page, setPage] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const debouncedSearch = useDebounce(searchTerm, 300);

  const pageSize = 20;
  const { data, isLoading, isError, refetch } = useGetSellers(
    page,
    pageSize,
    debouncedSearch,
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setPage(1); // Reset page on search change
  };

  const sellersList = data?.data?.data || [];
  const totalPages = data?.data?.totalPages || 1;
  const totalItems = data?.data?.totalItems || 0;
  const hasNextPage = data?.data?.hasNextPage || false;
  const hasPreviousPage = data?.data?.hasPreviousPage || false;

  const handleSellerClick = (userId: number) => {
    router.push(`/profile/${userId}`);
  };

  return (
    <Box variant="container" className="py-8 min-h-[70vh] max-w-5xl mx-auto space-y-6">
      {/* Persistent Header: Title & Search Bar (Never unmounts during typing) */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-white">
              {t('title')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-zinc-400 mt-1">
              {t('empty_subtitle')}
            </p>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute start-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <Input
              type="text"
              value={searchTerm}
              onChange={handleSearchChange}
              placeholder={t('search_placeholder')}
              className="ps-10 pe-4 h-11 rounded-xl bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 text-sm focus-visible:ring-1 focus-visible:ring-[#198341]"
            />
          </div>
        </div>
      </div>

      {/* Content Area */}
      <div className="bg-white dark:bg-zinc-900/70 border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl p-2 sm:p-4 shadow-sm">
        {/* 1. Loading Skeleton */}
        {isLoading ? (
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {Array.from({ length: 8 }).map((_, i) => (
              <div
                key={`seller-skel-${i}`}
                className="flex items-center justify-between h-16 px-4"
              >
                <div className="flex items-center gap-3.5 flex-1">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-2 flex-1 max-w-xs">
                    <Skeleton className="h-4 w-32" />
                    <Skeleton className="h-3 w-20" />
                  </div>
                </div>
                <Skeleton className="w-4 h-4 rounded" />
              </div>
            ))}
          </div>
        ) : isError ? (
          /* 2. Error State */
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-4">
            <div className="w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/40 text-red-600 dark:text-red-400 flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <div className="space-y-1">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {t('error_title')}
              </h3>
            </div>
            <Button
              onClick={() => refetch()}
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 text-xs font-semibold"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              {t('error_cta')}
            </Button>
          </div>
        ) : sellersList.length === 0 ? (
          /* 3. Empty States: Two distinct situations */
          <div className="py-16 text-center flex flex-col items-center justify-center space-y-3 px-4">
            <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-zinc-800 text-slate-400 flex items-center justify-center">
              {debouncedSearch ? (
                <Search className="w-6 h-6" />
              ) : (
                <Store className="w-6 h-6" />
              )}
            </div>
            <div className="space-y-1 max-w-sm">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">
                {debouncedSearch ? t('empty_search_title') : t('empty_title')}
              </h3>
              <p className="text-xs text-slate-500 dark:text-zinc-400">
                {debouncedSearch ? t('empty_search_subtitle') : t('empty_subtitle')}
              </p>
            </div>
            {debouncedSearch && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setSearchTerm('')}
                className="text-xs text-[#198341] hover:text-[#198341]"
              >
                {t('empty_search_subtitle')}
              </Button>
            )}
          </div>
        ) : (
          /* 4. Directory List */
          <div className="divide-y divide-slate-100 dark:divide-zinc-800/60">
            {sellersList.map((seller) => (
              <SellerRowCard
                key={seller.id}
                userId={seller.id}
                name={seller.name}
                profileUrl={seller.profileUrl}
                listingsCount={seller.listingsCount}
                onClick={() => handleSellerClick(seller.id)}
                showChevron={true}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination */}
      {!isLoading && !isError && totalPages > 1 && (
        <div className="flex justify-center pt-2">
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            hasNextPage={hasNextPage}
            hasPreviousPage={hasPreviousPage}
            totalItems={totalItems}
            pageSize={pageSize}
            onPageChange={(newPage) => {
              setPage(newPage);
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
          />
        </div>
      )}
    </Box>
  );
};

export default SellersDirectory;
