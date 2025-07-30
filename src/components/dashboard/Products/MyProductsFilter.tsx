'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, RefreshCw, Grid, List } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { useState, useEffect } from 'react';
import type { QueryParams, FilterGroup } from '@/core/entities/api/api';

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

  // Debounced search query
  const debouncedSearchQuery = useDebounce(searchQuery, 500);

  // Build filter query
  useEffect(() => {
    // Build filter query inside useEffect
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
  }, [debouncedSearchQuery, listingType, status, sortBy]);

  // Handle reset filters
  const handleReset = () => {
    setSearchQuery('');
    setListingType('all');
    setStatus('all');
    setSortBy('newest');
  };

  // Handle view mode change
  const handleViewModeChange = (mode: ViewMode) => {
    if (onViewModeChange) {
      onViewModeChange(mode);
    }
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

      {/* Filters */}
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
    </div>
  );
};

export default MyProductsFilter;
