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

export type FilterGroup = {
  operator?: LogicalOperator;
  filters: Filter[];
};

export type Filter = {
  field: string;
  operator: DrizzleOperator;
  value: unknown | unknown[];
};

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