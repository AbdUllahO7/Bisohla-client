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
