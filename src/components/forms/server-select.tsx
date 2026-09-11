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
import { cn } from '@/lib/utils';
import { CheckIcon, XCircle, ChevronDown, XIcon, Loader2 } from 'lucide-react';
import { Alert } from '@/components/ui/alert';
import { QueryParams } from '@/core/entities/api/api';
import { PaginatedResponse } from '@/core/entities/api/success.response';
import { useDebounce } from '@/hooks/use-debounce';
import Text from '@/components/ui/text';
import Box from '@/components/ui/box';

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

// Safe label resolver preventing any [object Object] from ever rendering
const resolveLabel = (val: any): string => {
  if (!val) return '';
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) {
    const first = val[0];
    if (typeof first === 'string') return first;
    if (first && typeof first === 'object') return resolveLabel(first.name || first.label || first.value);
    return '';
  }
  if (typeof val === 'object') {
    if (typeof val.name === 'string') return val.name;
    if (typeof val.label === 'string') return val.label;
    if (typeof val.value === 'string') return val.value;
    if (typeof val.ar === 'string') return val.ar;
    if (typeof val.en === 'string') return val.en;
    if (val.ar && typeof val.ar === 'object' && typeof val.ar.name === 'string') return val.ar.name;
    if (val.en && typeof val.en === 'object' && typeof val.en.name === 'string') return val.en.name;
    if (val.name && typeof val.name === 'object') return resolveLabel(val.name);
    if (val.translations && typeof val.translations === 'object') return resolveLabel(val.translations);
    for (const k of Object.keys(val)) {
      if (typeof val[k] === 'string') return val[k];
    }
    return '';
  }
  return String(val);
};

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
  pageSize = 50,
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

  const selectedValues = useMemo(() => {
    if (value === undefined || value === null || value === '') return [];
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
    staleTime: 5 * 60 * 1000,
    refetchOnWindowFocus: false,
  });

  // Observe scroll for infinite loading
  useEffect(() => {
    if (!open || !hasNextPage || isFetchingNextPage) return;

    const observerElement = observerRef.current;
    if (!observerElement) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && hasNextPage && !isFetchingNextPage) {
          fetchNextPage();
        }
      },
      {
        threshold: 0.1,
        rootMargin: '40px',
      },
    );

    observer.observe(observerElement);

    return () => {
      observer.disconnect();
    };
  }, [open, hasNextPage, isFetchingNextPage, fetchNextPage]);

  useEffect(() => {
    if (!open) setSearchTerm('');
  }, [open]);

  // Deduplicate options strictly by unique key
  const options: OptionType<T[K]>[] = useMemo(() => {
    if (!data?.pages) return [];
    const map = new Map<string, OptionType<T[K]>>();
    for (const page of data.pages) {
      if (page.data?.data) {
        for (const item of page.data.data) {
          const val = item[valueField];
          const rawLabel = item[labelField] ?? (item as any).name ?? (item as any).label ?? '';
          const label = resolveLabel(rawLabel) || resolveLabel((item as any).name) || resolveLabel((item as any).translations) || String(val ?? '');
          const key = val !== undefined && val !== null ? String(val) : label;
          if (!map.has(key)) {
            map.set(key, {
              label,
              value: val,
            });
          }
        }
      }
    }
    return Array.from(map.values());
  }, [data?.pages, labelField, valueField]);

  const handleSelect = useCallback(
    (selectedValue: T[K]) => {
      if (multiple) {
        const currentValues = selectedValues as T[K][];
        const exists = currentValues.some((v) => String(v) === String(selectedValue));
        const newValues = exists
          ? currentValues.filter((v) => String(v) !== String(selectedValue))
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
          (v) => String(v) !== String(valueToRemove),
        );
        onChange(newValues);
      }
    },
    [multiple, onChange, selectedValues],
  );

  const selectedOptions = useMemo(
    () => options.filter((opt) => selectedValues.some((v) => String(v) === String(opt.value))),
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
            type="button"
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
              'w-full justify-between font-normal text-start h-11 rounded-xl px-3 bg-white dark:bg-zinc-900 border-gray-200 dark:border-zinc-800 hover:bg-gray-50 dark:hover:bg-zinc-800 transition-colors',
              !selectedValues.length && 'text-muted-foreground',
              hasFocus && 'ring-2 ring-ring ring-offset-2',
              error && 'border-destructive',
              className,
            )}
          >
            <div className="flex gap-1 flex-wrap items-center truncate min-w-0 flex-1">
              {multiple ? (
                selectedOptions.length > 0 ? (
                  <>
                    {selectedOptions.slice(0, maxDisplayItems).map((option, idx) => (
                      <Badge
                        variant="secondary"
                        key={`badge-${String(option.value)}-${idx}`}
                        className="mr-1 flex items-center gap-1"
                      >
                        {option.label}
                        <span
                          onClick={(e) => handleRemove(option.value, e)}
                          aria-label={`Remove ${option.label}`}
                          className="focus:outline-none focus:ring-2 ml-1"
                        >
                          <XCircle className="h-3 w-3 cursor-pointer opacity-70 hover:opacity-100" />
                        </span>
                      </Badge>
                    ))}
                    {selectedOptions.length > maxDisplayItems && (
                      <Badge variant="secondary">
                        +{selectedOptions.length - maxDisplayItems} more
                      </Badge>
                    )}
                  </>
                ) : (
                  <span className="text-gray-400 dark:text-zinc-500">{placeholder}</span>
                )
              ) : (
                /* Single select display */
                selectedOptions.length > 0 ? (
                  <span className="text-gray-900 dark:text-zinc-100 font-medium truncate">
                    {selectedOptions[0].label}
                  </span>
                ) : selectedValues.length > 0 ? (
                  <span className="text-gray-900 dark:text-zinc-100 font-medium truncate">
                    {String(selectedValues[0])}
                  </span>
                ) : (
                  <span className="text-gray-400 dark:text-zinc-500">{placeholder}</span>
                )
              )}
            </div>
            <div className="flex items-center gap-1 shrink-0 ml-2">
              {selectedValues.length > 0 && (
                <>
                  <span
                    onClick={handleClear}
                    aria-label="Clear selection"
                    className="focus:outline-none p-0.5 rounded-md hover:bg-gray-100 dark:hover:bg-zinc-800"
                  >
                    <XIcon className="h-3.5 w-3.5 cursor-pointer text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300" />
                  </span>
                  <Separator orientation="vertical" className="h-4 mx-1" />
                </>
              )}
              <ChevronDown className="h-4 w-4 shrink-0 text-gray-400" />
            </div>
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="w-[var(--radix-popover-trigger-width)] min-w-[240px] p-0 shadow-xl border-gray-200 dark:border-zinc-800 rounded-2xl overflow-hidden bg-white dark:bg-zinc-900"
          align="start"
        >
          <Command shouldFilter={false} className="bg-transparent">
            <CommandInput
              placeholder={searchPlaceholder}
              value={searchTerm}
              onValueChange={setSearchTerm}
              className="border-none focus:ring-0 text-sm"
            />
            <CommandList className="max-h-64 overflow-y-auto p-1">
              <CommandEmpty className="py-4 text-center text-xs text-gray-400 dark:text-zinc-500">
                {isLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader2 className="h-4 w-4 animate-spin text-[#198341]" />
                    <span>{loadingMessage}</span>
                  </div>
                ) : (
                  noOptionsMessage
                )}
              </CommandEmpty>
              <CommandGroup>
                {options.map((option, idx) => {
                  const isSelected = selectedValues.some(
                    (v) => String(v) === String(option.value),
                  );
                  return (
                    <CommandItem
                      key={`opt-${String(option.value)}-${idx}`}
                      onSelect={() => handleSelect(option.value)}
                      className={cn(
                        'cursor-pointer flex items-center justify-between py-2 px-3 rounded-xl text-sm transition-colors',
                        isSelected
                          ? 'bg-[#198341]/10 text-[#198341] font-semibold dark:bg-[#198341]/20 dark:text-[#ABDE3B]'
                          : 'hover:bg-gray-50 dark:hover:bg-zinc-800 text-gray-700 dark:text-zinc-200',
                      )}
                    >
                      <span className="truncate">{option.label}</span>
                      <CheckIcon
                        className={cn(
                          'h-4 w-4 text-[#198341] dark:text-[#ABDE3B] shrink-0 ml-2',
                          !isSelected && 'invisible',
                        )}
                      />
                    </CommandItem>
                  );
                })}
                {isLoading && (
                  <div className="flex justify-center p-3">
                    <Loader2
                      className="h-5 w-5 animate-spin text-[#198341]"
                      aria-label="Loading options"
                    />
                  </div>
                )}
                {isFetchingNextPage && (
                  <div className="flex items-center justify-center gap-1.5 p-2 text-xs text-gray-400">
                    <Loader2
                      className="h-3.5 w-3.5 animate-spin text-[#198341]"
                      aria-label="Loading more"
                    />
                    <span>Loading more...</span>
                  </div>
                )}
                {hasNextPage && !isFetchingNextPage && (
                  <div
                    ref={observerRef}
                    className="h-4 w-full"
                    style={{ minHeight: '16px' }}
                  />
                )}
              </CommandGroup>
              {selectedValues.length > 0 && (
                <>
                  <CommandSeparator className="my-1 border-gray-100 dark:border-zinc-800" />
                  <CommandGroup>
                    <CommandItem
                      onSelect={() => handleClear()}
                      className="justify-center text-xs text-red-500 dark:text-red-400 cursor-pointer py-1.5 rounded-lg hover:bg-red-50 dark:hover:bg-red-950/30"
                    >
                      {multiple ? 'Clear all' : 'Clear selection'}
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
          className="text-destructive text-xs"
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
