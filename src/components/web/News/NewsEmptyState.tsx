import React from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Newspaper, ArrowRight } from 'lucide-react';

interface NewsEmptyStateProps {
  hasActiveFilters: boolean;
  onClearFilters: () => void;
  translations: {
    noResultsFound: string;
    noNews: string;
    noResultsDescription: string;
    noNewsDescription: string;
    clearFilters: string;
  };
}

export default function NewsEmptyState({
  hasActiveFilters,
  onClearFilters,
  translations,
}: NewsEmptyStateProps) {
  return (
    <Box
      variant="column"
      className="items-center justify-center py-24 animate-fadeIn"
    >
      <div className="relative mb-8 group">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-primary-light/20 rounded-full blur-3xl" />
        <div className="relative w-40 h-40 rounded-full bg-gradient-to-br from-gray-50 to-gray-100 dark:from-zinc-800 dark:to-zinc-900 flex items-center justify-center border-4 border-white dark:border-zinc-950 shadow-2xl">
          <Newspaper className="w-20 h-20 text-gray-300 dark:text-zinc-600" />
        </div>
      </div>

      <Text className="text-4xl font-black text-gray-800 dark:text-white mb-3 text-center">
        {hasActiveFilters ? translations.noResultsFound : translations.noNews}
      </Text>

      <Text className="text-gray-500 dark:text-zinc-400 text-lg mb-8 text-center max-w-md">
        {hasActiveFilters
          ? translations.noResultsDescription
          : translations.noNewsDescription}
      </Text>

      {hasActiveFilters && (
        <button
          onClick={onClearFilters}
          className="group/btn relative px-8 py-4 bg-gradient-to-r from-primary to-primary-light dark:from-[#198341] dark:to-[#ABDE3B] text-white dark:text-zinc-950 rounded-2xl font-bold transition-all duration-300 transform hover:scale-105 shadow-xl hover:shadow-2xl"
        >
          <div className="absolute inset-0 bg-white/20 dark:bg-white/10 rounded-2xl blur-xl opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          <span className="relative flex items-center gap-2">
            {translations.clearFilters}
            <ArrowRight className="w-5 h-5" />
          </span>
        </button>
      )}
    </Box>
  );
}
