'use client';

import React, { useState } from 'react';
import { Star, X, Check, Heart, ExternalLink } from 'lucide-react';
import { useTranslations, useLocale } from 'next-intl';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';

interface RateAppModalProps {
  open: boolean;
  onClose: () => void;
  onRate: (rating: number) => void;
  appStoreUrl?: string;
  playStoreUrl?: string;
}

export function RateAppModal({
  open,
  onClose,
  onRate,
  appStoreUrl = 'https://apps.apple.com',
  playStoreUrl = 'https://play.google.com/store',
}: RateAppModalProps) {
  const t = useTranslations('ratings.modal');
  const locale = useLocale();
  const [hoveredStar, setHoveredStar] = useState<number | null>(null);
  const [selectedRating, setSelectedRating] = useState<number>(5);
  const [submitted, setSubmitted] = useState(false);

  const handleStarClick = (rating: number) => {
    setSelectedRating(rating);
  };

  const handleSubmit = () => {
    onRate(selectedRating);
    setSubmitted(true);
    setTimeout(() => {
      setSubmitted(false);
      onClose();
    }, 1500);
  };

  const handleStoreRedirect = (url: string) => {
    onRate(5);
    window.open(url, '_blank', 'noopener,noreferrer');
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={(val) => !val && onClose()}>
      <DialogContent className="sm:max-w-md bg-white dark:bg-zinc-900 border-gray-100 dark:border-zinc-800 rounded-3xl p-6 sm:p-8 shadow-2xl overflow-hidden">
        {/* Decorative background glow */}
        <div className="absolute -top-16 -right-16 w-36 h-36 bg-[#198341]/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -bottom-16 -left-16 w-36 h-36 bg-[#ABDE3B]/15 rounded-full blur-2xl pointer-events-none" />

        {submitted ? (
          <div className="py-8 flex flex-col items-center justify-center text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-emerald-50 dark:bg-emerald-950/40 text-[#198341] flex items-center justify-center shadow-lg shadow-emerald-500/10 animate-bounce">
              <Check size={32} />
            </div>
            <h3 className="text-xl font-bold text-[#2C3C39] dark:text-zinc-100">
              {locale === 'ar' ? 'شكراً لتقييمك!' : 'Thank you for rating!'}
            </h3>
            <p className="text-sm text-gray-400">
              {locale === 'ar'
                ? 'رأيك يساعدنا في تحسين تجربتك دائماً.'
                : 'Your feedback helps us continuously improve Bishola.'}
            </p>
          </div>
        ) : (
          <div className="space-y-6">
            {/* Header Icon */}
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-400 to-amber-500 text-white flex items-center justify-center shadow-lg shadow-amber-500/25">
                <Star size={32} className="fill-white" />
              </div>

              <DialogTitle className="text-2xl font-extrabold text-[#2C3C39] dark:text-zinc-100">
                {t('title')}
              </DialogTitle>

              <DialogDescription className="text-sm text-gray-500 dark:text-gray-400 max-w-xs leading-relaxed">
                {t('message')}
              </DialogDescription>
            </div>

            {/* 5-Star Interactive Rating */}
            <div className="flex items-center justify-center gap-2 py-2">
              {[1, 2, 3, 4, 5].map((star) => {
                const isFilled =
                  hoveredStar !== null
                    ? star <= hoveredStar
                    : star <= selectedRating;

                return (
                  <button
                    key={star}
                    type="button"
                    onClick={() => handleStarClick(star)}
                    onMouseEnter={() => setHoveredStar(star)}
                    onMouseLeave={() => setHoveredStar(null)}
                    className="p-1 text-amber-400 hover:scale-125 transition-transform duration-150 focus:outline-none"
                    title={`${star} star`}
                  >
                    <Star
                      size={32}
                      className={
                        isFilled
                          ? 'fill-amber-400 text-amber-400'
                          : 'text-gray-200 dark:text-zinc-700 fill-none'
                      }
                    />
                  </button>
                );
              })}
            </div>

            {/* Quick App Store Link Options */}
            <div className="flex items-center justify-center gap-2 text-xs">
              {playStoreUrl && (
                <button
                  type="button"
                  onClick={() => handleStoreRedirect(playStoreUrl)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#198341] transition-colors"
                >
                  <span>Google Play</span>
                  <ExternalLink size={12} />
                </button>
              )}
              {appStoreUrl && (
                <button
                  type="button"
                  onClick={() => handleStoreRedirect(appStoreUrl)}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-gray-50 dark:bg-zinc-800 text-gray-600 dark:text-zinc-300 hover:text-[#198341] transition-colors"
                >
                  <span>App Store</span>
                  <ExternalLink size={12} />
                </button>
              )}
            </div>

            {/* Action Buttons */}
            <div className="space-y-2 pt-2">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full py-3 px-4 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white font-bold text-sm shadow-md shadow-[#198341]/20 hover:shadow-lg transition-all"
              >
                {t('rate_cta')}
              </button>

              <button
                type="button"
                onClick={onClose}
                className="w-full py-2.5 px-4 rounded-xl text-gray-400 hover:text-gray-600 dark:hover:text-zinc-200 text-xs font-semibold transition-colors"
              >
                {t('later_cta')}
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
