'use client';

import React, { useState, useEffect } from 'react';
import { useLocale, useTranslations } from 'next-intl';
import { useGetNewsArticles, useGetNewsCategories } from '@/hooks/use-news';
import NewsSearchBar from './NewsSearchBar';
import NewsFilterPanel from './NewsFilterPanel';
import NewsActiveFilters from './NewsActiveFilters';
import NewsGrid from './NewsGrid';
import NewsEmptyState from './NewsEmptyState';
import { useDebounce } from '@/hooks/use-debounce';

const PAGE_SIZE = 12;

export default function NewsPageClient() {
  const locale = useLocale();
  const t = useTranslations('news');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, 500); // updates after 500ms idle

  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false);

  // Reset to first page whenever the debounced search term changes
  useEffect(() => {
    setCurrentPage(1);
  }, [debouncedSearch]);

  // Fetch news articles — USE debouncedSearch here so the query only fires after typing stops
  const { data: newsData, isLoading: newsLoading } = useGetNewsArticles({
    page: currentPage,
    pageSize: PAGE_SIZE,
    locale,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
    searchTerm: debouncedSearch || undefined, // <-- important change
    ...(selectedCategory && {
      where: [{ field: 'categoryId', operator: 'eq', value: selectedCategory }],
    }),
  });

  // Fetch categories
  const { data: categoriesData } = useGetNewsCategories({
    page: 1,
    pageSize: 100,
    locale,
  });

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
    // If you want to force-search immediately on submit, you can also set:
    // setSearchTerm(searchTerm.trim()); // (no-op) or trigger other behavior
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const hasActiveFilters: boolean =
    (searchTerm && searchTerm.trim() !== '') || selectedCategory !== null;

  // Extract articles and categories from nested data structure
  const articles = newsData?.data?.data || [];
  const categories = categoriesData?.data?.data || [];

  // Extract pagination metadata
  const paginationMeta = newsData?.data
    ? {
        currentPage: newsData.data.currentPage || 1,
        totalPages: newsData.data.totalPages || 1,
        totalItems: newsData.data.totalItems || 0,
        hasNextPage: newsData.data.hasNextPage || false,
        hasPreviousPage: newsData.data.hasPreviousPage || false,
      }
    : null;

  return (
    <div
      className={`min-h-screen bg-white ${
        showFilters ? 'overflow-hidden' : ''
      }`}
    >
      <div className="relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          <NewsSearchBar
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            onFilterClick={() => setShowFilters(true)}
            showFilters={showFilters}
            hasActiveCategory={selectedCategory !== null}
            locale={locale}
            translations={{
              searchPlaceholder: t('searchPlaceholder'),
              search: t('search'),
              filters: t('filters'),
            }}
          />

          <NewsActiveFilters
            searchTerm={searchTerm}
            selectedCategory={selectedCategory}
            categories={categories}
            onClearSearch={() => {
              setSearchTerm('');
              setCurrentPage(1);
            }}
            onClearCategory={() => handleCategoryChange(null)}
            translations={{
              searchingFor: t('searchingFor'),
            }}
          />

          {!newsLoading && articles.length > 0 ? (
            <NewsGrid
              articles={articles}
              isLoading={newsLoading}
              paginationMeta={paginationMeta}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              translations={{
                showingResults: t('showingResults', {
                  count: paginationMeta?.totalItems || 0,
                }),
              }}
            />
          ) : newsLoading ? (
            <NewsGrid
              articles={[]}
              isLoading={true}
              paginationMeta={null}
              pageSize={PAGE_SIZE}
              onPageChange={setCurrentPage}
              translations={{
                showingResults: '',
              }}
            />
          ) : (
            <NewsEmptyState
              hasActiveFilters={hasActiveFilters}
              onClearFilters={clearFilters}
              translations={{
                noResultsFound: t('noResultsFound'),
                noNews: t('noNews'),
                noResultsDescription: t('noResultsDescription'),
                noNewsDescription: t('noNewsDescription'),
                clearFilters: t('clearFilters'),
              }}
            />
          )}
        </div>
      </div>

      <NewsFilterPanel
        isOpen={showFilters}
        onClose={() => setShowFilters(false)}
        categories={categories}
        selectedCategory={selectedCategory}
        onCategoryChange={handleCategoryChange}
        locale={locale}
        translations={{
          filters: t('filters'),
          filterByCategory: t('filterByCategory'),
          clearFilters: t('clearFilters'),
          allCategories: t('allCategories'),
          showResults: t('showResults'),
        }}
      />

      <style jsx>{`
        @keyframes fadeIn {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-fadeIn {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }

        @keyframes shimmer {
          0% {
            transform: translateX(-100%);
          }
          100% {
            transform: translateX(100%);
          }
        }

        .animate-shimmer {
          animation: shimmer 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }

        .animate-pulse {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
    </div>
  );
}
