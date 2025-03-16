'use client';

import { useState, useCallback, useMemo } from 'react';
import CustomizableTable, { Column } from '@/components/customizable-table';
import { UseQueryResult } from '@tanstack/react-query';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';

interface TableState {
  page: number;
  pageSize: number;
  sortConfig: { key: string; direction: 'asc' | 'desc' } | null;
  search: { key: string; term: string } | null;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  useFetchData: (
    params: QueryParams,
  ) => UseQueryResult<PaginatedResponse<T>, Error>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const AdminTable = <T extends Record<string, any>>({
  columns,
  useFetchData,
}: AdminTableProps<T>) => {
  const [tableState, setTableState] = useState<TableState>({
    page: 1,
    pageSize: 10,
    sortConfig: null,
    search: null,
  });

  // Memoize the queryParams to prevent unnecessary re-renders
  const queryParams = useMemo(
    () => ({
      page: tableState.page,
      pageSize: tableState.pageSize,
      sortBy: tableState.sortConfig?.key,
      sortDirection: tableState.sortConfig?.direction,
      searchKey: tableState.search?.key,
      searchTerm: tableState.search?.term,
    }),
    [
      tableState.page,
      tableState.pageSize,
      tableState.sortConfig?.key,
      tableState.sortConfig?.direction,
      tableState.search,
    ],
  );

  const { data: pagination, isLoading } = useFetchData(queryParams);
  console.log(pagination);
  const handleSort = useCallback(
    async (key: string, direction: 'asc' | 'desc') => {
      setTableState((prev) => ({
        ...prev,
        sortConfig: { key, direction },
        page: 1, // Reset to first page on sort
      }));
    },
    [],
  );

  const handleSearch = useCallback(
    async (params: { key: string; term: string }) => {
      const { key, term } = params;
      setTableState((prev) => ({
        ...prev,
        search: { key: key, term: term },
        page: 1, // Reset to first page on search
      }));
    },
    [],
  );

  const handlePageChange = useCallback(async (newPage: number) => {
    setTableState((prev) => ({
      ...prev,
      page: newPage,
    }));
  }, []);

  const handlePageSizeChange = useCallback(async (newPageSize: number) => {
    setTableState((prev) => ({
      ...prev,
      pageSize: newPageSize,
      page: 1, // Reset to first page when changing page size
    }));
  }, []);

  return (
    <CustomizableTable
      columns={columns}
      data={pagination?.data?.data || []} // Handle undefined data
      pagination={{
        currentPage: pagination?.data?.currentPage || 1,
        pageSize: pagination?.data?.pageSize || 10,
        totalItems: pagination?.data?.totalItems || 0,
        totalPages: pagination?.data?.totalPages || 1,
        hasNextPage: pagination?.data?.hasNextPage || false,
        hasPreviousPage: pagination?.data?.hasPreviousPage || false,
      }}
      isLoading={isLoading}
      enableSearch
      enablePagination
      onSort={handleSort}
      onSearch={handleSearch}
      onPageChange={handlePageChange}
      onPageSizeChange={handlePageSizeChange}
    />
  );
};

export default AdminTable;
