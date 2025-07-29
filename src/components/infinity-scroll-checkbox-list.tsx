import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import { Search, Loader2 } from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import Image from 'next/image';
import { useLocale } from 'next-intl';

interface InfiniteScrollCheckboxListProps<T extends Record<string, any>> {
  // Data fetching
  queryKey: string[];
  fetchFn: (params: QueryParams) => Promise<PaginatedResponse<T>>;

  // Display configuration
  labelField: keyof T;
  valueField: keyof T;
  logoField?: keyof T;

  // Selection
  selectedValues: string[];
  onToggle: (value: string) => void;

  // UI
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;

  // Styling (matching your existing style)
  className?: string;

  // Performance
  pageSize?: number;
  searchDebounce?: number;

  // Additional filters
  additionalFilters?: any[];
}

const InfiniteScrollCheckboxList = <T extends Record<string, any>>({
  queryKey,
  fetchFn,
  labelField,
  valueField,
  logoField,
  selectedValues = [],
  onToggle,
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options found',
  loadingMessage = 'Loading...',
  className = '',
  pageSize = 20,
  searchDebounce = 300,
  additionalFilters = [],
}: InfiniteScrollCheckboxListProps<T>) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const debouncedSearch = useDebounce(searchTerm, searchDebounce);

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
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
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

  // Intersection observer for infinite scroll
  useEffect(() => {
    if (!observerRef.current) return;

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
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleToggle = useCallback(
    (value: string) => {
      onToggle(value);
    },
    [onToggle],
  );

  // Your existing CarBrandCheckboxItem component logic, but as a local component
  const CheckboxItem = React.memo(({ option }: { option: any }) => (
    <div className="flex items-center p-2 my-1 rounded-md hover:bg-slate-50 transition-colors">
      <Checkbox
        id={`brand-${option.value}`}
        checked={selectedValues.includes(option.value)}
        onCheckedChange={() => handleToggle(option.value)}
        className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
      />
      <Label
        htmlFor={`brand-${option.value}`}
        className={`text-sm text-slate-700 font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 ${
          isRTL ? 'pr-2 mr-auto' : 'pl-2'
        } flex items-center cursor-pointer w-full`}
      >
        {option.logoUrl && (
          <Image
            src={option.logoUrl || '/placeholder.svg'}
            alt={option.label}
            width={24}
            height={24}
            className={isRTL ? 'ml-2' : 'mr-2'}
          />
        )}
        {option.label}
      </Label>
    </div>
  ));

  CheckboxItem.displayName = 'CheckboxItem';

  return (
    <div className={className}>
      {/* Search Input - Same style as your existing search */}
      <div className="mb-3">
        <div className="relative">
          <Search
            className={`absolute ${
              isRTL ? 'right-3' : 'left-3'
            } top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4`}
          />
          <input
            ref={searchInputRef}
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder={searchPlaceholder}
            className={`w-full border border-slate-200 bg-[#EFEFEF] ${
              isRTL ? 'pr-9 pl-3' : 'pl-9 pr-3'
            } h-8 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30`}
          />
        </div>
      </div>

      {/* Scrollable List - Same style as your existing max-h-64 */}
      <div
        ref={listRef}
        className="max-h-64 overflow-y-auto pr-1 custom-scrollbar"
      >
        {isError ? (
          <div className="p-3 text-sm text-red-600 text-center">
            Failed to load options. Please try again.
          </div>
        ) : options.length === 0 && !isLoading ? (
          <div className="p-3 text-sm text-slate-500 text-center">
            {noOptionsMessage}
          </div>
        ) : (
          <>
            {/* Render checkboxes exactly like your existing CarBrandCheckboxItem */}
            {options.map((option) => (
              <CheckboxItem key={option.value} option={option} />
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
  );
};

export default InfiniteScrollCheckboxList;
