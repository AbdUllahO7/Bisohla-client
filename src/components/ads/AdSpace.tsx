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
    fallbackContent?: React.ReactNode;
}

const AdSpace: React.FC<AdSpaceProps> = ({ name, platform = 'web', className = '', fallbackContent }) => {
    const [ads, setAds] = useState<AdContentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const trackedRef = useRef<boolean>(false);

    useEffect(() => {
        let isMounted = true;

        const fetchAds = async () => {
            setIsLoading(true);
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

                        setAds(extractedAds);
                    } else {
                        setError(response.message || 'No ads returned');
                    }
                }
            } catch (err) {
                if (isMounted) setError('An error occurred during fetch');
            } finally {
                if (isMounted) setIsLoading(false);
            }
        };

        fetchAds();

        return () => {
            isMounted = false;
        };
    }, [name, platform]);

    // Track impressions when ads are loaded and displayed
    useEffect(() => {
        if (ads.length > 0 && !trackedRef.current) {
            const trackImpressions = async () => {
                try {
                    const ids = ads.map(ad => ad.id);
                    await trackImpressionsBatchAction(ids);
                    trackedRef.current = true;
                } catch (err) {
                    console.error('Failed to track impressions:', err);
                }
            };
            trackImpressions();
        }
    }, [ads]);

    // ── Loading state ──────────────────────────────────────────────────────
    if (isLoading) {
        // KEY FIX: If a fallback is provided, show it IMMEDIATELY while ads load silently.
        // This prevents blank/skeleton gaps for sections that always need to show something.
        if (fallbackContent) {
            return <>{fallbackContent}</>;
        }
        // No fallback — show skeleton placeholder while loading
        return <Skeleton className={`w-full min-h-[200px] rounded-lg ${className}`} />;
    }

    // ── No ads returned (error or empty) ─────────────────────────────────
    if (error || ads.length === 0) {
        // Always show fallback if provided
        if (fallbackContent) {
            return <>{fallbackContent}</>;
        }
        // Dev-only debug label for slots with no fallback configured
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className={`text-[10px] text-gray-300 border border-dashed border-gray-200 p-2 text-center rounded ${className}`}>
                    {error ? `⚠️ Ad Error (${name}): ${error}` : `ℹ️ No Active Ads (${name})`}
                </div>
            );
        }
        return null;
    }

    // ── Ads loaded — render them ──────────────────────────────────────────
    return (
        <div className={`w-full h-full flex flex-col gap-4 ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
            {ads.map((ad, index) => (
                <AdRenderer key={ad.id || `ad-${index}`} ad={ad} />
            ))}
        </div>
    );
};

export default AdSpace;
