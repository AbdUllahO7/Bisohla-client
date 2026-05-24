import { ApiResponse } from '@/core/entities/api/success.response';
import { AdContentDto, AdSlotConfigDto } from '@/core/entities/models/ads/ads.dto';

export interface IAdVisitorRepository {
    resolveAds(names: string[], platform: string): Promise<ApiResponse<Record<string, AdContentDto[]>>>;
    resolveBySlotKey(slotKey: string, platform: string): Promise<ApiResponse<Record<string, AdSlotConfigDto>>>;
    getAdsByPage(pageSlug: string, platform: string): Promise<ApiResponse<Record<string, AdContentDto[]>>>;
    getActiveAdsBySpace(name: string, platform: string): Promise<ApiResponse<AdContentDto[]>>;
    trackImpressionsBatch(adIds: number[]): Promise<ApiResponse<void>>;
    trackClick(id: number): Promise<ApiResponse<void>>;
}
