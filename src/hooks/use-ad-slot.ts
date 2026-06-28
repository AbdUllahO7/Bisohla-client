'use client'
import { useState, useEffect, useRef } from 'react';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { resolveBySlotKeyAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';

export const useAdSlot = (slotKey: string, platform: string = 'web') => {
  const [adsData, setAdsData] = useState<AdContentDto[]>([]);
  const [isLoadingAds, setIsLoadingAds] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [allowPlaceholders, setAllowPlaceholders] = useState<boolean | undefined>(undefined);
  const [dismissable, setDismissable] = useState<boolean | undefined>(undefined);
  const [rotationStrategy, setRotationStrategy] = useState<'priority' | 'round_robin' | 'random' | undefined>(undefined);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!slotKey) {
      setIsLoadingAds(false);
      return;
    }

    let isMounted = true;

    // Safety timeout: if fetch takes more than 15 seconds, force-resolve loading
    timeoutRef.current = setTimeout(() => {
      if (isMounted) {
        console.warn(`[useAdSlot] ⏰ TIMEOUT for "${slotKey}" — forcing isLoadingAds=false after 15s`);
        setIsLoadingAds(false);
      }
    }, 15000);

    const fetchAds = async () => {
      setIsLoadingAds(true);
      try {
        const response = await resolveBySlotKeyAction(slotKey, platform);

        if (isMounted) {
          if (response.success && response.data) {
            let extractedAds: AdContentDto[] = [];
            let parsedAllowPlaceholders: boolean | undefined = undefined;
            let parsedDismissable: boolean | undefined = undefined;
            let parsedRotationStrategy: 'priority' | 'round_robin' | 'random' | undefined = undefined;

            const data = response.data;
            if (typeof data === 'object' && !Array.isArray(data) && slotKey in data) {
              const slotObj = (data as any)[slotKey];
              if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
                extractedAds = slotObj.ads || [];
                parsedAllowPlaceholders = slotObj.allowPlaceholders;
                parsedDismissable = slotObj.dismissable;
                parsedRotationStrategy = slotObj.rotationStrategy;
              } else {
                extractedAds = slotObj || [];
              }
            } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
              const slotObj = (data[0] as any)[slotKey];
              if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
                extractedAds = slotObj.ads || [];
                parsedAllowPlaceholders = slotObj.allowPlaceholders;
                parsedDismissable = slotObj.dismissable;
                parsedRotationStrategy = slotObj.rotationStrategy;
              } else {
                extractedAds = slotObj || [];
              }
            } else {
              extractedAds = Array.isArray(data) ? data : [data as any];
            }

            setAdsData(extractedAds.filter((ad: any) => ad && ad.id !== undefined));
            setAllowPlaceholders(parsedAllowPlaceholders);
            setDismissable(parsedDismissable);
            setRotationStrategy(parsedRotationStrategy);
          } else {
            console.warn(`[useAdSlot] 🔴 Response not successful for "${slotKey}":`, response.message);
            setError(response.message || 'No ads returned');
          }
        } else {
          console.warn(`[useAdSlot] ⚠️ Component unmounted before response for "${slotKey}"`);
        }
      } catch (err) {
        console.error(`[useAdSlot] 🔴 CATCH ERROR for "${slotKey}":`, err);
        if (isMounted) setError('An error occurred during fetch');
      } finally {
        if (isMounted) {
          setIsLoadingAds(false);
        }
        if (timeoutRef.current) clearTimeout(timeoutRef.current);
      }
    };

    fetchAds();

    return () => {
      isMounted = false;
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
    };
  }, [slotKey, platform]);

  return { adsData, isLoadingAds, error, allowPlaceholders, dismissable, rotationStrategy };
};

