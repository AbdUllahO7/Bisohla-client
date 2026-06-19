'use client';

import React, { useState, useEffect } from 'react';
import { Bell, X, CheckCircle, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { SelectCarListingDto } from '@/core/entities/models/cars/cars.dto';
import { createCarAlert } from '@/core/infrastructure-adapters/actions/users/car-alert.user.actions';
import { useToast } from '@/hooks/use-toast';

interface SimilarCarAlertBannerProps {
    car: SelectCarListingDto | null | undefined;
    isAuthenticated: boolean;
    locale: string;
}

const DISMISSED_KEY_PREFIX = 'bishola:similar_alert_dismissed:';

const SimilarCarAlertBanner: React.FC<SimilarCarAlertBannerProps> = ({
    car,
    isAuthenticated,
    locale,
}) => {
    const isArabic = locale === 'ar';
    const { toast } = useToast();
    const [visible, setVisible] = useState(false);
    const [dismissed, setDismissed] = useState(false);
    const [activated, setActivated] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Determine dismissed/activated state from localStorage
    useEffect(() => {
        if (!car?.id || !isAuthenticated) return;

        const dismissedKey = `${DISMISSED_KEY_PREFIX}${car.id}`;
        const activatedKey = `${DISMISSED_KEY_PREFIX}${car.id}:activated`;

        const isDismissed = localStorage.getItem(dismissedKey) === '1';
        const isAlreadyActivated = localStorage.getItem(activatedKey) === '1';

        if (isDismissed || isAlreadyActivated) return;

        // Show banner after 3 seconds
        const timer = setTimeout(() => {
            setVisible(true);
        }, 3000);

        return () => clearTimeout(timer);
    }, [car?.id, isAuthenticated]);

    // Don't render if not authenticated, no car, or already handled
    if (!isAuthenticated || !car || dismissed || activated) return null;
    if (!visible) return null;

    const handleDismiss = () => {
        if (car?.id) {
            localStorage.setItem(`${DISMISSED_KEY_PREFIX}${car.id}`, '1');
        }
        setDismissed(true);
    };

    const handleActivate = async () => {
        if (!car) return;
        setIsSubmitting(true);

        try {
            const attributeFilters: Record<string, any> = {};
            
            // Only add filters that have valid values (not null, undefined, or 0)
            if (car.makeId && car.makeId !== 0) attributeFilters.make = car.makeId;
            if (car.modelId && car.modelId !== 0) attributeFilters.model = car.modelId;
            if (car.trimId && car.trimId !== 0) attributeFilters.trim = car.trimId;

            const res = await createCarAlert({
                listingTypeId: car.listingTypeId || 1,
                minPrice: null,
                maxPrice: null,
                governorate: null,
                city: null,
                attributeFilters
            });

            if (res.success) {
                // Remember activation to never show again for this car
                if (car.id) {
                    localStorage.setItem(`${DISMISSED_KEY_PREFIX}${car.id}:activated`, '1');
                }
                setActivated(true);
                toast({
                    title: isArabic ? '✅ تم تفعيل التنبيه' : '✅ Alert Activated',
                    description: isArabic
                        ? 'سيصلك تنبيه عند توفّر منتجات مشابهة'
                        : 'You will be notified when similar products are listed',
                });
            } else {
                toast({
                    title: isArabic ? 'حدث خطأ' : 'Error',
                    description: res.message || (isArabic ? 'لم يتم تفعيل التنبيه' : 'Failed to activate alert'),
                    variant: 'destructive',
                });
            }
        } catch {
            toast({
                title: isArabic ? 'حدث خطأ غير متوقع' : 'Unexpected error',
                variant: 'destructive',
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div
            className={`
                fixed bottom-14 left-1/2 -translate-x-1/2 z-50 w-full max-w-xl px-4
                transition-all duration-500
                ${visible ? 'translate-y-0 opacity-100' : 'translate-y-full opacity-0'}
            `}
            dir={isArabic ? 'rtl' : 'ltr'}
        >
            <div className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-2xl border border-[#198341]/15 dark:border-zinc-800 overflow-hidden">
                {/* Gradient top accent */}
                <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#198341] via-[#22a352] to-[#ABDE3B]" />

                <div className="p-5">
                    <div className="flex items-start gap-4">
                        {/* Bell icon */}
                        <div className="flex-shrink-0 w-12 h-12 rounded-xl bg-gradient-to-br from-[#198341]/10 to-[#ABDE3B]/10 dark:from-[#ABDE3B]/10 dark:to-[#ABDE3B]/5 flex items-center justify-center border border-[#198341]/10 dark:border-[#ABDE3B]/20">
                            <Bell className="w-6 h-6 text-[#198341] dark:text-[#ABDE3B]" />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0">
                            <p className="font-bold text-[#2C3C39] dark:text-white text-base">
                                {isArabic
                                    ? 'هل تريد تنبيهات بمنتجات مشابهة؟'
                                    : 'Get alerts for similar products?'}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-zinc-400 mt-0.5 leading-relaxed">
                                {isArabic
                                    ? 'إذا أردت أن يصلك تنبيه بالمنتجات المشابهة، قم بتفعيل التنبيه.'
                                    : 'Activate to get notified when similar products matching this listing are available.'}
                            </p>

                            {/* Action buttons */}
                            <div className={`flex gap-2 mt-3 ${isArabic ? 'flex-row-reverse' : ''}`}>
                                <Button
                                    size="sm"
                                    onClick={handleActivate}
                                    disabled={isSubmitting}
                                    className="h-9 px-4 text-sm font-bold rounded-xl bg-gradient-to-r from-[#198341] to-[#22a352] hover:opacity-90 text-white shadow-sm hover:shadow-md transition-all"
                                >
                                    {isSubmitting ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-4 h-4 mr-1.5" />
                                            {isArabic ? 'تفعيل التنبيه' : 'Activate Alert'}
                                        </>
                                    )}
                                </Button>
                                <Button
                                    size="sm"
                                    variant="ghost"
                                    onClick={handleDismiss}
                                    className="h-9 px-3 text-sm text-gray-400 dark:text-zinc-500 hover:text-gray-600 dark:hover:text-zinc-300 rounded-xl"
                                >
                                    {isArabic ? 'لا شكراً' : 'No thanks'}
                                </Button>
                            </div>
                        </div>

                        {/* Close button */}
                        <button
                            onClick={handleDismiss}
                            className="flex-shrink-0 p-1 text-gray-300 dark:text-zinc-600 hover:text-gray-500 dark:hover:text-zinc-400 rounded-lg transition-colors"
                        >
                            <X className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SimilarCarAlertBanner;
