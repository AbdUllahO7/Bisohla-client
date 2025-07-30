'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
  useMemo,
  useRef,
} from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import type { QueryParams, FilterGroup, Filter } from '@/core/entities/api/api';
import { useDebounce } from '@/hooks/use-debounce';

// Filter state interface
export interface FilterState {
  governorate: string;
  city: string;
  marka: string;
  model: string;
  trim: string;
  minYear: string;
  maxYear: string;
  minPrice: string;
  maxPrice: string;
  currency: string;
  minMileage: string;
  maxMileage: string;
  transmission: string;
  fuelType: string;
  bodyType: string;
  listingType: string;
  selectedBrands: string[];
}

// Search state interface
export interface SearchState {
  searchText: string;
}

// Initial states
const initialFilterState: FilterState = {
  governorate: '',
  city: '',
  marka: '',
  model: '',
  trim: '',
  minYear: '',
  maxYear: '',
  minPrice: '',
  maxPrice: '',
  currency: '',
  minMileage: '',
  maxMileage: '',
  transmission: '',
  fuelType: '',
  bodyType: '',
  listingType: '',
  selectedBrands: [],
};

const initialSearchState: SearchState = {
  searchText: '',
};

// Context interface
interface FilterContextValue {
  // State
  filters: FilterState;
  searchState: SearchState;
  queryParams: QueryParams;
  isLoading: boolean;

  // Filter actions
  updateFilter: (key: keyof FilterState, value: string | string[]) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleBrand: (brandId: string) => void;
  selectModel: (modelId: string) => void;
  selectTrim: (trimId: string) => void;
  updateSearchText: (text: string) => void;

  // URL sync
  syncFromUrl: () => void;
}

// Create context
const FilterContext = createContext<FilterContextValue | undefined>(undefined);

// Hook to use filter context
export const useFilters = (): FilterContextValue => {
  const context = useContext(FilterContext);
  if (!context) {
    throw new Error('useFilters must be used within a FilterProvider');
  }
  return context;
};

// Provider props
interface FilterProviderProps {
  children: React.ReactNode;
  onFiltersChange?: (queryParams: QueryParams) => void;
}

// Filter Provider component
export const FilterProvider: React.FC<FilterProviderProps> = ({
  children,
  onFiltersChange,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const pathname = usePathname(); // Add pathname to detect URL changes

  // State
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [searchState, setSearchState] =
    useState<SearchState>(initialSearchState);
  const [isLoading, setIsLoading] = useState(false);

  // Refs for optimization
  const isInitialMount = useRef(true);
  const lastApiCallParams = useRef<string>('');
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const hasUncommittedChanges = useRef(false);
  const lastSearchParamsString = useRef<string>(''); // Track search params changes

  // Separate debounce instances with different delays
  const debouncedSearchText = useDebounce(searchState.searchText, 1000);
  const debouncedFiltersForApi = useDebounce(filters, 800);
  const debouncedFiltersForUrl = useDebounce(filters, 200);
  const debouncedSearchForUrl = useDebounce(searchState.searchText, 200);

  // Memoized function to build query params
  const buildQueryParams = useCallback(
    (currentFilters: FilterState, currentSearchText: string): QueryParams => {
      const filterGroups: FilterGroup[] = [];

      // Search filter group
      if (currentSearchText.trim()) {
        const searchFilters: Filter[] = [
          {
            field: 'title',
            operator: 'like',
            value: `%${currentSearchText.trim()}%`,
          },
          {
            field: 'description',
            operator: 'like',
            value: `%${currentSearchText.trim()}%`,
          },
        ];

        filterGroups.push({
          operator: 'or',
          filters: searchFilters,
        });
      }

      // Listing type filter
      if (currentFilters.listingType) {
        filterGroups.push({
          operator: 'and',
          filters: [
            {
              field: 'listingType',
              operator: 'eq',
              value: currentFilters.listingType,
            },
          ],
        });
      }

      // Car details filter group
      const carDetailsFilters: Filter[] = [];
      if (currentFilters.marka) {
        carDetailsFilters.push({
          field: 'makeId',
          operator: 'eq',
          value: currentFilters.marka,
        });
      }
      if (currentFilters.model) {
        carDetailsFilters.push({
          field: 'modelId',
          operator: 'eq',
          value: currentFilters.model,
        });
      }
      if (currentFilters.trim) {
        carDetailsFilters.push({
          field: 'trimId',
          operator: 'eq',
          value: currentFilters.trim,
        });
      }
      if (carDetailsFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: carDetailsFilters,
        });
      }

      // Location filter group
      const locationFilters: Filter[] = [];
      if (currentFilters.governorate) {
        locationFilters.push({
          field: 'governorate',
          operator: 'eq',
          value: currentFilters.governorate,
        });
      }
      if (currentFilters.city) {
        locationFilters.push({
          field: 'city',
          operator: 'eq',
          value: currentFilters.city,
        });
      }
      if (locationFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: locationFilters,
        });
      }

      // Technical details filter group
      const technicalDetailsFilters: Filter[] = [];

      if (currentFilters.minYear) {
        technicalDetailsFilters.push({
          field: 'details.year',
          operator: 'gte',
          value: parseInt(currentFilters.minYear, 10),
        });
      }
      if (currentFilters.maxYear) {
        technicalDetailsFilters.push({
          field: 'details.year',
          operator: 'lte',
          value: parseInt(currentFilters.maxYear, 10),
        });
      }
      if (currentFilters.minMileage) {
        technicalDetailsFilters.push({
          field: 'details.mileage',
          operator: 'gte',
          value: parseInt(currentFilters.minMileage, 10),
        });
      }
      if (currentFilters.maxMileage) {
        technicalDetailsFilters.push({
          field: 'details.mileage',
          operator: 'lte',
          value: parseInt(currentFilters.maxMileage, 10),
        });
      }
      if (currentFilters.transmission) {
        technicalDetailsFilters.push({
          field: 'details.transmission',
          operator: 'eq',
          value: currentFilters.transmission,
        });
      }
      if (currentFilters.fuelType) {
        technicalDetailsFilters.push({
          field: 'details.fuelType',
          operator: 'eq',
          value: currentFilters.fuelType,
        });
      }
      if (currentFilters.bodyType) {
        technicalDetailsFilters.push({
          field: 'details.bodyType',
          operator: 'eq',
          value: currentFilters.bodyType,
        });
      }

      if (technicalDetailsFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: technicalDetailsFilters,
        });
      }

      // Price filter group
      const priceFilters: Filter[] = [];
      if (currentFilters.minPrice) {
        priceFilters.push({
          field: 'price',
          operator: 'gte',
          value: parseInt(currentFilters.minPrice, 10),
        });
      }
      if (currentFilters.maxPrice) {
        priceFilters.push({
          field: 'price',
          operator: 'lte',
          value: parseInt(currentFilters.maxPrice, 10),
        });
      }
      if (priceFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: priceFilters,
        });
      }

      // Currency filter
      if (currentFilters.currency) {
        filterGroups.push({
          operator: 'and',
          filters: [
            {
              field: 'currency',
              operator: 'eq',
              value: currentFilters.currency,
            },
          ],
        });
      }

      return {
        page: 1,
        pageSize: 8,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
      };
    },
    [],
  );

  // Query params for API calls (heavily debounced)
  const apiQueryParams = useMemo(() => {
    const params = buildQueryParams(
      debouncedFiltersForApi,
      debouncedSearchText,
    );
    const paramsString = JSON.stringify(params);

    // Only return new params if they've actually changed
    if (lastApiCallParams.current !== paramsString) {
      lastApiCallParams.current = paramsString;
      return params;
    }

    return JSON.parse(lastApiCallParams.current || '{}') as QueryParams;
  }, [debouncedFiltersForApi, debouncedSearchText, buildQueryParams]);

  // Immediate query params for UI/context consumers (not debounced)
  const immediateQueryParams = useMemo(() => {
    return buildQueryParams(filters, searchState.searchText);
  }, [filters, searchState.searchText, buildQueryParams]);

  // Filter actions with optimizations
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | string[]) => {
      hasUncommittedChanges.current = true;

      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };

        // Handle cascading updates
        if (key === 'governorate' && value !== prev.governorate) {
          newFilters.city = '';
        }
        if (key === 'marka' && value !== prev.marka) {
          newFilters.model = '';
          newFilters.trim = '';
          if (value) {
            newFilters.selectedBrands = [value as string];
          } else {
            newFilters.selectedBrands = [];
          }
        }
        if (key === 'model' && value !== prev.model) {
          newFilters.trim = '';
        }

        return newFilters;
      });
    },
    [],
  );

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    hasUncommittedChanges.current = true;
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    hasUncommittedChanges.current = true;
    setFilters(initialFilterState);
    setSearchState(initialSearchState);
  }, []);

  const toggleBrand = useCallback((brandId: string) => {
    hasUncommittedChanges.current = true;
    setFilters((prev) => {
      const isSelected = prev.selectedBrands.includes(brandId);
      let newSelectedBrands: string[];
      let newMarka = prev.marka;
      let newModel = '';
      let newTrim = '';

      if (isSelected) {
        newSelectedBrands = prev.selectedBrands.filter((id) => id !== brandId);
        if (prev.marka === brandId) {
          newMarka = '';
        }
      } else {
        newSelectedBrands = [brandId];
        newMarka = brandId;
      }

      return {
        ...prev,
        selectedBrands: newSelectedBrands,
        marka: newMarka,
        model: newModel,
        trim: newTrim,
      };
    });
  }, []);

  const selectModel = useCallback((modelId: string) => {
    hasUncommittedChanges.current = true;
    setFilters((prev) => ({
      ...prev,
      model: modelId,
      trim: '', // Clear trim when model changes
    }));
  }, []);

  const selectTrim = useCallback((trimId: string) => {
    hasUncommittedChanges.current = true;
    setFilters((prev) => ({
      ...prev,
      trim: trimId,
    }));
  }, []);

  const updateSearchText = useCallback((text: string) => {
    hasUncommittedChanges.current = true;
    setSearchState((prev) => ({ ...prev, searchText: text }));
  }, []);

  // Optimized URL sync
  const syncFromUrl = useCallback(() => {
    if (!searchParams) return;

    const newFilters: Partial<FilterState> = {};
    const newSearchState: Partial<SearchState> = {};

    // Helper function to decode URL parameters properly
    const getDecodedParam = (key: string): string | null => {
      const value = searchParams.get(key);
      if (!value) return null;

      // Decode URI component and replace + with spaces for search terms
      if (key === 'search') {
        return decodeURIComponent(value.replace(/\+/g, ' '));
      }

      return decodeURIComponent(value);
    };

    const urlParams = {
      search: getDecodedParam('search'),
      make: getDecodedParam('make'),
      model: getDecodedParam('model'),
      trim: getDecodedParam('trim'),
      minYear: getDecodedParam('minYear'),
      maxYear: getDecodedParam('maxYear'),
      minPrice: getDecodedParam('minPrice'),
      maxPrice: getDecodedParam('maxPrice'),
      minMileage: getDecodedParam('minMileage'),
      maxMileage: getDecodedParam('maxMileage'),
      currency: getDecodedParam('currency'),
      governorate: getDecodedParam('governorate'),
      city: getDecodedParam('city'),
      transmission: getDecodedParam('transmission'),
      fuelType: getDecodedParam('fuelType'),
      bodyType: getDecodedParam('bodyType'),
      listingType: getDecodedParam('listingType'),
    };

    if (urlParams.search) newSearchState.searchText = urlParams.search;
    if (urlParams.make) {
      newFilters.marka = urlParams.make;
      newFilters.selectedBrands = [urlParams.make];
    }
    if (urlParams.model) newFilters.model = urlParams.model;
    if (urlParams.trim) newFilters.trim = urlParams.trim;
    if (urlParams.minYear) newFilters.minYear = urlParams.minYear;
    if (urlParams.maxYear) newFilters.maxYear = urlParams.maxYear;
    if (urlParams.minPrice) newFilters.minPrice = urlParams.minPrice;
    if (urlParams.maxPrice) newFilters.maxPrice = urlParams.maxPrice;
    if (urlParams.minMileage) newFilters.minMileage = urlParams.minMileage;
    if (urlParams.maxMileage) newFilters.maxMileage = urlParams.maxMileage;
    if (urlParams.currency) newFilters.currency = urlParams.currency;
    if (urlParams.governorate) newFilters.governorate = urlParams.governorate;
    if (urlParams.city) newFilters.city = urlParams.city;
    if (urlParams.transmission)
      newFilters.transmission = urlParams.transmission;
    if (urlParams.fuelType) newFilters.fuelType = urlParams.fuelType;
    if (urlParams.bodyType) newFilters.bodyType = urlParams.bodyType;
    if (urlParams.listingType) newFilters.listingType = urlParams.listingType;

    if (Object.keys(newFilters).length > 0) {
      setFilters((prev) => ({ ...prev, ...newFilters }));
    }
    if (Object.keys(newSearchState).length > 0) {
      setSearchState((prev) => ({ ...prev, ...newSearchState }));
    }
  }, [searchParams]);

  // Batch URL updates to prevent excessive history entries
  const updateUrl = useCallback(() => {
    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      const params = new URLSearchParams();

      // Special handling for search text to preserve spaces
      if (debouncedSearchForUrl) {
        params.set('search', encodeURIComponent(debouncedSearchForUrl));
      }

      if (debouncedFiltersForUrl.marka)
        params.set('make', debouncedFiltersForUrl.marka);
      if (debouncedFiltersForUrl.model)
        params.set('model', debouncedFiltersForUrl.model);
      if (debouncedFiltersForUrl.trim)
        params.set('trim', debouncedFiltersForUrl.trim);
      if (debouncedFiltersForUrl.minYear)
        params.set('minYear', debouncedFiltersForUrl.minYear);
      if (debouncedFiltersForUrl.maxYear)
        params.set('maxYear', debouncedFiltersForUrl.maxYear);
      if (debouncedFiltersForUrl.minPrice)
        params.set('minPrice', debouncedFiltersForUrl.minPrice);
      if (debouncedFiltersForUrl.maxPrice)
        params.set('maxPrice', debouncedFiltersForUrl.maxPrice);
      if (debouncedFiltersForUrl.minMileage)
        params.set('minMileage', debouncedFiltersForUrl.minMileage);
      if (debouncedFiltersForUrl.maxMileage)
        params.set('maxMileage', debouncedFiltersForUrl.maxMileage);
      if (debouncedFiltersForUrl.currency)
        params.set('currency', debouncedFiltersForUrl.currency);
      if (debouncedFiltersForUrl.governorate)
        params.set('governorate', debouncedFiltersForUrl.governorate);
      if (debouncedFiltersForUrl.city)
        params.set('city', debouncedFiltersForUrl.city);
      if (debouncedFiltersForUrl.transmission)
        params.set('transmission', debouncedFiltersForUrl.transmission);
      if (debouncedFiltersForUrl.fuelType)
        params.set('fuelType', debouncedFiltersForUrl.fuelType);
      if (debouncedFiltersForUrl.bodyType)
        params.set('bodyType', debouncedFiltersForUrl.bodyType);
      if (debouncedFiltersForUrl.listingType)
        params.set('listingType', debouncedFiltersForUrl.listingType);

      const newUrl = params.toString()
        ? `?${params.toString()}`
        : window.location.pathname;

      router.push(newUrl, { scroll: false });
      hasUncommittedChanges.current = false;
    }, 100);
  }, [debouncedFiltersForUrl, debouncedSearchForUrl, router]);

  // Initial URL sync
  useEffect(() => {
    if (isInitialMount.current) {
      syncFromUrl();
      isInitialMount.current = false;
    }
  }, [syncFromUrl]);

  // NEW: Listen for URL changes after initial mount
  useEffect(() => {
    if (!isInitialMount.current && searchParams) {
      const currentSearchParamsString = searchParams.toString();

      // Only sync if search params actually changed
      if (lastSearchParamsString.current !== currentSearchParamsString) {
        lastSearchParamsString.current = currentSearchParamsString;

        // Don't trigger URL updates for changes we detect from URL
        hasUncommittedChanges.current = false;
        syncFromUrl();
      }
    }
  }, [searchParams, syncFromUrl]);

  // Update URL when debounced values change (only if changes came from user interaction)
  useEffect(() => {
    if (!isInitialMount.current && hasUncommittedChanges.current) {
      updateUrl();
    }
  }, [debouncedFiltersForUrl, debouncedSearchForUrl, updateUrl]);

  // Call API callback only when heavily debounced params change
  useEffect(() => {
    if (!isInitialMount.current && onFiltersChange) {
      onFiltersChange(apiQueryParams);
    }
  }, [apiQueryParams, onFiltersChange]);

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (urlUpdateTimeoutRef.current) {
        clearTimeout(urlUpdateTimeoutRef.current);
      }
    };
  }, []);

  // Stable context value with React.useMemo and proper dependencies
  const contextValue = useMemo(
    () => ({
      filters,
      searchState,
      queryParams: immediateQueryParams,
      isLoading,
      updateFilter,
      updateFilters,
      resetFilters,
      toggleBrand,
      updateSearchText,
      syncFromUrl,
      selectModel,
      selectTrim,
    }),
    [
      filters,
      searchState,
      immediateQueryParams,
      isLoading,
      updateFilter,
      updateFilters,
      resetFilters,
      toggleBrand,
      updateSearchText,
      syncFromUrl,
      selectModel,
      selectTrim,
    ],
  );

  return (
    <FilterContext.Provider value={contextValue}>
      {children}
    </FilterContext.Provider>
  );
};
