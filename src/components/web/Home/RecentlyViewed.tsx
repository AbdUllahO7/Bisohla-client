'use client';

import React, { useEffect, useState } from 'react';
import Box from '@/components/ui/box';
import { useTranslations } from 'next-intl';
import { getBatchListingsAction } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
import ProductSkeleton from '../design/ProductSkeletonItem';
import { useSession } from '@/hooks/auth/use-session';
import SectionHeader from '@/components/shared/SectionHeader';
import { History } from 'lucide-react';
import { RentProductCard } from '../design/RentProductCard';
import { normalizeListingToCarDto } from '@/utils/listing-normalization';
import { useLocale } from 'next-intl';
import { motion } from 'framer-motion';
import { useAdSlot } from '@/hooks/use-ad-slot';
import AdSpace from '@/components/ads/AdSpace';
import CardAds from '../design/CardAds';

const RecentlyViewed = () => {
  const t = useTranslations('homePage.recentlyViewed');
  const tCommon = useTranslations('homePage.latestOffers');
  const session = useSession();
  const locale = useLocale();
  const [recentlyViewed, setRecentlyViewed] = useState<{ id: number, typeId: number }[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const { adsData, isLoadingAds, allowPlaceholders, dismissable, rotationStrategy } = useAdSlot('recently viewed ad card');

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
      setIsLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (recentlyViewed.length === 0) {
      setListings([]);
      setIsLoaded(true);
      return;
    }

    const fetchAll = async () => {
      setIsLoading(true);
      try {
        const params = session.user?.id ? { userId: session.user.id } : undefined;
        const ids = recentlyViewed.map(item => item.id);
        const response = await getBatchListingsAction(ids, params);
        
        const fetched = response.success && Array.isArray(response.data) ? response.data : [];
          
        const normalized = recentlyViewed
          .map(item => {
            const found = fetched.find((l: any) => l.id === item.id);
            return found ? normalizeListingToCarDto(found, locale) : null;
          })
          .filter(Boolean);

        setListings(normalized);
      } catch (error) {
        console.error('Failed to fetch recently viewed listings:', error);
      } finally {
        setIsLoading(false);
        setIsLoaded(true);
      }
    };

    fetchAll();
  }, [recentlyViewed, locale, session.user?.id]);

  const handleClearAll = () => {
    localStorage.removeItem('bishola-recently-viewed');
    setRecentlyViewed([]);
    setListings([]);
  };

  if (!isLoaded || (recentlyViewed.length === 0 && !isLoading)) {
    return null;
  }

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: 20 },
    visible: {
      opacity: 1,
      x: 0,
      transition: { duration: 0.5, ease: 'easeOut' },
    },
  };

  // Build grid items: inject ad after the 4th listing card
  const AD_INJECT_INDEX = 4;
  // Always show the ad slot — AdSpace will use CardAds as fallback if no real ad from API
  const hasAd = true;

  const gridItems: Array<{ type: 'product'; data: any } | { type: 'ad'; adIndex: number }> = [];
  let adInjected = false;

  listings.forEach((card, index) => {
    gridItems.push({ type: 'product', data: card });
    if (!adInjected && index === AD_INJECT_INDEX - 1 && hasAd) {
      gridItems.push({ type: 'ad', adIndex: 0 });
      adInjected = true;
    }
  });

  // If fewer listings than AD_INJECT_INDEX, still append ad at the end
  if (!adInjected && listings.length > 0) {
    gridItems.push({ type: 'ad', adIndex: 0 });
  }

  return (
    <div className="relative py-12 w-full bg-gray-50/50 dark:bg-zinc-900/50">
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
          ) : listings.length > 0 ? (
            <motion.div
              className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 sm:gap-6 w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true }}
            >
              {(gridItems as any[]).map((item, idx) =>
                item.type === 'ad' ? (
                  <motion.div key={`ad-${idx}`} className="w-full" variants={itemVariants}>
                    <AdSpace
                      name="recently viewed ad card"
                      className="w-full h-full"
                      wrapperClassName="w-full h-full min-h-[445px] flex flex-col items-stretch"
                      fallbackContent={<CardAds isRent={false} />}
                      isClosable={false}
                      adsData={adsData}
                      isLoadingAds={isLoadingAds}
                      allowPlaceholders={allowPlaceholders}
                      dismissable={dismissable}
                      rotationStrategy={rotationStrategy}
                      adIndex={item.adIndex}
                      layout="card"
                    />
                  </motion.div>
                ) : (
                  <motion.div key={item.data.id} className="w-full" variants={itemVariants}>
                    <RentProductCard
                      car={item.data}
                      priceWord={tCommon('price')}
                    />
                  </motion.div>
                )
              )}
            </motion.div>
          ) : (
            <p className="text-gray-500 dark:text-zinc-400 text-center py-4">{t('noItems')}</p>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default RecentlyViewed;


