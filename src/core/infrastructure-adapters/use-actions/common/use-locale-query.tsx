'use client';

import {
  QueryKey,
  UseQueryOptions,
  UseQueryResult,
  useQuery,
} from '@tanstack/react-query';
import { useLocale } from 'next-intl';

export function useLocaleQuery<
  TQueryFnData,
  TError = Error,
  TData = TQueryFnData,
  TQueryKey extends QueryKey = QueryKey,
>(
  options: Omit<
    UseQueryOptions<TQueryFnData, TError, TData, [...TQueryKey, string]>,
    'queryKey'
  > & {
    queryKey: TQueryKey;
  },
): UseQueryResult<TData, TError> {
  const locale = useLocale();
  const { queryKey, ...restOptions } = options;

  return useQuery({
    ...restOptions,
    queryKey: [...queryKey, locale],
  });
}
