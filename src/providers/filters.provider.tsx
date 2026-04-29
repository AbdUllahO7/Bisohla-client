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
import { getInjection } from '@/di/container';
import { ListingTypeFilterSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';

// Filter state interface
export interface FilterState {
  governorate: string;
  city: string;
  marka: string; // Keep for backward compatibility, but will be derived from selectedBrands[0]
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
  listingType: string; // ADDED: Listing type filter (Sale/Rent)
  listingTypeId: number; // ADDED: Category ID (e.g. 1 for Cars)
  selectedBrands: string[]; // This is the main source of truth for brands
  attributes: Record<string, any>; // Dynamic attributes from schema
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
  listingType: '', // ADDED: Initialize listing type
  listingTypeId: 0,
  selectedBrands: [],
  attributes: {},
};

const initialSearchState: SearchState = {
  searchText: '',
};

// Context interface
interface FilterContextValue {
  // State
  filters: FilterState;
  searchState: SearchState;
  queryParams: QueryParams; // Debounced query params for API calls
  immediateQueryParams: QueryParams; // Immediate query params for UI
  isLoading: boolean;
  filterSchema: ListingTypeFilterSchemaDto | null;
  listingTypes: any[];

  // Filter actions
  updateFilter: (key: keyof FilterState, value: string | string[] | number) => void;
  updateFilters: (updates: Partial<FilterState>) => void;
  resetFilters: () => void;
  toggleBrand: (brandId: string) => void;
  selectModel: (modelId: string) => void;
  selectTrim: (trimId: string) => void;
  updateSearchText: (text: string) => void;
  updateAttribute: (slug: string, value: any) => void;

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
  const pathname = usePathname();

  // State
  const [filters, setFilters] = useState<FilterState>(initialFilterState);
  const [searchState, setSearchState] =
    useState<SearchState>(initialSearchState);
  const [isLoading, setIsLoading] = useState(false);
  const [filterSchema, setFilterSchema] = useState<ListingTypeFilterSchemaDto | null>(null);
  const [listingTypes, setListingTypes] = useState<any[]>([]);

  // Refs for optimization and tracking
  const isInitialized = useRef(false);
  const lastApiCallParams = useRef<string>('');
  const urlUpdateTimeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const isUpdatingFromUrl = useRef(false);
  const lastSyncedUrlParams = useRef<string>('');
  const userInitiatedChange = useRef(false);

  // Watch for search params changes - this is key for URL reactivity
  const searchParamsString = useMemo(() => {
    return searchParams?.toString() || '';
  }, [searchParams]);

  // Separate debounce instances with different delays
  const debouncedSearchText = useDebounce(searchState.searchText, 1000);
  const debouncedFiltersForApi = useDebounce(filters, 800);
  const debouncedFiltersForUrl = useDebounce(filters, 500);
  const debouncedSearchForUrl = useDebounce(searchState.searchText, 800);

  // Memoized function to build query params
  const buildQueryParams = useCallback(
    (currentFilters: FilterState, currentSearchText: string): QueryParams => {
      const filterGroups: FilterGroup[] = [];
      let searchTerm: string | undefined = undefined;

      // Search filter group
      if (currentSearchText.trim()) {
        searchTerm = currentSearchText.trim();
      }

      // UPDATED: Listing type filter - moved to top for priority
      if (currentFilters.listingType) {
        filterGroups.push({
          operator: 'and',
          filters: [
            {
              field: 'listingOfferType',
              operator: 'eq',
              value: currentFilters.listingType,
            },
          ],
        });
      }

      // Car brands filter group - supports multiple brands with "in" operator
      const carDetailsFilters: Filter[] = [];

      // Use selectedBrands array instead of single marka
      if (currentFilters.selectedBrands.length > 0) {
        if (currentFilters.selectedBrands.length === 1) {
          // Single brand - use 'eq' operator
          carDetailsFilters.push({
            field: 'makeId',
            operator: 'eq',
            value: currentFilters.selectedBrands[0],
          });
        } else {
          // Multiple brands - use 'in' operator
          carDetailsFilters.push({
            field: 'makeId',
            operator: 'in',
            value: currentFilters.selectedBrands,
          });
        }
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

      const query: QueryParams = {
        page: 1,
        pageSize: 12,
        sortBy: 'createdAt',
        sortDirection: 'desc',
        filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
        searchTerm,
      };

      // Add dynamic attributes to filter groups
      if (currentFilters.attributes && Object.keys(currentFilters.attributes).length > 0) {
        const attributeFilters: Filter[] = [];
        Object.entries(currentFilters.attributes).forEach(([slug, value]) => {
          if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
            // Prefix with 'attributeValues.' so the backend resolves against the nested relation
            const field = `attributeValues.${slug}`;
            // Check if it's a range (min/max) or single value
            if (typeof value === 'object' && !Array.isArray(value)) {
              if (value.min) {
                attributeFilters.push({ field, operator: 'gte', value: value.min });
              }
              if (value.max) {
                attributeFilters.push({ field, operator: 'lte', value: value.max });
              }
            } else if (Array.isArray(value)) {
              attributeFilters.push({ field, operator: 'in', value });
            } else {
              attributeFilters.push({ field, operator: 'eq', value });
            }
          }
        });

        if (attributeFilters.length > 0) {
          if (!query.filterGroups) query.filterGroups = [];
          query.filterGroups.push({
            operator: 'and',
            filters: attributeFilters,
          });
        }
      }

      return query;
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
    (key: keyof FilterState, value: string | string[] | number) => {
      userInitiatedChange.current = true;

      setFilters((prev) => {
        const newFilters = { ...prev, [key]: value };

        // Handle category change
        if (key === 'listingTypeId' && value !== prev.listingTypeId) {
          // Clear all category-specific filters
          newFilters.marka = '';
          newFilters.model = '';
          newFilters.trim = '';
          newFilters.bodyType = '';
          newFilters.fuelType = '';
          newFilters.transmission = '';
          newFilters.selectedBrands = [];
          newFilters.minYear = '';
          newFilters.maxYear = '';
          newFilters.minMileage = '';
          newFilters.maxMileage = '';
          newFilters.attributes = {};
        }

        // Handle cascading updates
        if (key === 'governorate' && value !== prev.governorate) {
          newFilters.city = '';
        }

        // Handle selectedBrands updates properly
        if (key === 'selectedBrands') {
          const brands = Array.isArray(value) ? value : [value as string].filter(Boolean);
          newFilters.selectedBrands = brands;
          // Update marka for backward compatibility (use first selected brand)
          newFilters.marka = brands.length > 0 ? brands[0] : '';
          // Clear model and trim when brands change
          newFilters.model = '';
          newFilters.trim = '';
        }

        // Handle single marka update (for backward compatibility)
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

  const updateAttribute = useCallback((slug: string, value: any) => {
    userInitiatedChange.current = true;
    setFilters(prev => ({
      ...prev,
      attributes: {
        ...prev.attributes,
        [slug]: value
      }
    }));
  }, []);

  const updateFilters = useCallback((updates: Partial<FilterState>) => {
    userInitiatedChange.current = true;
    setFilters((prev) => ({ ...prev, ...updates }));
  }, []);

  const resetFilters = useCallback(() => {
    userInitiatedChange.current = true;
    setFilters(initialFilterState);
    setSearchState(initialSearchState);
  }, []);

  // Multi-brand toggle support
  const toggleBrand = useCallback((brandId: string) => {
    userInitiatedChange.current = true;
    setFilters((prev) => {
      const isSelected = prev.selectedBrands.includes(brandId);
      let newSelectedBrands: string[];
      let newModel = '';
      let newTrim = '';

      if (isSelected) {
        // Remove the brand
        newSelectedBrands = prev.selectedBrands.filter((id) => id !== brandId);
      } else {
        // Add the brand - supports multiple brands
        newSelectedBrands = [...prev.selectedBrands, brandId];
      }

      // Update marka for backward compatibility (use first selected brand)
      const newMarka = newSelectedBrands.length > 0 ? newSelectedBrands[0] : '';

      // Clear model and trim when any brand selection changes
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
    userInitiatedChange.current = true;
    setFilters((prev) => ({
      ...prev,
      model: modelId,
      trim: '', // Clear trim when model changes
    }));
  }, []);

  const selectTrim = useCallback((trimId: string) => {
    userInitiatedChange.current = true;
    setFilters((prev) => ({
      ...prev,
      trim: trimId,
    }));
  }, []);

  const updateSearchText = useCallback((text: string) => {
    userInitiatedChange.current = true;
    setSearchState((prev) => ({ ...prev, searchText: text }));
  }, []);

  // IMPROVED: URL sync with better error handling and comparison
  const syncFromUrl = useCallback(() => {
    if (!searchParams) return;

    // Prevent infinite loops
    if (isUpdatingFromUrl.current) return;

    const currentUrlParams = searchParams.toString();

    // Only sync if URL actually changed
    if (lastSyncedUrlParams.current === currentUrlParams) {
      return;
    }

    isUpdatingFromUrl.current = true;
    lastSyncedUrlParams.current = currentUrlParams;

    const newFilters: Partial<FilterState> = {};
    const newSearchState: Partial<SearchState> = {};

    // Helper function to decode URL parameters properly
    const getDecodedParam = (key: string): string | null => {
      const value = searchParams.get(key);
      if (!value) return null;

      try {
        // Decode URI component and replace + with spaces for search terms
        if (key === 'search') {
          return decodeURIComponent(value.replace(/\+/g, ' '));
        }
        return decodeURIComponent(value);
      } catch (error) {
        console.warn(`Failed to decode URL parameter ${key}:`, error);
        return value; // Return raw value if decoding fails
      }
    };

    // Support multiple makes from URL
    const getDecodedArrayParam = (key: string): string[] => {
      const values = searchParams.getAll(key);
      return values.map((value) => {
        try {
          return decodeURIComponent(value);
        } catch (error) {
          console.warn(`Failed to decode URL array parameter ${key}:`, error);
          return value;
        }
      });
    };

    const urlParams = {
      search: getDecodedParam('search'),
      make: getDecodedParam('make'), // Single make for backward compatibility
      makes: getDecodedArrayParam('makes'), // Multiple makes
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
      listingType: getDecodedParam('listingOfferType') || getDecodedParam('listingType'),
      listingTypeId: getDecodedParam('listingTypeId'),
    };

    // Build new state based on URL params
    if (urlParams.search !== null) {
      newSearchState.searchText = urlParams.search;
    } else {
      newSearchState.searchText = '';
    }

    // Handle both single and multiple makes
    if (urlParams.makes.length > 0) {
      // Multiple makes from 'makes' parameter
      newFilters.selectedBrands = urlParams.makes;
      newFilters.marka = urlParams.makes[0]; // First one for backward compatibility
    } else if (urlParams.make) {
      // Single make from 'make' parameter (backward compatibility)
      newFilters.selectedBrands = [urlParams.make];
      newFilters.marka = urlParams.make;
    } else {
      // No makes in URL - reset to empty
      newFilters.selectedBrands = [];
      newFilters.marka = '';
    }

    // Set all other filters, defaulting to empty string if not in URL
    newFilters.model = urlParams.model || '';
    newFilters.trim = urlParams.trim || '';
    newFilters.minYear = urlParams.minYear || '';
    newFilters.maxYear = urlParams.maxYear || '';
    newFilters.minPrice = urlParams.minPrice || '';
    newFilters.maxPrice = urlParams.maxPrice || '';
    newFilters.minMileage = urlParams.minMileage || '';
    newFilters.maxMileage = urlParams.maxMileage || '';
    newFilters.currency = urlParams.currency || '';
    newFilters.governorate = urlParams.governorate || '';
    newFilters.city = urlParams.city || '';
    newFilters.transmission = urlParams.transmission || '';
    newFilters.fuelType = urlParams.fuelType || '';
    newFilters.bodyType = urlParams.bodyType || '';
    newFilters.listingType = urlParams.listingType || '';
    newFilters.listingTypeId = parseInt(urlParams.listingTypeId || '0', 10);

    // Update state
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setSearchState((prev) => ({ ...prev, ...newSearchState }));

    // Reset the flag after a short delay
    setTimeout(() => {
      isUpdatingFromUrl.current = false;
    }, 100);
  }, [searchParams]);

  // IMPROVED: URL update with better conflict resolution
  const updateUrl = useCallback(() => {
    // Don't update URL if we're currently syncing from URL
    if (isUpdatingFromUrl.current) return;

    // Only update URL for user-initiated changes
    if (!userInitiatedChange.current) return;

    if (urlUpdateTimeoutRef.current) {
      clearTimeout(urlUpdateTimeoutRef.current);
    }

    urlUpdateTimeoutRef.current = setTimeout(() => {
      try {
        const params = new URLSearchParams();

        // Special handling for search text to preserve spaces
        if (debouncedSearchForUrl) {
          params.set('search', encodeURIComponent(debouncedSearchForUrl));
        }

        // Handle multiple makes in URL
        if (debouncedFiltersForUrl.selectedBrands.length > 0) {
          if (debouncedFiltersForUrl.selectedBrands.length === 1) {
            // Single make - use 'make' for backward compatibility
            params.set('make', debouncedFiltersForUrl.selectedBrands[0]);
          } else {
            // Multiple makes - use 'makes' parameter
            debouncedFiltersForUrl.selectedBrands.forEach((brand) => {
              params.append('makes', brand);
            });
          }
        }

        // Add other parameters only if they have values
        const paramMap = {
          model: debouncedFiltersForUrl.model,
          trim: debouncedFiltersForUrl.trim,
          minYear: debouncedFiltersForUrl.minYear,
          maxYear: debouncedFiltersForUrl.maxYear,
          minPrice: debouncedFiltersForUrl.minPrice,
          maxPrice: debouncedFiltersForUrl.maxPrice,
          minMileage: debouncedFiltersForUrl.minMileage,
          maxMileage: debouncedFiltersForUrl.maxMileage,
          currency: debouncedFiltersForUrl.currency,
          governorate: debouncedFiltersForUrl.governorate,
          city: debouncedFiltersForUrl.city,
          transmission: debouncedFiltersForUrl.transmission,
          fuelType: debouncedFiltersForUrl.fuelType,
          bodyType: debouncedFiltersForUrl.bodyType,
          listingOfferType: debouncedFiltersForUrl.listingType,
          listingTypeId: String(debouncedFiltersForUrl.listingTypeId),
        };

        Object.entries(paramMap).forEach(([key, value]) => {
          if (value) {
            params.set(key, value);
          }
        });

        const newUrl = params.toString()
          ? `${pathname}?${params.toString()}`
          : pathname;

        // Only update if URL actually changed
        const currentUrl = `${pathname}${window.location.search}`;
        if (currentUrl !== newUrl) {
          router.push(newUrl, { scroll: false });
        }

        userInitiatedChange.current = false;
      } catch (error) {
        console.error('Error updating URL:', error);
        userInitiatedChange.current = false;
      }
    }, 100);
  }, [debouncedFiltersForUrl, debouncedSearchForUrl, router, pathname]);

  // IMPROVED: Initial sync and URL change detection
  useEffect(() => {
    if (!isInitialized.current && searchParams) {
      syncFromUrl();
      isInitialized.current = true;
    }
  }, [syncFromUrl, searchParams]);

  // IMPROVED: Listen for search params changes with better detection
  useEffect(() => {
    if (isInitialized.current && !isUpdatingFromUrl.current) {
      syncFromUrl();
    }
  }, [searchParamsString, syncFromUrl]);

  // Update URL when debounced values change (only for user-initiated changes)
  useEffect(() => {
    if (
      isInitialized.current &&
      userInitiatedChange.current &&
      !isUpdatingFromUrl.current
    ) {
      updateUrl();
    }
  }, [debouncedFiltersForUrl, debouncedSearchForUrl, updateUrl]);

  // Fetch filter schema when listingTypeId changes
  useEffect(() => {
    const fetchSchema = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        console.log("filters.listingTypeId", filters.listingTypeId)
        const res = await controller.getFilterSchema(filters.listingTypeId);
        if (res.success && res.data) {
          setFilterSchema(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter schema in FilterProvider:', error);
      }
    };

    if (filters.listingTypeId) {
      fetchSchema();
    }
  }, [filters.listingTypeId]);

  // Fetch all listing types (categories)
  useEffect(() => {
    const fetchListingTypes = async () => {
      try {
        const controller = getInjection('IListingTypesRepoController');
        const response = await controller.getListingTypes(1, 100);
        if (response.success && response.data) {
          setListingTypes(response.data.data.filter((t: any) => t.isActive));
        }
      } catch (error) {
        console.error('Failed to fetch listing types in FilterProvider:', error);
      }
    };
    fetchListingTypes();
  }, []);

  // Call API callback only when heavily debounced params change
  useEffect(() => {
    if (isInitialized.current && onFiltersChange) {
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
      queryParams: apiQueryParams, // Debounced for API calls
      immediateQueryParams, // Immediate for UI
      isLoading,
      filterSchema,
      listingTypes,
      updateFilter,
      updateAttribute,
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
      apiQueryParams,
      immediateQueryParams,
      isLoading,
      filterSchema,
      listingTypes,
      updateFilter,
      updateAttribute,
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
