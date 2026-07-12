'use client';

import React from 'react';
import { useCompare } from '@/providers/CompareProvider';
import { useLocale, useTranslations } from 'next-intl';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import CompareTable from '@/components/web/Compare/CompareTable';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, CarFront } from 'lucide-react';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import { getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import { useLocaleQuery } from '@/core/infrastructure-adapters/use-actions/common/use-locale-query';

const ComparePage = () => {
  const t = useTranslations('compare');
  const locale = useLocale();
  const { compareIds, maxCompare } = useCompare();

  const { data: listings, isLoading } = useLocaleQuery({
    queryKey: ['compare-listings-details', compareIds],
    queryFn: async () => {
      if (compareIds.length === 0) return [];
      
      const promises = compareIds.map(async (id) => {
        try {
          const res = await getListingById(id, {
            include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
          });
          if (res.success && res.data) {
            return res.data;
          }
          return null;
        } catch (e) {
          console.error(`Failed to fetch listing ${id}`, e);
          return null;
        }
      });
      
      const results = await Promise.all(promises);
      return results.filter(Boolean);
    },
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: compareIds.length > 0,
  });

  const selectedCars = React.useMemo(() => {
    const list = Array.isArray(listings) ? listings : [];
    return compareIds
      .map((id) => {
        const car = list.find((c: any) => c.id === id);
        return car ? normalizeListingToCarDto(car, locale) : null;
      })
      .filter(Boolean);
  }, [listings, compareIds, locale]);

  return (
    <div className="min-h-screen bg-gray-50/50 dark:bg-zinc-950 py-12">
      <Box variant="container">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white dark:hover:bg-zinc-800 shadow-sm border border-emerald-50 dark:border-zinc-700">
                  <ArrowLeft size={20} className="text-emerald-700 dark:text-emerald-400" />
                </Button>
              </Link>
              <div>
                <Text variant="h1" className="text-3xl font-bold text-gray-900 dark:text-gray-100 font-cairo">
                  {t('title')}
                </Text>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <Text className="text-emerald-700 dark:text-emerald-400 font-medium text-sm">
                    {compareIds.length} / {maxCompare} {t('title').toLowerCase()}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && compareIds.length > 0 && (
            <div className="bg-white dark:bg-zinc-900 p-8 rounded-3xl shadow-xl mt-4">
              <ProductSkeleton count={maxCompare} showTitle={false} />
            </div>
          )}

          {/* Comparison Content */}
          {!isLoading && selectedCars.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CompareTable cars={selectedCars} />
            </div>
          ) : !isLoading && compareIds.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white dark:bg-zinc-900 rounded-[40px] shadow-xl border border-emerald-50 dark:border-zinc-800 max-w-2xl mx-auto w-full px-6 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 dark:bg-emerald-950 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CarFront size={48} className="text-emerald-500 dark:text-emerald-400" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-3">{t('noCarsTitle')}</h2>
              <p className="text-gray-505 dark:text-zinc-400 mb-8 max-w-sm">
                {t('noCarsDesc')}
              </p>
              <Link href="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-10 h-14 shadow-lg shadow-emerald-200 dark:shadow-none transition-all hover:scale-105 active:scale-95">
                  {t('backToList')}
                </Button>
              </Link>
            </div>
          ) : null}
        </div>
      </Box>
    </div>
  );
};

export default ComparePage;
