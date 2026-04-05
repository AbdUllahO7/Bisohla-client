'use client';

import React, { useEffect, useState } from 'react';
import Box from '@/components/box/box';
import { useTranslations } from 'next-intl';
import { useCarListings } from '@/core/infrastructure-adapters/use-actions/visitors/car.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import SectionHeader from '@/components/SectionHeader';
import { History } from 'lucide-react';
import { RentProductCard } from '../design/RentProductCard';
import { Button } from '@/components/ui/button';

const RecentlyViewed = () => {
  const t = useTranslations('homePage.recentlyViewed');
  const tCommon = useTranslations('homePage.latestOffers');
  const session = useSession();
  const [recentlyViewedIds, setRecentlyViewedIds] = useState<number[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'bishola-recently-viewed';
    try {
      const storedIds = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      setRecentlyViewedIds(storedIds);
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem('bishola-recently-viewed');
    setRecentlyViewedIds([]);
  };

  const { data, isLoading } = useCarListings({
    page: 1,
    pageSize: 10,
    userId: session.user.id,
    id: recentlyViewedIds.length > 0 ? recentlyViewedIds : [-1], // Fetch by IDs
  });

  // Sort the fetched data to match the order of IDs in localStorage
  const carListings = React.useMemo(() => {
    const listings = Array.isArray(data?.data)
      ? data.data
      : Array.isArray(data?.data?.data)
        ? data.data.data
        : [];
    
    // Sort based on the order of recentlyViewedIds
    return recentlyViewedIds
      .map(id => listings.find((item: any) => item.id === id))
      .filter(Boolean);
  }, [data, recentlyViewedIds]);

  if (!isLoaded || (recentlyViewedIds.length === 0 && !isLoading)) {
    return null;
  }

  return (
    <div className="relative py-12 w-full bg-gray-50/50">
      <Box variant="container">
        <Box variant="column" className="w-full">
          <div className="flex justify-center items-start w-full">
            <SectionHeader
              title={t('title')}
              icon={History}
            />
            
          </div>

          {isLoading ? (
            <ProductSkeleton count={4} showTitle={false} />
          ) : carListings.length > 0 ? (
            <div className="w-full overflow-x-auto scrollbar-hide pb-4">
              <div className="flex gap-6 min-w-max px-2">
                {carListings.map((card: any) => (
                  <div key={card.id} className="w-[280px] sm:w-[300px]">
                    <RentProductCard
                      car={card}
                      priceWord={tCommon('price')}
                    />
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <p className="text-gray-500 text-center py-4">{t('noItems')}</p>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default RecentlyViewed;
