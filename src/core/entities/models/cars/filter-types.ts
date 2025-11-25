// Shared filter types for car listings

// View mode type
export type ViewMode = 'grid' | 'list';

// Filter type for listing types
export type FilterType = 'all' | 'for_sale' | 'for_rent';

// Status filter type (for user's own products)
export type StatusFilter = 'all' | 'approved' | 'pending' | 'rejected';

// Sort options
export type SortOption =
  | 'newest'
  | 'oldest'
  | 'price_high'
  | 'price_low'
  | 'title_asc'
  | 'title_desc';
