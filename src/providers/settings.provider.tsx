'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePublicSettings } from '@/core/infrastructure-adapters/use-actions/settings/settings.use-actions';
import { useLocale } from 'next-intl';
import {
  AppSettings,
  GeneralSettings,
  SEOSettings,
} from '@/core/entities/models/settings/settings.dto';

interface SettingsContextType {
  settings: any;
  isLoading: boolean;
  error: Error | null;
  getSetting: (path: string, defaultValue?: any) => any;
  getGeneralSettings: () => GeneralSettings;
  getAppSettings: () => AppSettings;
  getSEOSettings: () => SEOSettings;
  getLogo: () => string;
  getCopyrightMessage: () => string;
  getSocialLinks: () => any;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { data: settingsResponse, isLoading, error } = usePublicSettings();

  console.log('Settings Response: ', settingsResponse);
  const locale = useLocale();

  const settings = useMemo(
    () => settingsResponse?.data?.[locale] || {},
    [settingsResponse, locale],
  );

  const getSetting = (path: string, defaultValue: any = null): any => {
    return (
      path.split('.').reduce((obj: any, key: string) => obj?.[key], settings) ??
      defaultValue
    );
  };

  const getGeneralSettings = () => {
    return getSetting('general', {});
  };
  const getAppSettings = () => {
    return getSetting('app_settings', {});
  };
  const getSEOSettings = () => {
    return getSetting('set_settings', {});
  };

  const getSocialLinks = () => {
    return getSetting('general.social_links', []);
  };

  const getLogo = () => {
    return getSetting(
      'general.appearance.logo',
      '/assets/images/logo/bishola.png',
    );
  };

  const getCopyrightMessage = () => {
    return getSetting(
      'general.site_info.copyright_message',
      '© 2025 Bishola. All rights reserved.',
    );
  };

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    getSetting,
    getGeneralSettings,
    getAppSettings,
    getSEOSettings,
    getLogo,
    getCopyrightMessage,
    getSocialLinks,
  };

  return (
    <SettingsContext.Provider value={contextValue}>
      {children}
    </SettingsContext.Provider>
  );
}

// Custom hook to use settings
export const useSettings = (): SettingsContextType => {
  const context = useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
};
