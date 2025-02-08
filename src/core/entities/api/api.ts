export interface QueryParams {
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortDirection?: 'asc' | 'desc';
  searchKey?: string;
  searchTerm?: string;
  id?: number;
}
