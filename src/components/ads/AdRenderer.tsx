'use client';

import React, { useState, useRef, useEffect } from 'react';
import Image from 'next/image';
import { AdContentDto, AdTemplate } from '@/core/entities/models/ads/ads.dto';
import { useLocale } from 'next-intl';
import { Link } from '@/i18n/routing';
import { trackClickAction } from '@/core/infrastructure-adapters/actions/visitors/ads.actions';
import { X, Play, ChevronLeft, ChevronRight, ExternalLink } from 'lucide-react';

interface AdRendererProps {
    ad: AdContentDto;
    isClosable?: boolean;
}

// ─── Helpers ────────────────────────────────────────────────────────────────

/** Extracts YouTube video ID from various URL formats */
const getYoutubeId = (url?: string) => {
    if (!url) return null;
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
};

/** Shared media renderer — picks video, youtube, or image depending on adType / available URLs */
const AdMedia = ({
    imageUrl,
    videoUrl,
    title,
    adType,
    ad,
    className = 'w-full h-full object-cover',
}: {
    imageUrl?: string;
    videoUrl?: string;
    title?: string;
    adType: string;
    ad?: AdContentDto;
    className?: string;
}) => {
    const rawType = (adType || '').toLowerCase().replace(/_/g, ' ');
    // Do not render media if it is text-only
    if (rawType === 'text only' || rawType === 'text_only' || rawType === 'text') {
        return null;
    }


    // --- FALLBACK LOGIC ---
    // If translation media is missing, try root ad properties
    const effectiveImageUrl = imageUrl || ad?.imageUrl;
    const effectiveVideoUrl = videoUrl || ad?.videoUrl;
    const effectiveTitle = title || ad?.name;

    // Decide which media to render
    const youtubeId = getYoutubeId(effectiveVideoUrl);
    const isVideo =
        adType === 'video' ||
        adType === 'animated_gif' ||
        (effectiveVideoUrl && !effectiveImageUrl);

    if (isVideo && effectiveVideoUrl) {
        if (youtubeId) {
            return (
                <iframe
                    src={`https://www.youtube.com/embed/${youtubeId}?autoplay=1&mute=1&loop=1&playlist=${youtubeId}&controls=0&modestbranding=1&rel=0&showinfo=0`}
                    className={className}
                    allow="autoplay; encrypted-media"
                    allowFullScreen
                    title={effectiveTitle || 'Advertisement YouTube video'}
                />
            );
        }
        return (
            <video
                src={effectiveVideoUrl}
                className={className}
                autoPlay
                muted
                loop
                playsInline
                preload="metadata"
                aria-label={effectiveTitle || 'Advertisement video'}
            />
        );
    }

    if (adType === 'animated_gif' && effectiveImageUrl) {
        // eslint-disable-next-line @next/next/no-img-element
        return <img src={effectiveImageUrl} alt={effectiveTitle || 'Advertisement'} className={className} />;
    }

    if (effectiveImageUrl) {
        return (
            <Image
                src={effectiveImageUrl}
                alt={effectiveTitle || 'Advertisement'}
                fill
                className={className}
                sizes="(max-width: 768px) 100vw, 50vw"
            />
        );
    }

    return null;
};

// ─── Template Components ─────────────────────────────────────────────────────

/** image_only — full image/video fill, no text overlay */
const ImageOnlyAd = ({ ad, translation }: any) => (
    <div className="relative w-full h-full min-h-[250px] overflow-hidden rounded-lg bg-gray-100">
        <AdMedia
            imageUrl={translation?.imageUrl}
            videoUrl={translation?.videoUrl}
            title={translation?.title}
            adType={ad.adType}
            ad={ad}
        />
    </div>
);

/** standard_card — image with text overlay at bottom */
const StandardCardAd = ({ ad, translation }: any) => (
    <div className="relative w-full h-full min-h-[250px] overflow-hidden rounded-lg shadow-sm hover:shadow-md transition-shadow bg-gray-50 border border-gray-100">
        <AdMedia
            imageUrl={translation?.imageUrl}
            videoUrl={translation?.videoUrl}
            title={translation?.title}
            adType={ad.adType}
            ad={ad}
        />
        {(translation?.title || translation?.description) && (
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                {translation?.title && <h3 className="text-lg font-bold leading-tight">{translation.title}</h3>}
                {translation?.description && (
                    <p className="text-sm opacity-90 line-clamp-2 mt-1">{translation.description}</p>
                )}
                {translation?.actionText && (
                    <span className="mt-2 inline-block px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        {translation.actionText}
                    </span>
                )}
            </div>
        )}
    </div>
);

/** hero_banner — full-width tall banner with centred CTA */
const HeroBannerAd = ({ ad, translation }: any) => (
    <div className="relative w-full h-[280px] md:h-[380px] rounded-2xl overflow-hidden group">
        <AdMedia
            imageUrl={translation?.imageUrl}
            videoUrl={translation?.videoUrl}
            title={translation?.title}
            adType={ad.adType}
            ad={ad}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/30 to-transparent flex flex-col justify-end p-6 md:p-10 text-white">
            {translation?.title && (
                <h1 className="text-2xl md:text-4xl font-bold mb-2 drop-shadow-lg">{translation.title}</h1>
            )}
            {translation?.description && (
                <p className="text-base md:text-lg mb-4 max-w-2xl drop-shadow opacity-90 line-clamp-2">
                    {translation.description}
                </p>
            )}
            {translation?.actionText && (
                <span className="self-start px-6 py-2 bg-primary hover:bg-green-700 text-white font-bold rounded-lg transition-colors text-sm md:text-base">
                    {translation.actionText}
                </span>
            )}
        </div>
    </div>
);

/** native_list — looks like editorial content, blends with the page */
const NativeListAd = ({ ad, translation }: any) => (
    <div className="flex gap-4 items-start p-4 rounded-xl bg-white border border-gray-100 hover:shadow-md transition-shadow">
        <div className="relative w-24 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-gray-100">
            <AdMedia
                imageUrl={translation?.imageUrl}
                videoUrl={translation?.videoUrl}
                title={translation?.title}
                adType={ad.adType}
                ad={ad}
            />
        </div>
        <div className="flex-1 min-w-0">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Sponsored</span>
            {translation?.title && (
                <h4 className="text-sm font-semibold text-gray-900 leading-tight mt-0.5 line-clamp-2">
                    {translation.title}
                </h4>
            )}
            {translation?.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{translation.description}</p>
            )}
            {translation?.actionText && (
                <span className="mt-2 inline-block text-xs text-primary font-semibold">
                    {translation.actionText} →
                </span>
            )}
        </div>
    </div>
);

/** carousel — horizontal swipeable cards */
const CarouselAd = ({ ad, translation }: any) => {
    const [current, setCurrent] = useState(0);
    // Build slides: use metadata.slides if provided, fallback to single translation
    const slides: Array<{ imageUrl?: string; videoUrl?: string; title?: string; description?: string; actionText?: string }> =
        ad.metadata?.slides?.length > 0
            ? ad.metadata.slides
            : [{ imageUrl: translation?.imageUrl, videoUrl: translation?.videoUrl, title: translation?.title, description: translation?.description, actionText: translation?.actionText }];

    const prev = (e: React.MouseEvent) => { e.preventDefault(); setCurrent((c) => (c - 1 + slides.length) % slides.length); };
    const next = (e: React.MouseEvent) => { e.preventDefault(); setCurrent((c) => (c + 1) % slides.length); };

    return (
        <div className="relative w-full h-full min-h-[250px] overflow-hidden rounded-xl bg-gray-100 select-none">
            {slides.map((slide, i) => (
                <div
                    key={i}
                    className={`absolute inset-0 transition-opacity duration-500 ${i === current ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                >
                    <AdMedia
                        imageUrl={slide.imageUrl}
                        videoUrl={slide.videoUrl}
                        title={slide.title}
                        adType={ad.adType}
                        ad={ad}
                    />
                    {(slide.title || slide.actionText) && (
                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/70 to-transparent text-white">
                            {slide.title && <p className="text-sm font-bold">{slide.title}</p>}
                            {slide.actionText && (
                                <span className="mt-1 inline-block text-xs px-3 py-1 bg-primary rounded-full">{slide.actionText}</span>
                            )}
                        </div>
                    )}
                </div>
            ))}

            {slides.length > 1 && (
                <>
                    <button onClick={prev} className="absolute left-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors">
                        <ChevronLeft size={18} />
                    </button>
                    <button onClick={next} className="absolute right-2 top-1/2 -translate-y-1/2 z-20 bg-black/40 hover:bg-black/60 text-white rounded-full p-1 transition-colors">
                        <ChevronRight size={18} />
                    </button>
                    <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-20 flex gap-1.5">
                        {slides.map((_, i) => (
                            <button
                                key={i}
                                onClick={(e) => { e.preventDefault(); setCurrent(i); }}
                                className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? 'bg-white w-4' : 'bg-white/50'}`}
                            />
                        ))}
                    </div>
                </>
            )}
        </div>
    );
};

/** popup_modal — renders a modal overlay */
const PopupModalAd = ({ ad, translation, onClose, isClosable }: any) => {
    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4" onClick={isClosable ? onClose : undefined}>
            <div
                className="relative bg-white rounded-2xl shadow-2xl overflow-hidden max-w-md w-full max-h-[80vh]"
                onClick={(e) => e.stopPropagation()}
            >
                {isClosable && (
                    <button
                        onClick={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                            onClose();
                        }}
                        className="absolute top-4 right-4 z-50 bg-black/50 hover:bg-black/70 text-white rounded-full p-2.5 shadow-xl transition-all transform hover:scale-110 active:scale-95"
                        aria-label="Close advertisement"
                    >
                        <X size={20} strokeWidth={2.5} />
                    </button>
                )}
                <div className="relative h-52 w-full">
                    <AdMedia
                        imageUrl={translation?.imageUrl}
                        videoUrl={translation?.videoUrl}
                        title={translation?.title}
                        adType={ad.adType}
                        ad={ad}
                    />
                </div>
                <div className="p-6 text-center">
                    {translation?.title || ad.name ? <h3 className="text-xl font-bold text-gray-900 mb-2">{translation?.title || ad.name}</h3> : null}
                    {translation?.description || ad.description ? <p className="text-sm text-gray-600 mb-4">{translation?.description || ad.description}</p> : null}
                    {translation?.actionText && (
                        <span className="inline-block px-6 py-2 bg-primary text-white font-semibold rounded-lg text-sm">
                            {translation.actionText}
                        </span>
                    )}
                </div>
            </div>
        </div>
    );
};

/** sticky_banner — secondary banner style */
const StickyBannerAd = ({ ad, translation }: any) => (
    <div className="w-full bg-white border border-gray-200 rounded-xl shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        <div className="px-4 py-3 flex items-center gap-4">
            {(translation?.imageUrl || translation?.videoUrl) && (
                <div className="relative w-16 h-10 flex-shrink-0 rounded overflow-hidden">
                    <AdMedia
                        imageUrl={translation?.imageUrl}
                        videoUrl={translation?.videoUrl}
                        title={translation?.title}
                        adType={ad.adType}
                        ad={ad}
                    />
                </div>
            )}
            <div className="flex-1 min-w-0">
                {translation?.title && <p className="text-sm font-semibold text-gray-900 truncate">{translation.title}</p>}
                {translation?.description && <p className="text-xs text-gray-500 truncate">{translation.description}</p>}
            </div>
            {translation?.actionText && (
                <span className="flex-shrink-0 px-4 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg">
                    {translation.actionText}
                </span>
            )}
        </div>
    </div>
);

/** interstitial — full screen takeover with skip after 5s */
const InterstitialAd = ({ ad, translation, onClose, isClosable }: any) => {
    const [countdown, setCountdown] = useState(5);

    useEffect(() => {
        if (!isClosable) return;
        if (countdown <= 0) { onClose(); return; }
        const t = setTimeout(() => setCountdown((c) => c - 1), 1000);
        return () => clearTimeout(t);
    }, [countdown, onClose, isClosable]);

    return (
        <div className="fixed inset-0 z-[9999] bg-black flex flex-col">
            <div className="flex-1 relative">
                <AdMedia
                    imageUrl={translation?.imageUrl}
                    videoUrl={translation?.videoUrl}
                    title={translation?.title}
                    adType={ad.adType}
                    ad={ad}
                    className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-black/30 flex flex-col justify-end p-8 text-white">
                    {translation?.title || ad.name ? <h2 className="text-3xl font-bold mb-2">{translation?.title || ad.name}</h2> : null}
                    {translation?.description || ad.description ? <p className="text-lg opacity-90 mb-4">{translation?.description || ad.description}</p> : null}
                    {translation?.actionText && (
                        <span className="self-start px-8 py-3 bg-primary text-white font-bold rounded-lg text-base">
                            {translation.actionText}
                        </span>
                    )}
                </div>
            </div>
            {isClosable && (
                <div className="absolute top-4 right-4">
                    {countdown > 0 ? (
                        <div className="bg-black/60 text-white text-sm px-4 py-2 rounded-full">
                            Skip in {countdown}s
                        </div>
                    ) : (
                        <button
                            onClick={onClose}
                            className="bg-white text-gray-900 text-sm font-semibold px-4 py-2 rounded-full hover:bg-gray-100 transition-colors"
                        >
                            Skip Ad <X size={14} className="inline ml-1" />
                        </button>
                    )}
                </div>
            )}
        </div>
    );
};

/** sidebar_widget — compact vertical card for sidebars */
const SidebarWidgetAd = ({ ad, translation }: any) => (
    <div className="w-full rounded-xl overflow-hidden border border-gray-100 shadow-sm bg-white hover:shadow-md transition-shadow">
        <div className="relative w-full h-40">
            <AdMedia
                imageUrl={translation?.imageUrl}
                videoUrl={translation?.videoUrl}
                title={translation?.title}
                adType={ad.adType}
                ad={ad}
            />
        </div>
        <div className="p-3">
            <span className="text-[10px] text-gray-400 uppercase tracking-wider">Sponsored</span>
            {translation?.title && (
                <h4 className="text-sm font-semibold text-gray-900 leading-snug mt-1 line-clamp-2">{translation.title}</h4>
            )}
            {translation?.description && (
                <p className="text-xs text-gray-500 mt-1 line-clamp-3">{translation.description}</p>
            )}
            {translation?.actionText && (
                <div className="mt-3">
                    <span className="block w-full text-center px-3 py-1.5 bg-primary text-white text-xs font-semibold rounded-lg">
                        {translation.actionText}
                    </span>
                </div>
            )}
        </div>
    </div>
);

/** inline_content — text-rich content block, editorial-style */
const InlineContentAd = ({ ad, translation }: any) => (
    <div className="w-full p-4 md:p-6 rounded-xl bg-gradient-to-br from-gray-50 to-white border border-gray-100 hover:shadow-md transition-shadow">
        <span className="text-[10px] text-gray-400 uppercase tracking-wider font-medium">Sponsored Content</span>
        <div className="mt-2 flex gap-4 items-start">
            {translation?.imageUrl && (
                <div className="relative w-20 h-16 flex-shrink-0 rounded-lg overflow-hidden">
                    <Image src={translation.imageUrl} alt={translation?.title || 'Ad'} fill className="object-cover" />
                </div>
            )}
            <div className="flex-1">
                {translation?.title && (
                    <h4 className="text-base font-bold text-gray-900 leading-tight">{translation.title}</h4>
                )}
                {translation?.description && (
                    <p className="text-sm text-gray-600 mt-1 line-clamp-3">{translation.description}</p>
                )}
                {translation?.actionText && (
                    <span className="mt-2 inline-flex items-center gap-1 text-sm text-primary font-semibold">
                        {translation.actionText} <ExternalLink size={12} />
                    </span>
                )}
            </div>
        </div>
    </div>
);

/** floating_button — pill button anchored bottom-right */
const FloatingButtonAd = ({ ad, translation, onClose, isClosable }: any) => (
    <div className="fixed bottom-20 right-4 z-[90] flex flex-col items-end gap-2">
        {isClosable && (
            <button
                onClick={onClose}
                className="self-end bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full p-0.5 transition-colors"
                aria-label="Close ad"
            >
                <X size={12} />
            </button>
        )}
        <div className="flex items-center gap-2 bg-primary text-white px-5 py-3 rounded-full shadow-xl hover:shadow-2xl hover:bg-green-700 transition-all cursor-pointer max-w-[220px]">
            {(translation?.imageUrl || ad.imageUrl) && (
                <div className="relative w-8 h-8 flex-shrink-0 rounded-full overflow-hidden bg-white/20">
                    <Image src={translation?.imageUrl || ad.imageUrl!} alt="" fill className="object-cover" />
                </div>
            )}
            <span className="text-sm font-semibold truncate">
                {translation?.actionText || translation?.title || 'Learn More'}
            </span>
        </div>
    </div>
);

/** video_player — dedicated video player with controls */
const VideoPlayerAd = ({ ad, translation }: any) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [isPlaying, setIsPlaying] = useState(false);

    // --- FALLBACK LOGIC ---
    const effectiveImageUrl = translation?.imageUrl || ad.imageUrl;
    const effectiveVideoUrl = translation?.videoUrl || ad.videoUrl;
    const effectiveTitle = translation?.title || ad.name;
    const youtubeId = getYoutubeId(effectiveVideoUrl);

    const toggle = (e: React.MouseEvent) => {
        e.preventDefault();
        const v = videoRef.current;
        if (!v) return;
        if (isPlaying) { v.pause(); setIsPlaying(false); }
        else { v.play(); setIsPlaying(true); }
    };

    if (!effectiveVideoUrl && !effectiveImageUrl) {
        return (
            <div className="w-full h-full rounded-xl bg-gray-900 flex items-center justify-center text-gray-500 text-sm">
                No media available
            </div>
        );
    }

    return (
        <div className="relative w-full h-full min-h-[250px] rounded-xl overflow-hidden bg-black group">
            {effectiveVideoUrl ? (
                <>
                    {youtubeId ? (
                        <iframe
                            src={`https://www.youtube.com/embed/${youtubeId}?autoplay=0&controls=1&modestbranding=1&rel=0`}
                            className="w-full h-full"
                            allow="autoplay; encrypted-media"
                            allowFullScreen
                            title={effectiveTitle || 'Advertisement YouTube video'}
                        />
                    ) : (
                        <>
                            <video
                                ref={videoRef}
                                src={effectiveVideoUrl}
                                className="w-full h-full object-cover"
                                playsInline
                                preload="metadata"
                                onPlay={() => setIsPlaying(true)}
                                onPause={() => setIsPlaying(false)}
                                onEnded={() => setIsPlaying(false)}
                                aria-label={effectiveTitle || 'Advertisement video'}
                            />
                            {/* Play/pause overlay */}
                            <button
                                onClick={toggle}
                                className={`absolute inset-0 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-0 group-hover:opacity-100' : 'opacity-100'}`}
                            >
                                <div className="bg-black/50 rounded-full p-4 hover:bg-black/70 transition-colors">
                                    <Play size={32} className="text-white fill-white" />
                                </div>
                            </button>
                        </>
                    )}
                </>
            ) : (
                <div className="relative w-full h-full">
                    {effectiveImageUrl && <Image src={effectiveImageUrl} alt={effectiveTitle || 'Ad'} fill className="object-cover" />}
                </div>
            )}

            {/* Bottom overlay with ad info */}
            <div className="absolute bottom-0 left-0 right-0 p-4 bg-gradient-to-t from-black/80 to-transparent text-white">
                {effectiveTitle && <h3 className="text-base font-bold leading-tight">{effectiveTitle}</h3>}
                {(translation?.description || ad.description) && (
                    <p className="text-xs opacity-80 mt-0.5 line-clamp-1">{translation?.description || ad.description}</p>
                )}
                {(translation?.actionText || ad.actionText) && (
                    <span className="mt-2 inline-block px-4 py-1 bg-primary text-white text-xs font-semibold rounded-full">
                        {translation?.actionText || ad.actionText}
                    </span>
                )}
            </div>
        </div>
    );
};

// ─── Overlay ads (need dismissal state) ──────────────────────────────────────

const OverlayAdRenderer = ({ ad, translation, onClickWrap, isClosable }: { ad: AdContentDto; translation: any, onClickWrap: () => void, isClosable: boolean }) => {
    const [dismissed, setDismissed] = useState(false);
    if (dismissed) return null;

    const close = (e?: React.MouseEvent) => {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        setDismissed(true);
    };

    // Wrap the overlays with a click handler if targetUrl is present, while still allowing close to work independently
    const handleContainerClick = () => {
        onClickWrap();
        if (ad.targetUrl) {
            window.open(ad.targetUrl, ad.targetUrl.startsWith('http') ? '_blank' : '_self');
        }
    };

    const renderOverlay = () => {
        const template = ad.displayTemplate;
        if (template === 'popup_modal' || template === 'popup') return <PopupModalAd ad={ad} translation={translation} onClose={close} isClosable={isClosable} />;
        if (template === 'interstitial') return <InterstitialAd ad={ad} translation={translation} onClose={close} isClosable={isClosable} />;
        if (template === 'floating_button') return <FloatingButtonAd ad={ad} translation={translation} onClose={close} isClosable={isClosable} />;
        return null;
    };

    const content = renderOverlay();
    if (!content) return null;

    return (
        <div onClick={ad.targetUrl ? handleContainerClick : undefined} className={ad.targetUrl ? 'cursor-pointer' : ''}>
            {content}
        </div>
    );
};

// ─── HTML Ad ─────────────────────────────────────────────────────────────────

const HtmlAd = ({ html }: { html: string }) => (
    <div
        className="w-full h-full overflow-hidden"
        dangerouslySetInnerHTML={{ __html: html }}
    />
);

// ─── Main AdRenderer ─────────────────────────────────────────────────────────

const AdRenderer: React.FC<AdRendererProps> = ({ ad, isClosable }) => {
    const locale = useLocale();
    const translation =
        ad.translations?.find((t) => t.locale === locale || t.locale.startsWith(locale)) ||
        ad.translations?.[0];

    const handleClick = async () => {
        try {
            await trackClickAction(ad.id);
        } catch {
            // click tracking is non-critical, fail silently
        }
    };

    // ── HTML / rich_media type: render raw HTML inside iframe-like div
    const isHtmlOrRich = ad.adType?.toLowerCase() === 'html' || ad.adType?.toLowerCase() === 'rich_media' || ad.adType?.toLowerCase() === 'rich media';
    if (isHtmlOrRich) {
        const htmlContent = translation?.htmlContent || ad.htmlContent || ad.metadata?.html || '';
        const content = htmlContent ? <HtmlAd html={htmlContent} /> : null;
        if (!content) return null;
        if (ad.targetUrl) {
            const isExternal = ad.targetUrl.startsWith('http');
            if (isExternal) {
                return <a href={ad.targetUrl} onClick={handleClick} target="_blank" rel="noopener noreferrer" className="block w-full h-full">{content}</a>;
            }
            return (
                <Link href={ad.targetUrl as any} onClick={handleClick} className="block w-full h-full">
                    {content}
                </Link>
            );
        }
        return content;
    }

    // ── Overlay templates (portal-like, rendered as siblings outside grid) ────
    const isOverlayTemplate = ['popup_modal', 'popup', 'interstitial', 'floating_button'].includes(
        ad.displayTemplate,
    );

    // An ad is treated as an overlay ONLY if it has an overlay template AND is intended to be closable/transient.
    // If isClosable is explicitly false, it is a persistent section ad and MUST be rendered inline.
    const isOverlay = isOverlayTemplate && isClosable !== false;

    if (isOverlay) {
        // Overlay ads (Popups, Interstitials, Floating Buttons) should be closable 
        // regardless of section-level isClosable={false} setting, as per user requirement.
        // However, if we reached here, isClosable is either true or undefined.
        const effectiveIsClosable = isClosable === undefined ? true : isClosable;

        // Force closable for popups/interstitials if they are overlays
        const forceClosableAlways = ['popup_modal', 'popup', 'interstitial'].includes(ad.displayTemplate);
        const finalIsClosable = forceClosableAlways ? true : effectiveIsClosable;

        return <OverlayAdRenderer ad={ad} translation={translation} onClickWrap={handleClick} isClosable={finalIsClosable} />;
    }

    // ── Inline templates ─────────────────────────────────────────────────────
    const renderInlineContent = () => {
        switch (ad.displayTemplate as AdTemplate) {
            case 'image_only':
                return <ImageOnlyAd ad={ad} translation={translation} />;

            case 'standard_card':
                return <StandardCardAd ad={ad} translation={translation} />;

            case 'hero_banner':
                return <HeroBannerAd ad={ad} translation={translation} />;

            case 'native_list':
                return <NativeListAd ad={ad} translation={translation} />;

            case 'carousel':
                return <CarouselAd ad={ad} translation={translation} />;

            case 'sidebar_widget':
                return <SidebarWidgetAd ad={ad} translation={translation} />;

            case 'inline_content':
                return <InlineContentAd ad={ad} translation={translation} />;

            case 'video_player':
                return <VideoPlayerAd ad={ad} translation={translation} />;

            case 'sticky_banner':
                return <StickyBannerAd ad={ad} translation={translation} />;

            case 'popup_modal':
            case 'popup':
            case 'interstitial':
            case 'floating_button':
                // When forced to be inline, these resemble a standard card/banner
                return <StandardCardAd ad={ad} translation={translation} />;

            default:
                // Unknown template: show media if available, otherwise nothing
                return (
                    <div className="relative w-full h-full min-h-[250px] rounded-md overflow-hidden bg-gray-100">
                        <AdMedia
                            imageUrl={translation?.imageUrl}
                            videoUrl={translation?.videoUrl}
                            title={translation?.title}
                            adType={ad.adType}
                            ad={ad}
                        />
                    </div>
                );
        }
    };

    const content = renderInlineContent();
    if (!content) return null;

    // Wrap with click-tracking link if targetUrl exists
    if (!ad.targetUrl) return content;

    const isExternal = ad.targetUrl.startsWith('http');
    if (isExternal) {
        return (
            <a
                href={ad.targetUrl}
                onClick={handleClick}
                target="_blank"
                rel="noopener noreferrer"
                className="block w-full h-full"
            >
                {content}
            </a>
        );
    }

    return (
        <Link
            href={ad.targetUrl as any}
            onClick={handleClick}
            className="block w-full h-full"
        >
            {content}
        </Link>
    );
};

export default AdRenderer;
