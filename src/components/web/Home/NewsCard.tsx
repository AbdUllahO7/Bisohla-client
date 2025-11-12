// src/components/web/Home/NewsCard.tsx
'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, Eye, Newspaper } from 'lucide-react';
import Text from '@/components/text/text'; // Assuming you have this
import type { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';

interface NewsCardProps {
  article: SelectNewsArticleDto & {
    category?: { name: string; slug: string } | null; // Extend type if category info is needed
  };
  variant?: 'vertical' | 'horizontal'; // Add a variant prop
}

const NewsCard: React.FC<NewsCardProps> = ({ article, variant = 'vertical' }) => {
  const locale = useLocale();
  const t = useTranslations('newsDetails'); // Assuming translations for NewsCard

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Common card styling
  const cardClasses = "relative bg-white rounded-3xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden";
  const imageContainerClasses = "relative overflow-hidden";
  const contentClasses = "p-4 flex flex-col justify-between";

  // Variant-specific styling
  const horizontalLayoutClasses = "flex items-center gap-4 h-40"; // Define a fixed height for horizontal cards
  const horizontalImageClasses = "flex-shrink-0 w-1/3 h-full rounded-l-3xl"; // Image takes 1/3 width, fills height
  const horizontalContentClasses = "flex-grow flex flex-col justify-between h-full py-2 pr-2"; // Content takes remaining width

  const verticalLayoutClasses = "flex flex-col h-full";
  const verticalImageClasses = "w-full h-48 rounded-t-3xl"; // Image takes full width, fixed height

  return (
    <Link href={`/${locale}/News/news/${article.slug}`}>
      <div className={`${cardClasses} ${variant === 'horizontal' ? horizontalLayoutClasses : verticalLayoutClasses}`}>
        {/* Category Badge - always at the top right of the image */}
        {article.category && (
          <div className="absolute top-4 right-4 z-10 px-3 py-1 bg-primary/80 text-white text-xs font-semibold rounded-full backdrop-blur-sm">
            {article.category.name}
          </div>
        )}

        {/* Image */}
        <div className={`${imageContainerClasses} ${variant === 'horizontal' ? horizontalImageClasses : verticalImageClasses}`}>
          {article.coverImage ? (
            <Image
              src={article.coverImage}
              alt={article.title}
              fill
              className="object-cover"
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
              <Newspaper className="w-16 h-16 text-gray-400" />
            </div>
          )}
        </div>

        {/* Content */}
        <div className={`${contentClasses} ${variant === 'horizontal' ? horizontalContentClasses : ''}`}>
          <Text className={`font-semibold text-gray-800 line-clamp-2 ${variant === 'horizontal' ? 'text-base' : 'text-lg'} mb-2`}>
            {article.title}
          </Text>
          {variant === 'vertical' && article.excerpt && ( // Only show excerpt for vertical variant
            <Text className="text-gray-600 text-sm line-clamp-3 mb-3">
              {article.excerpt}
            </Text>
          )}

          <div className="flex items-center justify-between text-gray-500 text-sm mt-auto pt-2 border-t border-gray-100">
            <div className="flex items-center gap-1">
              <Calendar className="w-4 h-4" />
              <span>{formatDate(article.publishedAt || article.createdAt)}</span>
            </div>
            <div className="flex items-center gap-1">
              <Eye className="w-4 h-4" />
              <span>{article.viewCount || 0}</span>
            </div>
          </div>
        </div>
      </div>
    </Link>
  );
};

export default NewsCard;