// NestedCarFilter.tsx - Fixed Multi-Brand Support with Pagination and Safe Image Handling
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
// UTILITIES
// =============================================================================

/**
 * Validates whether a URL string is safe to be passed to Next.js <Image />.
 * Avoids runtime crash `Failed to construct 'URL': Invalid URL`.
 */
export const isValidImageUrl = (url?: string | null): boolean => {
  if (!url || typeof url !== 'string') return false;
  const trimmed = url.trim();
  if (
    !trimmed ||
    trimmed === 'null' ||
    trimmed === 'undefined' ||
    trimmed === '[object Object]' ||
    trimmed === 'NaN'
  ) {
    return false;
  }
  return (
    trimmed.startsWith('http://') ||
    trimmed.startsWith('https://') ||
    trimmed.startsWith('/') ||
    trimmed.startsWith('data:image/')
  );
};

// =============================================================================
// TYPES & INTERFACES
// =============================================================================

interface CarMake {
  value: string;
  label: string;
  logoUrl?: string;
  isSelected: boolean;
  isCarTrimRequired: boolean;
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
// SUB-COMPONENTS
// =============================================================================

interface TrimItemProps {
  trim: CarTrim;
  isRTL: boolean;
  onTrimSelect: (trimId: string) => void;
}

const TrimItem: React.FC<TrimItemProps> = React.memo(({ trim, isRTL, onTrimSelect }) => (
  <div
    className={`rounded border transition-all duration-200 ${
      trim.isSelected
        ? 'bg-white dark:bg-zinc-900 border-primary/30 dark:border-[#ABDE3B]/30 shadow-sm'
        : 'bg-white/50 dark:bg-zinc-900/50 border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900'
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
          className="border-slate-300 dark:border-zinc-700 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-[#ABDE3B] data-[state=checked]:border-primary dark:data-[state=checked]:border-[#ABDE3B] data-[state=checked]:text-white dark:data-[state=checked]:text-zinc-950"
        />
        <Label
          htmlFor={`trim-${trim.value}`}
          className={`text-sm cursor-pointer flex items-center ${
            trim.isSelected
              ? 'text-primary dark:text-[#ABDE3B] font-medium'
              : 'text-slate-500 dark:text-zinc-400'
          } ${isRTL ? 'pr-2' : 'pl-2'}`}
        >
          {trim.isSelected && (
            <Star
              className={`w-3 h-3 text-primary dark:text-[#ABDE3B] fill-current ${
                isRTL ? 'ml-1' : 'mr-1'
              }`}
            />
          )}
          <span className="truncate">
            {trim.label || (
              <span className="inline-block h-4 w-16 bg-slate-200 dark:bg-zinc-700 animate-pulse rounded align-middle" />
            )}
          </span>
        </Label>
      </div>
    </div>
  </div>
));
TrimItem.displayName = 'TrimItem';

interface ModelItemProps {
  model: CarModel;
  isCarTrimRequired: boolean;
  locale: string;
  isRTL: boolean;
  expandedModels: Set<string>;
  setExpandedModels: React.Dispatch<React.SetStateAction<Set<string>>>;
  carTrimsConfig: {
    queryKey: string[];
    fetchFn: (params: any) => Promise<any>;
    labelField: string;
    valueField: string;
  };
  selectedTrim: string;
  onTrimSelect: (trimId: string) => void;
  onModelSelect: (modelId: string) => void;
}

const ModelItem: React.FC<ModelItemProps> = React.memo(({
  model,
  isCarTrimRequired,
  locale,
  isRTL,
  expandedModels,
  setExpandedModels,
  carTrimsConfig,
  selectedTrim,
  onTrimSelect,
  onModelSelect,
}) => {
  const isExpanded = expandedModels.has(model.value);
  const trimsObserverRef = useRef<HTMLDivElement>(null);
  const knownTrimsRef = useRef<Map<string, { label: string; modelId: string }>>(new Map());

  // Paginated Trims Query
  const trimsQuery = useInfiniteQuery({
    queryKey: [...carTrimsConfig.queryKey, model.value, locale],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await carTrimsConfig.fetchFn({
        page: Number(pageParam),
        pageSize: 100,
        where: [{ field: 'modelId', operator: 'eq', value: model.value }],
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch car trims');
      }

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return undefined;
      return lastPage.data.hasNextPage
        ? Number(lastPage.data.currentPage || 1) + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: !!model.value && expandedModels.has(model.value),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    fetchNextPage: fetchNextTrimsPage,
    hasNextPage: hasNextTrimsPage,
    isFetchingNextPage: isFetchingNextTrimsPage,
  } = trimsQuery;

  // Track known trims in ref to persist label info
  useEffect(() => {
    if (trimsQuery.data?.pages) {
      trimsQuery.data.pages.forEach((page) => {
        page.data?.data?.forEach((item: any) => {
          const trimValue = String(item[carTrimsConfig.valueField]);
          const label = String(item[carTrimsConfig.labelField]);
          const modelId = String(item.modelId || model.value);
          knownTrimsRef.current.set(trimValue, { label, modelId });
        });
      });
    }
  }, [trimsQuery.data?.pages, carTrimsConfig, model.value]);

  // Auto-paginate until selectedTrim is found
  useEffect(() => {
    if (selectedTrim && isExpanded && hasNextTrimsPage && !isFetchingNextTrimsPage) {
      const isTrimFound = trimsQuery.data?.pages?.some((page) =>
        page.data?.data?.some(
          (item: any) => String(item[carTrimsConfig.valueField]) === selectedTrim,
        ),
      );
      if (!isTrimFound) {
        fetchNextTrimsPage();
      }
    }
  }, [
    selectedTrim,
    isExpanded,
    hasNextTrimsPage,
    isFetchingNextTrimsPage,
    trimsQuery.data,
    carTrimsConfig.valueField,
    fetchNextTrimsPage,
  ]);

  // Infinite scroll observer for trims
  useEffect(() => {
    if (!trimsObserverRef.current || !isExpanded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasNextTrimsPage &&
          !isFetchingNextTrimsPage
        ) {
          fetchNextTrimsPage();
        }
      },
      { threshold: 0.1, rootMargin: '40px' },
    );

    observer.observe(trimsObserverRef.current);
    return () => observer.disconnect();
  }, [hasNextTrimsPage, isFetchingNextTrimsPage, fetchNextTrimsPage, isExpanded]);

  const trims = useMemo(() => {
    const allTrimsMap = new Map<string, CarTrim>();

    // 1. Maintain selected trim if present
    if (selectedTrim) {
      const cached = knownTrimsRef.current.get(selectedTrim);
      allTrimsMap.set(selectedTrim, {
        value: selectedTrim,
        label: cached?.label || '',
        modelId: model.value,
        isSelected: true,
      });
    }

    // 2. Populate from paginated data
    if (trimsQuery.data?.pages) {
      trimsQuery.data.pages
        .flatMap((page) => page.data?.data || [])
        .forEach((item: any) => {
          const trimValue = String(item[carTrimsConfig.valueField]);
          const label = String(item[carTrimsConfig.labelField]);
          const modelId = String(item.modelId || model.value);
          const isSelected = selectedTrim === trimValue;

          allTrimsMap.set(trimValue, {
            value: trimValue,
            label,
            modelId,
            isSelected,
          });
        });
    }

    return Array.from(allTrimsMap.values()).sort((a, b) => {
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      return (a.label || '').localeCompare(b.label || '', locale, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [trimsQuery.data?.pages, carTrimsConfig, selectedTrim, model.value, locale]);

  return (
    <div className="mb-1">
      <div
        className={`rounded-md border transition-all duration-200 ${
          model.isSelected
            ? 'bg-white dark:bg-zinc-900 border-primary/30 dark:border-[#ABDE3B]/30 shadow-sm'
            : 'bg-white/70 dark:bg-zinc-900/70 border-slate-200 dark:border-zinc-800 hover:bg-white dark:hover:bg-zinc-900'
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
                onCheckedChange={() => onModelSelect(model.value)}
                className="border-slate-300 dark:border-zinc-700 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-[#ABDE3B] data-[state=checked]:border-primary dark:data-[state=checked]:border-[#ABDE3B] data-[state=checked]:text-white dark:data-[state=checked]:text-zinc-950"
              />
              <Label
                htmlFor={`model-${model.value}`}
                className={`text-sm cursor-pointer flex items-center ${
                  model.isSelected
                    ? 'text-primary dark:text-[#ABDE3B] font-medium'
                    : 'text-slate-600 dark:text-zinc-350'
                } ${isRTL ? 'pr-2' : 'pl-2'}`}
              >
                {model.isSelected && (
                  <Star
                    className={`w-3 h-3 text-primary dark:text-[#ABDE3B] fill-current ${
                      isRTL ? 'ml-1' : 'mr-1'
                    }`}
                  />
                )}
                <span className="truncate">
                  {model.label || (
                    <span className="inline-block h-4 w-20 bg-slate-200 dark:bg-zinc-700 animate-pulse rounded align-middle" />
                  )}
                </span>
              </Label>
            </div>

            {model.isSelected && isCarTrimRequired && (
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
                className="p-1 hover:bg-primary/20 dark:hover:bg-[#ABDE3B]/20 rounded transition-colors border border-primary/20 dark:border-[#ABDE3B]/20"
              >
                {isExpanded ? (
                  <ChevronDown className="w-3 h-3 text-primary dark:text-[#ABDE3B]" />
                ) : (
                  <ChevronRight
                    className={`w-3 h-3 text-primary dark:text-[#ABDE3B] ${
                      isRTL ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            )}
          </div>
        </div>

        {model.isSelected && isExpanded && isCarTrimRequired && (
          <div className="border-t border-primary/20 dark:border-[#ABDE3B]/20 bg-primary/5 dark:bg-[#ABDE3B]/5 p-2 space-y-1">
            {trimsQuery.isLoading ? (
              <div className="flex items-center p-2 text-sm text-slate-500 dark:text-zinc-400">
                <Loader2
                  className={`w-4 h-4 animate-spin ${
                    isRTL ? 'ml-2' : 'mr-2'
                  }`}
                />
                {isRTL ? 'التحميل...' : 'Loading trims...'}
              </div>
            ) : trims.length === 0 ? (
              <div className="p-2 text-xs text-slate-500 dark:text-zinc-400">
                {isRTL ? 'لم يتم العثور على فئات' : 'No trims found'}
              </div>
            ) : (
              <>
                {trims.map((trim) => (
                  <TrimItem
                    key={trim.value}
                    trim={trim}
                    isRTL={isRTL}
                    onTrimSelect={onTrimSelect}
                  />
                ))}

                {isFetchingNextTrimsPage && (
                  <div className="flex justify-center items-center p-2">
                    <Loader2 className="w-3.5 h-3.5 animate-spin text-primary dark:text-[#ABDE3B] mr-1.5" />
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {isRTL ? 'جارٍ تحميل المزيد...' : 'Loading more...'}
                    </span>
                  </div>
                )}

                {hasNextTrimsPage && (
                  <div ref={trimsObserverRef} className="h-2 w-full" />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
ModelItem.displayName = 'ModelItem';

interface BrandItemProps {
  brand: CarMake;
  locale: string;
  isRTL: boolean;
  selectedBrands: string[];
  expandedBrands: Set<string>;
  setExpandedBrands: React.Dispatch<React.SetStateAction<Set<string>>>;
  carModelsConfig: {
    queryKey: string[];
    fetchFn: (params: any) => Promise<any>;
    labelField: string;
    valueField: string;
    logoField?: string;
  };
  selectedModel: string;
  onBrandToggle: (brandId: string) => void;
  expandedModels: Set<string>;
  setExpandedModels: React.Dispatch<React.SetStateAction<Set<string>>>;
  carTrimsConfig: {
    queryKey: string[];
    fetchFn: (params: any) => Promise<any>;
    labelField: string;
    valueField: string;
  };
  selectedTrim: string;
  onTrimSelect: (trimId: string) => void;
  onModelSelect: (modelId: string) => void;
  handleBrandToggle: (brandId: string) => void;
}

const BrandItem: React.FC<BrandItemProps> = React.memo(({
  brand,
  locale,
  isRTL,
  selectedBrands,
  expandedBrands,
  setExpandedBrands,
  carModelsConfig,
  selectedModel,
  onBrandToggle,
  expandedModels,
  setExpandedModels,
  carTrimsConfig,
  selectedTrim,
  onTrimSelect,
  onModelSelect,
  handleBrandToggle,
}) => {
  const isExpanded = expandedBrands.has(brand.value);
  const [imageError, setImageError] = useState(false);
  const modelsObserverRef = useRef<HTMLDivElement>(null);
  const knownModelsRef = useRef<Map<string, { label: string; makeId: string }>>(new Map());

  // Paginated Models Query
  const modelsQuery = useInfiniteQuery({
    queryKey: [...carModelsConfig.queryKey, brand.value, locale],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await carModelsConfig.fetchFn({
        page: Number(pageParam),
        pageSize: 100,
        where: [{ field: 'makeId', operator: 'eq', value: brand.value }],
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch car models');
      }

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage?.data) return undefined;
      return lastPage.data.hasNextPage
        ? Number(lastPage.data.currentPage || 1) + 1
        : undefined;
    },
    initialPageParam: 1,
    enabled: selectedBrands.includes(brand.value) && expandedBrands.has(brand.value),
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  const {
    fetchNextPage: fetchNextModelsPage,
    hasNextPage: hasNextModelsPage,
    isFetchingNextPage: isFetchingNextModelsPage,
  } = modelsQuery;

  // Track known models in ref to persist label info
  useEffect(() => {
    if (modelsQuery.data?.pages) {
      modelsQuery.data.pages.forEach((page) => {
        page.data?.data?.forEach((item: any) => {
          const modelValue = String(item[carModelsConfig.valueField]);
          const label = String(item[carModelsConfig.labelField]);
          const makeId = String(item.makeId || brand.value);
          knownModelsRef.current.set(modelValue, { label, makeId });
        });
      });
    }
  }, [modelsQuery.data?.pages, carModelsConfig, brand.value]);

  // Auto-paginate until selectedModel is found
  useEffect(() => {
    if (selectedModel && isExpanded && hasNextModelsPage && !isFetchingNextModelsPage) {
      const isModelFound = modelsQuery.data?.pages?.some((page) =>
        page.data?.data?.some(
          (item: any) => String(item[carModelsConfig.valueField]) === selectedModel,
        ),
      );
      if (!isModelFound) {
        fetchNextModelsPage();
      }
    }
  }, [
    selectedModel,
    isExpanded,
    hasNextModelsPage,
    isFetchingNextModelsPage,
    modelsQuery.data,
    carModelsConfig.valueField,
    fetchNextModelsPage,
  ]);

  // Infinite scroll observer for models
  useEffect(() => {
    if (!modelsObserverRef.current || !isExpanded) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const [entry] = entries;
        if (
          entry.isIntersecting &&
          hasNextModelsPage &&
          !isFetchingNextModelsPage
        ) {
          fetchNextModelsPage();
        }
      },
      { threshold: 0.1, rootMargin: '40px' },
    );

    observer.observe(modelsObserverRef.current);
    return () => observer.disconnect();
  }, [hasNextModelsPage, isFetchingNextModelsPage, fetchNextModelsPage, isExpanded]);

  const models = useMemo(() => {
    const allModelsMap = new Map<string, CarModel>();

    // 1. Maintain selected model if present
    if (selectedModel) {
      const cached = knownModelsRef.current.get(selectedModel);
      allModelsMap.set(selectedModel, {
        value: selectedModel,
        label: cached?.label || '',
        makeId: brand.value,
        isSelected: true,
      });
    }

    // 2. Populate from paginated data
    if (modelsQuery.data?.pages) {
      modelsQuery.data.pages
        .flatMap((page) => page.data?.data || [])
        .forEach((item: any) => {
          const modelValue = String(item[carModelsConfig.valueField]);
          const label = String(item[carModelsConfig.labelField]);
          const makeId = String(item.makeId || brand.value);
          const isSelected = selectedModel === modelValue;

          allModelsMap.set(modelValue, {
            value: modelValue,
            label,
            makeId,
            isSelected,
          });
        });
    }

    return Array.from(allModelsMap.values()).sort((a, b) => {
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;
      return (a.label || '').localeCompare(b.label || '', locale, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [modelsQuery.data?.pages, carModelsConfig, selectedModel, brand.value, locale]);

  return (
    <div className="mb-2">
      <div
        className={`rounded-lg border transition-all duration-200 ${
          brand.isSelected
            ? 'bg-primary/10 dark:bg-[#ABDE3B]/10 border-primary/30 dark:border-[#ABDE3B]/30 shadow-sm'
            : 'bg-white dark:bg-zinc-900 border-slate-200 dark:border-zinc-800 hover:border-slate-300 dark:hover:border-zinc-700'
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
                className="border-slate-300 dark:border-zinc-700 data-[state=checked]:bg-primary dark:data-[state=checked]:bg-[#ABDE3B] data-[state=checked]:border-primary dark:data-[state=checked]:border-[#ABDE3B] data-[state=checked]:text-white dark:data-[state=checked]:text-zinc-950"
              />
              <Label
                htmlFor={`brand-${brand.value}`}
                className={`text-sm font-medium cursor-pointer flex items-center ${
                  brand.isSelected
                    ? 'text-primary dark:text-[#ABDE3B]'
                    : 'text-slate-700 dark:text-zinc-300'
                } ${isRTL ? 'pr-3' : 'pl-3'}`}
              >
                {brand.isSelected && (
                  <Star
                    className={`w-3 h-3 text-primary dark:text-[#ABDE3B] fill-current ${
                      isRTL ? 'ml-2' : 'mr-2'
                    }`}
                  />
                )}
                {brand.logoUrl && isValidImageUrl(brand.logoUrl) && !imageError && (
                  <div
                    className={`relative w-6 h-6 flex-shrink-0 ${
                      isRTL ? 'ml-2' : 'mr-2'
                    }`}
                  >
                    <Image
                      src={brand.logoUrl}
                      alt={brand.label || 'Brand'}
                      fill
                      className="object-contain rounded"
                      sizes="24px"
                      onError={() => setImageError(true)}
                    />
                  </div>
                )}
                <span className="truncate">
                  {brand.label || (
                    <span className="inline-block h-4 w-24 bg-slate-200 dark:bg-zinc-700 animate-pulse rounded align-middle" />
                  )}
                </span>
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
                className="p-1.5 hover:bg-primary/20 dark:hover:bg-[#ABDE3B]/20 rounded-md transition-colors border border-primary/20 dark:border-[#ABDE3B]/20"
              >
                {isExpanded ? (
                  <ChevronDown className="w-4 h-4 text-primary dark:text-[#ABDE3B]" />
                ) : (
                  <ChevronRight
                    className={`w-4 h-4 text-primary dark:text-[#ABDE3B] ${
                      isRTL ? 'rotate-180' : ''
                    }`}
                  />
                )}
              </button>
            )}
          </div>
        </div>

        {brand.isSelected && isExpanded && (
          <div className="border-t border-primary/20 dark:border-[#ABDE3B]/20 bg-primary/5 dark:bg-[#ABDE3B]/5 p-3 space-y-2">
            {modelsQuery.isLoading ? (
              <div className="flex items-center p-2 text-sm text-slate-500 dark:text-zinc-400">
                <Loader2
                  className={`w-4 h-4 animate-spin ${
                    isRTL ? 'ml-2' : 'mr-2'
                  }`}
                />
                {isRTL ? 'التحميل...' : 'Loading models...'}
              </div>
            ) : models.length === 0 ? (
              <div className="p-2 text-sm text-slate-500 dark:text-zinc-400">
                {isRTL ? 'لم يتم العثور على موديلات' : 'No models found'}
              </div>
            ) : (
              <>
                {models.map((model) => (
                  <ModelItem
                    key={model.value}
                    model={model}
                    isCarTrimRequired={brand.isCarTrimRequired}
                    locale={locale}
                    isRTL={isRTL}
                    expandedModels={expandedModels}
                    setExpandedModels={setExpandedModels}
                    carTrimsConfig={carTrimsConfig}
                    selectedTrim={selectedTrim}
                    onTrimSelect={onTrimSelect}
                    onModelSelect={onModelSelect}
                  />
                ))}

                {isFetchingNextModelsPage && (
                  <div className="flex justify-center items-center p-2">
                    <Loader2 className="w-4 h-4 animate-spin text-primary dark:text-[#ABDE3B] mr-2" />
                    <span className="text-xs text-slate-500 dark:text-zinc-400">
                      {isRTL ? 'جارٍ تحميل المزيد من الموديلات...' : 'Loading more models...'}
                    </span>
                  </div>
                )}

                {hasNextModelsPage && (
                  <div ref={modelsObserverRef} className="h-3 w-full" />
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
});
BrandItem.displayName = 'BrandItem';

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
  pageSize = 100,
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
  const knownMakesRef = useRef<Map<string, { label: string; logoUrl?: string; isCarTrimRequired?: boolean }>>(new Map());

  const debouncedSearch = useDebounce(searchTerm, 300);

  // =============================================================================
  // DATA FETCHING (BRANDS / MAKES)
  // =============================================================================

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
      if (!lastPage?.data) return undefined;
      return lastPage.data.hasNextPage
        ? Number(lastPage.data.currentPage || 1) + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Track known makes in ref to persist label info across searches
  useEffect(() => {
    if (makesData?.pages) {
      makesData.pages.forEach((page) => {
        page.data?.data?.forEach((item) => {
          const makeValue = String(item[carMakesConfig.valueField]);
          const label = String(item[carMakesConfig.labelField]);
          const rawLogo = carMakesConfig.logoField
            ? item[carMakesConfig.logoField]
            : undefined;
          const logoUrl =
            typeof rawLogo === 'string' && isValidImageUrl(rawLogo)
              ? rawLogo.trim()
              : undefined;
          const isCarTrimRequired = !!item.isCarTrimRequired;

          knownMakesRef.current.set(makeValue, {
            label,
            logoUrl,
            isCarTrimRequired,
          });
        });
      });
    }
  }, [makesData?.pages, carMakesConfig]);

  // Auto-paginate until all selectedBrands are found in loaded pages
  useEffect(() => {
    if (selectedBrands.length > 0 && hasNextMakesPage && !isFetchingNextMakesPage) {
      const loadedMakeIds = new Set(
        makesData?.pages?.flatMap((page) => page.data?.data || []).map((item) =>
          String(item[carMakesConfig.valueField]),
        ) || [],
      );
      const hasMissingBrand = selectedBrands.some((id) => !loadedMakeIds.has(id));
      if (hasMissingBrand) {
        fetchNextMakesPage();
      }
    }
  }, [
    selectedBrands,
    hasNextMakesPage,
    isFetchingNextMakesPage,
    makesData,
    carMakesConfig.valueField,
    fetchNextMakesPage,
  ]);

  // =============================================================================
  // DATA TRANSFORMATION
  // =============================================================================

  const makes = useMemo(() => {
    const allMakes = new Map<string, CarMake>();

    // 1. Maintain selected brands in list even before page loaded
    selectedBrands.forEach((brandId) => {
      const cached = knownMakesRef.current.get(brandId);
      allMakes.set(brandId, {
        value: brandId,
        label: cached?.label || '',
        logoUrl: cached?.logoUrl,
        isSelected: true,
        isCarTrimRequired: cached?.isCarTrimRequired ?? true,
      });
    });

    // 2. Populate and update from paginated results
    if (makesData?.pages) {
      makesData.pages.forEach((page) => {
        page.data?.data?.forEach((item) => {
          const makeValue = String(item[carMakesConfig.valueField]);
          const label = String(item[carMakesConfig.labelField]);
          const rawLogo = carMakesConfig.logoField
            ? item[carMakesConfig.logoField]
            : undefined;
          const logoUrl =
            typeof rawLogo === 'string' && isValidImageUrl(rawLogo)
              ? rawLogo.trim()
              : undefined;
          const isSelected = selectedBrands.includes(makeValue);
          const isCarTrimRequired = !!item.isCarTrimRequired;

          allMakes.set(makeValue, {
            value: makeValue,
            label,
            logoUrl,
            isSelected,
            isCarTrimRequired,
          });
        });
      });
    }

    // 3. Sort: Selected items first, then alphabetically
    return Array.from(allMakes.values()).sort((a, b) => {
      if (a.isSelected && !b.isSelected) return -1;
      if (!a.isSelected && b.isSelected) return 1;

      return (a.label || '').localeCompare(b.label || '', locale, {
        numeric: true,
        sensitivity: 'base',
      });
    });
  }, [makesData?.pages, selectedBrands, carMakesConfig, locale]);

  // =============================================================================
  // EFFECTS
  // =============================================================================

  // Auto-expand selected items properly
  useEffect(() => {
    setExpandedBrands(new Set(selectedBrands));
    if (selectedModel) {
      setExpandedModels((prev) => new Set([...prev, selectedModel]));
    }
  }, [selectedBrands, selectedModel]);

  // Infinite scroll observer for makes
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
      { root: listRef.current, threshold: 0.1, rootMargin: '40px' },
    );

    observer.observe(observerRef.current);
    return () => observer.disconnect();
  }, [hasNextMakesPage, isFetchingNextMakesPage, fetchNextMakesPage]);

  // =============================================================================
  // EVENT HANDLERS
  // =============================================================================

  const handleBrandToggle = useCallback(
    (brandId: string) => {
      onBrandToggle(brandId);

      const willBeSelected = !selectedBrands.includes(brandId);
      if (willBeSelected) {
        setExpandedBrands((prev) => new Set([...prev, brandId]));
      } else {
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
              isFocused || searchTerm
                ? 'text-primary dark:text-[#ABDE3B]'
                : 'text-slate-400 dark:text-zinc-500'
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
            className={`w-full border border-slate-200 dark:border-zinc-800 bg-[#EFEFEF] dark:bg-zinc-950 text-slate-800 dark:text-zinc-100 transition-all duration-200 ${
              isRTL ? 'pr-9 pl-8 text-right' : 'pl-9 pr-8 text-left'
            } h-10 rounded-lg text-sm focus:outline-none focus:border-primary dark:focus:border-[#ABDE3B] focus:ring-1 focus:ring-primary/30 dark:focus:ring-[#ABDE3B]/30 hover:border-slate-300 dark:hover:border-zinc-700 ${
              isFocused ? 'bg-white dark:bg-zinc-900 shadow-sm' : ''
            }`}
          />
          {searchTerm && (
            <button
              type="button"
              onClick={() => setSearchTerm('')}
              className={`absolute ${
                isRTL ? 'left-2' : 'right-2'
              } top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-zinc-350`}
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div
        ref={listRef}
        className="overflow-y-auto rounded-lg border border-slate-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 shadow-sm"
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
              <Search className="h-8 w-8 mx-auto opacity-50 mb-2 dark:text-zinc-400" />
              <div className="text-sm text-slate-500 dark:text-zinc-400">
                {noOptionsMessage}
              </div>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {makes.map((brand) => (
                  <BrandItem
                    key={brand.value}
                    brand={brand}
                    locale={locale}
                    isRTL={isRTL}
                    selectedBrands={selectedBrands}
                    expandedBrands={expandedBrands}
                    setExpandedBrands={setExpandedBrands}
                    carModelsConfig={carModelsConfig}
                    selectedModel={selectedModel}
                    onBrandToggle={onBrandToggle}
                    expandedModels={expandedModels}
                    setExpandedModels={setExpandedModels}
                    carTrimsConfig={carTrimsConfig}
                    selectedTrim={selectedTrim}
                    onTrimSelect={onTrimSelect}
                    onModelSelect={handleModelSelect}
                    handleBrandToggle={handleBrandToggle}
                  />
                ))}
              </div>

              {(isLoadingMakes || isFetchingNextMakesPage) && (
                <div className="flex justify-center items-center p-4">
                  <Loader2 className="w-5 h-5 animate-spin text-primary dark:text-[#ABDE3B] mr-2" />
                  <span className="text-sm text-slate-500 dark:text-zinc-400">
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

      {/* Selection Status with multi-brand display */}
      {(selectedBrands.length > 0 || selectedModel || selectedTrim) && (
        <div className="p-3 bg-primary/5 dark:bg-[#ABDE3B]/5 border border-primary/20 dark:border-[#ABDE3B]/20 rounded-lg">
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
                <span className="text-primary dark:text-[#ABDE3B] font-medium ml-1">
                  {selectedBrands.length} {isRTL ? 'علامة تجارية' : 'brand'}
                  {selectedBrands.length !== 1 && !isRTL ? 's' : ''}
                </span>
              )}
              {selectedModel && (
                <span className="text-primary dark:text-[#ABDE3B] font-medium ml-1">
                  {isRTL ? '• 1 موديل' : '• 1 model'}
                </span>
              )}
              {selectedTrim && (
                <span className="text-primary dark:text-[#ABDE3B] font-medium ml-1">
                  {isRTL ? '• 1 تريم' : '• 1 trim'}
                </span>
              )}
            </div>

            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                selectedBrands.forEach((brandId) => onBrandToggle(brandId));
                if (selectedModel) onModelSelect('');
                if (selectedTrim) onTrimSelect('');
                setExpandedBrands(new Set());
                setExpandedModels(new Set());
              }}
              className="h-auto p-1.5 text-xs text-slate-500 dark:text-zinc-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30"
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
