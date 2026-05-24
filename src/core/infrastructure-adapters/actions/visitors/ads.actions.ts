'use server';

import { ApiResponse } from '@/core/entities/api/success.response';
import { AdContentDto, AdSlotConfigDto } from '@/core/entities/models/ads/ads.dto';
import { AdVisitorRepository } from '@/core/infrastructure/repositories/ads/ads.visitor.repo';

const adRepo = new AdVisitorRepository();

export const resolveAdsAction = async (
    names: string[],
    platform: string = 'Web',
): Promise<ApiResponse<Record<string, AdContentDto[]>>> => {
    try {
        const res = await adRepo.resolveAds(names, platform);
        return res;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to resolve ads',
            data: {},
        } as any;
    }
};

export const getAdsByPageAction = async (
    pageSlug: string,
    platform: string = 'Web',
): Promise<ApiResponse<Record<string, AdContentDto[]>>> => {
    try {
        const res = await adRepo.getAdsByPage(pageSlug, platform);
        return res;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to get ads for page',
            data: {},
        } as any;
    }
};

export const getActiveAdsBySpaceAction = async (
    name: string,
    platform: string = 'Web',
): Promise<ApiResponse<AdContentDto[]>> => {
    try {
        const res = await adRepo.getActiveAdsBySpace(name, platform);
        return res;
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to get active ads for space',
            data: [],
        } as any;
    }
};

export const resolveBySlotKeyAction = async (
    slotKey: string,
    platform: string = 'Web',
): Promise<ApiResponse<Record<string, AdSlotConfigDto>>> => {
    console.log(" [SERVER ACTION] resolveBySlotKeyAction CALLED with slotKey:", slotKey, "platform:", platform);
    try {
        const res = await adRepo.resolveBySlotKey(slotKey, platform);
        console.log(" [SERVER ACTION] resolveBySlotKeyAction COMPLETED for:", slotKey, "success:", res?.success);
        return res;
    } catch (error: any) {
        console.error(" [SERVER ACTION] resolveBySlotKeyAction ERROR for:", slotKey, error);
        return {
            success: false,
            message: error.message || 'Failed to resolve ads by slot key',
            data: {},
        } as any;
    }
};

export const trackImpressionsBatchAction = async (adIds: number[]): Promise<ApiResponse<void>> => {
    try {
        return await adRepo.trackImpressionsBatch(adIds);
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to track impressions',
        } as ApiResponse<void>;
    }
};

export const trackClickAction = async (id: number): Promise<ApiResponse<void>> => {
    try {
        return await adRepo.trackClick(id);
    } catch (error: any) {
        return {
            success: false,
            message: error.message || 'Failed to track click',
        } as ApiResponse<void>;
    }
};
