import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { ChevronDown, Search, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { cn } from '@/lib/utils';
import { useDebounce } from '@/hooks/use-debounce';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';

interface AccordionDropdownProps<T extends Record<string, any>> {
  // Data fetching
  queryKey: string[];
  fetchFn: (params: QueryParams) => Promise<PaginatedResponse<T>>;

  // Display configuration
  labelField: keyof T;
  valueField: keyof T;
  logoField?: keyof T;

  // Selection
  value?: string;
  onChange?: (name: string, value: string) => void;
  name?: string;

  // UI
  placeholder: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;

  // State
  disabled?: boolean;

  // Styling
  className?: string;

  // Performance
  pageSize?: number;
  searchDebounce?: number;

  // Additional filters
  additionalFilters?: any[];
}

const AccordionDropdown = <T extends Record<string, any>>({
  queryKey,
  fetchFn,
  labelField,
  valueField,
  logoField,
  value,
  onChange,
  name = '',
  placeholder,
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options found',
  loadingMessage = 'Loading...',
  disabled = false,
  className = '',
  pageSize = 20,
  searchDebounce = 300,
  additionalFilters = [],
}: AccordionDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, searchDebounce);

  const dropdownRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Build query params
  const queryParams = useMemo(
    (): QueryParams => ({
      page: 1,
      pageSize,
      searchTerm: debouncedSearch || undefined,
      searchKey: labelField as string,
      where: additionalFilters.length > 0 ? additionalFilters : undefined,
    }),
    [debouncedSearch, pageSize, labelField, additionalFilters],
  );

  // Infinite query
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: [...queryKey, queryParams],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchFn({
        ...queryParams,
        page: Number(pageParam),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch options');
      }

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined;
      return lastPage.data.hasNextPage
        ? Number(lastPage.data.currentPage) + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
    enabled: isOpen, // Only fetch when dropdown is open
  });

  // Transform data to options
  const options = useMemo(
    () =>
      data?.pages.flatMap(
        (page) =>
          page.data?.data.map((item) => ({
            value: String(item[valueField]),
            label: String(item[labelField]),
            logoUrl: logoField ? String(item[logoField]) : undefined,
          })) || [],
      ) || [],
    [data?.pages, labelField, valueField, logoField],
  );

  // Find selected option
  const selectedOption = useMemo(
    () => options.find((option) => option.value === value),
    [options, value],
  );

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!isOpen || !observerRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        root: listRef.current,
        threshold: 0.1,
        rootMargin: '20px',
      },
    );

    observer.observe(observerRef.current);

    return () => observer.disconnect();
  }, [isOpen, hasNextPage, isFetchingNextPage, fetchNextPage]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      return () =>
        document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [isOpen]);

  // Focus search input when dropdown opens
  useEffect(() => {
    if (isOpen && searchInputRef.current) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  // Reset search when closing
  useEffect(() => {
    if (!isOpen) {
      setSearchTerm('');
    }
  }, [isOpen]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  }, [disabled, isOpen]);

  const handleOptionSelect = useCallback(
    (selectedValue: string) => {
      if (onChange) {
        onChange(name, selectedValue);
      }
      setIsOpen(false);
      setSearchTerm('');
    },
    [onChange, name],
  );

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setIsOpen(false);
    }
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={handleToggle}
        onKeyDown={handleKeyDown}
        disabled={disabled}
        className={cn(
          'w-full flex items-center justify-between',
          'border border-[#EFEFEF] rounded-lg p-2.5 shadow-sm',
          'bg-white hover:bg-slate-50 transition-colors',
          'text-slate-800 text-left',
          disabled && 'bg-slate-100 text-slate-400 cursor-not-allowed',
          isOpen && 'border-primary ring-1 ring-primary',
          className,
        )}
      >
        <div className="flex items-center flex-1 min-w-0">
          {selectedOption ? (
            <div className="flex items-center gap-2">
              {selectedOption.logoUrl && (
                <img
                  src={selectedOption.logoUrl}
                  alt={selectedOption.label}
                  className="w-5 h-5 rounded-sm object-contain"
                />
              )}
              <span className="truncate">{selectedOption.label}</span>
            </div>
          ) : (
            <span className="text-slate-500">{placeholder}</span>
          )}
        </div>
        <ChevronDown
          className={cn(
            'w-4 h-4 text-slate-400 transition-transform flex-shrink-0',
            isOpen && 'transform rotate-180',
          )}
        />
      </button>

      {/* Normal Dropdown Content - No Portal, No Weird Positioning */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-white border border-slate-200 rounded-lg shadow-lg">
          {/* Search Input */}
          <div className="p-3 border-b border-slate-100">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchTerm}
                onChange={handleSearchChange}
                placeholder={searchPlaceholder}
                className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary"
              />
            </div>
          </div>

          {/* Options List */}
          <div ref={listRef} className="max-h-60 overflow-y-auto">
            {isError ? (
              <div className="p-3 text-sm text-red-600">
                Failed to load options. Please try again.
              </div>
            ) : options.length === 0 && !isLoading ? (
              <div className="p-3 text-sm text-slate-500 text-center">
                {noOptionsMessage}
              </div>
            ) : (
              <>
                {options.map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => handleOptionSelect(option.value)}
                    className={cn(
                      'w-full flex items-center gap-2 px-3 py-2 text-left text-sm',
                      'hover:bg-slate-50 transition-colors',
                      option.value === value &&
                        'bg-primary/10 text-primary font-medium',
                    )}
                  >
                    {option.logoUrl && (
                      <img
                        src={option.logoUrl}
                        alt={option.label}
                        className="w-5 h-5 rounded-sm object-contain"
                      />
                    )}
                    <span className="truncate">{option.label}</span>
                  </button>
                ))}

                {/* Loading indicator */}
                {(isLoading || isFetchingNextPage) && (
                  <div className="flex justify-center items-center p-3">
                    <Loader2 className="w-4 h-4 animate-spin text-primary" />
                    <span className="ml-2 text-sm text-slate-500">
                      {loadingMessage}
                    </span>
                  </div>
                )}

                {/* Intersection observer target for infinite scroll */}
                {hasNextPage && (
                  <div
                    ref={observerRef}
                    className="h-4 w-full"
                    style={{ minHeight: '20px' }}
                  />
                )}
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default AccordionDropdown;
