'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { Search, X, Clock, Sparkles, Trash2 } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { Input } from '@/components/ui/input';
import { useFilters, FilterState } from '@/providers/filters.provider';

interface QuickTag {
  id: string;
  labelKey: string;
  isActive: (filters: FilterState) => boolean;
  onApply: (
    updateFilter: (key: keyof FilterState, value: string | string[] | number) => void,
    isActive: boolean
  ) => void;
}

const quickTags: QuickTag[] = [
  {
    id: 'for_sale',
    labelKey: 'forSale',
    isActive: (f) => f.listingType === 'for_sale',
    onApply: (up, active) => up('listingType', active ? '' : 'for_sale'),
  },
  {
    id: 'for_rent',
    labelKey: 'forRent',
    isActive: (f) => f.listingType === 'for_rent',
    onApply: (up, active) => up('listingType', active ? '' : 'for_rent'),
  },
  {
    id: 'automatic',
    labelKey: 'automatic',
    isActive: (f) => f.transmission === 'automatic',
    onApply: (up, active) => up('transmission', active ? '' : 'automatic'),
  },
  {
    id: 'suv',
    labelKey: 'suvs',
    isActive: (f) => f.bodyType === 'suv',
    onApply: (up, active) => up('bodyType', active ? '' : 'suv'),
  },
  {
    id: 'sedan',
    labelKey: 'sedans',
    isActive: (f) => f.bodyType === 'sedan',
    onApply: (up, active) => up('bodyType', active ? '' : 'sedan'),
  },
  {
    id: 'under_10k',
    labelKey: 'under10k',
    isActive: (f) => f.maxPrice === '10000' && f.currency === 'usd',
    onApply: (up, active) => {
      if (active) {
        up('maxPrice', '');
        up('currency', '');
      } else {
        up('maxPrice', '10000');
        up('currency', 'usd');
      }
    },
  },
];

// Separate search input component to prevent context re-renders
const OptimizedSearchInput: React.FC = React.memo(() => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('productsPage');

  // Use local state for immediate UI feedback
  const [localSearchText, setLocalSearchText] = useState('');
  const [isFocused, setIsFocused] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);

  // Get context values
  const { searchState, updateSearchText, filters, updateFilter } = useFilters();

  // Load recent searches from localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('bishola_recent_searches');
      if (saved) {
        try {
          setRecentSearches(JSON.parse(saved));
        } catch (e) {
          console.error('Failed to parse recent searches', e);
        }
      }
    }
  }, []);

  // Save search term utility
  const saveSearchTerm = useCallback((term: string) => {
    const trimmed = term.trim();
    if (!trimmed) return;
    setRecentSearches((prev) => {
      const next = [trimmed, ...prev.filter((item) => item !== trimmed)].slice(0, 5);
      localStorage.setItem('bishola_recent_searches', JSON.stringify(next));
      return next;
    });
  }, []);

  // Remove single search item
  const removeRecentSearch = useCallback((termToRemove: string) => {
    setRecentSearches((prev) => {
      const next = prev.filter((item) => item !== termToRemove);
      localStorage.setItem('bishola_recent_searches', JSON.stringify(next));
      return next;
    });
  }, []);

  // Clear all recent searches
  const clearAllRecentSearches = useCallback(() => {
    setRecentSearches([]);
    localStorage.removeItem('bishola_recent_searches');
  }, []);

  // Click outside listener to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };
    const handleFocusOutside = (event: FocusEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('focusin', handleFocusOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('focusin', handleFocusOutside);
    };
  }, []);

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
    setShowDropdown(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsFocused(false);
    // Note: Do not close dropdown immediately on blur to allow click actions inside it
  }, []);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClearSearch();
        e.currentTarget.blur();
        setShowDropdown(false);
      } else if (e.key === 'Enter') {
        saveSearchTerm(localSearchText);
        e.currentTarget.blur();
        setShowDropdown(false);
      }
    },
    [handleClearSearch, localSearchText, saveSearchTerm],
  );

  // Apply suggestion search term
  const handleSelectSuggestion = useCallback(
    (term: string) => {
      setLocalSearchText(term);
      updateSearchText(term);
      saveSearchTerm(term);
      setShowDropdown(false);
    },
    [updateSearchText, saveSearchTerm],
  );

  return (
    <div ref={containerRef} className="p-4 border-b border-slate-100 dark:border-zinc-800 relative">
      <div className="relative group">
        <Search
          className={`absolute ${
            isRTL ? 'right-3' : 'left-3'
          } top-1/2 transform -translate-y-1/2 transition-colors duration-200 h-4 w-4 ${
            isFocused || localSearchText
              ? 'text-primary dark:text-[#ABDE3B]'
              : 'text-slate-400 group-hover:text-slate-500 dark:text-zinc-500 dark:group-hover:text-zinc-400'
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
          autoComplete="off"
          className={`border border-slate-200 dark:border-zinc-800 bg-[#EFEFEF] dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-all duration-200 ${
            isRTL ? 'pr-9 pl-10' : 'pl-9 pr-10'
          } h-10 rounded-xl focus-visible:ring-primary/30 dark:focus-visible:ring-[#ABDE3B]/30 focus-visible:border-primary dark:focus-visible:border-[#ABDE3B] hover:border-slate-300 dark:hover:border-zinc-700 ${
            isFocused ? 'bg-white dark:bg-zinc-900 shadow-sm' : ''
          }`}
        />
        {localSearchText && (
          <button
            type="button"
            onClick={handleClearSearch}
            className={`absolute ${
              isRTL ? 'left-3' : 'right-3'
            } top-1/2 transform -translate-y-1/2 text-slate-400 dark:text-zinc-500 hover:text-slate-600 dark:hover:text-zinc-300 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${
              isFocused || localSearchText ? 'opacity-100' : ''
            }`}
            title="Clear search"
          >
            <X className="h-4 w-4" />
          </button>
        )}

        {/* Suggestion Dropdown (Autocomplete) */}
        {showDropdown && (recentSearches.length > 0) && (
          <div
            className={`absolute top-full mt-2 w-full bg-white/95 dark:bg-zinc-950/95 backdrop-blur-md border border-slate-200/80 dark:border-zinc-800/80 rounded-2xl shadow-xl shadow-slate-200/50 dark:shadow-black/60 p-3 z-50 transition-all duration-200 animate-in fade-in slide-in-from-top-2 max-h-[300px] overflow-y-auto ${
              isRTL ? 'right-0' : 'left-0'
            }`}
          >
            <div className="flex items-center justify-between px-2 mb-2 pb-1.5 border-b border-slate-100 dark:border-zinc-900">
              <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-cairo flex items-center gap-1">
                <Clock className="h-3 w-3" />
                {t('filter.autocomplete.recentSearches')}
              </span>
              <button
                type="button"
                onClick={clearAllRecentSearches}
                className="text-[10px] font-bold text-red-500 hover:text-red-600 dark:text-red-400/90 dark:hover:text-red-400 flex items-center gap-1 font-cairo transition-colors"
              >
                <Trash2 className="h-3 w-3" />
                {t('filter.autocomplete.clearHistory')}
              </button>
            </div>

            <div className="space-y-1">
              {recentSearches.map((term, index) => (
                <div
                  key={`${term}-${index}`}
                  className="flex items-center justify-between group/item hover:bg-slate-50 dark:hover:bg-zinc-900/50 rounded-lg p-2 transition-colors cursor-pointer text-sm text-slate-700 dark:text-zinc-350"
                  onClick={() => handleSelectSuggestion(term)}
                >
                  <span className="flex items-center gap-2 truncate font-cairo">
                    <Search className="h-3.5 w-3.5 text-slate-400 dark:text-zinc-500" />
                    {term}
                  </span>
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeRecentSearch(term);
                    }}
                    className="p-1 rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:text-zinc-500 dark:hover:text-zinc-350 dark:hover:bg-zinc-800 opacity-0 group-hover/item:opacity-100 transition-all duration-150"
                    title="Remove from history"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Quick Search Tags Container */}
      <div className="mt-3">
        <div className="flex items-center gap-1 mb-2 px-1">
          <Sparkles className="h-3 w-3 text-primary dark:text-[#ABDE3B]" />
          <span className="text-[10px] font-bold tracking-wider text-slate-400 dark:text-zinc-500 uppercase font-cairo">
            {t('filter.autocomplete.popularTags')}
          </span>
        </div>
        
        <div className="flex flex-row items-center gap-1.5 overflow-x-auto no-scrollbar scrollbar-hide pb-1">
          {quickTags.map((tag) => {
            const active = tag.isActive(filters);
            return (
              <button
                key={tag.id}
                type="button"
                onClick={() => tag.onApply(updateFilter, active)}
                className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-full text-xs transition-all duration-200 whitespace-nowrap font-cairo border ${
                  active
                    ? 'bg-primary/10 border-primary/30 text-primary dark:bg-[#ABDE3B]/10 dark:border-[#ABDE3B]/30 dark:text-[#ABDE3B] font-semibold'
                    : 'bg-slate-50 border-slate-200/80 text-slate-600 hover:bg-slate-100 hover:text-slate-800 dark:bg-zinc-900/30 dark:border-zinc-800/80 dark:text-zinc-400 dark:hover:bg-zinc-850 dark:hover:text-zinc-200'
                }`}
              >
                {t(`filter.autocomplete.tags.${tag.labelKey}`)}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
});

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

export default OptimizedSearchInput;
