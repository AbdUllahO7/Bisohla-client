'use client';

import React from 'react';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import NewsCard from './NewsCard';
import { useLocale, useTranslations } from 'next-intl';
import { ArrowRight, ArrowLeft, Newspaper } from 'lucide-react';
import { useGetNewsArticles } from '@/hooks/use-news';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';

interface NewsSectionProps {
  className?: string;
  limit?: number;
}

const NewsSection: React.FC<NewsSectionProps> = ({ 
  className = '',
  limit = 6 
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

  console.log("NewsSection data", data);

  if (error) {
    return (
      <Box variant="center" className="py-20">
        <Text className="text-red-500">{t('errorLoading')}</Text>
      </Box>
    );
  }

  // Extract the actual articles array from the nested data structure
  const articles = data?.data?.data;
  const hasArticles = articles && Array.isArray(articles) && articles.length > 0;

  return (
    <section className={`py-16  ${className}`}>
      <div className="container mx-auto px-4 ">
        {/* Section Header */}
        <Box variant="column" className="mb-12 text-center">
          <Box variant="row" className="items-center justify-center gap-3 mb-4">
            <div className="w-12 h-12 rounded-full bg-primary-foreground flex items-center justify-center">
              <Newspaper className="w-6 h-6 text-primary" />
            </div>
             <Text className="text-4xl md:text-5xl font-bold text-primary ">
            {t('latestNews')}
          </Text>
          
          
          </Box>
          
         
        <Text className="text-lg text-gray-600 max-w-2xl mx-auto">
            {t('latestNewsDescription')}
          </Text>
          {/* Decorative line */}
          <div className="w-24 h-1 bg-primary-foreground mx-auto mt-6 rounded-full"></div>
        </Box>

        {/* Loading State */}
        {isLoading && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-gray-200 rounded-xl h-96"></div>
              </div>
            ))}
          </div>
        )}

        {/* News Grid */}
        {!isLoading && hasArticles && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
              {articles.map((article: SelectNewsArticleDto) => (
                <NewsCard key={article.id} article={article} />
              ))}
            </div>

            {/* View All Button */}
            <Box variant="center" className="mt-8">
              <Link
                href={`/${locale}/news`}
                className="group inline-flex items-center gap-3 px-8 py-4 bg-primary hover:bg-primary-light text-white rounded-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                <span>{t('viewAllNews')}</span>
                {locale === 'ar' ? (
                  <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
                ) : (
                  <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                )}
              </Link>
            </Box>
          </>
        )}

        {/* Empty State */}
        {!isLoading && !hasArticles && (
          <Box variant="column" className="items-center justify-center py-20">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center mb-6">
              <Newspaper className="w-12 h-12 text-gray-400" />
            </div>
            <Text className="text-2xl font-bold text-gray-700 mb-2">
              {t('noNews')}
            </Text>
            <Text className="text-gray-500">
              {t('noNewsDescription')}
            </Text>
          </Box>
        )}
      </div>
    </section>
  );
};

export default NewsSection;