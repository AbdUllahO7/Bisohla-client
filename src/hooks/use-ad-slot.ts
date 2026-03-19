import { useState, useEffect } from 'react';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { resolveBySlotKeyAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';

export const useAdSlot = (slotKey: string, platform: string = 'web') => {
  const [adsData, setAdsData] = useState<AdContentDto[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slotKey) {
        setIsLoadingAds(false);
        return;
    }
    
    let isMounted = true;

    const fetchAds = async () => {
      setIsLoadingAds(true);
      try {
        const response = await resolveBySlotKeyAction(slotKey, platform);

        if (isMounted) {
          if (response.success && response.data) {
            let extractedAds: AdContentDto[] = [];

            const data = response.data;
            if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
              extractedAds = (data[0] as any)[slotKey] || [];
            } else if (typeof data === 'object' && !Array.isArray(data) && slotKey in data) {
              extractedAds = (data as any)[slotKey] || [];
            } else {
              extractedAds = Array.isArray(data) ? data : [data as any];
            }

            setAdsData(extractedAds.filter((ad: any) => ad && ad.id !== undefined && ad.displayTemplate !== undefined));
          } else {
            setError(response.message || 'No ads returned');
          }
        }
      } catch (err) {
        if (isMounted) setError('An error occurred during fetch');
      } finally {
        if (isMounted) setIsLoadingAds(false);
      }
    };

    fetchAds();

    return () => {
      isMounted = false;
    };
  }, [slotKey, platform]);

  return { adsData, isLoadingAds, error };
};
