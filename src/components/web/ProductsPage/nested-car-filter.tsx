// EnhancedNestedCarFilterV3.tsx
'use client';

import React, {
  useState,
  useRef,
  useEffect,
  useCallback,
  useMemo,
} from 'react';
import {
  Search,
  Loader2,
  ChevronRight,
  ChevronDown,
  X,
  Star,
} from 'lucide-react';
import { useInfiniteQuery } from '@tanstack/react-query';
import { useDebounce } from '@/hooks/use-debounce';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useLocale } from 'next-intl';
import { useSearchParams } from 'next/navigation';
import {
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
} from '@/core/entities/models/cars/cars.dto';

// Enhanced types for better data management
interface EnhancedCarMake {
  value: string;
  label: string;
  logoUrl?: string;
  isSelected?: boolean;
}

interface EnhancedCarModel {
  value: string;
  label: string;
  makeId: string;
  isSelected?: boolean;
}

interface EnhancedCarTrim {
  value: string;
  label: string;
  modelId: string;
  isSelected?: boolean;
}

interface EnhancedNestedCarFilterV3Props {
  // Car Makes Configuration
  carMakesConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams,
    ) => Promise<PaginatedResponse<SelectCarMakeDto>>;
    labelField: keyof SelectCarMakeDto;
    valueField: keyof SelectCarMakeDto;
    logoField?: keyof SelectCarMakeDto;
  };

  // Car Models Configuration
  carModelsConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams,
    ) => Promise<PaginatedResponse<SelectCarModelDto>>;
    labelField: keyof SelectCarModelDto;
    valueField: keyof SelectCarModelDto;
    additionalFilters: any[];
  };

  // Car Trims Configuration
  carTrimsConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams,
    ) => Promise<PaginatedResponse<SelectCarTrimDto>>;
    labelField: keyof SelectCarTrimDto;
    valueField: keyof SelectCarTrimDto;
    additionalFilters: any[];
  };

  // Current selections
  selectedBrands: string[];
  selectedModel: string;
  selectedTrim: string;

  // Callbacks
  onBrandToggle: (brandId: string) => void;
  onModelSelect: (modelId: string) => void;
  onTrimSelect: (trimId: string) => void;

  // UI configuration
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  className?: string;
  pageSize?: number;
  searchDebounce?: number;
  maxHeight?: string;
}

const EnhancedNestedCarFilterV3: React.FC<EnhancedNestedCarFilterV3Props> = ({
  carMakesConfig,
  carModelsConfig,
  carTrimsConfig,
  selectedBrands,
  selectedModel,
  selectedTrim,
  onBrandToggle,
  onModelSelect,
  onTrimSelect,
  searchPlaceholder = 'Search brands...',
  noOptionsMessage = 'No options found',
  loadingMessage = 'Loading...',
  className = '',
  pageSize = 20,
  searchDebounce = 300,
  maxHeight = '20rem', // 320px
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const searchParams = useSearchParams();

  // Get URL parameters for initial state
  const urlMake = searchParams?.get('make') || '';
  const urlModel = searchParams?.get('model') || '';
  const urlTrim = searchParams?.get('trim') || '';

  // Search and UI state
  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Enhanced scroll management state
  const [isUserScrolling, setIsUserScrolling] = useState(false);
  const [canFetchNext, setCanFetchNext] = useState(true);

  // Track selections including URL parameters
  const effectiveSelectedBrands = useMemo(() => {
    const fromProps = selectedBrands || [];
    const fromUrl = urlMake ? [urlMake] : [];
    return [...new Set([...fromProps, ...fromUrl])];
  }, [selectedBrands, urlMake]);

  const effectiveSelectedModel = useMemo(() => {
    return selectedModel || urlModel;
  }, [selectedModel, urlModel]);

  const effectiveSelectedTrim = useMemo(() => {
    return selectedTrim || urlTrim;
  }, [selectedTrim, urlTrim]);

  // Refs for scroll management
  const scrollTimeout = useRef<NodeJS.Timeout | null>(null);
  const fetchCooldownTimeout = useRef<NodeJS.Timeout | null>(null);
  const debouncedSearch = useDebounce(searchTerm, searchDebounce);
  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  // Initialize expansion state based on URL parameters
  useEffect(() => {
    if (!isInitialized) {
      const initialExpandedBrands = new Set<string>();
      const initialExpandedModels = new Set<string>();

      // Auto-expand based on URL parameters
      if (urlMake) {
        initialExpandedBrands.add(urlMake);
      }
      if (urlModel) {
        initialExpandedModels.add(urlModel);
      }

      // Also include current selections
      effectiveSelectedBrands.forEach((brand) =>
        initialExpandedBrands.add(brand),
      );
      if (effectiveSelectedModel) {
        initialExpandedModels.add(effectiveSelectedModel);
      }

      setExpandedBrands(initialExpandedBrands);
      setExpandedModels(initialExpandedModels);
      setIsInitialized(true);
    }
  }, [
    urlMake,
    urlModel,
    effectiveSelectedBrands,
    effectiveSelectedModel,
    isInitialized,
  ]);

  // Car Makes Query with enhanced error handling
  const makesQueryParams = useMemo(
    (): QueryParams => ({
      page: 1,
      pageSize,
      searchTerm: debouncedSearch || undefined,
      searchKey: carMakesConfig.labelField as string,
    }),
    [debouncedSearch, pageSize, carMakesConfig.labelField],
  );

  const {
    data: makesData,
    fetchNextPage: fetchNextMakesPage,
    hasNextPage: hasNextMakesPage,
    isFetchingNextPage: isFetchingNextMakesPage,
    isLoading: isLoadingMakes,
    isError: isErrorMakes,
    error: makesError,
  } = useInfiniteQuery({
    queryKey: [...carMakesConfig.queryKey, makesQueryParams],
    queryFn: async ({ pageParam = 1 }) => {
      try {
        const response = await carMakesConfig.fetchFn({
          ...makesQueryParams,
          page: Number(pageParam),
        });

        if (!response.success) {
          throw new Error(response.message || 'Failed to fetch car makes');
        }

        return response;
      } catch (error) {
        console.error('Error fetching car makes:', error);
        throw error;
      }
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
    retry: 2,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });

  // If we have URL parameters but no data yet, we need to ensure those items are fetched
  // This is a special query to fetch specific makes/models/trims from URL
  const urlItemsQuery = useInfiniteQuery<{
    success: boolean;
    data: {
      data: {
        makes: SelectCarMakeDto[];
        models: SelectCarModelDto[];
        trims: SelectCarTrimDto[];
      };
    };
  }>({
    queryKey: ['url-specific-items', urlMake, urlModel, urlTrim],
    queryFn: async () => {
      // Fetch specific items mentioned in URL
      const results: {
        makes: SelectCarMakeDto[];
        models: SelectCarModelDto[];
        trims: SelectCarTrimDto[];
      } = { makes: [], models: [], trims: [] };

      try {
        // Fetch specific make if in URL
        if (urlMake) {
          const makeResponse = await carMakesConfig.fetchFn({
            page: 1,
            pageSize: 1,
            where: [{ field: 'id', operator: 'eq', value: urlMake }],
          });
          if (makeResponse.success && makeResponse.data?.data) {
            results.makes = makeResponse.data.data;
          }
        }

        // Fetch specific model if in URL
        if (urlModel) {
          const modelResponse = await carModelsConfig.fetchFn({
            page: 1,
            pageSize: 1,
            where: [{ field: 'id', operator: 'eq', value: urlModel }],
          });
          if (modelResponse.success && modelResponse.data?.data) {
            results.models = modelResponse.data.data;
          }
        }

        // Fetch specific trim if in URL
        if (urlTrim) {
          const trimResponse = await carTrimsConfig.fetchFn({
            page: 1,
            pageSize: 1,
            where: [{ field: 'id', operator: 'eq', value: urlTrim }],
          });
          if (trimResponse.success && trimResponse.data?.data) {
            results.trims = trimResponse.data.data;
          }
        }

        return { success: true, data: { data: results } };
      } catch (error) {
        console.error('Error fetching URL-specific items:', error);
        return {
          success: false,
          data: { data: { makes: [], models: [], trims: [] } },
        };
      }
    },
    getNextPageParam: () => undefined, // No pagination for this query
    initialPageParam: 1,
    enabled: !!(urlMake || urlModel || urlTrim), // Only run if we have URL params
    staleTime: 10 * 60 * 1000, // Cache longer since these are specific items
    refetchOnWindowFocus: false,
  });

  // Transform and sort makes data - selected items first
  const makes = useMemo(() => {
    if (!makesData?.pages && !urlItemsQuery.data?.pages) return [];

    try {
      // Combine regular makes data with URL-specific makes
      let allMakes: EnhancedCarMake[] = [];

      // Add makes from regular query
      if (makesData?.pages) {
        const regularMakes = makesData.pages.flatMap(
          (page) =>
            page.data?.data.map((item) => ({
              value: String(item[carMakesConfig.valueField]),
              label: String(item[carMakesConfig.labelField]),
              logoUrl: carMakesConfig.logoField
                ? String(item[carMakesConfig.logoField])
                : undefined,
              isSelected: effectiveSelectedBrands.includes(
                String(item[carMakesConfig.valueField]),
              ),
            })) || [],
        );
        allMakes = [...allMakes, ...regularMakes];
      }

      // Add URL-specific makes if not already present
      if (urlItemsQuery.data?.pages) {
        const urlMakes = urlItemsQuery.data.pages.flatMap((page) => {
          const urlData = page?.data?.data?.makes || [];
          return urlData.map((item: any) => ({
            value: String(item[carMakesConfig.valueField]),
            label: String(item[carMakesConfig.labelField]),
            logoUrl: carMakesConfig.logoField
              ? String(item[carMakesConfig.logoField])
              : undefined,
            isSelected: effectiveSelectedBrands.includes(
              String(item[carMakesConfig.valueField]),
            ),
          }));
        });

        // Add URL makes that aren't already in the list
        urlMakes.forEach((urlMake) => {
          if (!allMakes.find((make) => make.value === urlMake.value)) {
            allMakes.push(urlMake);
          }
        });
      }

      // Remove duplicates and sort: selected items first, then alphabetically
      const uniqueMakes = allMakes.filter(
        (make, index, self) =>
          index === self.findIndex((m) => m.value === make.value),
      );

      return uniqueMakes.sort((a, b) => {
        if (a.isSelected && !b.isSelected) return -1;
        if (!a.isSelected && b.isSelected) return 1;
        return a.label.localeCompare(b.label);
      });
    } catch (error) {
      console.error('Error transforming makes data:', error);
      return [];
    }
  }, [
    makesData?.pages,
    urlItemsQuery.data?.pages,
    carMakesConfig,
    effectiveSelectedBrands,
  ]);

  // Car Models Query hook - enhanced to handle URL parameters
  const useModelsForBrand = useCallback(
    (brandId: string) => {
      const modelsQueryParams = useMemo(
        (): QueryParams => ({
          page: 1,
          pageSize: 100,
          where: [{ field: 'makeId', operator: 'eq', value: brandId }],
        }),
        [brandId],
      );

      return useInfiniteQuery({
        queryKey: [...carModelsConfig.queryKey, brandId, modelsQueryParams],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const response = await carModelsConfig.fetchFn({
              ...modelsQueryParams,
              page: Number(pageParam),
            });

            if (!response.success) {
              throw new Error(response.message || 'Failed to fetch car models');
            }

            return response;
          } catch (error) {
            console.error(
              'Error fetching car models for brand:',
              brandId,
              error,
            );
            throw error;
          }
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.data) return undefined;
          return lastPage.data.hasNextPage
            ? Number(lastPage.data.currentPage) + 1
            : undefined;
        },
        initialPageParam: 1,
        enabled:
          (effectiveSelectedBrands.includes(brandId) &&
            expandedBrands.has(brandId)) ||
          urlMake === brandId, // Also enable if this brand is in URL
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      });
    },
    [carModelsConfig, effectiveSelectedBrands, expandedBrands, urlMake],
  );

  // Car Trims Query hook - enhanced to handle URL parameters
  const useTrimsForModel = useCallback(
    (modelId: string) => {
      const trimsQueryParams = useMemo(
        (): QueryParams => ({
          page: 1,
          pageSize: 100,
          where: [{ field: 'modelId', operator: 'eq', value: modelId }],
        }),
        [modelId],
      );

      return useInfiniteQuery({
        queryKey: [...carTrimsConfig.queryKey, modelId, trimsQueryParams],
        queryFn: async ({ pageParam = 1 }) => {
          try {
            const response = await carTrimsConfig.fetchFn({
              ...trimsQueryParams,
              page: Number(pageParam),
            });

            if (!response.success) {
              throw new Error(response.message || 'Failed to fetch car trims');
            }

            return response;
          } catch (error) {
            console.error(
              'Error fetching car trims for model:',
              modelId,
              error,
            );
            throw error;
          }
        },
        getNextPageParam: (lastPage) => {
          if (!lastPage.data) return undefined;
          return lastPage.data.hasNextPage
            ? Number(lastPage.data.currentPage) + 1
            : undefined;
        },
        initialPageParam: 1,
        enabled:
          (!!modelId && expandedModels.has(modelId)) || urlModel === modelId, // Also enable if this model is in URL
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
        retry: 2,
      });
    },
    [carTrimsConfig, expandedModels, urlModel],
  );

  // Enhanced scroll handling
  const handleScroll = useCallback(() => {
    if (!listRef.current) return;

    const { scrollTop, scrollHeight, clientHeight } = listRef.current;
    const isNearBottom = scrollTop + clientHeight >= scrollHeight - 100;

    setIsUserScrolling(true);

    if (scrollTimeout.current) {
      clearTimeout(scrollTimeout.current);
    }

    scrollTimeout.current = setTimeout(() => {
      setIsUserScrolling(false);
      if (isNearBottom) {
        setCanFetchNext(true);
      }
    }, 150);
  }, []);

  // Enhanced intersection observer
  useEffect(() => {
    if (!observerRef.current || !listRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;

        if (
          entry.isIntersecting &&
          hasNextMakesPage &&
          !isFetchingNextMakesPage &&
          canFetchNext &&
          !isUserScrolling
        ) {
          setCanFetchNext(false);

          fetchNextMakesPage().finally(() => {
            if (fetchCooldownTimeout.current) {
              clearTimeout(fetchCooldownTimeout.current);
            }

            fetchCooldownTimeout.current = setTimeout(() => {
              setCanFetchNext(true);
            }, 1000);
          });
        }
      },
      {
        root: listRef.current,
        threshold: 0.1,
        rootMargin: '20px',
      },
    );

    observer.observe(observerRef.current);

    return () => {
      observer.disconnect();
      if (scrollTimeout.current) clearTimeout(scrollTimeout.current);
      if (fetchCooldownTimeout.current)
        clearTimeout(fetchCooldownTimeout.current);
    };
  }, [
    hasNextMakesPage,
    isFetchingNextMakesPage,
    fetchNextMakesPage,
    canFetchNext,
    isUserScrolling,
  ]);

  // Add scroll listener
  useEffect(() => {
    const scrollContainer = listRef.current;
    if (!scrollContainer) return;

    scrollContainer.addEventListener('scroll', handleScroll, { passive: true });

    return () => {
      scrollContainer.removeEventListener('scroll', handleScroll);
    };
  }, [handleScroll]);

  // Input handlers
  const handleSearchChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchTerm(e.target.value);
    },
    [],
  );

  const handleClearSearch = useCallback(() => {
    setSearchTerm('');
  }, []);

  const handleSearchFocus = useCallback(() => {
    setIsFocused(true);
  }, []);

  const handleSearchBlur = useCallback(() => {
    setIsFocused(false);
  }, []);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Escape') {
        handleClearSearch();
        e.currentTarget.blur();
      }
    },
    [handleClearSearch],
  );

  // Selection handlers
  const handleBrandToggle = useCallback(
    (brandId: string) => {
      onBrandToggle(brandId);

      setExpandedBrands((prev) => {
        const newSet = new Set(prev);
        if (newSet.has(brandId)) {
          newSet.delete(brandId);
        } else {
          newSet.add(brandId);
        }
        return newSet;
      });
    },
    [onBrandToggle],
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelSelect(modelId);
      setExpandedModels((prev) => new Set([...prev, modelId]));
    },
    [onModelSelect],
  );

  const handleTrimSelect = useCallback(
    (trimId: string) => {
      onTrimSelect(trimId);
    },
    [onTrimSelect],
  );

  // Brand Item Component with enhanced selected styling
  const BrandItem: React.FC<{ brand: EnhancedCarMake }> = ({ brand }) => {
    const isSelected = effectiveSelectedBrands.includes(brand.value);
    const isExpanded = expandedBrands.has(brand.value);

    const modelsQuery = useModelsForBrand(brand.value);

    // Transform and sort models data - selected model first, including URL models
    const models = useMemo(() => {
      if (!modelsQuery.data?.pages) return [];

      try {
        let allModels = modelsQuery.data.pages.flatMap(
          (page) =>
            page.data?.data.map((item) => ({
              value: String(item[carModelsConfig.valueField]),
              label: String(item[carModelsConfig.labelField]),
              makeId: String(item.makeId),
              isSelected:
                effectiveSelectedModel ===
                String(item[carModelsConfig.valueField]),
            })) || [],
        );

        // If we have a URL model that's not in the current list, add it
        if (urlModel && urlItemsQuery.data?.pages) {
          const urlModels = urlItemsQuery.data.pages.flatMap((page) => {
            const urlData = page?.data?.data?.models || [];
            return urlData.map((item: any) => ({
              value: String(item[carModelsConfig.valueField]),
              label: String(item[carModelsConfig.labelField]),
              makeId: String(item.makeId),
              isSelected:
                effectiveSelectedModel ===
                String(item[carModelsConfig.valueField]),
            }));
          });

          // Add URL models that aren't already in the list and belong to this make
          urlModels.forEach((urlModel) => {
            if (
              urlModel.makeId === brand.value &&
              !allModels.find((model) => model.value === urlModel.value)
            ) {
              allModels.push(urlModel);
            }
          });
        }

        // Sort: selected model first, then alphabetically
        return allModels.sort((a, b) => {
          if (a.isSelected && !b.isSelected) return -1;
          if (!a.isSelected && b.isSelected) return 1;
          return a.label.localeCompare(b.label);
        });
      } catch (error) {
        console.error('Error transforming models data:', error);
        return [];
      }
    }, [
      modelsQuery.data?.pages,
      effectiveSelectedModel,
      urlModel,
      urlItemsQuery.data?.pages,
      brand.value,
    ]);

    return (
      <div className="mb-1">
        {/* Enhanced Brand Checkbox with selected styling */}
        <div
          className={`flex items-center p-2 rounded-md transition-all duration-200 group ${
            isSelected
              ? 'bg-primary/10 border border-primary/20 shadow-sm'
              : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center flex-1">
            <Checkbox
              id={`brand-${brand.value}`}
              checked={isSelected}
              onCheckedChange={() => handleBrandToggle(brand.value)}
              className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`brand-${brand.value}`}
              className={`text-sm font-medium cursor-pointer flex items-center transition-colors ${
                isSelected
                  ? 'text-primary'
                  : 'text-slate-700 group-hover:text-slate-900'
              } ${isRTL ? 'pr-2 mr-auto' : 'pl-2'}`}
            >
              {isSelected && (
                <Star className="w-3 h-3 mr-1 text-primary fill-current" />
              )}
              {brand.logoUrl && (
                <div className="relative w-6 h-6 mr-2 flex-shrink-0">
                  <Image
                    src={brand.logoUrl || '/placeholder.svg'}
                    alt={brand.label}
                    fill
                    className="object-contain rounded"
                    sizes="24px"
                  />
                </div>
              )}
              <span className="truncate">{brand.label}</span>
            </Label>
          </div>

          {/* Expand/Collapse indicator */}
          {isSelected && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedBrands((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(brand.value)) {
                    newSet.delete(brand.value);
                  } else {
                    newSet.add(brand.value);
                  }
                  return newSet;
                });
              }}
              className="p-1 hover:bg-primary/20 rounded transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse models' : 'Expand models'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </button>
          )}
        </div>

        {/* Models (nested under brand) */}
        {isSelected && isExpanded && (
          <div
            className={`${
              isRTL ? 'pr-6' : 'pl-6'
            } border-l-2 border-primary/30 ml-4 mt-1`}
          >
            {modelsQuery.isLoading ? (
              <div className="flex items-center p-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading models...
              </div>
            ) : modelsQuery.isError ? (
              <div className="p-2 text-sm text-red-500">
                Failed to load models. Try again.
              </div>
            ) : models.length === 0 ? (
              <div className="p-2 text-sm text-slate-500">No models found</div>
            ) : (
              models.map((model) => (
                <ModelItem
                  key={model.value}
                  model={model}
                  brandId={brand.value}
                />
              ))
            )}
          </div>
        )}
      </div>
    );
  };

  // Model Item Component with enhanced selected styling
  const ModelItem: React.FC<{ model: EnhancedCarModel; brandId: string }> = ({
    model,
    brandId,
  }) => {
    const isSelected = effectiveSelectedModel === model.value;
    const isExpanded = expandedModels.has(model.value);

    const trimsQuery = useTrimsForModel(model.value);

    // Transform and sort trims data - selected trim first, including URL trims
    const trims = useMemo(() => {
      if (!trimsQuery.data?.pages) return [];

      try {
        let allTrims = trimsQuery.data.pages.flatMap(
          (page) =>
            page.data?.data.map((item) => ({
              value: String(item[carTrimsConfig.valueField]),
              label: String(item[carTrimsConfig.labelField]),
              modelId: String(item.modelId),
              isSelected:
                effectiveSelectedTrim ===
                String(item[carTrimsConfig.valueField]),
            })) || [],
        );

        // If we have a URL trim that's not in the current list, add it
        if (urlTrim && urlItemsQuery.data?.pages) {
          const urlTrims = urlItemsQuery.data.pages.flatMap((page) => {
            const urlData = page?.data?.data?.trims || [];
            return urlData.map((item: any) => ({
              value: String(item[carTrimsConfig.valueField]),
              label: String(item[carTrimsConfig.labelField]),
              modelId: String(item.modelId),
              isSelected:
                effectiveSelectedTrim ===
                String(item[carTrimsConfig.valueField]),
            }));
          });

          // Add URL trims that aren't already in the list and belong to this model
          urlTrims.forEach((urlTrim) => {
            if (
              urlTrim.modelId === model.value &&
              !allTrims.find((trim) => trim.value === urlTrim.value)
            ) {
              allTrims.push(urlTrim);
            }
          });
        }

        // Sort: selected trim first, then alphabetically
        return allTrims.sort((a, b) => {
          if (a.isSelected && !b.isSelected) return -1;
          if (!a.isSelected && b.isSelected) return 1;
          return a.label.localeCompare(b.label);
        });
      } catch (error) {
        console.error('Error transforming trims data:', error);
        return [];
      }
    }, [
      trimsQuery.data?.pages,
      effectiveSelectedTrim,
      urlTrim,
      urlItemsQuery.data?.pages,
      model.value,
    ]);

    return (
      <div className="mb-1">
        {/* Enhanced Model Selection with selected styling */}
        <div
          className={`flex items-center p-2 rounded-md transition-all duration-200 group ${
            isSelected
              ? 'bg-primary/5 border border-primary/10'
              : 'hover:bg-slate-50'
          }`}
        >
          <div className="flex items-center flex-1">
            <Checkbox
              id={`model-${model.value}`}
              checked={isSelected}
              onCheckedChange={() => handleModelSelect(model.value)}
              className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
            />
            <Label
              htmlFor={`model-${model.value}`}
              className={`text-sm cursor-pointer transition-colors flex items-center ${
                isSelected
                  ? 'text-primary font-medium'
                  : 'text-slate-600 group-hover:text-slate-800'
              } ${isRTL ? 'pr-2 mr-auto' : 'pl-2'}`}
            >
              {isSelected && (
                <Star className="w-3 h-3 mr-1 text-primary fill-current" />
              )}
              <span className="truncate">{model.label}</span>
            </Label>
          </div>

          {/* Expand/Collapse indicator for trims */}
          {isSelected && trims.length > 0 && (
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExpandedModels((prev) => {
                  const newSet = new Set(prev);
                  if (newSet.has(model.value)) {
                    newSet.delete(model.value);
                  } else {
                    newSet.add(model.value);
                  }
                  return newSet;
                });
              }}
              className="p-1 hover:bg-primary/20 rounded transition-colors flex-shrink-0"
              title={isExpanded ? 'Collapse trims' : 'Expand trims'}
            >
              {isExpanded ? (
                <ChevronDown className="w-4 h-4 text-primary" />
              ) : (
                <ChevronRight className="w-4 h-4 text-primary" />
              )}
            </button>
          )}
        </div>

        {/* Trims (nested under model) */}
        {isSelected && isExpanded && (
          <div
            className={`${
              isRTL ? 'pr-6' : 'pl-6'
            } border-l-2 border-primary/20 ml-4 mt-1`}
          >
            {trimsQuery.isLoading ? (
              <div className="flex items-center p-2 text-sm text-slate-500">
                <Loader2 className="w-4 h-4 animate-spin mr-2" />
                Loading trims...
              </div>
            ) : trimsQuery.isError ? (
              <div className="p-2 text-sm text-red-500">
                Failed to load trims. Try again.
              </div>
            ) : trims.length === 0 ? (
              <div className="p-2 text-sm text-slate-500">No trims found</div>
            ) : (
              trims.map((trim) => <TrimItem key={trim.value} trim={trim} />)
            )}
          </div>
        )}
      </div>
    );
  };

  // Trim Item Component with enhanced selected styling
  const TrimItem: React.FC<{ trim: EnhancedCarTrim }> = ({ trim }) => {
    const isSelected = effectiveSelectedTrim === trim.value;

    return (
      <div
        className={`flex items-center p-2 rounded-md transition-all duration-200 group ${
          isSelected
            ? 'bg-primary/5 border border-primary/10'
            : 'hover:bg-slate-50'
        }`}
      >
        <Checkbox
          id={`trim-${trim.value}`}
          checked={isSelected}
          onCheckedChange={() => handleTrimSelect(trim.value)}
          className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
        />
        <Label
          htmlFor={`trim-${trim.value}`}
          className={`text-sm cursor-pointer transition-colors flex items-center ${
            isSelected
              ? 'text-primary font-medium'
              : 'text-slate-500 group-hover:text-slate-700'
          } ${isRTL ? 'pr-2 mr-auto' : 'pl-2'}`}
        >
          {isSelected && (
            <Star className="w-3 h-3 mr-1 text-primary fill-current" />
          )}
          <span className="truncate">{trim.label}</span>
        </Label>
      </div>
    );
  };

  return (
    <div className={className}>
      {/* Enhanced Search Input */}
      <div className="mb-3">
        <div className="relative group">
          <Search
            className={`absolute ${
              isRTL ? 'right-3' : 'left-3'
            } top-1/2 transform -translate-y-1/2 transition-colors duration-200 h-4 w-4 ${
              isFocused || searchTerm
                ? 'text-primary'
                : 'text-slate-400 group-hover:text-slate-500'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            onFocus={handleSearchFocus}
            onBlur={handleSearchBlur}
            onKeyDown={handleKeyDown}
            placeholder={searchPlaceholder}
            className={`w-full border border-slate-200 bg-[#EFEFEF] transition-all duration-200 ${
              isRTL ? 'pr-9 pl-8' : 'pl-9 pr-8'
            } h-8 rounded-md text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 hover:border-slate-300 ${
              isFocused ? 'bg-white shadow-sm' : ''
            }`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={handleClearSearch}
              className={`absolute ${
                isRTL ? 'left-2' : 'right-2'
              } top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 transition-colors duration-200 opacity-0 group-hover:opacity-100 ${
                isFocused || searchTerm ? 'opacity-100' : ''
              }`}
              title="Clear search"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        {/* Search Status */}
        {searchTerm && (
          <div className="mt-1 text-xs text-slate-500 px-1">
            {searchTerm.length < 2
              ? 'Type at least 2 characters to search'
              : `Searching for "${searchTerm}"...`}
          </div>
        )}
      </div>

      {/* URL Parameters Loading Indicator */}
      {/* {(urlMake || urlModel || urlTrim) && urlItemsQuery.isLoading && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded-md">
          <div className="flex items-center text-sm text-blue-700">
            <Loader2 className="w-4 h-4 animate-spin mr-2" />
            Loading selected items from URL...
          </div>
        </div>
      )} */}

      {/* Main Content Area */}
      <div
        ref={listRef}
        className="overflow-y-auto pr-1 transition-all duration-200"
        style={{
          maxHeight,
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e1 transparent',
        }}
      >
        {/* Error State */}
        {isErrorMakes ? (
          <div className="p-4 text-center">
            <div className="text-red-500 text-sm font-medium mb-2">
              Failed to load car brands
            </div>
            <div className="text-xs text-slate-500 mb-3">
              {makesError?.message ||
                'Please check your connection and try again'}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.location.reload()}
              className="text-xs"
            >
              Retry
            </Button>
          </div>
        ) : (
          <>
            {/* Empty State */}
            {makes.length === 0 &&
            !isLoadingMakes &&
            !urlItemsQuery.isLoading ? (
              <div className="p-4 text-center">
                <div className="text-slate-400 mb-2">
                  <Search className="h-8 w-8 mx-auto opacity-50" />
                </div>
                <div className="text-sm text-slate-500 font-medium mb-1">
                  {noOptionsMessage}
                </div>
                {searchTerm && (
                  <div className="text-xs text-slate-400">
                    Try adjusting your search terms
                  </div>
                )}
              </div>
            ) : (
              <>
                {/* Car Brands List - Selected items appear first */}
                <div className="space-y-1">
                  {makes.map((brand) => (
                    <BrandItem key={brand.value} brand={brand} />
                  ))}
                </div>

                {/* Loading States */}
                {(isLoadingMakes || isFetchingNextMakesPage) && (
                  <div className="flex justify-center items-center p-4">
                    <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                    <span className="text-sm text-slate-500">
                      {isLoadingMakes ? loadingMessage : 'Loading more...'}
                    </span>
                  </div>
                )}

                {/* Infinite Scroll Trigger */}
                {hasNextMakesPage && canFetchNext && !isUserScrolling && (
                  <div
                    ref={observerRef}
                    className="h-4 w-full flex items-center justify-center"
                    style={{ minHeight: '20px' }}
                  >
                    {/* Visual indicator for infinite scroll */}
                    <div className="text-xs text-slate-400 opacity-50">
                      ↓ Scroll for more
                    </div>
                  </div>
                )}

                {/* End of List Indicator */}
                {!hasNextMakesPage && makes.length > 0 && (
                  <div className="py-3 text-center">
                    <div className="text-xs text-slate-400">
                      All brands loaded ({makes.length} total)
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Selection Status Footer */}
      {(effectiveSelectedBrands.length > 0 ||
        effectiveSelectedModel ||
        effectiveSelectedTrim) && (
        <div className="mt-3 pt-3 border-t border-slate-200">
          <div className="flex items-center justify-between text-xs">
            <div className="text-slate-600">
              <span className="font-medium">Selected:</span>
              {effectiveSelectedBrands.length > 0 && (
                <span className="ml-1 text-primary font-medium">
                  {effectiveSelectedBrands.length} brand
                  {effectiveSelectedBrands.length !== 1 ? 's' : ''}
                </span>
              )}
              {effectiveSelectedModel && (
                <span className="ml-1 text-primary font-medium">• 1 model</span>
              )}
              {effectiveSelectedTrim && (
                <span className="ml-1 text-primary font-medium">• 1 trim</span>
              )}
            </div>

            {/* Quick Clear Button */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // Clear all selections
                effectiveSelectedBrands.forEach((brandId) =>
                  onBrandToggle(brandId),
                );
                if (effectiveSelectedModel) onModelSelect('');
                if (effectiveSelectedTrim) onTrimSelect('');
                setExpandedBrands(new Set());
                setExpandedModels(new Set());
              }}
              className="h-auto p-1 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              Clear All
            </Button>
          </div>

          {/* URL Parameters Info */}
          {/* {(urlMake || urlModel || urlTrim) && (
            <div className="mt-2 text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
              Selections loaded from URL parameters
            </div>
          )} */}
        </div>
      )}
    </div>
  );
};

// Export with display name for debugging
EnhancedNestedCarFilterV3.displayName = 'EnhancedNestedCarFilterV3';

export default EnhancedNestedCarFilterV3;
