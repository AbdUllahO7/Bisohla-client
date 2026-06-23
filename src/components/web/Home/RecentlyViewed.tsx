'use client';

import React, { useEffect, useState } from 'react';
import Box from '@/components/ui/box';
import { useTranslations } from 'next-intl';
import { getListingById } from '@/core/infrastructure-adapters/actions/visitors/listing.visitor.actions';
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
  const [listings, setListings] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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
        // Fetch each listing by its ID in parallel
        const promises = recentlyViewed.map(item => getListingById(item.id, params));
        const responses = await Promise.all(promises);
        
        // Extract successful data
        const fetched = responses
          .map(res => res.success && res.data ? res.data : null)
          .filter(Boolean);
          
        // Normalize based on the order of recentlyViewed items
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
            <div className="w-full overflow-x-auto scrollbar-hide pb-4">
              <motion.div 
                className="flex gap-6 min-w-max px-2"
                variants={containerVariants}
                initial="hidden"
                whileInView="visible"
                viewport={{ once: true }}
              >
                {listings.map((card: any) => (
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
            <p className="text-gray-500 dark:text-zinc-400 text-center py-4">{t('noItems')}</p>
          )}
        </Box>
      </Box>
    </div>
  );
};

export default RecentlyViewed;
