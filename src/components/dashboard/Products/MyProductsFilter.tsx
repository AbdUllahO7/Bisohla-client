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
  Search,
  Filter,
  RefreshCw,
  Grid,
  List,
  X,
  ChevronDown,
} from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import React, { useState, useEffect } from 'react';
import type { QueryParams } from '@/core/entities/api/api';
import { useDebounce } from '@/hooks/use-debounce';
import { getInjection } from '@/di/container';
import { ListingTypeFilterSchemaDto } from '@/core/entities/models/listing-types/listing-types.dto';
import { ViewMode, FilterType, StatusFilter, SortOption } from '@/core/entities/models/cars/filter-types';

interface MyProductsFilterProps {
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

const MyProductsFilter: React.FC<MyProductsFilterProps> = ({
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
  const tFavorites = useTranslations('UserProfile.favorites');

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [listingType, setListingType] = useState<FilterType>('all');
  const [status, setStatus] = useState<StatusFilter>('all');
  const [sortBy, setSortBy] = useState<SortOption>('newest');

  // Dynamic filter states
  const [filterSchema, setFilterSchema] = useState<ListingTypeFilterSchemaDto | null>(null);
  const [dynamicAttributes, setDynamicAttributes] = useState<Record<string, any>>({});
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build filter query
  useEffect(() => {
    const where: any[] = [];
    const filterGroups: any[] = [];
    
    if (listingTypeId) {
      where.push({ field: 'listingTypeId', operator: 'eq', value: listingTypeId });
    }

    if (listingType !== 'all') {
      where.push({ field: 'listingOfferType', operator: 'eq', value: listingType });
    }

    if (status !== 'all') {
      where.push({ field: 'publicationStatus', operator: 'eq', value: status });
    }

    // Dynamic attributes - using filterGroups like Favorites page
    const dynamicFilters: any[] = [];
    Object.entries(dynamicAttributes).forEach(([slug, value]) => {
      if (value !== undefined && value !== '' && (Array.isArray(value) ? value.length > 0 : true)) {
        if (Array.isArray(value)) {
          dynamicFilters.push({ field: `attrs.${slug}`, operator: 'in', value });
        } else {
          dynamicFilters.push({
            field: `attrs.${slug}`,
            operator: 'eq',
            value: isNaN(Number(value)) ? value : Number(value),
          });
        }
      }
    });

    if (dynamicFilters.length > 0) {
      filterGroups.push({
        operator: 'and',
        filters: dynamicFilters,
      });
    }

    // Sort configuration
    let sortField = 'createdAt';
    let sortDirection: 'asc' | 'desc' = 'desc';

    switch (sortBy) {
      case 'oldest': sortField = 'createdAt'; sortDirection = 'asc'; break;
      case 'price_high': sortField = 'price'; sortDirection = 'desc'; break;
      case 'price_low': sortField = 'price'; sortDirection = 'asc'; break;
      case 'title_asc': sortField = 'title'; sortDirection = 'asc'; break;
      case 'title_desc': sortField = 'title'; sortDirection = 'desc'; break;
      case 'newest': default: sortField = 'createdAt'; sortDirection = 'desc'; break;
    }

    const queryParams: QueryParams = {
      page: 1,
      pageSize: 12,
      sortBy: sortField,
      sortDirection,
      where: where.length > 0 ? where : undefined,
      filterGroups: filterGroups.length > 0 ? filterGroups : undefined,
      searchTerm: debouncedSearchQuery.trim() || undefined,
    };

    if (onChange) onChange(queryParams);
  }, [debouncedSearchQuery, listingType, status, sortBy, dynamicAttributes, listingTypeId, onChange]);

  // Fetch filter schema
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
          setFilterSchema({ ...res.data, listingTypeId });
        }
      } catch (error) {
        console.error('Failed to fetch filter schema:', error);
      }
    };
    fetchSchema();
    setDynamicAttributes({});
  }, [listingTypeId]);

  const updateAttribute = (slug: string, value: any) => {
    setDynamicAttributes(prev => ({ ...prev, [slug]: value }));
  };

  const handleReset = () => {
    setSearchQuery('');
    setListingType('all');
    setStatus('all');
    setSortBy('newest');
    setDynamicAttributes({});
  };

  return (
    <div className="space-y-4" dir={isRTL ? 'rtl' : 'ltr'}>
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-primary">
            {isRTL ? 'إعلاناتي' : 'My Listings'}
          </h2>
          <Badge variant="secondary" className="mt-1">
            {totalItems} {isRTL ? 'إعلان' : 'listings'}
          </Badge>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex bg-muted p-1 rounded-lg">
            <Button
              variant={viewMode === 'grid' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('grid')}
              className="h-8 w-8 p-0"
            >
              <Grid className="h-4 w-4" />
            </Button>
            <Button
              variant={viewMode === 'list' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => onViewModeChange?.('list')}
              className="h-8 w-8 p-0"
            >
              <List className="h-4 w-4" />
            </Button>
          </div>

          {onRefresh && (
            <Button variant="outline" size="sm" onClick={onRefresh} disabled={isLoading} className="h-10">
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
          )}
        </div>
      </div>

      <Card className="dark:bg-zinc-900 dark:border-zinc-800">
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4 items-center">
            {/* Search */}
            <div className="relative flex-1 w-full">
              <Search className="absolute left-3 rtl:left-auto rtl:right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder={t('searchPlaceholder')}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9 rtl:pl-3 rtl:pr-9 h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
              />
            </div>

            {/* Category */}
            <Select
              value={listingTypeId ? String(listingTypeId) : "all"}
              onValueChange={(val) => onListingTypeChange?.(val === "all" ? undefined : Number(val))}
            >
              <SelectTrigger className="w-full sm:w-[160px] h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                <SelectValue placeholder={isRTL ? 'الفئة' : 'Category'} />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectItem value="all">{isRTL ? 'جميع الفئات' : 'All Categories'}</SelectItem>
                {listingTypes.map((type) => (
                  <SelectItem key={type.id} value={String(type.id)}>
                    {type.translations?.find((tr: any) => tr.locale === locale)?.name || type.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {/* Offer Type */}
            <Select value={listingType} onValueChange={(val: any) => setListingType(val)}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectItem value="all">{t('allTypes')}</SelectItem>
                <SelectItem value="for_sale">{t('forSale')}</SelectItem>
                <SelectItem value="for_rent">{t('forRent')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Status */}
            <Select value={status} onValueChange={(val: any) => setStatus(val)}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectItem value="all">{t('allStatus')}</SelectItem>
                <SelectItem value="approved">{t('active')}</SelectItem>
                <SelectItem value="pending">{t('pending')}</SelectItem>
                <SelectItem value="rejected">{t('rejected')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Sort */}
            <Select value={sortBy} onValueChange={(val: any) => setSortBy(val)}>
              <SelectTrigger className="w-full sm:w-[150px] h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                <SelectItem value="newest">{t('newest')}</SelectItem>
                <SelectItem value="oldest">{t('oldest')}</SelectItem>
                <SelectItem value="price_high">{t('priceHigh')}</SelectItem>
                <SelectItem value="price_low">{t('priceLow')}</SelectItem>
                <SelectItem value="title_asc">{t('titleAsc')}</SelectItem>
                <SelectItem value="title_desc">{t('titleDesc')}</SelectItem>
              </SelectContent>
            </Select>

            {/* Advanced Filters Button */}
            {filterSchema && (
              <Button
                variant="outline"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
                className="h-10 px-4"
              >
                <Filter className="h-4 w-4 mr-2 rtl:mr-0 rtl:ml-2" />
                {tFavorites('advancedFilters') || 'Advanced Filters'}
                <ChevronDown className={`ml-2 h-4 w-4 transition-transform ${showAdvancedFilters ? 'rotate-180' : ''}`} />
              </Button>
            )}

            {/* Reset */}
            <Button variant="ghost" onClick={handleReset} className="h-10 px-3 text-muted-foreground hover:text-foreground">
              <X className="h-4 w-4 mr-1" />
              {t('reset')}
            </Button>
          </div>

          {/* Advanced Filters Content - Same layout as Favorites */}
          {showAdvancedFilters && filterSchema && (
            <div className="mt-4 pt-4 border-t grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 animate-in fade-in slide-in-from-top-2">
              {filterSchema.sections.map((section) => (
                <React.Fragment key={section.id}>
                  {section.attributes.map((attr) => {
                    if (!attr.isFilterable || !attr.isActive) return null;
                    
                    const localeKey = locale === 'ar' ? 'ar' : 'en';
                    const attrName = attr.translations.find((tr: any) => tr.locale === localeKey)?.name || attr.name;
                    
                    if (attr.type === 'select') {
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{attrName}</label>
                          <Select
                            value={dynamicAttributes[attr.slug] ? String(dynamicAttributes[attr.slug]) : "all"}
                            onValueChange={(value) => updateAttribute(attr.slug, value === "all" ? undefined : value)}
                          >
                            <SelectTrigger className="w-full h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectValue placeholder={attrName} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                              {(attr.options ?? []).map((opt: any) => (
                                <SelectItem key={String(opt.id)} value={String(opt.id)}>
                                  {opt.label[localeKey] || opt.label['en'] || opt.id}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    if (attr.type === 'year') {
                      const minYear = attr.validationRules?.min || 1950;
                      const maxYear = attr.validationRules?.max || new Date().getFullYear() + 1;
                      const yearOptions = [];
                      for (let y = maxYear; y >= minYear; y--) {
                        yearOptions.push(y.toString());
                      }
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{attrName}</label>
                          <Select
                            value={dynamicAttributes[attr.slug] ? String(dynamicAttributes[attr.slug]) : "all"}
                            onValueChange={(value) => updateAttribute(attr.slug, value === "all" ? undefined : value)}
                          >
                            <SelectTrigger className="w-full h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectValue placeholder={attrName} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                              {yearOptions.map((y) => (
                                <SelectItem key={y} value={y}>
                                  {y}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    if (attr.type === 'color_selection' || attr.type === 'color_multi_selection') {
                      const options = attr.options || [];
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{attrName}</label>
                          <Select
                            value={dynamicAttributes[attr.slug] ? String(dynamicAttributes[attr.slug]) : "all"}
                            onValueChange={(value) => updateAttribute(attr.slug, value === "all" ? undefined : value)}
                          >
                            <SelectTrigger className="w-full h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectValue placeholder={attrName} />
                            </SelectTrigger>
                            <SelectContent className="bg-white dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200">
                              <SelectItem value="all">{isRTL ? 'الكل' : 'All'}</SelectItem>
                              {options.map((opt: any) => (
                                <SelectItem key={String(opt.id)} value={String(opt.id)}>
                                  <div className="flex items-center gap-2">
                                    {opt.color ? (
                                      <span 
                                        className="w-3.5 h-3.5 rounded-full border border-slate-200"
                                        style={{ backgroundColor: opt.color }}
                                      />
                                    ) : (
                                      <span className="w-3.5 h-3.5 rounded-full border border-slate-200 bg-gradient-to-r from-red-500 via-green-500 to-blue-500" />
                                    )}
                                    <span>{opt.label[localeKey] || opt.label['en'] || opt.id}</span>
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                      );
                    }

                    if (attr.type === 'color_picker') {
                      const val = dynamicAttributes[attr.slug] || '';
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{attrName}</label>
                          <div className="flex items-center gap-2">
                            <input
                              type="color"
                              value={val || '#000000'}
                              onChange={(e) => updateAttribute(attr.slug, e.target.value)}
                              className="w-10 h-10 border border-slate-200 dark:border-zinc-800 rounded-lg cursor-pointer p-0.5 bg-white dark:bg-zinc-900 shadow-sm"
                            />
                            <Input
                              type="text"
                              placeholder="#000000"
                              value={val}
                              onChange={(e) => updateAttribute(attr.slug, e.target.value)}
                              className="h-10 font-mono dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                              dir="ltr"
                            />
                          </div>
                        </div>
                      );
                    }

                    if (attr.type === 'number') {
                      return (
                        <div key={attr.id} className="space-y-2">
                          <label className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{attrName}</label>
                          <Input
                            type="number"
                            placeholder={attrName}
                            value={dynamicAttributes[attr.slug] || ''}
                            onChange={(e) => updateAttribute(attr.slug, e.target.value)}
                            className="h-10 dark:bg-zinc-900 dark:border-zinc-800 dark:text-zinc-200"
                          />
                        </div>
                      );
                    }

                    return null;
                  })}
                </React.Fragment>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default MyProductsFilter;
