export type DrizzleOperator =
  | 'eq'
  | 'neq'
  | 'gt'
  | 'gte'
  | 'lt'
  | 'lte'
  | 'like'
  | 'in'
  | 'inArray'
  | 'notInArray';

export type LogicalOperator = 'and' | 'or';

export interface FilterState {
  make?: string;
  price?: string;
  fuelType?: string;
  [key: string]: string | undefined;
}

export interface Filter {
  field: string;
  operator: string;
  value: string | number | boolean | string[] | number[] | boolean[];
}

export interface FilterGroup {
  operator: string;
  filters: Filter[];
}

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchKey?: string;
  searchTerm?: unknown | unknown[];
  id?: number | number[]; 
  userId?: number | null;
  locale?: string; 
  where?: Filter[]; 
  filterGroups?: FilterGroup[];
  include?: string;
  listingOfferType?: string;
  [key: string]: any;
}

export interface SortOption {
  sortBy: string;
  sortDirection: 'asc' | 'desc';
}

export interface PriceRange {
  min: number | null;
  max: number | null;
}

export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface CarImage {
  isPrimary: boolean;
  url: string;
}

export interface CarMake {
  name: string;
}

export interface VehicleListing {
  id: number;
  title: string;
  make?: CarMake;
  marka?: string;
  price: number;
  listingType: string;
  images?: CarImage[];
  imageSrc?: string;
  gaz?: string;
  type?: string;
  [key: string]: any; 
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}
