import React from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import NewsCard from '@/components/web/Home/NewsCard';
import Pagination from '@/components/Pagination';
import { SelectNewsArticleDto } from '@/core/entities/models/news/news.dto';
import AdSpace from '@/components/ads/AdSpace';
import AdsSectionProduct from '@/components/web/ProductsPage/product/AdsSectionProduct';
import CardAds from '@/components/web/design/CardAds';
import { useAdSlot } from '@/hooks/use-ad-slot';

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
  const { adsData, isLoadingAds } = useAdSlot('news-page-ads-section');

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
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {(() => {
              const items: any[] = [];
              let adIndexCounter = 0;
              
              articles.forEach((article: SelectNewsArticleDto, index: number) => {
                items.push({ type: 'article', data: article, originalIndex: index });
                
                if ((index + 1) % 2 === 0) {
                  items.push({ type: 'ad', adIndex: adIndexCounter });
                  adIndexCounter++;
                }
              });

              while (adIndexCounter < adsData.length) {
                items.push({ type: 'ad', adIndex: adIndexCounter });
                adIndexCounter++;
              }

              return items.map((item, i) => {
                if (item.type === 'article') {
                  return (
                    <div
                      key={`article-${item.data.id}`}
                      className="block h-full animate-fadeIn"
                      style={{ animationDelay: `${item.originalIndex * 0.1}s` }}
                    >
                      <NewsCard article={item.data} />
                    </div>
                  );
                } else {
                  return (
                    <div
                      key={`ad-slot-${item.adIndex}-${i}`}
                      className="animate-fadeIn w-full h-full min-h-[380px]"
                      style={{ animationDelay: `${i * 0.1}s` }}
                    >
                      <AdSpace
                        name="news-page-ads-section"
                        className="w-full h-full"
                        wrapperClassName="w-full h-full min-h-[380px]"
                        fallbackContent={<CardAds isRent={false} />}
                        isClosable={false}
                        adsData={adsData}
                        isLoadingAds={isLoadingAds}
                        adIndex={item.adIndex}
                      />
                    </div>
                  );
                }
              });
            })()}
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
