'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  ALL_ACCEPTED_CATEGORIES,
  CookieConsentCategories,
  CookieConsentPayload,
  DEFAULT_CONSENT_CATEGORIES,
  generateConsentPayload,
  getClientConsentCookie,
  setClientConsentCookie,
} from '@/core/lib/web/cookie-consent';

import { useLegalDocuments } from '@/core/infrastructure-adapters/use-actions/legal/legal.use-actions';

interface CookieConsentContextType {
  consent: CookieConsentPayload | null;
  categories: CookieConsentCategories;
  hasAnswered: boolean;
  activePolicyVersion: number;
  isPreferencesOpen: boolean;
  openPreferences: () => void;
  closePreferences: () => void;
  acceptAll: () => void;
  rejectNonEssential: () => void;
  savePreferences: (customCategories: CookieConsentCategories) => void;
}

const CookieConsentContext = createContext<CookieConsentContextType | undefined>(
  undefined,
);

const updateGtagConsent = (categories: CookieConsentCategories) => {
  if (
    typeof window !== 'undefined' &&
    typeof (window as any).gtag === 'function'
  ) {
    (window as any).gtag('consent', 'update', {
      analytics_storage: categories.analytics ? 'granted' : 'denied',
      ad_storage: categories.marketing ? 'granted' : 'denied',
      ad_user_data: categories.marketing ? 'granted' : 'denied',
      ad_personalization: categories.marketing ? 'granted' : 'denied',
      functionality_storage: 'granted',
      security_storage: 'granted',
    });
  }
};

export const CookieConsentProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [consent, setConsent] = useState<CookieConsentPayload | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPreferencesOpen, setIsPreferencesOpen] = useState(false);

  const { data: legalDocsResponse } = useLegalDocuments();
  const cookiePolicyDoc = legalDocsResponse?.data?.find(
    (doc) => doc.kind === 'cookie_policy' || doc.slug === 'cookie-policy'
  );
  const activePolicyVersion = cookiePolicyDoc?.version ?? 1;

  useEffect(() => {
    const existing = getClientConsentCookie();
    if (existing) {
      setConsent(existing);
      updateGtagConsent(existing.cat);
    }
    setIsLoaded(true);
  }, []);

  // Determine if the user's recorded consent matches or exceeds the active published version
  const isConsentOutdated = Boolean(
    consent &&
    cookiePolicyDoc &&
    typeof consent.pol === 'number' &&
    consent.pol < activePolicyVersion
  );

  const savePreferences = (customCategories: CookieConsentCategories) => {
    const payload = generateConsentPayload(
      customCategories,
      activePolicyVersion,
      consent?.id,
    );
    setClientConsentCookie(payload);
    setConsent(payload);
    updateGtagConsent(payload.cat);
    setIsPreferencesOpen(false);
  };

  const acceptAll = () => {
    savePreferences(ALL_ACCEPTED_CATEGORIES);
  };

  const rejectNonEssential = () => {
    savePreferences(DEFAULT_CONSENT_CATEGORIES);
  };

  const categories: CookieConsentCategories =
    consent?.cat ?? DEFAULT_CONSENT_CATEGORIES;

  return (
    <CookieConsentContext.Provider
      value={{
        consent,
        categories,
        hasAnswered: isLoaded && consent !== null && !isConsentOutdated,
        activePolicyVersion,
        isPreferencesOpen,
        openPreferences: () => setIsPreferencesOpen(true),
        closePreferences: () => setIsPreferencesOpen(false),
        acceptAll,
        rejectNonEssential,
        savePreferences,
      }}
    >
      {children}
    </CookieConsentContext.Provider>
  );
};

export const useCookieConsent = (): CookieConsentContextType => {
  const context = useContext(CookieConsentContext);
  if (!context) {
    throw new Error(
      'useCookieConsent must be used within a CookieConsentProvider',
    );
  }
  return context;
};
