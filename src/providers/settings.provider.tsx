'use client';

import React, { createContext, useContext, ReactNode, useMemo } from 'react';
import { usePublicSettings } from '@/core/infrastructure-adapters/use-actions/settings/settings.use-actions';
import { useLocale } from 'next-intl';
import {
  AppSettings,
  GeneralSettings,
  SEOSettings,
  AuthenticationSettings,
  ThirdPartyIntegrations,
  SettingsData,
  SettingsKey,
  SettingsSubKey,
  SettingsField,
  SettingsFieldValue,
} from '@/core/entities/models/settings/settings.dto';

interface SettingsContextType {
  settings: SettingsData;
  isLoading: boolean;
  error: Error | null;

  // Type-safe getter with autocomplete
  getSetting: <
    K extends SettingsKey,
    SK extends SettingsSubKey<K>,
    F extends SettingsField<K, SK>,
  >(
    key: K,
    subKey: SK,
    field: F,
    defaultValue?: SettingsFieldValue<K, SK, F>,
  ) => SettingsFieldValue<K, SK, F> | undefined;

  // Convenient getters for entire sections
  getGeneralSettings: () => GeneralSettings | undefined;
  getAuthenticationSettings: () => AuthenticationSettings | undefined;
  getAppSettings: () => AppSettings | undefined;
  getSEOSettings: () => SEOSettings | undefined;
  getThirdPartyIntegrations: () => ThirdPartyIntegrations | undefined;

  // Specific commonly-used settings
  getLogo: () => string;
  getFavicon: () => string;
  getCopyrightMessage: () => string;
  getSocialLinks: () => GeneralSettings['social_links'];
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

interface SettingsProviderProps {
  children: ReactNode;
}

export function SettingsProvider({ children }: SettingsProviderProps) {
  const { data: settingsResponse, isLoading, error } = usePublicSettings();

  const locale = useLocale();

  const settings = useMemo(
    () => (settingsResponse?.data?.[locale] || {}) as SettingsData,
    [settingsResponse, locale],
  );

  // Type-safe getSetting function
  const getSetting = <
    K extends SettingsKey,
    SK extends SettingsSubKey<K>,
    F extends SettingsField<K, SK>,
  >(
    key: K,
    subKey: SK,
    field: F,
    defaultValue?: SettingsFieldValue<K, SK, F>,
  ): SettingsFieldValue<K, SK, F> | undefined => {
    try {
      const keyData = settings[key];
      if (!keyData) return defaultValue;

      const subKeyData = (keyData as Record<string, any>)[subKey as string];
      if (!subKeyData || typeof subKeyData !== 'object') return defaultValue;

      const fieldValue = subKeyData[field as string];
      return fieldValue !== undefined ? fieldValue : defaultValue;
    } catch {
      return defaultValue;
    }
  };

  // Section getters
  const getGeneralSettings = () => settings.general;
  const getAuthenticationSettings = () => settings.authentication;
  const getAppSettings = () => settings.app_settings;
  const getSEOSettings = () => settings.seo_settings;
  const getThirdPartyIntegrations = () => settings.third_party_integrations;

  // Specific getters
  const getSocialLinks = () => settings.general?.social_links;

  const getLogo = () => {
    return (
      getSetting('general', 'appearance', 'logo') ||
      '/assets/images/logo/bishola.png'
    );
  };

  const getFavicon = () => {
    return (
      getSetting('general', 'appearance', 'favicon') ||
      '/assets/images/logo/bisholaLogo2.jpg'
    );
  };

  const getCopyrightMessage = () => {
    return (
      getSetting('general', 'site_info', 'copyright_message') ||
      '© 2025 Bishola. All rights reserved.'
    );
  };

  const contextValue: SettingsContextType = {
    settings,
    isLoading,
    error,
    getSetting,
    getGeneralSettings,
    getAuthenticationSettings,
    getAppSettings,
    getSEOSettings,
    getThirdPartyIntegrations,
    getLogo,
    getCopyrightMessage,
    getSocialLinks,
    getFavicon,
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
