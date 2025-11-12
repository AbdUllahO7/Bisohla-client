'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';
import { useLocale, useTranslations } from 'next-intl';
import { Calendar, Eye, ArrowUpRight, Clock } from 'lucide-react';

interface NewsCardProps {
  article: SelectNewsArticleDto;
  className?: string;
}

const NewsCard: React.FC<NewsCardProps> = ({ article, className = '' }) => {
  const locale = useLocale();
  const t = useTranslations('news');

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString(locale === 'ar' ? 'ar-SA' : 'en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };


  console.log("article", article);

  return (
    <Link href={`/${locale}/News/news/${article.slug}`}>
      <div className={`group relative ${className}`}>
        {/* Glow effect on hover */}
        <div className="absolute -inset-1 bg-gradient-to-r from-primary via-primary-light to-primary rounded-3xl blur-xl opacity-0 group-hover:opacity-30 transition-all duration-500"></div>
        
        {/* Main card */}
        <Box
          variant="column"
          className="relative bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 h-full border border-gray-100 group-hover:border-primary/20 transform group-hover:-translate-y-2"
        >
          {/* Image Container */}
          <div className="relative w-full h-56 bg-gradient-to-br from-gray-100 to-gray-200 overflow-hidden">
            {article.coverImage ? (
              <Image
                src={article.coverImage}
                alt={article.title}
                fill
                className="object-cover transition-all duration-700 group-hover:scale-110"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary via-primary-light to-primary">
                <Text className="text-white text-5xl font-black opacity-50">
                  {article.title.charAt(0)}
                </Text>
              </div>
            )}
            
            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Tags overlay - Modern badges */}
            {article.tags && article.tags.length > 0 && (
              <div className="absolute top-4 left-4 right-4 flex flex-wrap gap-2 z-10">
                {article.tags.slice(0, 2).map((tag, index) => (
                  <span
                    key={index}
                    className="px-4 py-1.5 bg-white/95 backdrop-blur-md text-primary text-xs font-bold rounded-full shadow-lg border border-primary/10 transform group-hover:scale-105 transition-transform duration-300"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* Read More Icon - appears on hover */}
            <div className="absolute bottom-4 right-4 w-12 h-12 bg-white rounded-full flex items-center justify-center shadow-xl opacity-0 group-hover:opacity-100 transform translate-y-4 group-hover:translate-y-0 transition-all duration-500 z-10">
              <ArrowUpRight className="w-6 h-6 text-primary" />
            </div>
          </div>

          {/* Content */}
          <Box variant="column" className="p-6 flex-1 justify-between">
            <div>
              {/* Date badge */}
            

              {/* Title */}
              <Text className="text-2xl font-black text-gray-900 mb-3 line-clamp-2 group-hover:text-primary transition-colors duration-300 leading-tight">
                {article.title}
              </Text>

              {/* Subtitle */}
              {article.subTitle && (
                <Text className="text-sm font-semibold text-gray-500 mb-3 line-clamp-1">
                  {article.subTitle}
                </Text>
              )}

              {/* Excerpt */}
              {article.excerpt && (
                <Text className="text-gray-600 text-sm leading-relaxed mb-4 line-clamp-3">
                  {article.excerpt}
                </Text>
              )}
            </div>

            {/* Footer - Stats */}
            <Box variant="row" className="items-center justify-between mt-6 pt-5 border-t-2 border-gray-50">
              {/* Date */}
              <Box variant="row" className="items-center gap-2 px-3 py-2 bg-gray-50 rounded-xl">
                <Calendar className="w-4 h-4 text-gray-400" />
                <Text className="text-xs font-semibold text-gray-600">
                  {formatDate(article.publishedAt || article.createdAt)}
                </Text>
              </Box>

              {/* View Count */}
              <Box variant="row" className="items-center gap-2 px-3 py-2 bg-gradient-to-r from-primary/5 to-primary-light/5 rounded-xl border border-primary/10">
                <Eye className="w-4 h-4 text-primary" />
                <Text className="text-xs font-bold text-primary">
                  {article.viewCount?.toLocaleString() || 0}
                </Text>
              </Box>
            </Box>
          </Box>

          {/* Bottom accent bar */}
          <div className="h-1 bg-gradient-to-r from-primary via-primary-light to-primary transform scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
        </Box>
      </div>
    </Link>
  );
};

export default NewsCard;