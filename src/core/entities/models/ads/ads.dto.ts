export type AdType = 'image' | 'video' | 'html' | 'product_link' | 'rich_media' | 'animated_gif' | 'text_only';

export type AdTemplate =
    | 'image_only'
    | 'standard_card'
    | 'hero_banner'
    | 'native_list'
    | 'carousel'
    | 'popup_modal'
    | 'sticky_banner'
    | 'interstitial'
    | 'sidebar_widget'
    | 'inline_content'
    | 'floating_button'
    | 'video_player';

export type AdPlatform = 'web' | 'mobile_app' | 'all';

export interface AdTranslationDto {
    id: number;
    adContentId: number;
    locale: string;
    imageUrl?: string;
    videoUrl?: string;
    title?: string;
    description?: string;
    actionText?: string;
}

export interface AdSpaceDto {
    id: number;
    name: string;
    slotKey: string;
    platform: AdPlatform;
    pageId: number;
    sectionId: number;
    width?: number;
    height?: number;
    description?: string;
    basePricePerDay?: number;
    pricePerImpression?: number;
    pricePerClick?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    page?: AdPageDto;
    section?: AdSectionDto;
}

export interface AdPageDto {
    id: number;
    slug: string;
    label: string;
    description?: string;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdSectionDto {
    id: number;
    slug: string;
    label: string;
    description?: string;
    defaultWidth?: number;
    defaultHeight?: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
}

export interface AdSpacePlacementDto {
    id: number;
    adContentId: number;
    adSpaceId: number;
    priority: number;
    isActive: boolean;
    createdAt: string;
    updatedAt: string;
    space?: AdSpaceDto;
}

export interface AdContentDto {
    id: number;
    displayTemplate: AdTemplate;
    targetUrl: string;
    adType: AdType;
    productId?: number;
    startDate: string;
    endDate: string;
    maxImpressions?: number;
    isActive: boolean;
    metadata?: Record<string, any>;
    createdAt: string;
    updatedAt: string;
    translations: AdTranslationDto[];
    spacePlacements?: AdSpacePlacementDto[];
}
