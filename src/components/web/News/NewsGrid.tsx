import React from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import NewsCard from '@/components/web/Home/NewsCard';
import Pagination from '@/components/Pagination';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';
import AdSpace from '@/components/ads/AdSpace';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import CardAds from '@/components/web/design/CardAds';

interface NewsGridProps {
  articles: SelectNewsArticleDto[];
  isLoading: boolean;
  paginationMeta: {
    currentPage: number;
    totalPages: number;
    totalItems: number;
    hasNextPage: boolean;
    hasPreviousPage: boolean;
  } | null;
  pageSize: number;
  onPageChange: (page: number) => void;
  translations: {
    showingResults: string;
  };
}

export default function NewsGrid({
  articles,
  isLoading,
  paginationMeta,
  pageSize,
  onPageChange,
  translations,
}: NewsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
          <div key={i} className="animate-pulse">
            <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-[450px] relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer" />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return null;
  }

  return (
    <>
      {paginationMeta && (
        <Box
          variant="row"
          className="justify-between items-center mb-8 animate-fadeIn"
        >
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 bg-primary rounded-full animate-pulse" />
            <Text className="text-gray-600 font-medium">
              {translations.showingResults.replace(
                '{count}',
                String(paginationMeta.totalItems)
              )}
            </Text>
          </div>
        </Box>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
        {articles.map((article, index) => (
          <React.Fragment key={article.id}>
            <NewsCard article={article} />
            {/* Insert a card-sized ad after every 5 articles */}
            {(index + 1) % 5 === 0 && (
              <div className="col-span-full">
                <AdSpace
                  name="news-page-ads-section"
                  className="w-full"
                  fallbackContent={<CardAds isRent={false} />}
                />
              </div>
            )}
          </React.Fragment>
        ))}
      </div>

      {/* Always show an ad after the articles grid */}
      <AdsSectionProduct />

      {paginationMeta && paginationMeta.totalPages > 1 && (
        <Pagination
          currentPage={paginationMeta.currentPage}
          totalPages={paginationMeta.totalPages}
          hasNextPage={paginationMeta.hasNextPage}
          hasPreviousPage={paginationMeta.hasPreviousPage}
          totalItems={paginationMeta.totalItems}
          pageSize={pageSize}
          onPageChange={onPageChange}
          showItemsInfo={true}
          className="mt-16"
        />
      )}
    </>
  );
}
