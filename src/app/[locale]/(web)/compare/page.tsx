'use client';

import React from 'react';
import { useCompare } from '@/providers/CompareProvider';
import { useTranslations } from 'next-intl';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import CompareTable from '@/components/web/Compare/CompareTable';
import { Button } from '@/components/ui/button';
import { Link } from '@/i18n/routing';
import { ArrowLeft, CarFront } from 'lucide-react';
import ProductSkeleton from '@/components/web/design/ProductSkeletonItem';

const ComparePage = () => {
  const t = useTranslations('compare');
  const { compareIds } = useCompare();

  const { data, isLoading } = useCarListings({
    id: compareIds.length > 0 ? compareIds : [-1],
    page: 1,
    pageSize: 10,
  });

  const selectedCars = React.useMemo(() => {
    const listings = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
        ? data.data.data
        : [];
    return compareIds
      .map((id) => listings.find((c: any) => c.id === id))
      .filter(Boolean);
  }, [data, compareIds]);

  return (
    <div className="min-h-screen bg-gray-50/50 py-12">
      <Box variant="container">
        <div className="flex flex-col gap-8">
          {/* Header */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/products">
                <Button variant="ghost" size="icon" className="rounded-full hover:bg-white shadow-sm border border-emerald-50">
                  <ArrowLeft size={20} className="text-emerald-700" />
                </Button>
              </Link>
              <div>
                <Text variant="h1" className="text-3xl font-bold text-gray-900 font-cairo">
                  {t('title')}
                </Text>
                <div className="flex items-center gap-2 mt-1">
                  <div className="w-2 h-2 rounded-full bg-emerald-500"></div>
                  <Text className="text-emerald-700 font-medium text-sm">
                    {compareIds.length} / 3 {t('title').toLowerCase()}
                  </Text>
                </div>
              </div>
            </div>
          </div>

          {/* Loading State */}
          {isLoading && compareIds.length > 0 && (
            <div className="bg-white p-8 rounded-3xl shadow-xl mt-4">
              <ProductSkeleton count={3} showTitle={false} />
            </div>
          )}

          {/* Comparison Content */}
          {!isLoading && selectedCars.length > 0 ? (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
              <CompareTable cars={selectedCars} />
            </div>
          ) : !isLoading && compareIds.length === 0 ? (
            /* Empty State */
            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[40px] shadow-xl border border-emerald-50 max-w-2xl mx-auto w-full px-6 text-center animate-in zoom-in duration-500">
              <div className="w-24 h-24 bg-emerald-50 rounded-full flex items-center justify-center mb-6 shadow-inner">
                <CarFront size={48} className="text-emerald-300" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-3">{t('noCarsTitle')}</h2>
              <p className="text-gray-500 mb-8 max-w-sm">
                {t('noCarsDesc')}
              </p>
              <Link href="/products">
                <Button className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-2xl px-10 h-14 shadow-lg shadow-emerald-200 transition-all hover:scale-105 active:scale-95">
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
