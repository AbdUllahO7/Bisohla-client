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
import React, { useState, useEffect } from 'react';
import type { QueryParams, FilterGroup } from '@/core/entities/api/api';
import ServerSelect from '@/components/server-select';

import {
  SelectCarMakeDto,
  SelectCarModelDto,
  SelectCarTrimDto,
} from '@/core/entities/models/cars/cars.dto';
import {
  ViewMode,
  FilterType,
  StatusFilter,
  SortOption,
} from '@/core/entities/models/cars/filter-types';
import {
  getCarMakes,
  getCarModels,
  getCarTrims,
} from '@/core/infrastructure-adapters/actions/visitors/car.visitor.actions';
import { useDebounce } from '@/hooks/use-debounce';
import { getInjection } from '@/di/container';
import { ListingTypeFilterSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';

interface SimpleProductsFilterProps {
  onChange?: (params: QueryParams) => void;
  onListingTypeChange?: (id: number | undefined) => void;
  listingTypeId?: number;
  listingTypes?: any[];
  onViewModeChange?: (mode: ViewMode) => void;
  viewMode?: ViewMode;
  totalItems?: number;
  isLoading?: boolean;
  onRefresh?: () => void;
}

const MyProductsFilter: React.FC<SimpleProductsFilterProps> = ({
  onChange,
  onListingTypeChange,
  listingTypeId,
  listingTypes = [],
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

  // Dynamic filter states
  const [filterSchema, setFilterSchema] = useState<ListingTypeFilterSchemaDto | null>(null);
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Count active car filters
  const activeCarFilters = [makeId, modelId, trimId].filter(Boolean).length;

  // Build filter query matching FilterProvider.tsx pattern
  useEffect(() => {
    const filterGroups: FilterGroup[] = [];
    
    // 1. Listing Type (Offer Type) filter group
    if (listingType !== 'all') {
      filterGroups.push({
        operator: 'and',
        filters: [
          {
            field: 'listingOfferType',
            operator: 'eq',
            value: listingType,
          },
        ],
      });
    }

    // 2. Car filters group
    const carDetailsFilters: any[] = [];
    if (makeId) {
      carDetailsFilters.push({
        field: 'makeId',
        operator: 'eq',
        value: makeId,
      });
    }
    if (modelId) {
      carDetailsFilters.push({
        field: 'modelId',
        operator: 'eq',
        value: modelId,
      });
    }
    if (trimId) {
      carDetailsFilters.push({
        field: 'trimId',
        operator: 'eq',
        value: trimId,
      });
    }

    if (carDetailsFilters.length > 0) {
      filterGroups.push({
        operator: 'and',
        filters: carDetailsFilters,
      });
    }

    // 3. Status filter group (Custom for My Listings)
    if (status !== 'all') {
      filterGroups.push({
        operator: 'and',
        filters: [
          {
            field: 'publicationStatus', // Using publicationStatus from the example data
            operator: 'eq',
            value: status,
          },
        ],
      });
    }

    // 4. Dynamic attribute filters
    if (Object.keys(dynamicAttributes).length > 0) {
      const attributeFilters: any[] = [];
      Object.entries(dynamicAttributes).forEach(([slug, value]) => {
        if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
          if (Array.isArray(value)) {
            attributeFilters.push({ field: slug, operator: 'in', value });
          } else {
            attributeFilters.push({ field: slug, operator: 'eq', value });
          }
        }
      });
      if (attributeFilters.length > 0) {
        filterGroups.push({
          operator: 'and',
          filters: attributeFilters,
        });
      }
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
      searchTerm: debouncedSearchQuery.trim() || undefined,
    };

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
    dynamicAttributes,
    listingTypeId,
    onChange,
  ]);

  // Fetch filter schema when listingTypeId changes
  useEffect(() => {
    const fetchSchema = async () => {
      if (!listingTypeId) {
        setFilterSchema(null);
        return;
      }
      try {
        const controller = getInjection('IListingTypesRepoController');
        const res = await controller.getFilterSchema(listingTypeId);
        if (res.success && res.data) {
          setFilterSchema(res.data);
        }
      } catch (error) {
        console.error('Failed to fetch filter schema:', error);
      }
    };
    fetchSchema();
    // Reset all filters when category changes
    setDynamicAttributes({});
    setMakeId(undefined);
    setModelId(undefined);
    setTrimId(undefined);
    setListingType('all');
    setStatus('all');
  }, [listingTypeId]);

  const updateAttribute = (slug: string, value: any) => {
    setDynamicAttributes(prev => ({
      ...prev,
      [slug]: value
    }));
  };

  // Handle reset filters
  const handleReset = () => {
    setSearchQuery('');
    setListingType('all');
    setStatus('all');
    setSortBy('newest');
    setMakeId(undefined);
    setModelId(undefined);
    setTrimId(undefined);
    setDynamicAttributes({});
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
            {isRTL ? 'إعلاناتي' : 'My Listings'}
          </h2>
          <p className="text-sm text-muted-foreground">
            {totalItems} {isRTL ? 'إعلان' : 'listings'}
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
            <div className="relative flex-1 w-full">
              <Search
                className={`absolute top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground ${
                  isRTL ? 'right-3' : 'left-3'
                }`}
              />
              <Input
                placeholder={
                  isRTL ? 'البحث في إعلاناتي...' : 'Search my listings...'
                }
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className={`${isRTL ? 'pr-9' : 'pl-9'} h-10`}
              />
            </div>

            {/* Category (Listing Type ID) Filter */}
            <Select
              value={listingTypeId ? String(listingTypeId) : "all"}
              onValueChange={(value: string) => {
                const id = value === "all" ? undefined : Number(value);
                if (onListingTypeChange) onListingTypeChange(id);
              }}
            >
              <SelectTrigger className="w-full lg:w-[180px]">
                <SelectValue placeholder={isRTL ? 'الفئة' : 'Category'} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  {isRTL ? 'جميع الفئات' : 'All Categories'}
                </SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

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

            {/* Advanced Filters Toggle - ONLY FOR CARS (ID 1) */}
            {listingTypeId === 1 && (
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="w-full lg:w-auto px-4"
              >
                <Filter className={`h-4 w-4 ${isRTL ? 'ml-2' : 'mr-2'}`} />
                {isRTL ? 'تفاصيل الإعلان' : 'Listing Details'}
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
            )}

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

      {/* Advanced Car Filters - ONLY FOR CARS (ID 1) */}
      {listingTypeId === 1 && (
        <Collapsible
          open={showAdvancedFilters}
          onOpenChange={setShowAdvancedFilters}
        >
          <CollapsibleContent>
            <Card>
              <CardContent className="p-4 space-y-4">
                <div className="flex items-center gap-2 mb-4">
                  <Filter className="h-5 w-5 text-primary" />
                  <h3 className="text-lg font-semibold">
                    {isRTL ? 'تفاصيل الإعلان' : 'Listing Details'}
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Car Make */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium">
                      {isRTL ? 'الماركة' : 'Make'}
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

                  {/* Model - Only show if make is selected */}
                  {makeId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {isRTL ? 'الموديل' : 'Model'}
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

                  {/* Trim - Only show if model is selected */}
                  {modelId && (
                    <div className="space-y-2">
                      <label className="text-sm font-medium">
                        {isRTL ? 'الفئة' : 'Trim'}
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
                      {isRTL ? 'المرشحات النشطة:' : 'Active Filters:'}
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
      )}

      {/* Dynamic Category Filters */}
      {filterSchema && listingTypeId !== 1 && (
        <Card>
          <CardContent className="p-4 space-y-6">
            <div className="flex items-center gap-2 mb-2">
              <Filter className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-semibold">
                {isRTL ? 'مرشحات إضافية' : 'More Filters'}
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filterSchema.sections.map((section) => (
                <React.Fragment key={section.id}>
                  {section.attributes.map((attr) => {
                    if (!attr.isFilterable || !attr.isActive) return null;
                    
                    const attrName = attr.translations.find((t: any) => t.locale === locale)?.name || attr.name;
                    
                    if (attr.type === 'select') {
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-sm font-medium">{attrName}</label>
                          <Select
                            value={dynamicAttributes[attr.slug] || "all"}
                            onValueChange={(value) => updateAttribute(attr.slug, value === "all" ? undefined : value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder={attrName} />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                              {attr.options.map((opt: any) => (
                                <SelectItem key={opt.id} value={opt.id}>
                                  {opt.label[locale] || opt.label['en'] || opt.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    if (attr.type === 'number') {
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-sm font-medium">{attrName}</label>
                          <Input
                            type="number"
                            placeholder={attrName}
                            value={dynamicAttributes[attr.slug] || ''}
                            onChange={(e) => updateAttribute(attr.slug, e.target.value)}
                          />
                        </div>
                      );
                    }

                    return null;
                  })}
                </React.Fragment>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default MyProductsFilter;
