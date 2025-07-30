'use client';

import { Card, CardContent } from '@/components/ui/card';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  Search,
  Filter,
  RefreshCw,
  Grid,
  List,
  ChevronDown,
  X,
  Car,
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
  getCarMakes,
  getCarModels,
  getCarTrims,
} from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';

// View mode type
type ViewMode = 'grid' | 'list';

// Filter type for listing types
type FilterType = 'all' | 'for_sale' | 'for_rent';

// Status filter type
type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

// Sort options
type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_high'
  | 'price_low'
  | 'title_asc'
  | 'title_desc';

interface SimpleProductsFilterProps {
  onChange?: (params: QueryParams) => void;
  onViewModeChange?: (mode: ViewMode) => void;
  viewMode?: ViewMode;
  totalItems?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

// Custom hook for debounced value
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const MyProductsFilter: React.FC<SimpleProductsFilterProps> = ({
  onChange,
  onViewModeChange,
  viewMode = 'grid',
  totalItems = 0,
  isLoading = false,
  onRefresh,
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const t = useTranslations('UserProfile.products');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState<FilterType>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
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

    // Status filter
    if (status !== 'all') {
      filterGroups.push({
        operator: 'and',
        filters: [
          {
            field: 'status',
            operator: 'eq',
            value: status,
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
      pageSize: 8,
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
    status,
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
    setStatus('all');
    setSortBy('newest');
    setMakeId(undefined);
    setModelId(undefined);
    setTrimId(undefined);
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
  };

  // Handle make change and reset dependent fields
  const handleMakeChange = (value: number | number[] | undefined) => {
    // If value is an array, pick the first element or undefined
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
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Header with total count and view toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            {isRTL ? 'سياراتي' : 'My Cars'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalItems} {isRTL ? 'سيارة' : 'cars'}
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === 'grid' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('grid')}
            className="px-3"
          >
            <Grid className="h-4 w-4" />
          </Button>
          <Button
            variant={viewMode === 'list' ? 'default' : 'outline'}
            size="sm"
            onClick={() => handleViewModeChange('list')}
            className="px-3"
          >
            <List className="h-4 w-4" />
          </Button>

          {onRefresh && (
            <Button
              variant="outline"
              size="sm"
              onClick={onRefresh}
              disabled={isLoading}
              className="px-3"
            >
              <RefreshCw
                className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`}
              />
            </Button>
          )}
        </div>
      </div>

      {/* Basic Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col lg:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <Input
                placeholder={
                  isRTL ? 'البحث في سياراتي...' : 'Search my cars...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} h-10`}
              />
            </div>

            {/* Listing Type Filter */}
            <Select
              value={listingType}
              onValueChange={(value: FilterType) => setListingType(value)}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isRTL ? 'جميع الأنواع' : 'All Types'}
                </SelectItem>
                <SelectItem value="for_sale">
                  {isRTL ? 'للبيع' : 'For Sale'}
                </SelectItem>
                <SelectItem value="for_rent">
                  {isRTL ? 'للإيجار' : 'For Rent'}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Status Filter */}
            <Select
              value={status}
              onValueChange={(value: StatusFilter) => setStatus(value)}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isRTL ? 'جميع الحالات' : 'All Status'}
                </SelectItem>
                <SelectItem value="approved">
                  {isRTL ? 'نشط' : 'Active'}
                </SelectItem>
                <SelectItem value="pending">
                  {isRTL ? 'قيد المراجعة' : 'Pending'}
                </SelectItem>
                <SelectItem value="rejected">
                  {isRTL ? 'مرفوض' : 'Rejected'}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select
              value={sortBy}
              onValueChange={(value: SortOption) => setSortBy(value)}
            >
              <SelectTrigger className="w-full lg:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">
                  {isRTL ? 'الأحدث' : 'Newest'}
                </SelectItem>
                <SelectItem value="oldest">
                  {isRTL ? 'الأقدم' : 'Oldest'}
                </SelectItem>
                <SelectItem value="price_high">
                  {isRTL ? 'السعر (الأعلى)' : 'Price (High)'}
                </SelectItem>
                <SelectItem value="price_low">
                  {isRTL ? 'السعر (الأقل)' : 'Price (Low)'}
                </SelectItem>
                <SelectItem value="title_asc">
                  {isRTL ? 'العنوان (أ-ي)' : 'Title (A-Z)'}
                </SelectItem>
                <SelectItem value="title_desc">
                  {isRTL ? 'العنوان (ي-أ)' : 'Title (Z-A)'}
                </SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Toggle */}
            <Button
              variant="outline"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className="w-full lg:w-auto px-4"
            >
              <Car className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
              {isRTL ? 'مرشحات متقدمة' : 'Car Filters'}
              {activeCarFilters > 0 && (
                <Badge
                  variant="secondary"
                  className={`${isRTL ? 'mr-2' : 'ml-2'}`}
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
              className="w-full lg:w-auto px-4"
            >
              {isRTL ? 'إعادة تعيين' : 'Reset'}
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Advanced Car Filters */}
      <Collapsible
        open={showAdvancedFilters}
        onOpenChange={setShowAdvancedFilters}
      >
        <CollapsibleContent>
          <Card>
            <CardContent className="p-4 space-y-4">
              <div className="flex items-center gap-2 mb-4">
                <Car className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-semibold">
                  {isRTL ? 'مرشحات السيارة' : 'Car Filters'}
                </h3>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Car Make */}
                <div className="space-y-2">
                  <label className="text-sm font-medium">
                    {isRTL ? 'ماركة السيارة' : 'Car Make'}
                  </label>
                  <ServerSelect<SelectCarMakeDto, 'id'>
                    queryKey={['car-makes']}
                    fetchFn={getCarMakes}
                    labelField="name"
                    valueField="id"
                    placeholder={isRTL ? 'اختر الماركة...' : 'Select make...'}
                    value={makeId}
                    onChange={handleMakeChange}
                    pageSize={20}
                    searchPlaceholder={
                      isRTL ? 'ابحث عن الماركات...' : 'Search makes...'
                    }
                    noOptionsMessage={
                      isRTL ? 'لم يتم العثور على ماركات' : 'No makes found'
                    }
                  />
                </div>

                {/* Car Model - Only show if make is selected */}
                {makeId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'موديل السيارة' : 'Car Model'}
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
                      placeholder={
                        isRTL ? 'اختر الموديل...' : 'Select model...'
                      }
                      value={modelId}
                      onChange={handleModelChange}
                      pageSize={20}
                      searchPlaceholder={
                        isRTL ? 'ابحث عن الموديلات...' : 'Search models...'
                      }
                      noOptionsMessage={
                        isRTL ? 'لم يتم العثور على موديلات' : 'No models found'
                      }
                    />
                  </div>
                )}

                {/* Car Trim - Only show if model is selected */}
                {modelId && (
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'فئة السيارة' : 'Car Trim'}
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
                      placeholder={isRTL ? 'اختر الفئة...' : 'Select trim...'}
                      value={trimId}
                      onChange={(value) => {
                        const selectedValue = Array.isArray(value)
                          ? value[0]
                          : value;
                        setTrimId(selectedValue);
                      }}
                      pageSize={20}
                      searchPlaceholder={
                        isRTL ? 'ابحث عن الفئات...' : 'Search trims...'
                      }
                      noOptionsMessage={
                        isRTL ? 'لم يتم العثور على فئات' : 'No trims found'
                      }
                    />
                  </div>
                )}
              </div>

              {/* Active Car Filters Display */}
              {activeCarFilters > 0 && (
                <div className="pt-4 border-t">
                  <p className="text-sm font-medium mb-2">
                    {isRTL ? 'المرشحات النشطة:' : 'Active Car Filters:'}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {makeId && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {isRTL ? 'ماركة محددة' : 'Make Selected'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleMakeChange(undefined)}
                        />
                      </Badge>
                    )}
                    {modelId && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {isRTL ? 'موديل محدد' : 'Model Selected'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => handleModelChange(undefined)}
                        />
                      </Badge>
                    )}
                    {trimId && (
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1"
                      >
                        {isRTL ? 'فئة محددة' : 'Trim Selected'}
                        <X
                          className="h-3 w-3 cursor-pointer"
                          onClick={() => setTrimId(undefined)}
                        />
                      </Badge>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
};

export default MyProductsFilter;
