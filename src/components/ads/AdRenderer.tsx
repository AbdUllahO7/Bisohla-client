'use client';

import React from 'react';
import Image from 'next/image';
import { AdContentDto, AdTemplate } from '@/core/entities/models/ads/ads.dto';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { trackClickAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';

interface AdRendererProps {
    ad: AdContentDto;
}

const AdRenderer: React.FC<AdRendererProps> = ({ ad }) => {
    const locale = useLocale();
    const translation = ad.translations?.find((t) => t.locale === locale || t.locale.startsWith(locale)) || ad.translations?.[0];
    const handleClick = async () => {
        try {
            await trackClickAction(ad.id);
        } catch (error) {
            console.error('Failed to track ad click:', error);
        }
    };

    const renderContent = () => {
        switch (ad.displayTemplate) {
            case 'standard_card':
            case 'image_only':
                return (
                    <div className="relative w-full h-full overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50 border border-gray-100">
                        {translation?.imageUrl && (
                            <Image
                                src={translation.imageUrl}
                                alt={translation.title || 'Advertisement'}
                                fill
                                className="object-cover"
                            />
                        )}
                        {ad.displayTemplate === 'standard_card' && (translation?.title || translation?.description) && (
                            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                                {translation?.title && <h3 className="text-lg font-bold">{translation.title}</h3>}
                                {translation?.description && <p className="text-sm opacity-90 line-clamp-2">{translation.description}</p>}
                                {translation?.actionText && (
                                    <span className="mt-2 inline-block px-4 py-1 bg-primary text-white text-xs rounded-full">
                                        {translation.actionText}
                                    </span>
                                )}
                            </div>
                        )}
                    </div>
                );

            case 'hero_banner':
                return (
                    <div className="relative w-full h-[300px] md:h-[400px] rounded-2xl overflow-hidden group">
                        {translation?.imageUrl && (
                            <Image
                                src={translation.imageUrl}
                                alt={translation.title || 'Hero Banner'}
                                fill
                                className="object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                        )}
                        <div className="absolute inset-0 bg-black/40 flex flex-col justify-center px-8 md:px-16 text-white text-center md:text-start">
                            {translation?.title && (
                                <h1 className="text-3xl md:text-5xl font-bold mb-4 drop-shadow-lg">
                                    {translation.title}
                                </h1>
                            )}
                            {translation?.description && (
                                <p className="text-lg md:text-xl mb-6 max-w-2xl drop-shadow-md opacity-90">
                                    {translation.description}
                                </p>
                            )}
                            {translation?.actionText && (
                                <div>
                                    <span className="inline-block px-8 py-3 bg-primary hover:bg-primary-dark text-white font-bold rounded-lg transition-colors">
                                        {translation.actionText}
                                    </span>
                                </div>
                            )}
                        </div>
                    </div>
                );

            default:
                // Fallback to simple image + link if template is not explicitly handled yet
                return (
                    <div className="relative w-full h-full rounded-md overflow-hidden bg-gray-100 flex items-center justify-center">
                        {translation?.imageUrl ? (
                            <Image
                                src={translation.imageUrl}
                                alt={translation.title || 'Ad'}
                                fill
                                className="object-contain"
                            />
                        ) : (
                            <span className="text-xs text-gray-400">Ad Space</span>
                        )}
                    </div>
                );
        }
    };

    if (!ad.targetUrl) return renderContent();

    return (
        <Link
            href={ad.targetUrl}
            onClick={handleClick}
            target={ad.targetUrl.startsWith('http') ? '_blank' : '_self'}
            className="block w-full h-full"
        >
            {renderContent()}
        </Link>
    );
};

export default AdRenderer;
