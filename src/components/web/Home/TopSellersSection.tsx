'use client';

import React, { useMemo } from 'react';
import { motion } from 'framer-motion';
import { useTranslations, useLocale } from 'next-intl';
import { Users } from 'lucide-react';
import { Link } from '@/i18n/routing';
import Box from '@/components/ui/box';
import SectionHeader from '@/components/shared/SectionHeader';
import { TopSellerSummaryDto } from '@/core/entities/models/public-profile/top-seller.dto';

/* ─── Seller Avatar Card ─────────────────────────────────────────────────── */

interface SellerCardProps {
  seller: TopSellerSummaryDto;
  index: number;
}

const SellerCard: React.FC<SellerCardProps> = ({ seller, index }) => {
  const t = useTranslations('homePage.topSellers');

  const initials = useMemo(() => {
    if (!seller.name) return 'U';
    return seller.name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }, [seller.name]);

  const cardVariants = {
    hidden: { opacity: 0, y: 30, scale: 0.9 },
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        duration: 0.5,
        ease: 'easeOut',
        delay: index * 0.08,
      },
    },
  };

  return (
    <motion.div variants={cardVariants}>
      <Link href={`/profile/${seller.id}`} prefetch={false}>
        <div className="group flex flex-col items-center gap-3 cursor-pointer select-none">
          {/* Avatar */}
          <div className="relative">
            {/* Glow ring */}
            <div className="absolute -inset-0.5 rounded-full bg-gradient-to-br from-[#198341] to-[#ABDE3B] opacity-0 group-hover:opacity-60 blur-sm transition-opacity duration-300 pointer-events-none" />

            {/* Rank badge */}
            {index < 3 && (
              <div
                className="absolute -top-1.5 -right-1.5 z-10 flex items-center justify-center w-6 h-6 rounded-full text-[10px] font-bold text-white shadow-md border-2 border-white dark:border-zinc-900"
                style={{
                  background:
                    index === 0
                      ? 'linear-gradient(135deg,#f59e0b,#d97706)'
                      : index === 1
                      ? 'linear-gradient(135deg,#9ca3af,#6b7280)'
                      : 'linear-gradient(135deg,#b45309,#92400e)',
                }}
              >
                {index + 1}
              </div>
            )}

            <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-full overflow-hidden border-2 border-[#198341]/40 dark:border-[#ABDE3B]/30 shadow-lg group-hover:border-[#198341] dark:group-hover:border-[#ABDE3B] transition-all duration-300">
              {seller.profileUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={seller.profileUrl}
                  alt={seller.name}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white font-bold text-xl md:text-2xl group-hover:from-[#156b34] group-hover:to-[#96c433] transition-all duration-300">
                  {initials}
                </div>
              )}
            </div>
          </div>

          {/* Name */}
          <span className="text-sm font-semibold text-[#2C3C39] dark:text-zinc-100 text-center line-clamp-1 max-w-[90px] md:max-w-[100px] group-hover:text-[#198341] dark:group-hover:text-[#ABDE3B] transition-colors duration-200">
            {seller.name}
          </span>

          {/* Listings count pill */}
          <div className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#198341]/10 dark:bg-[#198341]/20 border border-[#198341]/20 dark:border-[#ABDE3B]/20 group-hover:bg-[#198341]/20 transition-colors duration-200">
            <span className="text-[11px] font-bold text-[#198341] dark:text-[#ABDE3B]">
              {seller.listingsCount}
            </span>
            <span className="text-[10px] text-gray-500 dark:text-zinc-400">
              {t('listings')}
            </span>
          </div>
        </div>
      </Link>
    </motion.div>
  );
};

/* ─── Skeleton ──────────────────────────────────────────────────────────── */

const SellerCardSkeleton: React.FC<{ index: number }> = ({ index }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay: index * 0.06, duration: 0.4 }}
    className="flex flex-col items-center gap-3"
  >
    <div className="w-20 h-20 md:w-24 md:h-24 rounded-full bg-gray-200 dark:bg-zinc-800 animate-pulse" />
    <div className="w-16 h-3 rounded bg-gray-200 dark:bg-zinc-800 animate-pulse" />
    <div className="w-12 h-5 rounded-full bg-gray-100 dark:bg-zinc-800 animate-pulse" />
  </motion.div>
);

/* ─── Section ───────────────────────────────────────────────────────────── */

interface TopSellersSectionProps {
  sellers: TopSellerSummaryDto[];
}

const TopSellersSection: React.FC<TopSellersSectionProps> = ({ sellers }) => {
  const t = useTranslations('homePage.topSellers');

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.08 } },
  };

  return (
    <div className="relative overflow-hidden py-16 w-full bg-gray-50/60 dark:bg-zinc-900/40">
      {/* Decorative blobs */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div
          className="absolute -bottom-20 -left-40 w-[500px] h-[500px] rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, rgba(25,131,65,0.35) 0%, transparent 70%)',
            animation: 'float 18s ease-in-out infinite',
          }}
        />
        <div
          className="absolute top-0 right-0 w-[350px] h-[350px] rounded-full opacity-10"
          style={{
            background:
              'radial-gradient(circle, rgba(171,222,59,0.3) 0%, transparent 70%)',
            animation: 'float 14s ease-in-out infinite reverse',
          }}
        />
      </div>

      <Box variant="container" className="relative z-10">
        <Box variant="column" className="w-full">
          <SectionHeader
            title={t('title')}
            icon={Users}
            showMoreLink="/sellers"
            showMoreText={t('see_all', { defaultValue: 'See all' })}
          />

          {sellers && sellers.length > 0 ? (
            <motion.div
              className="flex flex-wrap justify-center md:justify-start gap-8 md:gap-12 w-full"
              variants={containerVariants}
              initial="hidden"
              whileInView="visible"
              viewport={{ once: true, margin: '-60px' }}
            >
              {sellers.map((seller, idx) => (
                <SellerCard key={seller.id} seller={seller} index={idx} />
              ))}
            </motion.div>
          ) : (
            <div className="py-8 text-center text-xs text-slate-400 dark:text-zinc-500">
              {t('empty_title', { defaultValue: 'No sellers yet' })}
            </div>
          )}
        </Box>
      </Box>

      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          50% {
            transform: translate(-12px, -24px) scale(0.97);
          }
        }
      `}</style>
    </div>
  );
};

export default TopSellersSection;
