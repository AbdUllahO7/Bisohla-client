'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import NewsCard from './NewsCard';
import { useLocale, useTranslations } from 'next-intl';
import { Newspaper } from 'lucide-react'; // Removed ArrowRight, ArrowLeft
import { useGetNewsArticles } from '@/hooks/use-news';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';
import SectionHeader from '@/components/SectionHeader'; // Added import
import { logger } from '@/lib/logger';
import AdSpace from '@/components/ads/AdSpace';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import CardAds from '@/components/web/design/CardAds';

interface NewsSectionProps {
  className?: string;
  limit?: number;
}

const NewsSection: React.FC<NewsSectionProps> = ({
  className = '',
  limit = 6,
}) => {
  const locale = useLocale();
  const t = useTranslations('news');

  const { data, isLoading, error } = useGetNewsArticles({
    page: 1,
    pageSize: limit,
    locale,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
  });

  logger.log('NewsSection data', data);

  // Extract the actual articles array from the nested data structure
  const articles = data?.data?.data;
  const hasArticles =
    articles && Array.isArray(articles) && articles.length > 0;

  return (
    <div className={`relative overflow-hidden py-16 ${className}`}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large Gradient Orbs */}
        <div
          className="absolute top-1/4 -right-40 w-[600px] h-[600px] rounded-full opacity-20 animate-float"
          style={{
            background:
              'radial-gradient(circle, rgba(171, 222, 59, 0.3) 0%, transparent 70%)',
            animationDelay: '2s',
          }}
        ></div>
        <div
          className="absolute bottom-0 left-1/3 w-[400px] h-[400px] rounded-full opacity-20 animate-float"
          style={{
            background:
              'radial-gradient(circle, rgba(44, 60, 57, 0.2) 0%, transparent 70%)',
            animationDelay: '4s',
          }}
        ></div>

        {/* Decorative Grid Pattern */}
        <div
          className="absolute inset-0 opacity-[0.02]"
          style={{
            backgroundImage: `linear-gradient(#198341 1px, transparent 1px), linear-gradient(90deg, #198341 1px, transparent 1px)`,
            backgroundSize: '50px 50px',
          }}
        ></div>

        {/* Animated Dots */}
        <div className="absolute top-20 left-1/4 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse"></div>
        <div
          className="absolute top-40 right-1/3 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse"
          style={{ animationDelay: '1s' }}
        ></div>
        <div
          className="absolute bottom-32 left-1/2 w-2 h-2 rounded-full bg-primary-light opacity-40 animate-pulse"
          style={{ animationDelay: '2s' }}
        ></div>
        <div
          className="absolute top-1/2 right-1/4 w-3 h-3 rounded-full bg-primary-light opacity-30 animate-pulse"
          style={{ animationDelay: '3s' }}
        ></div>
      </div>

      {/* Content with Glass Effect */}
      <Box variant="container" className="relative z-10">
        <Box variant="column">
          {/* Section Header */}
          <div className="relative mb-12">
            {/* Glow Effect Behind Header */}
            <div
              className="absolute -top-10 left-0 right-0 h-40 opacity-30 blur-3xl -z-10"
              style={{
                background:
                  'radial-gradient(ellipse at center, rgba(171, 222, 59, 0.4) 0%, transparent 70%)',
              }}
            ></div>

            <SectionHeader
              title={t('latestNews')}
              icon={Newspaper}
              showMoreLink={`/news`}
              showMoreText={t('viewAllNews')}
            />

            <Text className="text-lg text-gray-600 max-w-2xl mx-auto text-center mt-4">
              {t('latestNewsDescription')}
            </Text>
          </div>

          {/* Loading State */}
          {isLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(limit)].map((_, i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gray-200 dark:bg-gray-700 rounded-xl h-96"></div>
                </div>
              ))}
            </div>
          )}

          {/* Error State */}
          {error && (
            <Box
              className="w-full py-8 px-6 rounded-2xl backdrop-blur-sm"
              variant="center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(255, 0, 0, 0.05) 0%, rgba(255, 0, 0, 0.1) 100%)',
                border: '1px solid rgba(255, 0, 0, 0.2)',
              }}
            >
              <Text className="text-red-500 font-semibold">
                {t('errorLoading')}
              </Text>
            </Box>
          )}

          {/* Empty State */}
          {!isLoading && !error && !hasArticles && (
            <Box
              className="w-full py-12 px-6 rounded-2xl backdrop-blur-sm"
              variant="center"
              style={{
                background:
                  'linear-gradient(135deg, rgba(171, 222, 59, 0.05) 0%, rgba(25, 131, 65, 0.05) 100%)',
                border: '2px dashed rgba(25, 131, 65, 0.3)',
              }}
            >
              <div className="text-center">
                <Newspaper
                  className="w-16 h-16 mx-auto mb-4 opacity-30"
                  style={{ color: '#198341' }}
                />
                <Text className="text-gray-500 text-lg">{t('noNews')}</Text>
                <Text className="text-gray-500 text-sm mt-1">
                  {t('noNewsDescription')}
                </Text>
              </div>
            </Box>
          )}

          {/* News Grid */}
          {!isLoading && !error && hasArticles && (
            <>
              <Box
                className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                variant="center"
              >
                {articles.map((article: SelectNewsArticleDto, index: number) => {
                  const showAdSlot = (index + 1) % 2 === 0;
                  return (
                    <React.Fragment key={article.id}>
                      <div
                        className="animate-fadeInUp h-full"
                        style={{
                          animationDelay: `${index * 0.1}s`,
                          animationFillMode: 'both',
                        }}
                      >
                        <NewsCard article={article} />
                      </div>
                      {/* Insert a card-sized ad after every 2 articles */}
                      {showAdSlot && (
                        <div
                          className="animate-fadeInUp h-full"
                          style={{
                            animationDelay: `${(index + 0.5) * 0.1}s`,
                            animationFillMode: 'both',
                          }}
                        >
                          <AdSpace
                            name="news-page-ads-section"
                            className="w-full h-full"
                            wrapperClassName="w-full h-full min-h-[380px]"
                            fallbackContent={<CardAds isRent={false} />}
                            isClosable={false}
                          />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </Box>

              {/* News Section Ad */}
              <AdsSectionProduct />
            </>
          )}
        </Box>
      </Box>

      {/* CSS Animations */}
      <style jsx>{`
        @keyframes float {
          0%,
          100% {
            transform: translate(0, 0) scale(1);
          }
          25% {
            transform: translate(20px, -20px) scale(1.05);
          }
          50% {
            transform: translate(-15px, -40px) scale(0.95);
          }
          75% {
            transform: translate(-25px, -15px) scale(1.02);
          }
        }

        .animate-float {
          animation: float 20s ease-in-out infinite;
        }

        @keyframes fadeInUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeInUp {
          animation: fadeInUp 0.8s ease-out;
          opacity: 0;
        }

        /* Pulse animation for dots */
        @keyframes pulse {
          0%,
          100% {
            opacity: 0.4;
            transform: scale(1);
          }
          50% {
            opacity: 0.8;
            transform: scale(1.5);
          }
        }

        .animate-pulse {
          animation: pulse 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  );
};

export default NewsSection;
