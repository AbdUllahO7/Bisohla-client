'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useFilters } from '@/providers/filters.provider';

// Separate search input component to prevent context re-renders
const OptimizedSearchInput: React.FC = React.memo(() => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('productsPage');

  // Use local state for immediate UI feedback
  const [localSearchText, setLocalSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);

  // Get context values
  const { searchState, updateSearchText } = useFilters();

  // Sync local state with context when context changes (e.g., from URL or reset)
  useEffect(() => {
    if (searchState.searchText !== localSearchText) {
      setLocalSearchText(searchState.searchText);
    }
  }, [searchState.searchText, localSearchText]);

  // Handle input change with local state for immediate UI feedback
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const value = e.target.value;
      setLocalSearchText(value); // Update local state immediately for UI
      updateSearchText(value); // Update context (which will handle debouncing)
    },
    [updateSearchText],
  );

  // Handle clear search
  const handleClearSearch = useCallback(() => {
    setLocalSearchText('');
    updateSearchText('');
  }, [updateSearchText]);

  // Handle focus events
  const handleFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClearSearch();
        e.currentTarget.blur();
      }
    },
    [handleClearSearch],
  );

  return (
    <div className="p-4 border-b border-slate-100">
      <div className="relative group">
        <Search
          className={`absolute ${
            isRTL ? 'right-3' : 'left-3'
          } top-1/2 transform -translate-y-1/2 transition-colors duration-200 h-4 w-4 ${
            isFocused || localSearchText
              ? 'text-primary'
              : 'text-slate-400 group-hover:text-slate-500'
          }`}
        />
        <Input
          type="text"
          id="search"
          placeholder={t('filter.searchInput')}
          value={localSearchText}
          onChange={handleInputChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          className={`border border-slate-200 bg-[#EFEFEF] transition-all duration-200 ${
            isRTL ? 'pr-9 pl-10' : 'pl-9 pr-10'
          } h-10 rounded-xl focus-visible:ring-primary/30 focus-visible:border-primary hover:border-slate-300 ${
            isFocused ? 'bg-white shadow-sm' : ''
          }`}
        />
        {localSearchText && (
          <button
            type="button"
            onClick={handleClearSearch}
            className={`absolute ${
              isRTL ? 'left-3' : 'right-3'
            } top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${
              isFocused || localSearchText ? 'opacity-100' : ''
            }`}
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Search hint */}
        {/* {localSearchText && (
          <div className="absolute top-full left-0 right-0 mt-1">
            <div className="text-xs text-slate-500 px-3">
              {localSearchText.length < 2
                ? 'Type at least 2 characters to search'
                : `Searching for "${localSearchText}"...`}
            </div>
          </div>
        )} */}
      </div>
    </div>
  );
});

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

export default OptimizedSearchInput;
