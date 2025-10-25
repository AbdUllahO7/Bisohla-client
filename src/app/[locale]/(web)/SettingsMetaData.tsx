import React from 'react';
import { getLocale } from "next-intl/server";
import type { Metadata } from "next";
import {
  generateSettingsBasedMetadata,
  generateSettingsBasedStructuredData,
  getPageType
} from '@/utils/settings-metadata.utils';

// Types for different page configurations
type WebPageType = 'home' | 'products' | 'product_detail' | 'auth' | 'profile' | 'privacy_policy';

interface SettingsMetadataConfig {
  title?: string;
  description?: string;
  keywords?: string[];
  ogImage?: string;
  twitterImage?: string;
  noIndex?: boolean;
  canonical?: string;
  customMeta?: Array<{ name?: string; property?: string; content: string; httpEquiv?: string; }>;
}

interface CustomStructuredData {
  "@type": string;
  "@id"?: string;
  [key: string]: any;
}

/**
 * Generate metadata using settings from the backend
 */
export async function generateSettingsMetadata(
  pageType: WebPageType = 'home',
  customConfig?: SettingsMetadataConfig
): Promise<Metadata> {
  return await generateSettingsBasedMetadata(pageType, customConfig);
}

/**
 * Generate metadata based on pathname
 */
export async function generateMetadataFromPath(
  pathname: string,
  customConfig?: SettingsMetadataConfig
): Promise<Metadata> {
  const pageType = getPageType(pathname);
  return await generateSettingsBasedMetadata(pageType, customConfig);
}

// React component for adding settings-based structured data
interface SettingsMetadataProviderProps {
  pageType?: WebPageType;
  customConfig?: SettingsMetadataConfig;
  customStructuredData?: CustomStructuredData | CustomStructuredData[];
  children?: React.ReactNode;
}

export const SettingsMetadataProvider: React.FC<SettingsMetadataProviderProps> = async ({
  pageType = 'home',
  customStructuredData,
  children
}) => {
  const structuredData = await generateSettingsBasedStructuredData(pageType, customStructuredData);

  return (
    <>
      {/* JSON-LD Structured Data */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structuredData, null, 2),
        }}
      />
      {children}
    </>
  );
};

export default SettingsMetadataProvider;