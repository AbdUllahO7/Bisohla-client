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

  
 export  interface FilterState {
    make?: string;
    price?: string;
    fuelType?: string;
    [key: string]: string | undefined;
  }

export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchKey?: string;
  searchTerm?: unknown | unknown[];
  id?: number | number[]; // Modified to support arrays
  locale?: string; // Add this line
  where?: Filter[]; // New field for explicit where conditions
  filterGroups?: FilterGroup[];
}

interface CarListing {
  id: number;
  title: string;
  make?: { name: string };
  marka?: string;
  price: number;
  listingType: string;
  images?: Array<{ isPrimary: boolean; url: string }>;
  imageSrc?: string;
}

interface PaginationMeta {
  total?: number;
  totalPages?: number;
  currentPage?: number;
  pageSize?: number;
}


interface PaginatedData {
  data?: CarListing[] | { data: CarListing[] };
  meta?: PaginationMeta;
}



export interface SortOption {
  sortBy: string;
  sortDirection: "asc" | "desc";
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


// Define interfaces for component usage
export interface CarImage {
  isPrimary: boolean;
  url: string;
}

export interface CarMake {
  name: string;
}



// 


// Define proper TypeScript interfaces
export interface FilterOption {
  id: string;
  label: string;
  value: string;
}

export interface Filter {
  field: string;
  operator: string;
  value: string | number; // Allow both string and number values
}

export interface FilterGroup {
  operator: string;
  filters: Filter[];
}

export interface SortOption {
  sortBy: string;
  sortDirection: "asc" | "desc";
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
  [key: string]: any; // Allow additional properties for flexibility
}

export interface PaginationInfo {
  currentPage: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  totalItems: number;
}
