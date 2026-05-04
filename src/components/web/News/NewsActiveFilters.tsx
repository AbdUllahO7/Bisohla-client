'use client';

import React from 'react';
import Box from '@/components/box/box';
import { Search, Filter, X } from 'lucide-react';
import { SelectNewsCategoryDto } from '@/core/entities/models/news/news.dto';

interface NewsActiveFiltersProps {
  searchTerm: string;
  selectedCategory: number | null;
  categories: SelectNewsCategoryDto[];
  onClearSearch: () => void;
  onClearCategory: () => void;
  translations: {
    searchingFor: string;
  };
}

export default function NewsActiveFilters({
  searchTerm,
  selectedCategory,
  categories,
  onClearSearch,
  onClearCategory,
  translations,
}: NewsActiveFiltersProps) {
  const hasActiveFilters = searchTerm || selectedCategory !== null;

  if (!hasActiveFilters) return null;

  return (
    <Box variant="row" className="gap-3 mb-8 flex-wrap animate-fadeIn">
      {searchTerm && (
        <div className="group/tag relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl" />
          <span className="relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20 text-primary rounded-2xl font-semibold">
            <Search className="w-4 h-4" />
            {translations.searchingFor}: &quot;{searchTerm}&quot;
            <button
              title="Clear search"
              onClick={onClearSearch}
              className="hover:bg-primary hover:text-white rounded-lg p-1 transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        </div>
      )}

      {selectedCategory && categories.length > 0 && (
        <div className="group/tag relative">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl" />
          <span className="relative inline-flex items-center gap-3 px-5 py-3 bg-gradient-to-r from-primary/10 to-primary-light/10 border-2 border-primary/20 text-primary rounded-2xl font-semibold">
            <Filter className="w-4 h-4" />
            {categories.find((c) => c.id === selectedCategory)?.name}
            <button
              title="Clear category filter"
              onClick={onClearCategory}
              className="hover:bg-primary hover:text-white rounded-lg p-1 transition-all duration-300"
            >
              <X className="w-4 h-4" />
            </button>
          </span>
        </div>
      )}
    </Box>
  );
}
