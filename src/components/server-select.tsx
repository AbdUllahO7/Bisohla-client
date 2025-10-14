/* eslint-disable @typescript-eslint/no-explicit-any */
import * as React from 'react';
import {
  useCallback,
  useEffect,
  useId,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useInfiniteQuery } from '@tanstack/react-query';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
  CommandSeparator,
} from '@/components/ui/command';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import { CheckIcon, XCircle, ChevronDown, XIcon, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { useDebounce } from '@/hooks/use-debounce';
import Text from './text/text';
import Box from './box/box';

export interface ServerSelectProps<
  T extends Record<string, any>,
  K extends keyof T,
> {
  // Query configuration
  queryKey: string[];
  fetchFn: (params: QueryParams) => Promise<PaginatedResponse<T>>;

  // Selection configuration
  multiple?: boolean;
  value?: T[K] | T[K][];
  onChange: (value: T[K] | T[K][]) => void;

  // Display configuration
  labelField: keyof T;
  valueField: K;
  placeholder?: string;
  searchPlaceholder?: string;
  noOptionsMessage?: string;
  loadingMessage?: string;
  errorMessage?: string;
  maxDisplayItems?: number;

  // Styling & State
  className?: string;
  disabled?: boolean;
  error?: string;
  required?: boolean;
  name?: string;

  // Performance configuration
  pageSize?: number;
  searchDebounce?: number;

  // Accessibility
  ariaLabel?: string;
}

interface OptionType<V> {
  label: string;
  value: V;
}

export function ServerSelect<T extends Record<string, any>, K extends keyof T>({
  queryKey,
  fetchFn,
  multiple = false,
  value,
  onChange,
  labelField,
  valueField,
  placeholder = 'Select...',
  searchPlaceholder = 'Search...',
  noOptionsMessage = 'No options found.',
  loadingMessage = 'Loading...',
  errorMessage = 'Failed to load options.',
  maxDisplayItems = 3,
  className,
  disabled = false,
  error,
  required = false,
  name,
  pageSize = 10,
  searchDebounce = 300,
  ariaLabel,
}: ServerSelectProps<T, K>) {
  const uniqueId = useId();
  const selectId = `server-select-${uniqueId}`;
  const labelId = `server-select-label-${uniqueId}`;

  const [open, setOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [hasFocus, setHasFocus] = useState(false);
  const debouncedSearch = useDebounce(searchTerm, searchDebounce);
  const observerRef = useRef<HTMLDivElement | null>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  const selectedValues = useMemo(() => {
    if (value === undefined) return [];
    return Array.isArray(value) ? value : [value];
  }, [value]);

  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
    error: queryError,
  } = useInfiniteQuery({
    queryKey: [...queryKey, debouncedSearch],
    queryFn: async ({ pageParam = 1 }) => {
      const response = await fetchFn({
        page: Number(pageParam),
        pageSize,
        searchTerm: debouncedSearch || undefined,
        searchKey: labelField as string,
      });

      if (!response.success) {
        throw new Error(response.message || 'Failed to fetch options');
      }

      return response;
    },
    getNextPageParam: (lastPage) => {
      if (!lastPage.data) return undefined;
      return lastPage.data.hasNextPage
        ? Number(lastPage.data.currentPage) + 1
        : undefined;
    },
    initialPageParam: 1,
    staleTime: 0,
    refetchOnWindowFocus: false,
  });

  useEffect(() => {
    if (!open) return;

    const timeoutId = setTimeout(() => {
      const observerElement = observerRef.current;
      const scrollContainer = scrollContainerRef.current;

      if (!observerElement || !scrollContainer) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
            fetchNextPage();
          }
        },
        {
          root: scrollContainer,
          threshold: 0.1,
          rootMargin: '20px',
        },
      );

      observer.observe(observerElement);

      return () => {
        observer.disconnect();
      };
    }, 100);

    return () => clearTimeout(timeoutId);
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!open) setSearchTerm('');
  }, [open]);

  const options: OptionType<T[K]>[] = useMemo(
    () =>
      data?.pages.flatMap(
        (page) =>
          page.data?.data.map((item) => ({
            label: String(item[labelField]),
            value: item[valueField],
          })) || [],
      ) || [],
    [data?.pages, labelField, valueField],
  );

  const handleSelect = useCallback(
    (selectedValue: T[K]) => {
      if (multiple) {
        const currentValues = selectedValues as T[K][];
        const newValues = currentValues.includes(selectedValue)
          ? currentValues.filter((v) => v !== selectedValue)
          : [...currentValues, selectedValue];
        onChange(newValues);
      } else {
        onChange(selectedValue);
        setOpen(false);
      }
    },
    [multiple, onChange, selectedValues],
  );

  const handleClear = useCallback(
    (e?: React.MouseEvent) => {
      e?.stopPropagation();
      onChange(multiple ? [] : (undefined as any));
      setSearchTerm('');
    },
    [multiple, onChange],
  );

  const handleRemove = useCallback(
    (valueToRemove: T[K], e?: React.MouseEvent) => {
      e?.stopPropagation();
      if (multiple) {
        const newValues = (selectedValues as T[K][]).filter(
          (v) => v !== valueToRemove,
        );
        onChange(newValues);
      }
    },
    [multiple, onChange, selectedValues],
  );

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedValues.includes(opt.value)),
    [options, selectedValues],
  );

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Escape') setOpen(false);
  }, []);

  if (isError) {
    return (
      <Alert variant="destructive">
        <Text>
          {errorMessage}:{' '}
          {queryError instanceof Error ? queryError.message : 'Unknown error'}
        </Text>
      </Alert>
    );
  }

  return (
    <Box variant="column" className="w-full space-y-2">
      <Popover open={open} onOpenChange={setOpen} modal={true}>
        <PopoverTrigger asChild>
          <Button
            variant="outline"
            role="combobox"
            disabled={disabled}
            aria-expanded={open}
            aria-label={ariaLabel}
            aria-invalid={!!error}
            aria-required={required}
            id={selectId}
            aria-labelledby={labelId}
            onKeyDown={handleKeyDown}
            onFocus={() => setHasFocus(true)}
            onBlur={() => setHasFocus(false)}
            className={cn(
              'w-full justify-between',
              !selectedValues.length && 'text-muted-foreground',
              hasFocus && 'ring-2 ring-ring ring-offset-2',
              error && 'border-destructive',
              className,
            )}
          >
            <div className="flex gap-1 flex-wrap items-center">
              {selectedOptions.length > 0 ? (
                <>
                  {selectedOptions.slice(0, maxDisplayItems).map((option) => (
                    <Badge
                      variant="secondary"
                      key={String(option.value)}
                      className="mr-1 flex items-center gap-1"
                    >
                      {option.label}
                      {multiple && (
                        <span
                          onClick={(e) => handleRemove(option.value, e)}
                          aria-label={`Remove ${option.label}`}
                          className="focus:outline-none focus:ring-2"
                        >
                          <XCircle className="h-3 w-3 cursor-pointer" />
                        </span>
                      )}
                    </Badge>
                  ))}
                  {selectedOptions.length > maxDisplayItems && (
                    <Badge variant="secondary">
                      +{selectedOptions.length - maxDisplayItems} more
                    </Badge>
                  )}
                </>
              ) : (
                <span>{placeholder}</span>
              )}
            </div>
            <div className="flex items-center">
              {selectedValues.length > 0 && (
                <>
                  <span
                    onClick={handleClear}
                    aria-label="Clear selection"
                    className="focus:outline-none focus:ring-2"
                  >
                    <XIcon className="h-4 w-4 cursor-pointer opacity-50 hover:opacity-100" />
                  </span>
                  <Separator orientation="vertical" className="mx-2 h-4" />
                </>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 opacity-50" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-full min-w-[var(--radix-popover-trigger-width)] p-0">
          <Command shouldFilter={false}>
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
            />
            <CommandList>
              <CommandEmpty>
                {isLoading ? loadingMessage : noOptionsMessage}
              </CommandEmpty>
              <CommandGroup>
                <ScrollArea
                  className="max-h-60 overflow-y-scroll"
                  ref={scrollContainerRef}
                >
                  {options.map((option) => {
                    const isSelected = selectedValues.includes(option.value);
                    return (
                      <CommandItem
                        key={String(option.value)}
                        onSelect={() => handleSelect(option.value)}
                        className="cursor-pointer"
                      >
                        <div
                          className={cn(
                            'mr-2 flex h-4 w-4 items-center justify-center rounded-sm border',
                            isSelected
                              ? 'bg-primary border-primary text-primary-foreground'
                              : 'border-primary opacity-50',
                          )}
                        >
                          <CheckIcon
                            className={cn(
                              'h-4 w-4',
                              !isSelected && 'invisible',
                            )}
                          />
                        </div>
                        {option.label}
                      </CommandItem>
                    );
                  })}
                  {(isLoading || isFetchingNextPage) && (
                    <div className="flex justify-center p-2">
                      <Loader2
                        className="h-6 w-6 animate-spin text-primary"
                        aria-label="Loading options"
                      />
                    </div>
                  )}
                  {hasNextPage && (
                    <div
                      ref={observerRef}
                      className="h-4 w-full"
                      style={{ minHeight: '20px' }}
                    />
                  )}
                </ScrollArea>
              </CommandGroup>
              {selectedValues.length > 0 && (
                <>
                  <CommandSeparator />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleClear()}
                      className="justify-center text-sm cursor-pointer"
                    >
                      Clear {multiple ? 'all' : 'selection'}
                    </CommandItem>
                  </CommandGroup>
                </>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      {error && (
        <Text
          variant="small"
          className="text-destructive"
          role="alert"
          aria-live="polite"
        >
          {error}
        </Text>
      )}

      {name && (
        <input
          type="hidden"
          name={name}
          value={
            Array.isArray(value)
              ? value.map(String).join(',')
              : value !== undefined
              ? String(value)
              : ''
          }
          aria-hidden="true"
        />
      )}
    </Box>
  );
}

export default ServerSelect;
