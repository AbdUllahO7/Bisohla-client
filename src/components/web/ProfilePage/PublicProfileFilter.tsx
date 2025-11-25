'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Collapsible, CollapsibleContent } from '@/components/ui/collapsible';
import {
  Search,
  RefreshCw,
  ChevronDown,
  X,
  SlidersHorizontal,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import type { QueryParams, FilterGroup } from '@/core/entities/api/api';
import ServerSelect from '@/components/server-select';
import {
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
} from '@/core/entities/models/cars/cars.dto';
import {
  FilterType,
  SortOption,
} from '@/core/entities/models/cars/filter-types';
import {
  getCarMakes,
  getCarModels,
  getCarTrims,
} from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { useDebounce } from '@/hooks/use-debounce';

interface PublicProfileFilterProps {
  onChange?: (params: QueryParams) => void;
  totalItems?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const PublicProfileFilter: React.FC<PublicProfileFilterProps> = ({
  onChange,
  totalItems = 0,
  isLoading = false,
  onRefresh,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('publicProfile.filters');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState<FilterType>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Car filter states
  const [makeId, setMakeId] = useState<number | undefined>(undefined);
  const [modelId, setModelId] = useState<number | undefined>(undefined);
  const [trimId, setTrimId] = useState<number | undefined>(undefined);

  // UI states
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Count active car filters
  const activeCarFilters = [makeId, modelId, trimId].filter(Boolean).length;

  // Build filter query
  useEffect(() => {
    const filterGroups: FilterGroup[] = [];

    // Listing type filter
    if (listingType !== 'all') {
      filterGroups.push({
        operator: 'and',
        filters: [
          {
            field: 'listingType',
            operator: 'eq',
            value: listingType,
          },
        ],
      });
    }

    // Car filters
    const carFilters = [];
    if (makeId) {
      carFilters.push({
        field: 'makeId',
        operator: 'eq',
        value: makeId,
      });
    }
    if (modelId) {
      carFilters.push({
        field: 'modelId',
        operator: 'eq',
        value: modelId,
      });
    }
    if (trimId) {
      carFilters.push({
        field: 'trimId',
        operator: 'eq',
        value: trimId,
      });
    }

    if (carFilters.length > 0) {
      filterGroups.push({
        operator: 'and',
        filters: carFilters,
      });
    }

    // Sort configuration
    let sortField = 'createdAt';
    let sortDirection: 'asc' | 'desc' = 'desc';

    switch (sortBy) {
      case 'oldest':
        sortField = 'createdAt';
        sortDirection = 'asc';
        break;
      case 'price_high':
        sortField = 'price';
        sortDirection = 'desc';
        break;
      case 'price_low':
        sortField = 'price';
        sortDirection = 'asc';
        break;
      case 'title_asc':
        sortField = 'title';
        sortDirection = 'asc';
        break;
      case 'title_desc':
        sortField = 'title';
        sortDirection = 'desc';
        break;
      case 'newest':
      default:
        sortField = 'createdAt';
        sortDirection = 'desc';
        break;
    }

    const queryParams: QueryParams = {
      page: 1,
      pageSize: 12,
      sortBy: sortField,
      sortDirection,
      filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
    };

    // Add search parameters only if search query exists
    if (debouncedSearchQuery.trim()) {
      queryParams.searchKey = 'title';
      queryParams.searchTerm = debouncedSearchQuery.trim();
    }

    if (onChange) {
      onChange(queryParams);
    }
  }, [
    debouncedSearchQuery,
    listingType,
    sortBy,
    makeId,
    modelId,
    trimId,
    onChange,
  ]);

  // Handle reset filters
  const handleReset = () => {
    setSearchQuery('');
    setListingType('all');
    setSortBy('newest');
    setMakeId(undefined);
    setModelId(undefined);
    setTrimId(undefined);
  };

  // Handle make change and reset dependent fields
  const handleMakeChange = (value: number | number[] | undefined) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setMakeId(selectedValue);
    setModelId(undefined);
    setTrimId(undefined);
  };

  // Handle model change and reset dependent fields
  const handleModelChange = (value: number | number[] | undefined) => {
    const selectedValue = Array.isArray(value) ? value[0] : value;
    setModelId(selectedValue);
    setTrimId(undefined);
  };

  return (
    <div className="w-full space-y-4 mb-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Main Filter Bar */}
      <div className="bg-white rounded-xl shadow-md border-2 border-gray-100 p-4">
        <div className="flex flex-col gap-4">
          {/* Top row - Search and total count */}
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
            {/* Search */}
            <div className="relative flex-1 w-full max-w-md">
              <Search
                className={`absolute top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400 ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${
                  isRTL ? 'pr-10' : 'pl-10'
                } h-11 border-gray-300 focus:border-[#198341] focus:ring-[#198341]`}
              />
            </div>

            {/* Total count and refresh */}
            <div className="flex items-center gap-3">
              <span className="text-sm text-gray-600">
                {totalItems} {t('totalCars')}
              </span>
              {onRefresh && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={onRefresh}
                  disabled={isLoading}
                  className="h-9 px-3 border-gray-300 hover:border-[#198341] hover:bg-[#198341]/5"
                >
                  <RefreshCw
                    className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
                  />
                </Button>
              )}
            </div>
          </div>

          {/* Bottom row - Filters */}
          <div className="flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
            {/* Listing Type */}
            <Select
              value={listingType}
              onValueChange={(value: FilterType) => setListingType(value)}
            >
              <SelectTrigger className="w-full sm:w-[150px] h-10 border-gray-300 focus:border-[#198341] focus:ring-[#198341]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="for_sale">{t('forSale')}</SelectItem>
                <SelectItem value="for_rent">{t('forRent')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-10 border-gray-300 focus:border-[#198341] focus:ring-[#198341]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
                <SelectItem value="price_high">{t('priceHigh')}</SelectItem>
                <SelectItem value="price_low">{t('priceLow')}</SelectItem>
                <SelectItem value="title_asc">{t('titleAsc')}</SelectItem>
                <SelectItem value="title_desc">{t('titleDesc')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`h-10 px-4 border-gray-300 hover:bg-gradient-to-r hover:from-[#198341] hover:to-[#ABDE3B] hover:text-white hover:border-transparent transition-all duration-300 ${
                showAdvancedFilters
                  ? 'bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white border-transparent'
                  : ''
              }`}
            >
              <SlidersHorizontal
                className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`}
              />
              {t('advancedFilters')}
              {activeCarFilters > 0 && (
                <Badge
                  variant="secondary"
                  className={`${
                    isRTL ? 'mr-2' : 'ml-2'
                  } bg-white text-[#198341]`}
                >
                  {activeCarFilters}
                </Badge>
              )}
              <ChevronDown
                className={`h-4 w-4 ${
                  isRTL ? 'mr-2' : 'ml-2'
                } transition-transform ${
                  showAdvancedFilters ? 'rotate-180' : ''
                }`}
              />
            </Button>

            {/* Reset Button */}
            <Button
              variant="outline"
              onClick={handleReset}
              className="h-10 px-4 border-gray-300 hover:border-red-500 hover:bg-red-50 hover:text-red-600 transition-colors"
            >
              {t('reset')}
            </Button>
          </div>
        </div>
      </div>

      {/* Advanced Car Filters */}
      <Collapsible
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
      >
        <CollapsibleContent>
          <div className="bg-white rounded-xl shadow-md border-2 border-[#198341]/20 p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="h-8 w-1 bg-gradient-to-b from-[#198341] to-[#ABDE3B] rounded-full"></div>
              <h3 className="text-lg font-bold text-[#2C3C39]">
                {t('carFilters')}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {/* Car Make */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-gray-700">
                  {t('carMake')}
                </label>
                <ServerSelect<SelectCarMakeDto, 'id'>
                  queryKey={['car-makes']}
                  fetchFn={getCarMakes}
                  labelField="name"
                  valueField="id"
                  placeholder={t('selectMake')}
                  value={makeId}
                  onChange={handleMakeChange}
                  pageSize={20}
                  searchPlaceholder={t('searchMakes')}
                  noOptionsMessage={t('noMakesFound')}
                />
              </div>

              {/* Car Model - Only show if make is selected */}
              {makeId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('carModel')}
                  </label>
                  <ServerSelect<SelectCarModelDto, 'id'>
                    queryKey={['car-models', makeId.toString()]}
                    fetchFn={(params) =>
                      getCarModels({
                        ...params,
                        where: [
                          {
                            field: 'makeId',
                            operator: 'eq',
                            value: makeId,
                          },
                        ],
                      })
                    }
                    labelField="name"
                    valueField="id"
                    placeholder={t('selectModel')}
                    value={modelId}
                    onChange={handleModelChange}
                    pageSize={20}
                    searchPlaceholder={t('searchModels')}
                    noOptionsMessage={t('noModelsFound')}
                  />
                </div>
              )}

              {/* Car Trim - Only show if model is selected */}
              {modelId && (
                <div className="space-y-2">
                  <label className="text-sm font-medium text-gray-700">
                    {t('carTrim')}
                  </label>
                  <ServerSelect<SelectCarTrimDto, 'id'>
                    queryKey={['car-trims', modelId.toString()]}
                    fetchFn={(params) =>
                      getCarTrims({
                        ...params,
                        where: [
                          {
                            field: 'modelId',
                            operator: 'eq',
                            value: modelId,
                          },
                        ],
                      })
                    }
                    labelField="name"
                    valueField="id"
                    placeholder={t('selectTrim')}
                    value={trimId}
                    onChange={(value) => {
                      const selectedValue = Array.isArray(value)
                        ? value[0]
                        : value;
                      setTrimId(selectedValue);
                    }}
                    pageSize={20}
                    searchPlaceholder={t('searchTrims')}
                    noOptionsMessage={t('noTrimsFound')}
                  />
                </div>
              )}
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default PublicProfileFilter;
