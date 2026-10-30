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
  ContentProtectionSettings,
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
  getContentProtectionSettings: () => ContentProtectionSettings | undefined;
  isContactRevealSignInRequired: () => boolean;

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
  getGoogleGeocodingApiKey: () => string | undefined;
}

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

import { ApiResponse } from '@/core/entities/api/success.response';

interface SettingsProviderProps {
  children: ReactNode;
  initialSettings?: ApiResponse<any>;
}

export function SettingsProvider({ children, initialSettings }: SettingsProviderProps) {
  const { data: settingsResponse, isLoading: queryLoading, error } = usePublicSettings(initialSettings);

  const locale = useLocale();

  const settings = useMemo(() => {
    const data = settingsResponse?.data || initialSettings?.data;
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
  }, [settingsResponse, initialSettings, locale]);

  const hasData = Boolean(initialSettings?.data || settingsResponse?.data);
  const isLoading = Boolean(queryLoading && !hasData);

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
  const getContentProtectionSettings = () => settings.content_protection;
  const isContactRevealSignInRequired = (): boolean => {
    if (settings.content_protection?.contact_reveal?.require_sign_in != null) {
      return Boolean(settings.content_protection.contact_reveal.require_sign_in);
    }
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const directCp = (rawData.content_protection as any)?.contact_reveal?.require_sign_in;
      if (directCp != null) return Boolean(directCp);
      const locCp = ((rawData[locale] as any)?.content_protection as any)?.contact_reveal?.require_sign_in;
      if (locCp != null) return Boolean(locCp);
      const arCp = ((rawData.ar as any)?.content_protection as any)?.contact_reveal?.require_sign_in;
      if (arCp != null) return Boolean(arCp);
      const enCp = ((rawData.en as any)?.content_protection as any)?.contact_reveal?.require_sign_in;
      if (enCp != null) return Boolean(enCp);
    }
    return false;
  };

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

    // Default to true (matches mobile v2: settings?.listings_settings?.map?.enabled ?? true)
    return true;
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

  const resolveApiKey = (preferredKeyType: 'geocoding' | 'maps' = 'maps'): string | undefined => {
    // 1. Check environment variables
    const envGeocodingKey = process.env.NEXT_PUBLIC_GOOGLE_GEOCODING_API_KEY;
    const envMapsKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    const envMapKey = process.env.NEXT_PUBLIC_MAP_API_KEY;
    
    if (preferredKeyType === 'geocoding' && envGeocodingKey && envGeocodingKey.trim() !== '') {
      return envGeocodingKey.trim();
    }
    if (envMapsKey && envMapsKey.trim() !== '') {
      return envMapsKey.trim();
    }
    if (envGeocodingKey && envGeocodingKey.trim() !== '') {
      return envGeocodingKey.trim();
    }
    if (envMapKey && envMapKey.trim() !== '') {
      return envMapKey.trim();
    }

    // 2. Check localized settings object
    const tp = settings.third_party_integrations;
    const ls = settings.listings_settings;
    const keyCandidates = [
      tp?.google_geocoding?.api_key,
      tp?.google_geocoding?.apiKey,
      tp?.geocoding?.api_key,
      tp?.geocoding?.apiKey,
      tp?.google_maps?.api_key,
      tp?.google_maps?.apiKey,
      ls?.location?.geocoding_api_key,
      ls?.location?.api_key,
      ls?.location?.apiKey,
      ls?.map?.api_key,
    ];

    for (const cand of keyCandidates) {
      if (cand && typeof cand === 'string' && cand.trim() !== '') {
        return cand.trim();
      }
    }

    // 3. Check raw response across locales (locale, ar, en) or root object
    const rawData = settingsResponse?.data as Record<string, unknown> | undefined;
    if (rawData) {
      const candidates = [
        rawData[locale],
        rawData['ar'],
        rawData['en'],
        rawData,
      ] as (Record<string, unknown> | undefined)[];

      for (const root of candidates) {
        if (!root || typeof root !== 'object') continue;
        const rawTp = (root.third_party_integrations || root) as Record<string, unknown> | undefined;
        const rawLs = (root.listings_settings || root) as Record<string, unknown> | undefined;
        const rawGeneral = (root.general || root) as Record<string, unknown> | undefined;

        const rawCandidates = [
          (rawTp?.google_geocoding as Record<string, unknown> | undefined)?.api_key,
          (rawTp?.google_geocoding as Record<string, unknown> | undefined)?.apiKey,
          (rawTp?.geocoding as Record<string, unknown> | undefined)?.api_key,
          (rawTp?.geocoding as Record<string, unknown> | undefined)?.apiKey,
          (rawTp?.google_maps as Record<string, unknown> | undefined)?.api_key,
          (rawTp?.google_maps as Record<string, unknown> | undefined)?.apiKey,
          (rawLs?.location as Record<string, unknown> | undefined)?.geocoding_api_key,
          (rawLs?.location as Record<string, unknown> | undefined)?.api_key,
          (rawLs?.location as Record<string, unknown> | undefined)?.apiKey,
          (rawLs?.map as Record<string, unknown> | undefined)?.api_key,
          rawGeneral?.google_maps_api_key,
          rawGeneral?.google_geocoding_api_key,
        ];

        for (const rawVal of rawCandidates) {
          if (typeof rawVal === 'string' && rawVal.trim() !== '') {
            return rawVal.trim();
          }
        }
      }
    }

    return undefined;
  };

  const getGoogleMapsApiKey = (): string | undefined => resolveApiKey('maps');
  const getGoogleGeocodingApiKey = (): string | undefined => resolveApiKey('geocoding');

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
    getContentProtectionSettings,
    isContactRevealSignInRequired,
    getLogo,
    getAppLogo,
    getCopyrightMessage,
    getSocialLinks,
    getFavicon,
    isMapEnabled,
    getMapSettings,
    getGoogleMapsApiKey,
    getGoogleGeocodingApiKey,
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
