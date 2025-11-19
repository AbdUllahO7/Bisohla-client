'use client';

import React from 'react';
import Text from '@/components/text/text';
import { Filter, X } from 'lucide-react';
import { SelectNewsCategoryDto } from '@/core/entities/models/news/news.dto';

interface NewsFilterPanelProps {
  isOpen: boolean;
  onClose: () => void;
  categories: SelectNewsCategoryDto[];
  selectedCategory: number | null;
  onCategoryChange: (categoryId: number | null) => void;
  locale: string;
  translations: {
    filters: string;
    filterByCategory: string;
    clearFilters: string;
    allCategories: string;
    showResults: string;
  };
}

export default function NewsFilterPanel({
  isOpen,
  onClose,
  categories,
  selectedCategory,
  onCategoryChange,
  locale,
  translations,
}: NewsFilterPanelProps) {
  return (
    <div
      className={`fixed z-[999] inset-0 z-40 transition-opacity duration-300 ${
        isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
      }`}
    >
      {/* Overlay */}
      <div
        className="absolute inset-0 bg-black/50"
        onClick={onClose}
      />

      {/* Panel */}
      <div
        className={`fixed top-0 ${
          locale === 'ar' ? 'left-0' : 'right-0'
        } z-50 flex h-full w-full max-w-md flex-col bg-white shadow-2xl transition-transform duration-300 ease-in-out
          ${
            isOpen
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
              {translations.filters}
            </h3>
          </div>
          <button
            title="Close filters"
            onClick={onClose}
            className="p-2 text-gray-400 rounded-lg hover:bg-gray-100 hover:text-gray-600"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Panel Body */}
        <div className="flex-1 p-6 space-y-8 overflow-y-auto">
          {/* Category Filter */}
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <Text className="text-lg font-bold text-gray-900">
                {translations.filterByCategory}
              </Text>
              {selectedCategory !== null && (
                <button
                  onClick={() => onCategoryChange(null)}
                  className="px-3 py-1 text-xs text-red-500 hover:text-white hover:bg-red-500 rounded-full flex items-center gap-1 transition-all duration-300 border border-red-200 hover:border-red-500"
                >
                  <X className="w-3 h-3" />
                  {translations.clearFilters}
                </button>
              )}
            </div>

            <div className="flex flex-wrap gap-3">
              {/* "All" Button */}
              <button
                onClick={() => onCategoryChange(null)}
                className={`group/cat relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                  selectedCategory === null
                    ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {selectedCategory === null && (
                  <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl" />
                )}
                <span className="relative">{translations.allCategories}</span>
              </button>

              {/* Category Buttons */}
              {categories.map((category: SelectNewsCategoryDto) => (
                <button
                  key={category.id}
                  onClick={() => onCategoryChange(category.id)}
                  className={`group/cat relative px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 ${
                    selectedCategory === category.id
                      ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-lg'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {selectedCategory === category.id && (
                    <div className="absolute inset-0 bg-white/20 rounded-xl blur-xl" />
                  )}
                  <span className="relative">{category.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Panel Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="w-full px-8 py-4 bg-gradient-to-r from-primary to-primary-light text-white rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-2xl"
          >
            {translations.showResults}
          </button>
        </div>
      </div>
    </div>
  );
}
