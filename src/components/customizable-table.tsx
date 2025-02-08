'use client';

import { useState, useEffect } from 'react';
import Box from '@/components/box/box';
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  ChevronDown,
  ChevronUp,
  ChevronLeft,
  ChevronRight,
  Search,
  Loader2,
  KeyIcon,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { cn } from '@/lib/utils';
import Text from './text/text';
import { useTranslations } from 'next-intl';

export interface Column<T> {
  key: string;
  header: string;
  width?: string;
  align?: 'left' | 'center' | 'right';
  sortable?: boolean;
  actions?: boolean;
  hidden?: boolean;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  render?: (value: any, row: T) => React.ReactNode;
}

export interface PaginationState {
  currentPage: number;
  pageSize: number;
  totalItems: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
}

interface AdminTableProps<T> {
  columns: Column<T>[];
  data: T[];
  pagination?: PaginationState;
  caption?: string;
  isLoading?: boolean;
  enableSearch?: boolean;
  enablePagination?: boolean;
  className?: string;
  onSort?: (key: string, direction: 'asc' | 'desc') => Promise<void>;
  onSearch?: (params: { key: string; term: string }) => Promise<void>;
  onPageChange?: (page: number) => Promise<void>;
  onPageSizeChange?: (pageSize: number) => Promise<void>;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomizableTable = <T extends Record<string, any>>({
  columns,
  data,
  pagination,
  caption,
  isLoading = false,
  enableSearch = true,
  enablePagination = true,
  className,
  onSort,
  onSearch,
  onPageChange,
  onPageSizeChange,
}: AdminTableProps<T>) => {
  const [sortConfig, setSortConfig] = useState<{
    key: string;
    direction: 'asc' | 'desc';
  } | null>(null);
  const [search, setSearch] = useState({ key: '', term: '' });
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const t = useTranslations('adminPage.general');

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearchTerm(search.term);
    }, 300);

    return () => clearTimeout(timer);
  }, [search.term]);

  // Handle search with debounce
  useEffect(() => {
    if (onSearch) {
      onSearch({ key: search.key, term: debouncedSearchTerm });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearchTerm, onSearch]);

  const handleSort = async (key: string) => {
    if (!onSort) return;

    const direction =
      sortConfig?.key === key && sortConfig.direction === 'asc'
        ? 'desc'
        : 'asc';
    setSortConfig({ key, direction });
    await onSort(key, direction);
  };

  const handleSearchTerm = (value: string) => {
    setSearch((prev) => ({ ...prev, term: value }));
  };

  const handleSearchKey = (key: string) => {
    setSearch((prev) => ({ ...prev, key: key }));
  };

  const handlePageChange = async (page: number) => {
    if (onPageChange) {
      await onPageChange(page);
    }
  };

  const handlePageSizeChange = async (value: string) => {
    if (onPageSizeChange) {
      await onPageSizeChange(Number(value));
    }
  };

  const renderCell = (column: Column<T>, row: T) => {
    if (column.render) {
      return column.render(row[column.key], row);
    }
    return (
      row[column.key] || (
        <Text variant="small" className="text-danger">
          Invalid
        </Text>
      )
    );
  };

  return (
    <Box className={cn('w-full space-y-4', className)} variant="column">
      {enableSearch && (
        <div className="flex justify-between items-center w-full">
          <div className="flex items-center gap-4">
            <div className="relative w-50">
              <KeyIcon className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Select onValueChange={handleSearchKey}>
                <SelectTrigger className="pl-8 w-full">
                  <SelectValue placeholder={t('selectColumn')} />
                </SelectTrigger>
                <SelectContent>
                  {columns
                    .filter((col) => !col.actions)
                    .map((column) =>
                      column.hidden ? null : (
                        <SelectItem key={column.key} value={column.key}>
                          {column.header}
                        </SelectItem>
                      ),
                    )}
                </SelectContent>
              </Select>
            </div>
            <div className="relative w-72">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder={t('search')}
                value={search.term}
                onChange={(e) => handleSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
          {pagination && (
            <Select
              value={pagination.pageSize.toString()}
              onValueChange={handlePageSizeChange}
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Rows per page" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 {t('rows')}</SelectItem>
                <SelectItem value="20">20 {t('row')}</SelectItem>
                <SelectItem value="50">50 {t('row')}</SelectItem>
              </SelectContent>
            </Select>
          )}
        </div>
      )}

      <div className="rounded-md border w-full">
        <Table>
          {caption && <TableCaption>{caption}</TableCaption>}
          <TableHeader>
            <TableRow>
              {columns.map((column) =>
                column.hidden ? null : (
                  <TableHead
                    key={column.key}
                    className={cn(
                      column.width && `w-[${column.width}]`,
                      column.align && `text-${column.align}`,
                      column.sortable && 'cursor-pointer hover:bg-muted/50',
                    )}
                    onClick={() => column.sortable && handleSort(column.key)}
                  >
                    <div className="flex items-center gap-2 w-full">
                      {column.header}
                      {column.sortable &&
                        sortConfig?.key === column.key &&
                        {
                          asc: <ChevronUp className="h-4 w-4" />,
                          desc: <ChevronDown className="h-4 w-4" />,
                        }[sortConfig.direction]}
                    </div>
                  </TableHead>
                ),
              )}
            </TableRow>
          </TableHeader>
          <TableBody>
            {isLoading ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  <Loader2 className="h-6 w-6 animate-spin mx-auto" />
                </TableCell>
              </TableRow>
            ) : data.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={columns.length}
                  className="h-24 text-center"
                >
                  No results found.
                </TableCell>
              </TableRow>
            ) : (
              data.map((row, index) => (
                <TableRow key={index}>
                  {columns.map((column) =>
                    column.hidden ? null : (
                      <TableCell
                        key={column.key}
                        className={cn(column.align && `text-${column.align}`)}
                      >
                        {renderCell(column, row)}
                      </TableCell>
                    ),
                  )}
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {enablePagination && pagination && (
        <div className="flex items-center justify-between w-full">
          <p className="text-sm text-muted-foreground">
            {t('showing')}{' '}
            {(pagination.currentPage - 1) * pagination.pageSize + 1} {t('to')}{' '}
            {Math.min(
              pagination.currentPage * pagination.pageSize,
              pagination.totalItems,
            )}{' '}
            {t('of')} {pagination.totalItems} {t('results')}
          </p>
          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage - 1)}
              disabled={!pagination.hasPreviousPage}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map(
              (page) => (
                <Button
                  key={page}
                  variant={
                    pagination.currentPage === page ? 'default' : 'outline'
                  }
                  size="sm"
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </Button>
              ),
            )}
            <Button
              variant="outline"
              size="sm"
              onClick={() => handlePageChange(pagination.currentPage + 1)}
              disabled={!pagination.hasNextPage}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </Box>
  );
};

export default CustomizableTable;
