// Settings types for website consumption

// ============================================================================
// SETTINGS STRUCTURE TYPES
// ============================================================================

export interface GeneralSettings {
  site_info?: {
    site_name?: string;
    site_description?: string;
    copyright_message?: string;
  };
  contact_info?: {
    email?: string;
    phone?: string;
    address?: string;
  };
  appearance?: {
    logo?: string;
    favicon?: string;
    primary_color?: string;
    secondary_color?: string;
  };
  localization?: {
    default_lang?: string;
    timezone?: string;
    date_format?: string;
    date_time_format?: string;
    time_format?: string;
  };
  social_links?: {
    facebook_url?: string;
    facebook_image?: string;
    instagram_url?: string;
    instagram_image?: string;
    tiktok_url?: string;
    tiktok_image?: string;
    youtube_url?: string;
    youtube_image?: string;
    snapchat_url?: string;
    snapchat_image?: string;
    twitter_url?: string;
    twitter_image?: string;
    linkedin_url?: string;
    linkedin_image?: string;
    pinterest_url?: string;
    pinterest_image?: string;
    telegram_url?: string;
    telegram_image?: string;
    whatsapp_url?: string;
    whatsapp_image?: string;
  };
}

export interface AuthenticationSettings {
  auth_providers?: {
    enable_google_oauth?: boolean;
    enable_facebook_oauth?: boolean;
    enable_apple_oauth?: boolean;
  };
}

export interface PageSEOData {
  meta_title?: string;
  meta_description?: string;
  meta_keywords?: string;
  og_title?: string;
  og_description?: string;
  og_image?: string;
  og_image_alt?: string;
  twitter_title?: string;
  twitter_description?: string;
  twitter_image?: string;
  canonical_url?: string;
  focus_keyword?: string;
}

export interface SEOSettings {
  home_page?: PageSEOData;
  products_page?: PageSEOData;
  product_detail_page?: PageSEOData;
  auth_pages?: PageSEOData;
  user_profile_pages?: PageSEOData;
  privacy_policy?: PageSEOData;
  global_seo?: {
    site_name?: string;
    default_og_image?: string;
    default_twitter_image?: string;
    twitter_handle?: string;
    facebook_app_id?: string;
    google_site_verification?: string;
    bing_site_verification?: string;
    canonical_base_url?: string;
    robots_txt_content?: string;
    google_analytics_id?: string;
    google_tag_manager_id?: string;
    facebook_pixel_id?: string;
    schema_org_type?: string;
    organization_name?: string;
    organization_logo?: string;
    default_author?: string;
    sitemap_enabled?: boolean;
    breadcrumbs_enabled?: boolean;
    og_locale?: string;
    twitter_card_type?: string;
  };
}

export interface AppSettings {
  app_info?: {
    app_name?: string;
    app_description?: string;
    bundle_id?: string;
    play_store_url?: string;
    app_store_url?: string;
  };
  version_control?: {
    app_version?: string;
    min_supported_version?: string;
    force_update_version?: string;
    update_message?: string;
  };
  maintenance?: {
    maintenance_mode?: boolean;
    maintenance_message?: string;
    maintenance_start_time?: string;
    maintenance_end_time?: string;
  };
  security?: {
    session_timeout?: number;
    max_login_attempts?: number;
    password_reset_expiry?: number;
  };
  performance?: {
    api_rate_limit?: number;
    cache_duration?: number;
    max_file_size?: number;
  };
}

export interface ThirdPartyIntegrations {
  google_auth?: {
    google_client_id?: string;
    google_client_secret?: string;
    google_callback_url?: string;
  };
}

// Main settings structure combining all sections
export interface SettingsData {
  general?: GeneralSettings;
  authentication?: AuthenticationSettings;
  seo_settings?: SEOSettings;
  app_settings?: AppSettings;
  third_party_integrations?: ThirdPartyIntegrations;
}

export interface Settings {
  [locale: string]: SettingsData;
}

export interface SettingsVersion {
  version: string;
  timestamp: number;
}

// ============================================================================
// TYPE-SAFE SETTINGS ACCESS - AUTO-INFERRED FROM STRUCTURE
// ============================================================================

// Extract keys automatically from SettingsData
export type SettingsKey = keyof SettingsData;

// Extract subkeys for a given settings key
export type SettingsSubKey<K extends SettingsKey> = keyof NonNullable<
  SettingsData[K]
>;

// Extract fields for a given key and subkey
export type SettingsField<
  K extends SettingsKey,
  SK extends SettingsSubKey<K>,
> = keyof NonNullable<NonNullable<SettingsData[K]>[SK]>;

// Get the value type for a specific field
export type SettingsFieldValue<
  K extends SettingsKey,
  SK extends SettingsSubKey<K>,
  F extends SettingsField<K, SK>,
> = NonNullable<NonNullable<SettingsData[K]>[SK]>[F];
