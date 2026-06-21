'use client';

import React, { useEffect, useState } from 'react';
import Box from '@/components/ui/box';
import { useTranslations } from 'next-intl';
import { useListings } from '@/core/infrastructure-adapters/use-actions/visitors/listing.visitor.use-actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import SectionHeader from '@/components/shared/SectionHeader';
import { History } from 'lucide-react';
import { RentProductCard } from '../design/RentProductCard';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import { useLocale } from 'next-intl';

import { motion } from 'framer-motion';

const RecentlyViewed = () => {
  const t = useTranslations('homePage.recentlyViewed');
  const tCommon = useTranslations('homePage.latestOffers');
  const session = useSession();
  const locale = useLocale();
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: number, typeId: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const STORAGE_KEY = 'bishola-recently-viewed';
    try {
      const storedItems = JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]');
      // Handle both old (number) and new ({id, typeId}) formats
      const normalizedItems = storedItems.map((item: any) => 
        typeof item === 'number' ? { id: item, typeId: 1 } : item
      );
      setRecentlyViewed(normalizedItems);
    } catch (error) {
      console.error('Failed to load recently viewed:', error);
    } finally {
      setIsLoaded(true);
    }
  }, []);

  const handleClearAll = () => {
    localStorage.removeItem('bishola-recently-viewed');
    setRecentlyViewed([]);
  };

  const carIds = recentlyViewed
    .filter(item => Number(item.typeId) === 1)
    .map(item => item.id);

  const { data, isLoading } = useListings(1, {
    page: 1,
    pageSize: 10,
    userId: session.user?.id,
    include: 'attributeValues.attribute,images,user,listingType,listingTypeVersion',
    where: [
      {
        field: 'id',
        operator: 'in',
        value: carIds.length > 0 ? carIds : [-1],
      },
    ],
  });

  // Sort the fetched data to match the order of IDs in localStorage
  const carListings = React.useMemo(() => {
    const apiData = data as any;
    if (!apiData) return [];

    let listings: any[] = [];
    if (apiData.data && Array.isArray(apiData.data.data)) {
      listings = apiData.data.data;
    } else if (Array.isArray(apiData.data)) {
      listings = apiData.data;
    } else if (Array.isArray(apiData)) {
      listings = apiData;
    }
    
    // Normalize and sort based on the order of recentlyViewed car items
    return carIds
      .map(id => {
        const item = listings.find((listing: any) => listing.id === id);
        return item ? normalizeListingToCarDto(item, locale) : null;
      })
      .filter(Boolean);
  }, [data, carIds, locale]);

  if (!isLoaded || (recentlyViewed.length === 0 && !isLoading)) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

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
              <motion.div 
                className="flex gap-6 min-w-max px-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {carListings.map((card: any) => (
                  <motion.div 
                    key={card.id} 
                    className="w-[280px] sm:w-[300px]"
                    variants={itemVariants}
                  >
                    <RentProductCard
                      car={card}
                      priceWord={tCommon('price')}
                    />
                  </motion.div>
                ))}
              </motion.div>
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
