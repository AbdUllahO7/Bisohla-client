'use client';

import { ApiResponse } from '@/core/entities/api/success.response';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useLocale } from 'next-intl';
import { getPublicSettings } from '../../actions/settings/settings.actions';
import {
  Settings,
  SettingsVersion,
  PageSEOData,
  GlobalSEOData,
  SiteInfoData,
  SEOPageType,
} from '@/core/entities/models/settings/settings.dto';
import { useLocaleQuery } from '../common/use-locale-query';

// Cache time: 1 hour (3600000 ms)
const SETTINGS_CACHE_TIME = 60 * 60 * 1000;

/**
 * Main hook to get all public settings with smart caching
 */
export const usePublicSettings = () => {
  const locale = useLocale();
  const queryClient = useQueryClient();

  return useLocaleQuery<ApiResponse<Settings>, Error>({
    queryKey: ['settings', 'public', locale],
    queryFn: async () => {
      const res = await getPublicSettings();
      if (!res.success) {
        throw new Error(res.message);
      }
      return res;
    },
    staleTime: SETTINGS_CACHE_TIME,
    gcTime: SETTINGS_CACHE_TIME * 2,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    retry: 3,
    retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
  });
};

/**
 * Simple hook to get any setting by path
 */
export const useSetting = (path: string, defaultValue: any = null) => {
  const { data: settingsResponse } = usePublicSettings();

  if (!settingsResponse?.success || !settingsResponse.data) {
    return defaultValue;
  }

  const value = path
    .split('.')
    .reduce((obj: any, key: string) => obj?.[key], settingsResponse.data);

  return value !== undefined ? value : defaultValue;
};
