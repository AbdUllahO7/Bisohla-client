import { ApiResponse } from '@/core/entities/api/success.response';
import { AdContentDto, AdSlotConfigDto } from '@/core/entities/models/ads/ads.dto';
import { getReq, postReq } from '@/core/lib/api';
import { IAdVisitorRepository } from '@/core/application/repositories/ads/ads.visitor.repo.interface';

export class AdVisitorRepository implements IAdVisitorRepository {
    async resolveAds(names: string[], platform: string): Promise<ApiResponse<Record<string, AdContentDto[]>>> {
        const query = new URLSearchParams();
        names.forEach(name => query.append('names', name));
        query.append('platform', platform);

        const res = await getReq({
            url: `/visitor/ad-spaces/resolve?${query.toString()}`,
        });
        return res as ApiResponse<Record<string, AdContentDto[]>>;
    }

    async resolveBySlotKey(slotKey: string, platform: string): Promise<ApiResponse<Record<string, AdSlotConfigDto>>> {
        const encodedSlotKeys = slotKey.split(',').map(encodeURIComponent).join(',');
        try {
            const res = await getReq({
                url: `/visitor/ad-spaces/v2/resolve-by-slot-key?slotKeys=${encodedSlotKeys}&platform=${platform}`,
            });
            return res as ApiResponse<Record<string, AdSlotConfigDto>>;
        } catch (error) {
            console.error(" [REPO] AdVisitorRepository.resolveBySlotKey getReq error for slotKey:", slotKey, error);
            throw error;
        }
    }

    async getAdsByPage(pageSlug: string, platform: string): Promise<ApiResponse<Record<string, AdContentDto[]>>> {
        const res = await getReq({
            url: `/visitor/ad-spaces/by-page/${encodeURIComponent(pageSlug)}?platform=${platform}`,
        });
        return res as ApiResponse<Record<string, AdContentDto[]>>;
    }

    async getActiveAdsBySpace(name: string, platform: string): Promise<ApiResponse<AdContentDto[]>> {
        const res = await getReq({
            url: `/visitor/ad-spaces/${encodeURIComponent(name)}/active?platform=${platform}`,
        });
        return res as ApiResponse<AdContentDto[]>;
    }

    async trackImpressionsBatch(adIds: number[]): Promise<ApiResponse<void>> {
        const res = await postReq({
            url: '/visitor/ad-spaces/impressions/batch',
            body: { adIds },
        });
        return res as ApiResponse<void>;
    }

    async trackClick(id: number): Promise<ApiResponse<void>> {
        const res = await postReq({
            url: `/visitor/ad-spaces/track/${id}`,
        });
        return res as ApiResponse<void>;
    }
}
