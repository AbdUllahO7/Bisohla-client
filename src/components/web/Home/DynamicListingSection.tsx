'use client';
import React from 'react';
import Box from '@/components/ui/box';
import { motion } from 'framer-motion';
import Text from '@/components/ui/text';
import { useTranslations } from 'next-intl';
import { RentProductCard } from '../design/RentProductCard';
import SectionHeader from '@/components/shared/SectionHeader';
import { ListingDto } from '@/core/entities/models/listings/listings.dto';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { TrendingUp, Star, CarFrontIcon } from 'lucide-react';
import AdSpace from '@/components/ads/AdSpace';
import CardAds from '../design/CardAds';
import { useAdSlot } from '@/hooks/use-ad-slot';

interface DynamicListingSectionProps {
  listings: SelectCarListingDto[];
  title: string;
  showMoreLink?: string;
  iconName?: 'star' | 'trending' | 'car';
  adSlotName?: string;
}

const iconMap = {
  star: Star,
  trending: TrendingUp,
  car: CarFrontIcon,
};

const DynamicListingSection: React.FC<DynamicListingSectionProps> = ({
  listings,
  title,
  showMoreLink = 'products',
  iconName = 'car',
  adSlotName,
}) => {
  const t = useTranslations('homePage');
  const Icon = iconMap[iconName] || CarFrontIcon;
  const { adsData, isLoadingAds } = useAdSlot(adSlotName || '');

  if (!listings || listings.length === 0) {
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
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
      },
    },
  };

  return (
    <div className="relative overflow-hidden py-16 w-full">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-10 animate-float"
          style={{
            background:
              'radial-gradient(circle, rgba(171, 222, 59, 0.3) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        ></div>
        <div
          className="absolute inset-0 opacity-[0.01]"
          style={{
            backgroundImage: `linear-gradient(#198341 1px, transparent 1px), linear-gradient(90deg, #198341 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>
      </div>

      <Box variant="container" className="relative z-10">
        <Box variant="column" className="w-full">
          <div className="relative mb-8">
            <div
              className="absolute -top-10 left-0 right-0 h-40 opacity-20 blur-3xl -z-10"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(171, 222, 59, 0.4) 0%, transparent 70%)',
              }}
            ></div>

            <SectionHeader
              title={title}
              icon={Icon}
              showMoreLink={showMoreLink}
              showMoreText={t('latestOffers.showMore')}
            />
          </div>

          <motion.div
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-6 sm:w-[90%] xs:w-[90%] lg:w-full mx-auto"
            variants={containerVariants}
            initial="hidden"
            whileInView="visible"
            viewport={{ once: true, margin: '-50px' }}
          >
            {(() => {
              const items: any[] = [];
              let adIndexCounter = 0;
              const displayLimit = 10; // 9 products + 1 ad = 10 slots

              listings.slice(0, 9).forEach((listing, index) => {
                items.push({ type: 'product', data: listing });

                // Inject ad at index 3 (4th position) if adSlotName is provided
                if (adSlotName && index === 3) {
                  items.push({ type: 'ad', baseAdIndex: adIndexCounter });
                  adIndexCounter++;
                }
              });

              // Ensure at least one ad is shown if requested and we have items but didn't reach index 3
              if (adSlotName && items.length > 0 && items.length < 4) {
                 items.push({ type: 'ad', baseAdIndex: adIndexCounter });
              }

              return items.slice(0, displayLimit).map((item, i) => {
                if (item.type === 'product') {
                  return (
                    <motion.div key={`product-${item.data.id}`} variants={itemVariants}>
                      <RentProductCard
                        car={item.data as any}
                        priceWord={t('latestOffers.price')}
                      />
                    </motion.div>
                  );
                } else {
                  const currentAdIndex = (item.baseAdIndex >= 0 && adsData.length > 0) ? item.baseAdIndex % adsData.length : item.baseAdIndex;
                  return (
                    <motion.div
                      key={`ad-slot-${i}`}
                      className="w-full h-[370px] rounded-lg shadow-sm overflow-hidden relative"
                      variants={itemVariants}
                    >
                      <AdSpace
                        name={adSlotName!}
                        className="w-full h-full"
                        fallbackContent={<CardAds isRent={false} />}
                        isClosable={false}
                        adsData={adsData}
                        isLoadingAds={isLoadingAds}
                        adIndex={currentAdIndex}
                      />
                    </motion.div>
                  );
                }
              });
            })()}
          </motion.div>
        </Box>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-15px, -30px) scale(0.98);
          }
        }
        .animate-float {
          animation: float 15s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default DynamicListingSection;
