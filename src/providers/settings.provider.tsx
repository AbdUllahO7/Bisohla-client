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
  ListingsSettings,
  ReferenceProposalsSettings,
  MapSettings,
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
  getListingsSettings: () => ListingsSettings | undefined;
  getReferenceProposalsSettings: () => ReferenceProposalsSettings | undefined;

  // Specific commonly-used settings
  getLogo: () => string;
  getAppLogo: () => string;
  getFavicon: () => string;
  getCopyrightMessage: () => string;
  getSocialLinks: () => GeneralSettings['social_links'];

  // Map settings
  isMapEnabled: () => boolean;
  getMapSettings: () => MapSettings | undefined;
  getGoogleMapsApiKey: () => string | undefined;
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

  const settings = useMemo(() => {
    const data = settingsResponse?.data;
    if (!data) return {} as SettingsData;

    // 1. Direct match for current locale
    const recordData = data as Record<string, unknown>;
    const localeData = recordData[locale];
    if (localeData && typeof localeData === 'object' && Object.keys(localeData).length > 0) {
      return localeData as SettingsData;
    }

    // 2. Direct settings object without locale wrapper
    if (recordData.general || recordData.appearance || recordData.seo_settings) {
      return data as unknown as SettingsData;
    }

    // 3. Fallback to any available locale key (ar, en, etc.)
    const availableLocale = Object.keys(recordData).find((k) => {
      const item = recordData[k];
      return item && typeof item === 'object' && ('general' in item || 'appearance' in item);
    });
    if (availableLocale) {
      return (recordData[availableLocale] || {}) as SettingsData;
    }

    return {} as SettingsData;
  }, [settingsResponse, locale]);

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

      const subKeyData = (keyData as Record<string, unknown>)[subKey as string];
      if (!subKeyData || typeof subKeyData !== 'object') return defaultValue;

      const fieldValue = (subKeyData as Record<string, unknown>)[field as string];
      return (fieldValue !== undefined ? fieldValue : defaultValue) as
        | SettingsFieldValue<K, SK, F>
        | undefined;
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
  const getListingsSettings = () => settings.listings_settings;
  const getReferenceProposalsSettings = () => settings.listings_settings?.reference_proposals;

  // Specific getters
  const getSocialLinks = () => settings.general?.social_links;

  const getLogo = () => {
    // 1. Try current locale appearance logo
    const appearanceLogo = getSetting('general', 'appearance', 'logo');
    if (
      appearanceLogo &&
      typeof appearanceLogo === 'string' &&
      !appearanceLogo.includes('dlftfxjqt') &&
      appearanceLogo.trim() !== ''
    ) {
      return appearanceLogo.trim();
    }

    // 2. Try raw response from any locale or root structure
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const rawLocale = rawData[locale] as Record<string, unknown> | undefined;
      const rawAr = rawData['ar'] as Record<string, unknown> | undefined;
      const rawEn = rawData['en'] as Record<string, unknown> | undefined;
      const rawGeneral = rawData['general'] as Record<string, unknown> | undefined;
      const rawAppearance = rawData['appearance'] as Record<string, unknown> | undefined;
      const rawSeo = rawData['seo_settings'] as Record<string, unknown> | undefined;

      const fallbackLogo =
        (rawLocale?.general as Record<string, unknown> | undefined)?.appearance &&
        ((rawLocale?.general as Record<string, unknown>).appearance as Record<string, unknown>)?.logo ||
        (rawAr?.general as Record<string, unknown> | undefined)?.appearance &&
        ((rawAr?.general as Record<string, unknown>).appearance as Record<string, unknown>)?.logo ||
        (rawEn?.general as Record<string, unknown> | undefined)?.appearance &&
        ((rawEn?.general as Record<string, unknown>).appearance as Record<string, unknown>)?.logo ||
        (rawGeneral?.appearance as Record<string, unknown> | undefined)?.logo ||
        rawAppearance?.logo ||
        ((rawLocale?.seo_settings as Record<string, unknown> | undefined)?.global_seo as Record<string, unknown> | undefined)?.organization_logo ||
        ((rawAr?.seo_settings as Record<string, unknown> | undefined)?.global_seo as Record<string, unknown> | undefined)?.organization_logo ||
        ((rawEn?.seo_settings as Record<string, unknown> | undefined)?.global_seo as Record<string, unknown> | undefined)?.organization_logo ||
        (rawSeo?.global_seo as Record<string, unknown> | undefined)?.organization_logo;

      if (
        typeof fallbackLogo === 'string' &&
        !fallbackLogo.includes('dlftfxjqt') &&
        fallbackLogo.trim() !== ''
      ) {
        return fallbackLogo.trim();
      }
    }

    // 3. Fallback to app_settings appearance if available
    const appLogo = settings.app_settings?.appearance?.app_logo_light;
    if (appLogo && typeof appLogo === 'string' && appLogo.trim() !== '') {
      return appLogo.trim();
    }

    // 4. Fallback to default asset
    return '/assets/images/logo/bishola.png';
  };

  const getAppLogo = () => {
    // 1. Try app_settings.appearance.app_logo_light or app_logo_dark from localized settings
    const appSettings = settings.app_settings;
    if (
      appSettings?.appearance?.app_logo_light &&
      typeof appSettings.appearance.app_logo_light === 'string' &&
      appSettings.appearance.app_logo_light.trim() !== ''
    ) {
      return appSettings.appearance.app_logo_light.trim();
    }
    if (
      appSettings?.appearance?.app_logo_dark &&
      typeof appSettings.appearance.app_logo_dark === 'string' &&
      appSettings.appearance.app_logo_dark.trim() !== ''
    ) {
      return appSettings.appearance.app_logo_dark.trim();
    }

    // 2. Try raw response from any locale or root structure
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const rawLocale = rawData[locale] as Record<string, unknown> | undefined;
      const rawAr = rawData['ar'] as Record<string, unknown> | undefined;
      const rawEn = rawData['en'] as Record<string, unknown> | undefined;
      const rawAppSettings = rawData['app_settings'] as Record<string, unknown> | undefined;

      const getAppLogoFromObj = (obj: Record<string, unknown> | undefined): string | undefined => {
        const app = obj?.app_settings as Record<string, unknown> | undefined;
        const appAppearance = app?.appearance as Record<string, unknown> | undefined;
        const logo = appAppearance?.app_logo_light || appAppearance?.app_logo_dark;
        return typeof logo === 'string' && logo.trim() !== '' ? logo.trim() : undefined;
      };

      const fallbackAppLogo =
        getAppLogoFromObj(rawLocale) ||
        getAppLogoFromObj(rawAr) ||
        getAppLogoFromObj(rawEn) ||
        ((rawAppSettings?.appearance as Record<string, unknown> | undefined)?.app_logo_light as string | undefined) ||
        ((rawAppSettings?.appearance as Record<string, unknown> | undefined)?.app_logo_dark as string | undefined);

      if (
        fallbackAppLogo &&
        typeof fallbackAppLogo === 'string' &&
        fallbackAppLogo.trim() !== ''
      ) {
        return fallbackAppLogo.trim();
      }
    }

    // 3. Fallback to getLogo() if valid
    const generalLogo = getLogo();
    if (generalLogo && !generalLogo.includes('dlftfxjqt')) {
      return generalLogo;
    }

    return '/assets/images/logo/bisholaLogo2.jpg';
  };

  const getFavicon = () => {
    const favicon = getSetting('general', 'appearance', 'favicon');
    if (
      favicon &&
      typeof favicon === 'string' &&
      !favicon.includes('dlftfxjqt') &&
      favicon.trim() !== ''
    ) {
      return favicon.trim();
    }
    return '/assets/images/logo/bisholaLogo2.jpg';
  };

  const getCopyrightMessage = () => {
    return (
      getSetting('general', 'site_info', 'copyright_message') ||
      '© 2025 Bishola. All rights reserved.'
    );
  };

  const isMapEnabled = (): boolean => {
    // 1. Try listings_settings.map.enabled
    const mapSetting = settings.listings_settings?.map?.enabled;
    if (typeof mapSetting === 'boolean') {
      return mapSetting;
    }

    // 2. Check raw data across locales or root payload
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const rawLocale = rawData[locale] as Record<string, unknown> | undefined;
      const rawAr = rawData['ar'] as Record<string, unknown> | undefined;
      const rawEn = rawData['en'] as Record<string, unknown> | undefined;
      const rawListings = rawData['listings_settings'] as Record<string, unknown> | undefined;

      const getEnabled = (obj: Record<string, unknown> | undefined): boolean | undefined => {
        const ls = obj?.listings_settings as Record<string, unknown> | undefined;
        const map = ls?.map as Record<string, unknown> | undefined;
        return typeof map?.enabled === 'boolean' ? map.enabled : undefined;
      };

      const rawMapEnabled =
        getEnabled(rawLocale) ??
        getEnabled(rawAr) ??
        getEnabled(rawEn) ??
        ((rawListings?.map as Record<string, unknown> | undefined)?.enabled as boolean | undefined);

      if (typeof rawMapEnabled === 'boolean') {
        return rawMapEnabled;
      }
    }

    return false;
  };

  const getMapSettings = (): MapSettings | undefined => {
    if (settings.listings_settings?.map) {
      return settings.listings_settings.map;
    }
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const rawLocale = rawData[locale] as Record<string, unknown> | undefined;
      const rawAr = rawData['ar'] as Record<string, unknown> | undefined;
      const rawEn = rawData['en'] as Record<string, unknown> | undefined;
      const rawListings = rawData['listings_settings'] as Record<string, unknown> | undefined;

      return (
        ((rawLocale?.listings_settings as Record<string, unknown> | undefined)?.map as MapSettings | undefined) ||
        ((rawAr?.listings_settings as Record<string, unknown> | undefined)?.map as MapSettings | undefined) ||
        ((rawEn?.listings_settings as Record<string, unknown> | undefined)?.map as MapSettings | undefined) ||
        ((rawListings?.map as Record<string, unknown> | undefined) as MapSettings | undefined)
      );
    }
    return undefined;
  };

  const getGoogleMapsApiKey = (): string | undefined => {
    const key =
      settings.third_party_integrations?.google_maps?.api_key ||
      settings.third_party_integrations?.google_maps?.apiKey ||
      settings.listings_settings?.map?.api_key;
    if (key && typeof key === 'string' && key.trim() !== '') {
      return key.trim();
    }

    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const rawLocale = rawData[locale] as Record<string, unknown> | undefined;
      const rawAr = rawData['ar'] as Record<string, unknown> | undefined;
      const rawEn = rawData['en'] as Record<string, unknown> | undefined;
      const rawThirdParty = rawData['third_party_integrations'] as Record<string, unknown> | undefined;

      const rawKey =
        ((rawLocale?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.api_key ||
        ((rawLocale?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.apiKey ||
        ((rawAr?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.api_key ||
        ((rawAr?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.apiKey ||
        ((rawEn?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.api_key ||
        ((rawEn?.third_party_integrations as Record<string, unknown> | undefined)?.google_maps as Record<string, unknown> | undefined)?.apiKey ||
        (rawThirdParty?.google_maps as Record<string, unknown> | undefined)?.api_key ||
        (rawThirdParty?.google_maps as Record<string, unknown> | undefined)?.apiKey;

      if (typeof rawKey === 'string' && rawKey.trim() !== '') {
        return rawKey.trim();
      }
    }

    return undefined;
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
    getListingsSettings,
    getReferenceProposalsSettings,
    getLogo,
    getAppLogo,
    getCopyrightMessage,
    getSocialLinks,
    getFavicon,
    isMapEnabled,
    getMapSettings,
    getGoogleMapsApiKey,
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
