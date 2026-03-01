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
}

const AdSpace: React.FC<AdSpaceProps> = ({ name, platform = 'web', className = '' }) => {
    const [ads, setAds] = useState<AdContentDto[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const trackedRef = useRef<boolean>(false);

    console.log('ads', ads)

    useEffect(() => {
        let isMounted = true;

        const fetchAds = async () => {
            setIsLoading(true);
            console.log(`[AdSpace DEBUG] Fetching ads for slot key: "${name}" (Platform: ${platform})`);
            try {
                const response = await resolveBySlotKeyAction(name, platform);
                console.log(`[AdSpace DEBUG] Response for slot key "${name}":`, response);

                if (isMounted) {
                    if (response.success && response.data) {
                        let extractedAds: AdContentDto[] = [];

                        // Handle the case where the API returns a map of slot keys to ads: [{ "slot-key": [ads] }]
                        // or just { "slot-key": [ads] }
                        const data = response.data;
                        if (Array.isArray(data) && data.length > 0 && typeof data[0] === 'object' && !('id' in data[0])) {
                            // It's the [{ "slot-key": [ads] }] format
                            extractedAds = data[0][name] || [];
                        } else if (typeof data === 'object' && !Array.isArray(data) && name in data) {
                            // It's the { "slot-key": [ads] } format
                            extractedAds = (data as any)[name] || [];
                        } else {
                            // Fallback to the original logic
                            extractedAds = Array.isArray(data) ? data : [data];
                        }

                        console.log(`[AdSpace DEBUG] Successfully extracted ${extractedAds.length} ads for slot key "${name}"`);
                        setAds(extractedAds);
                    } else {
                        console.warn(`[AdSpace DEBUG] Slot key "${name}" returned no ads or failed. Message: ${response.message}`);
                        setError(response.message || 'No ads returned');
                    }
                }
            } catch (err) {
                console.error(`[AdSpace DEBUG] Fatal error fetching slot key "${name}":`, err);
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

    if (isLoading) {
        return <Skeleton className={`w-full min-h-[200px] rounded-lg ${className}`} />;
    }

    if (error || ads.length === 0) {
        // In development, show a small label if ads are missing to help debug
        if (process.env.NODE_ENV === 'development') {
            return (
                <div className={`text-[10px] text-gray-300 border border-dashed border-gray-200 p-2 text-center rounded ${className}`}>
                    {error ? `⚠️ Ad Error (${name}): ${error}` : `ℹ️ No Active Ads (${name})`}
                </div>
            );
        }
        return null;
    }

    return (
        <div className={`w-full h-full ad-space-${name.replace(/\s+/g, '-')} ${className}`}>
            {ads.map((ad, index) => (
                <AdRenderer key={ad.id || `ad-${index}`} ad={ad} />
            ))}
        </div>
    );
};

export default AdSpace;
