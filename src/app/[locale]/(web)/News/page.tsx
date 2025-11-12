'use client';

import React, { useState } from 'react';
import Box from '@/components/box/box';
import Text from '@/components/text/text';
import { useLocale, useTranslations } from 'next-intl';
import {
  Search,
  Filter,
  Newspaper,
  X,
  TrendingUp,
  Sparkles,
  ArrowRight,
} from 'lucide-react';
import { useGetNewsArticles, useGetNewsCategories } from '@/hooks/use-news';
import Pagination from '@/components/Pagination';
import {
  SelectNewsArticleDto,
  SelectNewsCategoryDto,
} from '@/core/entities/models/news/news.dto';
import NewsCard from '@/components/web/Home/NewsCard';
import Image from 'next/image';

const AllNewsPage: React.FC = () => {
  const locale = useLocale();
  const t = useTranslations('news');

  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  const [showFilters, setShowFilters] = useState(false); // <<< This now controls the slide-in panel
  const pageSize = 9;

  // Fetch news articles
  const { data: newsData, isLoading: newsLoading } = useGetNewsArticles({
    page: currentPage,
    pageSize,
    locale,
    sortBy: 'publishedAt',
    sortDirection: 'desc',
    searchTerm: searchTerm || undefined,
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
  };

  const handleCategoryChange = (categoryId: number | null) => {
    setSelectedCategory(categoryId);
    setCurrentPage(1);
    // <<< Optional: Close panel on selection. Good for mobile. >>>
    // setShowFilters(false);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory(null);
    setCurrentPage(1);
  };

  const hasActiveFilters = searchTerm || selectedCategory !== null;

  // Extract articles and categories from nested data structure
  const articles = newsData?.data?.data;
  const categories = categoriesData?.data?.data;
  const hasArticles = articles && Array.isArray(articles) && articles.length > 0;
  const hasCategories =
    categories && Array.isArray(categories) && categories.length > 0;

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
    // <<< Added 'overflow-hidden' to the root when panel is open >>>
    <div
      className={`min-h-screen bg-white ${
        showFilters ? 'overflow-hidden' : ''
      }`}
    >
      {/* ... (Hero section is unchanged) ... */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light">
        <div
          className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground rounded-full opacity-10"
          style={{ transform: 'translate(30%, -30%)' }}
        ></div>
        <div
          className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground rounded-full opacity-10"
          style={{ transform: 'translate(-30%, 30%)' }}
        ></div>

        <div className="relative max-w-7xl mx-auto py-20 px-4 md:px-6">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="text-white space-y-6 animate-fadeIn">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
                <Sparkles className="w-4 h-4 text-primary-foreground" />
                <span className="text-sm font-medium text-primary-foreground">
                  {t('allNewsDescription')}
                </span>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold leading-tight">
                {t('allNews')}
              </h1>
              <p className="text-xl text-white/90">{t('latestNews')}</p>
            </div>
            <div
              className="relative animate-fadeIn"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute inset-0 bg-primary-foreground rounded-3xl opacity-20 blur-3xl"></div>
              <div className="relative transition-all duration-700 hover:scale-105">
                <Image
                  src="/assets/images/3-car.png"
                  alt="logo"
                  width={500}
                  height={500}
                  className="relative transition-all duration-700 hover:scale-105 drop-shadow-2xl"
                />
                <div className="flex items-center justify-center"></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="relative bg-gradient-to-b from-gray-50 to-white py-20">
        <div className="container mx-auto px-4 max-w-7xl">
          {/* Search and Filters */}
          <div
            className="group mb-12 animate-fadeIn"
            style={{ animationDelay: '0.1s' }}
          >
            <div className="absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 bg-gradient-to-r from-primary/20 to-primary-light/20 blur-3xl"></div>
            <Box
              variant="column"
              className="relative bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 p-8"
            >
              {/* Search Bar */}
              <form onSubmit={handleSearch} className="mb-0"> {/* <<< FIX: Removed mb-6 >>> */}
                <Box variant="row" className="gap-4">
                  <div className="flex-1 relative group/input">
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl group-focus-within/input:blur-2xl transition-all duration-300 opacity-0 group-focus-within/input:opacity-100"></div>
                    <div className="relative flex items-center">
                      <Search
                        className={`absolute ${
                          locale === 'ar' ? 'right-5' : 'left-5'
                        } text-gray-400 w-5 h-5 group-focus-within/input:text-primary transition-colors`}
                      />
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder={t('searchPlaceholder')}
                        className={`w-full ${
                          locale === 'ar' ? 'pr-14 pl-5' : 'pl-14 pr-5'
                        } py-5 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-lg`}
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="group/btn relative px-5 md:px-10 py-5 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 flex items-center justify-center md:justify-start gap-2 whitespace-nowrap shadow-lg hover:shadow-2xl"
                  >
                    <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                    <Search className="w-5 h-5 relative md:hidden" />
                    <span className="relative hidden md:inline">{t('search')}</span>
                    <ArrowRight className="w-5 h-5 relative hidden md:inline" />
                  </button>

                  {/* <<< FIX: Filter button now opens the panel >>> */}
                  <button
                    type="button"
                    onClick={() => setShowFilters(true)} // <<< CHANGED
                    className={`relative px-5 md:px-8 py-5 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center md:justify-start gap-2 transform hover:scale-105 ${
                      showFilters
                        ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xl'
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                    }`}
                  >
                    {/* <<< FIX: Added badge to show active filters >>> */}
                    {selectedCategory !== null && (
                      <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
                    )}
                    <Filter className="w-5 h-5" />
                    <span className="hidden md:inline">{t('filters')}</span>
                  </button>
                </Box>
              </form>

              {/* <<< FIX: This entire 'showFilters' block has been REMOVED >>> */}
              {/*
                {showFilters && (
                  ...
                )}
              */}

            </Box>
          </div>

          {/* ... (Active filter tags are unchanged) ... */}
          {hasActiveFilters && (
            <Box variant="row" className="gap-3 mb-8 flex-wrap animate-fadeIn">
              {searchTerm && (
                <div className="group/tag relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl"></div>
                  <span className="relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20 text-primary rounded-2xl font-semibold">
                    <Search className="w-4 h-4" />
                    {t('searchingFor')}: "{searchTerm}"
                    <button
                      title="searchingFor"
                      onClick={() => {
                        setSearchTerm('');
                        setCurrentPage(1);
                      }}
                      className="hover:bg-primary hover:text-white rounded-lg p-1 transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                </div>
              )}

              {selectedCategory && hasCategories && (
                <div className="group/tag relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl"></div>
                  <span className="relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20 text-primary rounded-2xl font-semibold">
                    <Filter className="w-4 h-4" />
                    {
                      categories.find(
                        (c: SelectNewsCategoryDto) => c.id === selectedCategory,
                      )?.name
                    }
                    <button
                      title="find"
                      onClick={() => handleCategoryChange(null)}
                      className="hover:bg-primary hover:text-white rounded-lg p-1 transition-all duration-300"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </span>
                </div>
              )}
            </Box>
          )}

          {/* ... (Rest of the component: results count, loading, grid, empty state) is unchanged ... */}
          {/* ... (They will all work perfectly with the new filter panel) ... */}
          {!newsLoading && paginationMeta && hasArticles && (
            <Box
              variant="row"
              className="justify-between items-center mb-8 animate-fadeIn"
            >
              <div className="flex items-center gap-3">
                <div className="w-2 h-2 bg-primary rounded-full animate-pulse"></div>
                <Text className="text-gray-600 font-medium">
                  {t('showingResults', { count: paginationMeta.totalItems })}
                </Text>
              </div>
            </Box>
          )}

          {newsLoading && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((i) => (
                <div key={i} className="animate-pulse">
                  <div className="bg-gradient-to-br from-gray-100 to-gray-200 rounded-3xl h-[450px] relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/50 to-transparent animate-shimmer"></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {!newsLoading && hasArticles && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-fadeIn">
                {articles.map((article: SelectNewsArticleDto) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>

              {paginationMeta && paginationMeta.totalPages > 1 && (
                <Pagination
                  currentPage={paginationMeta.currentPage}
                  totalPages={paginationMeta.totalPages}
                  hasNextPage={paginationMeta.hasNextPage}
                  hasPreviousPage={paginationMeta.hasPreviousPage}
                  totalItems={paginationMeta.totalItems}
                  pageSize={pageSize}
                  onPageChange={setCurrentPage}
                  showItemsInfo={true}
                  className="mt-16"
                />
              )}
            </>
          )}

          {!newsLoading && !hasArticles && (
            <Box
              variant="column"
              className="items-center justify-center py-24 animate-fadeIn"
            >
              <div className="relative mb-8 group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-full blur-3xl"></div>
                <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center border-4 border-white shadow-2xl">
                  <Newspaper className="w-20 h-20 text-gray-300" />
                </div>
              </div>

              <Text className="text-4xl font-black text-gray-800 mb-3 text-center">
                {hasActiveFilters ? t('noResultsFound') : t('noNews')}
              </Text>

              <Text className="text-gray-500 text-lg mb-8 text-center max-w-md">
                {hasActiveFilters
                  ? t('noResultsDescription')
                  : t('noNewsDescription')}
              </Text>

              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="group/btn relative px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity"></div>
                  <span className="relative flex items-center gap-2">
                    {t('clearFilters')}
                    <ArrowRight className="w-5 h-5" />
                  </span>
                </button>
              )}
            </Box>
          )}
        </div>
      </div>

      {/* <<< FIX: NEW FILTER PANEL & OVERLAY >>> */}
      <div
        className={`fixed z-[999] inset-0 z-40 transition-opacity duration-300 ${
          showFilters ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* Overlay */}
        <div
          className="absolute inset-0 bg-black/50"
          onClick={() => setShowFilters(false)}
        ></div>

        {/* Panel */}
        <div
          className={`fixed top-0 ${
            locale === 'ar' ? 'left-0' : 'right-0'
          } z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out
            ${
              showFilters
                ? 'translate-x-0'
                : locale === 'ar'
                  ? '-translate-x-full'
                  : 'translate-x-full'
            }`}
        >
          {/* Panel Header */}
          <div className="flex items-center justify-between p-6 border-b border-gray-200">
            <div className="flex items-center gap-3">
              <Filter className="w-6 h-6 text-primary" />
              <h3 className="text-2xl font-bold text-gray-900">
                {t('filters')}
              </h3>
            </div>
            <button
            title='setShowFilters'
              onClick={() => setShowFilters(false)}
              className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </button>
          </div>

          {/* Panel Body */}
          <div className="flex-1  p-6 space-y-8 overflow-y-auto">
            {/* Category Filter */}
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <Text className="text-lg font-bold text-gray-900">
                  {t('filterByCategory')}
                </Text>
                {/* Moved Clear Filters button here */}
                {selectedCategory !== null && (
                  <button
                    onClick={() => handleCategoryChange(null)}
                    className="px-3 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded-full flex items-center gap-1 transition-all duration-300 border border-red-200 hover:border-red-500"
                  >
                    <X className="w-3 h-3" />
                    {t('clearFilters')}
                  </button>
                )}
              </div>

              <div className="flex flex-wrap gap-3">
                {/* "All" Button */}
                <button
                  onClick={() => handleCategoryChange(null)}
                  className={`group/cat relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === null
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedCategory === null && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl"></div>
                  )}
                  <span className="relative">{t('allCategories')}</span>
                </button>

                {/* Category Buttons */}
                {hasCategories &&
                  categories.map((category: SelectNewsCategoryDto) => (
                    <button
                      key={category.id}
                      onClick={() => handleCategoryChange(category.id)}
                      className={`group/cat relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                        selectedCategory === category.id
                          ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {selectedCategory === category.id && (
                        <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl"></div>
                      )}
                      <span className="relative">{category.name}</span>
                    </button>
                  ))}
              </div>
            </div>

            {/* You can add more filter sections here in the future */}
            {/* <div className="space-y-5 border-t border-gray-200 pt-6">
              <Text className="text-lg font-bold text-gray-900">Filter by Date</Text>
              ...
            </div> 
            */}
          </div>

          {/* Panel Footer */}
          <div className="p-6 border-t border-gray-200 bg-gray-50">
            <button
              onClick={() => setShowFilters(false)}
              className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
            >
              {t('showResults')}
            </button>
          </div>
        </div>
      </div>
      {/* <<< END OF NEW FILTER PANEL >>> */}

      {/* Animations (unchanged) */}
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
};

export default AllNewsPage;