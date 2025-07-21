// components/OptimizedSearchInput.tsx - Search with instant feedback
import React, { useState, useEffect, useCallback } from 'react';
import { Search, X } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { useTranslations, useLocale } from 'next-intl';

interface OptimizedSearchInputProps {
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  className?: string;
}

const OptimizedSearchInput: React.FC<OptimizedSearchInputProps> = React.memo(
  ({ value = '', onChange, placeholder, className = '' }) => {
    const t = useTranslations('productsPage');
    const locale = useLocale();
    const isRTL = locale === 'ar';

    // Local state for immediate UI updates
    const [localValue, setLocalValue] = useState(value);
    const [isSearching, setIsSearching] = useState(false);

    // Sync local value with prop value
    useEffect(() => {
      setLocalValue(value);
    }, [value]);

    // Handle input change with immediate UI feedback
    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        const newValue = e.target.value;
        setLocalValue(newValue);

        // Show searching indicator if there's a value
        if (newValue.trim()) {
          setIsSearching(true);
        }

        // Call parent onChange (which will handle debouncing)
        onChange(newValue.trim());

        // Hide searching indicator after a delay (visual feedback)
        setTimeout(() => {
          setIsSearching(false);
        }, 1000);
      },
      [onChange],
    );

    // Handle clear search
    const handleClear = useCallback(() => {
      setLocalValue('');
      onChange('');
      setIsSearching(false);
    }, [onChange]);

    // Handle form submit (for Enter key)
    const handleSubmit = useCallback(
      (e: React.FormEvent) => {
        e.preventDefault();
        onChange(localValue.trim());
        setIsSearching(false);
      },
      [localValue, onChange],
    );

    return (
      <form onSubmit={handleSubmit} className={`relative ${className}`}>
        <div className="relative">
          {/* Search Icon */}
          <Search
            className={`absolute ${
              isRTL ? 'right-3' : 'left-3'
            } top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4 transition-colors ${
              isSearching ? 'text-primary animate-pulse' : ''
            }`}
          />

          {/* Search Input */}
          <Input
            type="text"
            value={localValue}
            onChange={handleChange}
            placeholder={placeholder || t('filter.searchInput')}
            className={`
            border border-slate-200 bg-[#EFEFEF]
            ${isRTL ? 'pr-9 pl-9' : 'pl-9 pr-9'}
            h-10 rounded-xl
            focus-visible:ring-primary/30
            transition-all duration-200
            ${isSearching ? 'ring-2 ring-primary/20' : ''}
          `}
            autoComplete="off"
            spellCheck="false"
          />

          {/* Clear Button */}
          {localValue && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={handleClear}
              className={`
              absolute ${isRTL ? 'left-1' : 'right-1'}
              top-1/2 transform -translate-y-1/2
              h-8 w-8 p-0
              hover:bg-slate-100
              rounded-md
              transition-all duration-200
            `}
              aria-label="Clear search"
            >
              <X className="h-3 w-3" />
            </Button>
          )}
        </div>

        {/* Search Status Indicator */}
        {isSearching && (
          <div className="absolute -bottom-6 left-0 text-xs text-primary animate-pulse">
            {t('filter.searching', { defaultValue: 'Searching...' })}
          </div>
        )}
      </form>
    );
  },
);

OptimizedSearchInput.displayName = 'OptimizedSearchInput';

export default OptimizedSearchInput;
