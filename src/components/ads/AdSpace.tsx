'use client';

import React, { useEffect, useState, useRef, useMemo } from 'react';
import { AdContentDto } from '@/core/entities/models/ads/ads.dto';
import { resolveBySlotKeyAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';
import AdRenderer from './AdRenderer';
import { Skeleton } from '@/components/ui/skeleton';
import { X } from 'lucide-react';

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
    allowPlaceholders?: boolean;
    dismissable?: boolean;
    rotationStrategy?: 'priority' | 'round_robin' | 'random';
    style?: React.CSSProperties;
}

const AdSpace: React.FC<AdSpaceProps> = ({
    name,
    platform = 'web',
    className = '',
    wrapperClassName,
    fallbackContent,
    isClosable = true,
    adIndex,
    adsData,
    isLoadingAds,
    allowPlaceholders,
    dismissable,
    rotationStrategy,
    style,
}) => {
    const [fetchedAds, setFetchedAds] = useState<AdContentDto[]>([]);
    const [isFetching, setIsFetching] = useState(true);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [isDismissed, setIsDismissed] = useState(false);

    // Internal states parsed from V2 response
    const [internalAllowPlaceholders, setInternalAllowPlaceholders] = useState<boolean | undefined>(undefined);
    const [internalDismissable, setInternalDismissable] = useState<boolean | undefined>(undefined);
    const [internalRotationStrategy, setInternalRotationStrategy] = useState<'priority' | 'round_robin' | 'random' | undefined>(undefined);

    const [rrOffset, setRrOffset] = useState(0);

    const ads = adsData !== undefined ? adsData : fetchedAds;
    const isLoading = isLoadingAds !== undefined ? isLoadingAds : isFetching;
    const error = fetchError;

    const finalAllowPlaceholders = allowPlaceholders !== undefined ? allowPlaceholders : internalAllowPlaceholders;
    const finalDismissable = dismissable !== undefined ? dismissable : internalDismissable;
    const finalRotationStrategy = rotationStrategy !== undefined ? rotationStrategy : internalRotationStrategy;

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
                console.log("AdSpace fetchAds response for slot key:", name, "response:", response);

                if (isMounted) {
                    if (response.success && response.data) {
                        let extractedAds: AdContentDto[] = [];
                        let parsedAllowPlaceholders: boolean | undefined = undefined;
                        let parsedDismissable: boolean | undefined = undefined;
                        let parsedRotationStrategy: 'priority' | 'round_robin' | 'random' | undefined = undefined;

                        const data = response.data;
                        if (typeof data === 'object' && !Array.isArray(data) && name in data) {
                            const slotObj = (data as any)[name];
                            if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
                                extractedAds = slotObj.ads || [];
                                parsedAllowPlaceholders = slotObj.allowPlaceholders;
                                parsedDismissable = slotObj.dismissable;
                                parsedRotationStrategy = slotObj.rotationStrategy;
                            } else {
                                extractedAds = slotObj || [];
                            }
                        } else if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
                            const slotObj = data[0][name];
                            if (slotObj && typeof slotObj === 'object' && 'ads' in slotObj) {
                                extractedAds = slotObj.ads || [];
                                parsedAllowPlaceholders = slotObj.allowPlaceholders;
                                parsedDismissable = slotObj.dismissable;
                                parsedRotationStrategy = slotObj.rotationStrategy;
                            } else {
                                extractedAds = slotObj || [];
                            }
                        } else {
                            extractedAds = Array.isArray(data) ? data : [data];
                        }

                        setFetchedAds(extractedAds.filter((ad: any) => ad && ad.id !== undefined && ad.displayTemplate !== undefined));
                        setInternalAllowPlaceholders(parsedAllowPlaceholders);
                        setInternalDismissable(parsedDismissable);
                        setInternalRotationStrategy(parsedRotationStrategy);
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

    // Handle round robin client-side offset on mount/ads update
    useEffect(() => {
        if (ads.length > 1 && finalRotationStrategy === 'round_robin') {
            try {
                const storageKey = `rr_${name}`;
                const lastIdxStr = localStorage.getItem(storageKey);
                const lastIdx = lastIdxStr ? parseInt(lastIdxStr, 10) : 0;
                setRrOffset(lastIdx);

                const nextIdx = (lastIdx + 1) % ads.length;
                localStorage.setItem(storageKey, String(nextIdx));
            } catch (e) {
                // Ignore localStorage errors
            }
        }
    }, [ads.length, finalRotationStrategy, name]);

    // Apply sorting/rotation strategies
    const orderedAds = useMemo(() => {
        if (!ads || ads.length <= 1) return ads;

        if (finalRotationStrategy === 'random') {
            return [...ads].sort(() => Math.random() - 0.5);
        }

        if (finalRotationStrategy === 'round_robin') {
            const indexToUse = rrOffset % ads.length;
            return [...ads.slice(indexToUse), ...ads.slice(0, indexToUse)];
        }

        return ads;
    }, [ads, finalRotationStrategy, rrOffset]);

    console.log("AdSpace name:", name, "isLoading:", isLoading, "error:", error, "finalAllowPlaceholders:", finalAllowPlaceholders, "orderedAdsLength:", orderedAds.length, "hasFallback:", !!fallbackContent, "isDismissed:", isDismissed);

    if (isDismissed) return null;

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        console.log(`[AdSpace] ⏳ "${name}" → rendering SKELETON (isLoading=true)`);
        return (
            <>
                {wrapperClassName ? (
                    <div className={wrapperClassName} style={style}>
                        <Skeleton className={`w-full h-full min-h-[200px] rounded-lg ${className}`} />
                    </div>
                ) : (
                    <Skeleton className={`w-full h-full min-h-[200px] rounded-lg ${className}`} style={style} />
                )}
            </>
        );
    }

    // ── No ads returned (error or empty) ─────────────────────────────────
    if (error || orderedAds.length === 0) {
        // If allowPlaceholders is true, hide the default ads. If false, show them!
        if (finalAllowPlaceholders === true) {
            console.log(`[AdSpace] 🚫 "${name}" → returning NULL (allowPlaceholders=true)`);
            return null;
        }

        // Always show fallback if provided
        if (fallbackContent) {
            console.log(`[AdSpace] ✅ "${name}" → rendering FALLBACK content`);
            return wrapperClassName
                ? <div className={`w-full ${wrapperClassName}`} style={style}>{fallbackContent}</div>
                : <div className={`w-full ${className}`} style={style}>{fallbackContent}</div>;
        }
        // Dev-only debug label for slots with no fallback configured
        if (process.env.NODE_ENV === 'development') {
            console.log(`[AdSpace] 🔧 "${name}" → rendering DEV debug label`);
            const content = (
                <div className={`text-[10px] text-gray-300 border border-dashed border-gray-200 p-2 text-center rounded ${className}`}>
                    {error ? `⚠️ Ad Error (${name}): ${error}` : `ℹ️ No Active Ads (${name})`}
                </div>
            );
            return wrapperClassName ? <div className={wrapperClassName} style={style}>{content}</div> : <div style={style}>{content}</div>;
        }
        return null;
    }

    const dismissButton = finalDismissable ? (
        <button
            onClick={() => setIsDismissed(true)}
            className="absolute top-2 right-2 z-20 bg-white/80 dark:bg-black/60 hover:bg-white dark:hover:bg-black text-gray-700 dark:text-gray-200 rounded-full p-1.5 shadow-md hover:shadow-lg transition-all duration-200"
            aria-label="Close Advertisement"
        >
            <X size={16} />
        </button>
    ) : null;

    const renderInlineContainer = (content: React.ReactNode) => {
        return (
            <div className="relative group/adspace w-full h-full">
                {dismissButton}
                {content}
            </div>
        );
    };

    // ── Ads loaded — render them ──────────────────────────────────────────

    // If adIndex is provided, only render that specific ad, or fallback if it doesn't exist
    if (adIndex !== undefined) {
        const adToRender = orderedAds[adIndex];

        if (!adToRender) {
            if (finalAllowPlaceholders === true) {
                return null;
            }
            return fallbackContent ? (
                wrapperClassName ? <div className={wrapperClassName} style={style}>{fallbackContent}</div> : <div style={style}>{fallbackContent}</div>
            ) : null;
        }

        const isOverlayTemplate = ['popup_modal', 'interstitial', 'floating_button', 'popup'].includes(adToRender.displayTemplate);
        if (isClosable !== false && isOverlayTemplate) {
            return <AdRenderer key={adToRender.id} ad={adToRender} isClosable={isClosable} />;
        }

        let AdsContent = (
            <div className={`w-full h-full flex flex-col gap-4 ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
                <AdRenderer key={adToRender.id} ad={adToRender} isClosable={isClosable} />
            </div>
        );

        if (finalDismissable) {
            AdsContent = renderInlineContainer(AdsContent);
        }

        return wrapperClassName ? <div className={wrapperClassName} style={style}>{AdsContent}</div> : <div style={style}>{AdsContent}</div>;
    }

    // Determine if all ads are overlays (which are removed from document flow)
    const overlayTemplates = ['popup_modal', 'interstitial', 'floating_button', 'popup'];
    // Overlays are only active if the template matches AND they are allowed to be closable (not section ads)
    const allOverlays = isClosable !== false && orderedAds.every((ad) => overlayTemplates.includes(ad.displayTemplate));

    if (allOverlays) {
        // Do NOT apply wrapperClassName here so these take up absolutely NO space in grids/layouts!
        return (
            <>
                {orderedAds.map((ad, index) => (
                    <AdRenderer key={ad.id || `ad-${index}`} ad={ad} isClosable={isClosable} />
                ))}
            </>
        );
    }

    let AdsContent = (
        <div className={`w-full h-full flex flex-col gap-4 ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
            {orderedAds.map((ad, index) => (
                <AdRenderer key={ad.id || `ad-${index}`} ad={ad} isClosable={isClosable} />
            ))}
        </div>
    );

    if (finalDismissable) {
        AdsContent = renderInlineContainer(AdsContent);
    }

    return wrapperClassName ? <div className={wrapperClassName} style={style}>{AdsContent}</div> : <div style={style}>{AdsContent}</div>;
};

export default AdSpace;
