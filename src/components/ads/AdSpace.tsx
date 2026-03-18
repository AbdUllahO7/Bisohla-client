'use client';

import React, { useEffect, useState, useRef } from 'react';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { resolveBySlotKeyAction, trackImpressionsBatchAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';
import AdRenderer from './AdRenderer';
import { Skeleton } from '@/components/ui/skeleton';

interface AdSpaceProps {
    name: string;
    platform?: string;
    className?: string;
    wrapperClassName?: string;
    fallbackContent?: React.ReactNode;
    isClosable?: boolean;
    adIndex?: number;
    adsData?: AdContentDto[];
    isLoadingAds?: boolean;
}

const AdSpace: React.FC<AdSpaceProps> = ({
    name,
    platform = 'web',
    className = '',
    wrapperClassName,
    fallbackContent,
    isClosable = true, // Closable by default (for overlays)
    adIndex,
    adsData,
    isLoadingAds,
}) => {
    const [fetchedAds, setFetchedAds] = useState<AdContentDto[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const trackedRef = useRef<boolean>(false);

    const ads = adsData !== undefined ? adsData : fetchedAds;
    const isLoading = isLoadingAds !== undefined ? isLoadingAds : isFetching;
    const error = fetchError;
    console.log(name,ads)
    useEffect(() => {
        // If external ads data is provided, don't fetch internally
        if (adsData !== undefined) {
             setIsFetching(false);
             return;
        }

        let isMounted = true;

        const fetchAds = async () => {
            setIsFetching(true);
            try {
                const response = await resolveBySlotKeyAction(name, platform);

                if (isMounted) {
                    if (response.success && response.data) {
                        let extractedAds: AdContentDto[] = [];

                        const data = response.data;
                        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
                            extractedAds = data[0][name] || [];
                        } else if (typeof data === 'object' && !Array.isArray(data) && name in data) {
                            extractedAds = (data as any)[name] || [];
                        } else {
                            extractedAds = Array.isArray(data) ? data : [data];
                        }

                        setFetchedAds(extractedAds);
                    } else {
                        setFetchError(response.message || 'No ads returned');
                    }
                }
            } catch (err) {
                if (isMounted) setFetchError('An error occurred during fetch');
            } finally {
                if (isMounted) setIsFetching(false);
            }
        };

        fetchAds();

        return () => {
            isMounted = false;
        };
    }, [name, platform, adsData]);


    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <>
                {wrapperClassName ? (
                    <div className={wrapperClassName}>
                        <Skeleton className={`w-full h-full min-h-[200px] rounded-lg ${className}`} />
                    </div>
                ) : (
                    <Skeleton className={`w-full h-full min-h-[200px] rounded-lg ${className}`} />
                )}
            </>
        );
    }

    // ── No ads returned (error or empty) ─────────────────────────────────
    if (error || ads.length === 0) {
        // Always show fallback if provided
        if (fallbackContent) {
            return wrapperClassName ? <div className={wrapperClassName}>{fallbackContent}</div> : <>{fallbackContent}</>;
        }
        // Dev-only debug label for slots with no fallback configured
        if (process.env.NODE_ENV === 'development') {
            const content = (
                <div className={`text-[10px] text-gray-300 border border-dashed border-gray-200 p-2 text-center rounded ${className}`}>
                    {error ? `⚠️ Ad Error (${name}): ${error}` : `ℹ️ No Active Ads (${name})`}
                </div>
            );
            return wrapperClassName ? <div className={wrapperClassName}>{content}</div> : content;
        }
        return null;
    }

    // ── Ads loaded — render them ──────────────────────────────────────────
    
    // If adIndex is provided, only render that specific ad, or fallback if it doesn't exist
    if (adIndex !== undefined) {
        const adToRender = ads[adIndex];
        
        if (!adToRender) {
             return fallbackContent ? (
                  wrapperClassName ? <div className={wrapperClassName}>{fallbackContent}</div> : <>{fallbackContent}</>
             ) : null;
        }
        
        const isOverlayTemplate = ['popup_modal', 'interstitial', 'floating_button', 'popup'].includes(adToRender.displayTemplate);
        if (isClosable !== false && isOverlayTemplate) {
            return <AdRenderer key={adToRender.id} ad={adToRender} isClosable={isClosable} />;
        }
        
        const AdsContent = (
            <div className={`w-full h-full flex flex-col gap-4 ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
                <AdRenderer key={adToRender.id} ad={adToRender} isClosable={isClosable} />
            </div>
        );
        return wrapperClassName ? <div className={wrapperClassName}>{AdsContent}</div> : AdsContent;
    }

    // Determine if all ads are overlays (which are removed from document flow)
    const overlayTemplates = ['popup_modal', 'interstitial', 'floating_button', 'popup'];
    // Overlays are only active if the template matches AND they are allowed to be closable (not section ads)
    const allOverlays = isClosable !== false && ads.every((ad) => overlayTemplates.includes(ad.displayTemplate));

    if (allOverlays) {
        // Do NOT apply wrapperClassName here so these take up absolutely NO space in grids/layouts!
        return (
            <>
                {ads.map((ad, index) => (
                    <AdRenderer key={ad.id || `ad-${index}`} ad={ad} isClosable={isClosable} />
                ))}
            </>
        );
    }

    const AdsContent = (
        <div className={`w-full h-full flex flex-col gap-4 ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
            {ads.map((ad, index) => (
                <AdRenderer key={ad.id || `ad-${index}`} ad={ad} isClosable={isClosable} />
            ))}
        </div>
    );

    return wrapperClassName ? <div className={wrapperClassName}>{AdsContent}</div> : AdsContent;
};

export default AdSpace;
