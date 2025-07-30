// NestedCarFilter.tsx - Fixed Multi-Brand Support
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
import {
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
} from '@/core/entities/models/cars/cars.dto';

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface CarMake {
  value: string;
  label: string;
  logoUrl?: string;
  isSelected: boolean;
}

interface CarModel {
  value: string;
  label: string;
  makeId: string;
  isSelected: boolean;
}

interface CarTrim {
  value: string;
  label: string;
  modelId: string;
  isSelected: boolean;
}

interface SimplifiedNestedCarFilterProps {
  carMakesConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams & { selectedCarMakes?: number[] },
    ) => Promise<PaginatedResponse<SelectCarMakeDto>>;
    labelField: keyof SelectCarMakeDto;
    valueField: keyof SelectCarMakeDto;
    logoField?: keyof SelectCarMakeDto;
  };
  carModelsConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams,
    ) => Promise<PaginatedResponse<SelectCarModelDto>>;
    labelField: keyof SelectCarModelDto;
    valueField: keyof SelectCarModelDto;
  };
  carTrimsConfig: {
    queryKey: string[];
    fetchFn: (
      params: QueryParams,
    ) => Promise<PaginatedResponse<SelectCarTrimDto>>;
    labelField: keyof SelectCarTrimDto;
    valueField: keyof SelectCarTrimDto;
  };
  selectedBrands: string[];
  selectedModel: string;
  selectedTrim: string;
  onBrandToggle: (brandId: string) => void;
  onModelSelect: (modelId: string) => void;
  onTrimSelect: (trimId: string) => void;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  className?: string;
  pageSize?: number;
  maxHeight?: string;
}

// =============================================================================
// MAIN COMPONENT
// =============================================================================

const NestedCarFilter: React.FC<SimplifiedNestedCarFilterProps> = ({
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
  className = '',
  pageSize = 20,
  maxHeight = '30rem',
}) => {
  // =============================================================================
  // HOOKS & STATE
  // =============================================================================

  const locale = useLocale();
  const isRTL = locale === 'ar';

  const [searchTerm, setSearchTerm] = useState('');
  const [expandedBrands, setExpandedBrands] = useState<Set<string>>(new Set());
  const [expandedModels, setExpandedModels] = useState<Set<string>>(new Set());
  const [isFocused, setIsFocused] = useState(false);

  const listRef = useRef<HTMLDivElement>(null);
  const observerRef = useRef<HTMLDivElement>(null);

  const debouncedSearch = useDebounce(searchTerm, 300);

  // =============================================================================
  // DATA FETCHING
  // =============================================================================

  // Query params for makes
  const makesQueryParams = useMemo(
    (): QueryParams => ({
      page: 1,
      pageSize,
      searchTerm: debouncedSearch || undefined,
      searchKey: carMakesConfig.labelField as string,
    }),
    [debouncedSearch, pageSize, carMakesConfig.labelField],
  );

  // Fetch car makes with infinite scroll
  const {
    data: makesData,
    fetchNextPage: fetchNextMakesPage,
    hasNextPage: hasNextMakesPage,
    isFetchingNextPage: isFetchingNextMakesPage,
    isLoading: isLoadingMakes,
    isError: isErrorMakes,
  } = useInfiniteQuery({
    queryKey: [...carMakesConfig.queryKey, makesQueryParams, locale],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await carMakesConfig.fetchFn({
        ...makesQueryParams,
        page: Number(pageParam),
        selectedCarMakes: selectedBrands.map((id) => Number(id)),
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch car makes');
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
  });

  // =============================================================================
  // DATA TRANSFORMATION
  // =============================================================================

  // FIXED: Transform and sort makes data with proper multi-brand support
  const makes = useMemo(() => {
    const allMakes = new Map<string, CarMake>();

    // 2. Then, add makes from search results
    if (makesData?.pages) {
      makesData.pages.forEach((page) => {
        page.data?.data.forEach((item) => {
          const makeValue = String(item[carMakesConfig.valueField]);

          // Only add if not already exists (selected items take priority)
          if (!allMakes.has(makeValue)) {
            const make: CarMake = {
              value: makeValue,
              label: String(item[carMakesConfig.labelField]),
              logoUrl: carMakesConfig.logoField
                ? String(item[carMakesConfig.logoField])
                : undefined,
              isSelected: selectedBrands.includes(makeValue), // FIXED: Proper multi-brand check
            };
            allMakes.set(make.value, make);
          } else {
            // Update selection status if make already exists
            const existingMake = allMakes.get(makeValue);
            if (existingMake) {
              existingMake.isSelected = selectedBrands.includes(makeValue);
            }
          }
        });
      });
    }

    // 3. Convert to array and sort: selected first, then alphabetically
    return Array.from(allMakes.values()).sort((a, b) => {
      // Selected items always come first
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;

      // Within same selection status, sort alphabetically
      return a.label.localeCompare(b.label, locale, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [makesData?.pages, selectedBrands, carMakesConfig, locale]);

  // =============================================================================
  // HOOKS FOR MODELS AND TRIMS
  // =============================================================================

  const useModelsForBrand = useCallback(
    (brandId: string) => {
      return useInfiniteQuery({
        queryKey: [...carModelsConfig.queryKey, brandId, locale],
        queryFn: async ({ pageParam = 1 }) => {
          const response = await carModelsConfig.fetchFn({
            page: Number(pageParam),
            pageSize: 100,
            where: [{ field: 'makeId', operator: 'eq', value: brandId }],
          });

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch car models');
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
        enabled:
          selectedBrands.includes(brandId) && expandedBrands.has(brandId),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      });
    },
    [carModelsConfig, selectedBrands, expandedBrands],
  );

  const useTrimsForModel = useCallback(
    (modelId: string) => {
      return useInfiniteQuery({
        queryKey: [...carTrimsConfig.queryKey, modelId, locale],
        queryFn: async ({ pageParam = 1 }) => {
          const response = await carTrimsConfig.fetchFn({
            page: Number(pageParam),
            pageSize: 100,
            where: [{ field: 'modelId', operator: 'eq', value: modelId }],
          });

          if (!response.success) {
            throw new Error(response.message || 'Failed to fetch car trims');
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
        enabled: !!modelId && expandedModels.has(modelId),
        staleTime: 5 * 60 * 1000,
        refetchOnWindowFocus: false,
      });
    },
    [carTrimsConfig, expandedModels],
  );

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // FIXED: Auto-expand selected items properly
  useEffect(() => {
    setExpandedBrands(new Set(selectedBrands));
    if (selectedModel) {
      setExpandedModels((prev) => new Set([...prev, selectedModel]));
    }
  }, [selectedBrands, selectedModel]);

  // Infinite scroll observer
  useEffect(() => {
    if (!observerRef.current || !listRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasNextMakesPage &&
          !isFetchingNextMakesPage
        ) {
          fetchNextMakesPage();
        }
      },
      { root: listRef.current, threshold: 0.1, rootMargin: '20px' },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextMakesPage, isFetchingNextMakesPage, fetchNextMakesPage]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  // FIXED: Brand toggle handler with proper expansion logic
  const handleBrandToggle = useCallback(
    (brandId: string) => {
      onBrandToggle(brandId);

      // Only auto-expand when selecting a brand, not when deselecting
      const willBeSelected = !selectedBrands.includes(brandId);

      if (willBeSelected) {
        setExpandedBrands((prev) => new Set([...prev, brandId]));
      } else {
        // Optionally collapse when deselecting
        setExpandedBrands((prev) => {
          const newSet = new Set(prev);
          newSet.delete(brandId);
          return newSet;
        });
      }
    },
    [onBrandToggle, selectedBrands],
  );

  const handleModelSelect = useCallback(
    (modelId: string) => {
      onModelSelect(modelId);
      if (modelId) {
        setExpandedModels((prev) => new Set([...prev, modelId]));
      }
    },
    [onModelSelect],
  );

  // =============================================================================
  // RENDER COMPONENTS
  // =============================================================================

  const BrandItem: React.FC<{ brand: CarMake }> = React.memo(({ brand }) => {
    const isExpanded = expandedBrands.has(brand.value);
    const modelsQuery = useModelsForBrand(brand.value);

    const models = useMemo(() => {
      if (!modelsQuery.data?.pages) return [];

      return modelsQuery.data.pages
        .flatMap((page) => page.data?.data || [])
        .map((item) => ({
          value: String(item[carModelsConfig.valueField]),
          label: String(item[carModelsConfig.labelField]),
          makeId: String(item.makeId),
          isSelected:
            selectedModel === String(item[carModelsConfig.valueField]),
        }))
        .sort((a, b) => {
          if (a.isSelected && !b.isSelected) return -1;
          if (!a.isSelected && b.isSelected) return 1;
          return a.label.localeCompare(b.label, locale, {
            numeric: true,
            sensitivity: 'base',
          });
        });
    }, [modelsQuery.data?.pages]);

    return (
      <div className="mb-2">
        <div
          className={`rounded-lg border transition-all duration-200 ${
            brand.isSelected
              ? 'bg-primary/10 border-primary/30 shadow-sm'
              : 'bg-white border-slate-200 hover:border-slate-300'
          }`}
        >
          <div className="p-3">
            <div
              className={`flex items-center w-full ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`flex items-center flex-1 ${
                  isRTL ? 'flex-row' : 'justify-start'
                }`}
              >
                <Checkbox
                  id={`brand-${brand.value}`}
                  checked={brand.isSelected}
                  onCheckedChange={() => handleBrandToggle(brand.value)}
                  className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`brand-${brand.value}`}
                  className={`text-sm font-medium cursor-pointer flex items-center ${
                    brand.isSelected ? 'text-primary' : 'text-slate-700'
                  } ${isRTL ? 'pr-3' : 'pl-3'}`}
                >
                  {brand.isSelected && (
                    <Star
                      className={`w-3 h-3 text-primary fill-current ${
                        isRTL ? 'ml-2' : 'mr-2'
                      }`}
                    />
                  )}
                  {brand.logoUrl && (
                    <div
                      className={`relative w-6 h-6 flex-shrink-0 ${
                        isRTL ? 'ml-2' : 'mr-2'
                      }`}
                    >
                      <Image
                        src={brand.logoUrl}
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

              {brand.isSelected && (
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
                  className="p-1.5 hover:bg-primary/20 rounded-md transition-colors border border-primary/20"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-4 h-4 text-primary" />
                  ) : (
                    <ChevronRight
                      className={`w-4 h-4 text-primary ${
                        isRTL ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
              )}
            </div>
          </div>

          {brand.isSelected && isExpanded && (
            <div className="border-t border-primary/20 bg-primary/5 p-3 space-y-2">
              {modelsQuery.isLoading ? (
                <div className="flex items-center p-2 text-sm text-slate-500">
                  <Loader2
                    className={`w-4 h-4 animate-spin ${
                      isRTL ? 'ml-2' : 'mr-2'
                    }`}
                  />
                  {isRTL ? 'جارٍ تحميل الموديلات...' : 'Loading models...'}
                </div>
              ) : models.length === 0 ? (
                <div className="p-2 text-sm text-slate-500">
                  {isRTL ? 'لم يتم العثور على موديلات' : 'No models found'}
                </div>
              ) : (
                models.map((model) => (
                  <ModelItem key={model.value} model={model} />
                ))
              )}
            </div>
          )}
        </div>
      </div>
    );
  });

  const ModelItem: React.FC<{ model: CarModel }> = React.memo(({ model }) => {
    const isExpanded = expandedModels.has(model.value);
    const trimsQuery = useTrimsForModel(model.value);

    const trims = useMemo(() => {
      if (!trimsQuery.data?.pages) return [];

      return trimsQuery.data.pages
        .flatMap((page) => page.data?.data || [])
        .map((item) => ({
          value: String(item[carTrimsConfig.valueField]),
          label: String(item[carTrimsConfig.labelField]),
          modelId: String(item.modelId),
          isSelected: selectedTrim === String(item[carTrimsConfig.valueField]),
        }))
        .sort((a, b) => {
          if (a.isSelected && !b.isSelected) return -1;
          if (!a.isSelected && b.isSelected) return 1;
          return a.label.localeCompare(b.label, locale, {
            numeric: true,
            sensitivity: 'base',
          });
        });
    }, [trimsQuery.data?.pages]);

    return (
      <div className="mb-1">
        <div
          className={`rounded-md border transition-all duration-200 ${
            model.isSelected
              ? 'bg-white border-primary/30 shadow-sm'
              : 'bg-white/70 border-slate-200 hover:bg-white'
          }`}
        >
          <div className="p-2">
            <div
              className={`flex items-center w-full ${
                isRTL ? 'text-right' : 'text-left'
              }`}
            >
              <div
                className={`flex items-center flex-1 ${
                  isRTL ? 'flex-row' : 'justify-start'
                }`}
              >
                <Checkbox
                  id={`model-${model.value}`}
                  checked={model.isSelected}
                  onCheckedChange={() => handleModelSelect(model.value)}
                  className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
                />
                <Label
                  htmlFor={`model-${model.value}`}
                  className={`text-sm cursor-pointer flex items-center ${
                    model.isSelected
                      ? 'text-primary font-medium'
                      : 'text-slate-600'
                  } ${isRTL ? 'pr-2' : 'pl-2'}`}
                >
                  {model.isSelected && (
                    <Star
                      className={`w-3 h-3 text-primary fill-current ${
                        isRTL ? 'ml-1' : 'mr-1'
                      }`}
                    />
                  )}
                  <span className="truncate">{model.label}</span>
                </Label>
              </div>

              {model.isSelected && trims.length > 0 && (
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
                  className="p-1 hover:bg-primary/20 rounded transition-colors border border-primary/20"
                >
                  {isExpanded ? (
                    <ChevronDown className="w-3 h-3 text-primary" />
                  ) : (
                    <ChevronRight
                      className={`w-3 h-3 text-primary ${
                        isRTL ? 'rotate-180' : ''
                      }`}
                    />
                  )}
                </button>
              )}
            </div>
          </div>

          {model.isSelected && isExpanded && trims.length > 0 && (
            <div className="border-t border-primary/20 bg-primary/5 p-2 space-y-1">
              {trimsQuery.isLoading ? (
                <div className="flex items-center p-2 text-sm text-slate-500">
                  <Loader2
                    className={`w-4 h-4 animate-spin ${
                      isRTL ? 'ml-2' : 'mr-2'
                    }`}
                  />
                  {isRTL ? 'جارٍ تحميل الفئات...' : 'Loading trims...'}
                </div>
              ) : (
                trims.map((trim) => <TrimItem key={trim.value} trim={trim} />)
              )}
            </div>
          )}
        </div>
      </div>
    );
  });

  const TrimItem: React.FC<{ trim: CarTrim }> = React.memo(({ trim }) => (
    <div
      className={`rounded border transition-all duration-200 ${
        trim.isSelected
          ? 'bg-white border-primary/30 shadow-sm'
          : 'bg-white/50 border-slate-200 hover:bg-white'
      }`}
    >
      <div className="p-2">
        <div
          className={`flex items-center w-full ${
            isRTL ? 'text-right' : 'text-left'
          }`}
        >
          <Checkbox
            id={`trim-${trim.value}`}
            checked={trim.isSelected}
            onCheckedChange={() => onTrimSelect(trim.value)}
            className="border-slate-300 data-[state=checked]:bg-primary data-[state=checked]:border-primary"
          />
          <Label
            htmlFor={`trim-${trim.value}`}
            className={`text-sm cursor-pointer flex items-center ${
              trim.isSelected ? 'text-primary font-medium' : 'text-slate-500'
            } ${isRTL ? 'pr-2' : 'pl-2'}`}
          >
            {trim.isSelected && (
              <Star
                className={`w-3 h-3 text-primary fill-current ${
                  isRTL ? 'ml-1' : 'mr-1'
                }`}
              />
            )}
            <span className="truncate">{trim.label}</span>
          </Label>
        </div>
      </div>
    </div>
  ));

  // Add display names
  BrandItem.displayName = 'BrandItem';
  ModelItem.displayName = 'ModelItem';
  TrimItem.displayName = 'TrimItem';

  // =============================================================================
  // MAIN RENDER
  // =============================================================================

  return (
    <div className={`${className} space-y-3`} dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Search Input */}
      <div className="relative">
        <div className="relative group">
          <Search
            className={`absolute ${
              isRTL ? 'right-3' : 'left-3'
            } top-1/2 transform -translate-y-1/2 h-4 w-4 ${
              isFocused || searchTerm ? 'text-primary' : 'text-slate-400'
            }`}
          />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            onKeyDown={(e) => e.key === 'Escape' && setSearchTerm('')}
            placeholder={searchPlaceholder}
            className={`w-full border border-slate-200 bg-[#EFEFEF] transition-all duration-200 ${
              isRTL ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8 text-left'
            } h-10 rounded-lg text-sm focus:outline-none focus:border-primary focus:ring-1 focus:ring-primary/30 hover:border-slate-300 ${
              isFocused ? 'bg-white shadow-sm' : ''
            }`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className={`absolute ${
                isRTL ? 'left-2' : 'right-2'
              } top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={listRef}
        className="overflow-y-auto rounded-lg border border-slate-200 bg-white shadow-sm"
        style={{ maxHeight, scrollbarWidth: 'thin' }}
      >
        <div className="p-3">
          {isErrorMakes ? (
            <div className="p-4 text-center text-red-500 text-sm">
              {isRTL
                ? 'فشل في تحميل العلامات التجارية'
                : 'Failed to load car brands'}
            </div>
          ) : makes.length === 0 && !isLoadingMakes ? (
            <div className="p-4 text-center">
              <Search className="h-8 w-8 mx-auto opacity-50 mb-2" />
              <div className="text-sm text-slate-500">{noOptionsMessage}</div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {makes.map((brand) => (
                  <BrandItem key={brand.value} brand={brand} />
                ))}
              </div>

              {(isLoadingMakes || isFetchingNextMakesPage) && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary mr-2" />
                  <span className="text-sm text-slate-500">
                    {isRTL ? 'جارٍ التحميل...' : 'Loading...'}
                  </span>
                </div>
              )}

              {hasNextMakesPage && (
                <div ref={observerRef} className="h-4 w-full" />
              )}
            </>
          )}
        </div>
      </div>

      {/* FIXED: Selection Status with proper multi-brand display */}
      {(selectedBrands.length > 0 || selectedModel || selectedTrim) && (
        <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
          <div
            className={`flex items-center justify-between text-xs ${
              isRTL ? 'flex-row-reverse' : ''
            }`}
          >
            <div className={isRTL ? 'text-right' : 'text-left'}>
              <span className="font-medium">
                {isRTL ? 'المحدد:' : 'Selected:'}
              </span>
              {selectedBrands.length > 0 && (
                <span className="text-primary font-medium ml-1">
                  {selectedBrands.length} {isRTL ? 'علامة تجارية' : 'brand'}
                  {selectedBrands.length !== 1 && !isRTL ? 's' : ''}
                </span>
              )}
              {selectedModel && (
                <span className="text-primary font-medium ml-1">
                  {isRTL ? '• 1 موديل' : '• 1 model'}
                </span>
              )}
              {selectedTrim && (
                <span className="text-primary font-medium ml-1">
                  {isRTL ? '• 1 تريم' : '• 1 trim'}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                // FIXED: Clear all selected brands properly
                selectedBrands.forEach((brandId) => onBrandToggle(brandId));
                if (selectedModel) onModelSelect('');
                if (selectedTrim) onTrimSelect('');
                setExpandedBrands(new Set());
                setExpandedModels(new Set());
              }}
              className="h-auto p-1.5 text-xs text-slate-500 hover:text-red-600 hover:bg-red-50"
            >
              {isRTL ? 'مسح الكل' : 'Clear All'}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

export default NestedCarFilter;
