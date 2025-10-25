// Settings types for website consumption

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
}

export interface Settings {
  [locale: string]: {
    general?: GeneralSettings;
    seo_settings?: SEOSettings;
    app_settings?: AppSettings;
  };
}

export interface SettingsVersion {
  version: string;
  timestamp: number;
}

// Utility types for accessing specific parts of settings
export type SettingsPath =
  | 'general.site_info.site_name'
  | 'general.site_info.site_description'
  | 'general.site_info.copyright_message'
  | 'general.contact_info.email'
  | 'general.contact_info.phone'
  | 'general.contact_info.address'
  | 'general.appearance.logo'
  | 'general.appearance.favicon'
  | 'general.appearance.primary_color'
  | 'general.appearance.secondary_color'
  | 'seo_settings.home_page.meta_title'
  | 'seo_settings.home_page.meta_description'
  | 'seo_settings.home_page.og_title'
  | 'seo_settings.home_page.og_description'
  | 'seo_settings.home_page.og_image'
  | 'seo_settings.products_page.meta_title'
  | 'seo_settings.products_page.meta_description'
  | 'seo_settings.global_seo.site_name'
  | 'seo_settings.global_seo.google_analytics_id'
  | 'seo_settings.global_seo.facebook_pixel_id'
  | 'app_settings.maintenance.maintenance_mode'
  | 'app_settings.maintenance.maintenance_message';

// Page-specific SEO settings
export type SEOPageType = 'home_page' | 'products_page' | 'product_detail_page';

export interface GlobalSEOData {
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
}

export interface SiteInfoData {
  site_name?: string;
  site_description?: string;
  logo?: string;
  favicon?: string;
  primary_color?: string;
  secondary_color?: string;
}
