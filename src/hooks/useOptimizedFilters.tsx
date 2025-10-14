// hooks/useOptimizedFilters.ts - Custom hook for filter management
import { useState, useCallback, useMemo, useRef, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { QueryParams, FilterGroup, Filter } from '@/core/entities/api/api';

// Custom debounce hook
function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
}

export interface FilterState {
  // Location
  governorate?: string;
  city?: string;

  // Car details
  make?: string;
  model?: string;
  trim?: string;

  // Technical specs
  transmission?: string;
  fuelType?: string;
  bodyType?: string;

  // Ranges
  minYear?: string;
  maxYear?: string;
  minPrice?: string;
  maxPrice?: string;
  minMileage?: string;
  maxMileage?: string;

  // Other
  currency?: string;
  searchTerm?: string;
}

export const useOptimizedFilters = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const hasInitialized = useRef(false);
  const isUpdatingUrl = useRef(false);

  // Single state object for all filters
  const [filters, setFilters] = useState<FilterState>({});

  // Separate page state
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc');

  // Debounced values for search and URL updates
  const debouncedSearchTerm = useDebounce(filters.searchTerm || '', 800);
  const debouncedFilters = useDebounce(filters, 1000);

  // Initialize from URL params
  useEffect(() => {
    if (hasInitialized.current || !searchParams) return;

    const urlFilters: FilterState = {
      governorate: searchParams.get('governorate') || undefined,
      city: searchParams.get('city') || undefined,
      make: searchParams.get('make') || undefined,
      model: searchParams.get('model') || undefined,
      trim: searchParams.get('trim') || undefined,
      transmission: searchParams.get('transmission') || undefined,
      fuelType: searchParams.get('fuelType') || undefined,
      bodyType: searchParams.get('bodyType') || undefined,
      currency: searchParams.get('currency') || undefined,
      searchTerm: searchParams.get('search') || undefined,
      minYear: searchParams.get('minYear') || undefined,
      maxYear: searchParams.get('maxYear') || undefined,
      minPrice: searchParams.get('minPrice') || undefined,
      maxPrice: searchParams.get('maxPrice') || undefined,
      minMileage: searchParams.get('minMileage') || undefined,
      maxMileage: searchParams.get('maxMileage') || undefined,
    };

    setFilters(urlFilters);
    hasInitialized.current = true;
  }, [searchParams]);

  // Update URL when filters change (debounced)
  useEffect(() => {
    if (!hasInitialized.current || isUpdatingUrl.current) return;

    const params = new URLSearchParams();

    Object.entries(debouncedFilters).forEach(([key, value]) => {
      if (value && value !== '') {
        if (key === 'searchTerm') {
          params.set('search', value);
        } else {
          params.set(key, value);
        }
      }
    });

    const queryString = params.toString();
    const newUrl = queryString ? `?${queryString}` : window.location.pathname;

    isUpdatingUrl.current = true;
    router.replace(newUrl, { scroll: false });

    setTimeout(() => {
      isUpdatingUrl.current = false;
    }, 100);
  }, [debouncedFilters, router]);

  // Update filter function with dependency handling
  const updateFilter = useCallback(
    (key: keyof FilterState, value: string | undefined) => {
      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };

        // Handle cascading dependencies
        if (key === 'governorate' && value !== prev.governorate) {
          newFilters.city = undefined;
        }
        if (key === 'make' && value !== prev.make) {
          newFilters.model = undefined;
          newFilters.trim = undefined;
        }
        if (key === 'model' && value !== prev.model) {
          newFilters.trim = undefined;
        }

        return newFilters;
      });

      // Reset page when filters change (except search)
      if (key !== 'searchTerm') {
        setCurrentPage(1);
      }
    },
    [],
  );

  // Batch update filters
  const updateFilters = useCallback((newFilters: Partial<FilterState>) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  // Reset all filters
  const resetFilters = useCallback(() => {
    setFilters({});
    setCurrentPage(1);
  }, []);

  // Build filter groups for API
  const filterGroups = useMemo((): FilterGroup[] => {
    const groups: FilterGroup[] = [];

    // Car details filter group
    const carDetailsFilters: Filter[] = [];
    if (filters.make) {
      carDetailsFilters.push({
        field: 'makeId',
        operator: 'eq',
        value: filters.make,
      });
    }
    if (filters.model) {
      carDetailsFilters.push({
        field: 'modelId',
        operator: 'eq',
        value: filters.model,
      });
    }
    if (filters.trim) {
      carDetailsFilters.push({
        field: 'trimId',
        operator: 'eq',
        value: filters.trim,
      });
    }
    if (carDetailsFilters.length > 0) {
      groups.push({ operator: 'and', filters: carDetailsFilters });
    }

    // Location filter group
    const locationFilters: Filter[] = [];
    if (filters.governorate) {
      locationFilters.push({
        field: 'governorate',
        operator: 'eq',
        value: filters.governorate,
      });
    }
    if (filters.city) {
      locationFilters.push({
        field: 'city',
        operator: 'eq',
        value: filters.city,
      });
    }
    if (locationFilters.length > 0) {
      groups.push({ operator: 'and', filters: locationFilters });
    }

    // Technical details filter group
    const technicalFilters: Filter[] = [];
    if (filters.minYear) {
      technicalFilters.push({
        field: 'details.year',
        operator: 'gte',
        value: parseInt(filters.minYear, 10),
      });
    }
    if (filters.maxYear) {
      technicalFilters.push({
        field: 'details.year',
        operator: 'lte',
        value: parseInt(filters.maxYear, 10),
      });
    }
    if (filters.transmission) {
      technicalFilters.push({
        field: 'details.transmission',
        operator: 'eq',
        value: filters.transmission,
      });
    }
    if (filters.fuelType) {
      technicalFilters.push({
        field: 'details.fuelType',
        operator: 'eq',
        value: filters.fuelType,
      });
    }
    if (filters.bodyType) {
      technicalFilters.push({
        field: 'details.bodyType',
        operator: 'eq',
        value: filters.bodyType,
      });
    }
    if (filters.minMileage) {
      technicalFilters.push({
        field: 'details.mileage',
        operator: 'gte',
        value: parseInt(filters.minMileage, 10),
      });
    }
    if (filters.maxMileage) {
      technicalFilters.push({
        field: 'details.mileage',
        operator: 'lte',
        value: parseInt(filters.maxMileage, 10),
      });
    }
    if (technicalFilters.length > 0) {
      groups.push({ operator: 'and', filters: technicalFilters });
    }

    // Price filter group
    const priceFilters: Filter[] = [];
    if (filters.minPrice) {
      priceFilters.push({
        field: 'price',
        operator: 'gte',
        value: parseInt(filters.minPrice, 10),
      });
    }
    if (filters.maxPrice) {
      priceFilters.push({
        field: 'price',
        operator: 'lte',
        value: parseInt(filters.maxPrice, 10),
      });
    }
    if (priceFilters.length > 0) {
      groups.push({ operator: 'and', filters: priceFilters });
    }

    // Currency filter
    if (filters.currency) {
      groups.push({
        operator: 'and',
        filters: [
          {
            field: 'currency',
            operator: 'eq',
            value: filters.currency,
          },
        ],
      });
    }

    return groups;
  }, [filters]);

  // Build query params for TanStack Query
  const queryParams = useMemo(
    (): QueryParams => ({
      page: currentPage,
      pageSize: 8,
      sortBy,
      sortDirection,
      searchKey: 'title',
      searchTerm: debouncedSearchTerm || undefined,
      filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
    }),
    [currentPage, sortBy, sortDirection, debouncedSearchTerm, filterGroups],
  );

  // Check if any filters are active
  const hasActiveFilters = useMemo(() => {
    return Object.values(filters).some((value) => value && value !== '');
  }, [filters]);

  return {
    // State
    filters,
    currentPage,
    sortBy,
    sortDirection,

    // Computed
    queryParams,
    hasActiveFilters,

    // Actions
    updateFilter,
    updateFilters,
    resetFilters,
    setCurrentPage,
    setSortBy,
    setSortDirection,
  };
};
