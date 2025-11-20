'use client';

import React from 'react';
import Box from '@/components/box/box';
import { Search, Filter, ArrowRight, ArrowLeft } from 'lucide-react';
import { useDirection } from '@/hooks/use-direction';

interface NewsSearchBarProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onFilterClick: () => void;
  showFilters: boolean;
  hasActiveCategory: boolean;
  locale: string;
  translations: {
    searchPlaceholder: string;
    search: string;
    filters: string;
  };
}

export default function NewsSearchBar({
  searchTerm,
  onSearchChange,
  onFilterClick,
  showFilters,
  hasActiveCategory,
  locale,
  translations,
}: NewsSearchBarProps) {
  const direction = useDirection();
  return (
    <div
      className="group mb-12 animate-fadeIn"
      style={{ animationDelay: '0.1s' }}
    >
      <Box
        variant="column"
        className="relative w-full bg-white/80 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-100 p-8"
      >
        <Box variant="row" className="w-full gap-4">
          <div className="flex-1 relative group/input">
            <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-2xl blur-xl group-focus-within/input:blur-2xl transition-all duration-300 opacity-0 group-focus-within/input:opacity-100" />
            <div className="relative flex items-center">
              <Search
                className={`absolute ${
                  locale === 'ar' ? 'right-5' : 'left-5'
                } text-gray-400 w-5 h-5 group-focus-within/input:text-primary transition-colors`}
              />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder={translations.searchPlaceholder}
                className={`w-full ${
                  locale === 'ar' ? 'pr-14 pl-5' : 'pl-14 pr-5'
                } py-2 bg-gray-50 border-2 border-gray-100 rounded-2xl focus:outline-none focus:border-primary focus:bg-white transition-all duration-300 text-lg`}
              />
            </div>
          </div>

          <button
            type="button"
            onClick={onFilterClick}
            className={`relative px-5 md:px-8 py-2 rounded-2xl font-bold transition-all duration-300 flex items-center justify-center md:justify-start gap-2 transform hover:scale-105 ${
              showFilters
                ? 'bg-gradient-to-r from-primary to-primary-light text-white shadow-xl'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {hasActiveCategory && (
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white" />
            )}
            <Filter className="w-5 h-5" />
            <span className="hidden md:inline">{translations.filters}</span>
          </button>
        </Box>
      </Box>
    </div>
  );
}
