'use client';

import React, { useMemo } from 'react';
import { useTour } from '@/context/tour-context';
import { useLocale } from 'next-intl';
import { Sparkles, ChevronLeft, ChevronRight, X, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function TourOverlay() {
  const {
    isRunning,
    currentStep,
    currentStepIndex,
    totalSteps,
    targetRect,
    nextStep,
    prevStep,
    skipTour,
  } = useTour();

  const locale = useLocale();
  const isArabic = locale === 'ar';

  // Calculate tooltip placement
  const tooltipStyle = useMemo(() => {
    if (!targetRect || typeof window === 'undefined') {
      return {
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
      };
    }

    const PADDING = 16;
    const CARD_WIDTH = Math.min(380, window.innerWidth - 32);
    const CARD_ESTIMATED_HEIGHT = 220;

    // Check if there is enough space below the target
    const spaceBelow = window.innerHeight - targetRect.bottom;
    const placeBelow = spaceBelow >= CARD_ESTIMATED_HEIGHT || targetRect.top < CARD_ESTIMATED_HEIGHT;

    let top = placeBelow
      ? targetRect.bottom + PADDING
      : Math.max(PADDING, targetRect.top - CARD_ESTIMATED_HEIGHT - PADDING);

    // Calculate left alignment (centered on target, clamped to screen)
    let left = targetRect.left + targetRect.width / 2 - CARD_WIDTH / 2;
    left = Math.max(PADDING, Math.min(left, window.innerWidth - CARD_WIDTH - PADDING));

    return {
      top: `${top}px`,
      left: `${left}px`,
      width: `${CARD_WIDTH}px`,
    };
  }, [targetRect]);

  if (!isRunning || !currentStep) return null;

  const isLastStep = currentStepIndex === totalSteps - 1;
  const isFirstStep = currentStepIndex === 0;

  const title = isArabic ? currentStep.titleAr : currentStep.titleEn;
  const description = isArabic ? currentStep.descAr : currentStep.descEn;

  return (
    <div className="fixed inset-0 z-[9999] pointer-events-auto select-none">
      {/* Dark Scrim with Cutout Spotlight */}
      <svg className="absolute inset-0 w-full h-full pointer-events-auto">
        <defs>
          <mask id="tour-spotlight-mask">
            {/* White background: dark overlay is visible everywhere */}
            <rect x="0" y="0" width="100%" height="100%" fill="white" />
            {/* Black cutout: reveals the underlying target element */}
            {targetRect && (
              <rect
                x={targetRect.left - 8}
                y={targetRect.top - 8}
                width={targetRect.width + 16}
                height={targetRect.height + 16}
                rx="16"
                ry="16"
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          x="0"
          y="0"
          width="100%"
          height="100%"
          fill="rgba(0, 0, 0, 0.7)"
          mask="url(#tour-spotlight-mask)"
        />
      </svg>

      {/* Target Highlight Border Ring */}
      {targetRect && (
        <div
          className="absolute pointer-events-none rounded-2xl ring-4 ring-[#198341] ring-offset-2 ring-offset-transparent animate-pulse transition-all duration-300"
          style={{
            left: `${targetRect.left - 8}px`,
            top: `${targetRect.top - 8}px`,
            width: `${targetRect.width + 16}px`,
            height: `${targetRect.height + 16}px`,
          }}
        />
      )}

      {/* Floating Tooltip Card */}
      <div
        className="fixed z-[10000] bg-white dark:bg-zinc-900 border border-gray-100 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-2xl transition-all duration-300 animate-in fade-in zoom-in-95"
        style={tooltipStyle}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white flex items-center justify-center shadow-md">
              <Sparkles size={16} />
            </div>
            <span className="text-[11px] font-bold text-gray-400 dark:text-zinc-500 uppercase tracking-wider">
              {isArabic
                ? `الخطوة ${currentStepIndex + 1} من ${totalSteps}`
                : `Step ${currentStepIndex + 1} of ${totalSteps}`}
            </span>
          </div>

          <button
            type="button"
            onClick={skipTour}
            className="p-1 rounded-full text-gray-400 hover:text-gray-600 dark:hover:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
            title={isArabic ? 'تخطي الجولة' : 'Skip Tour'}
          >
            <X size={16} />
          </button>
        </div>

        {/* Content */}
        <div className="space-y-1.5 mb-5">
          <h3 className="text-base font-extrabold text-[#2C3C39] dark:text-zinc-100">{title}</h3>
          <p className="text-xs text-gray-600 dark:text-zinc-400 leading-relaxed">{description}</p>
        </div>

        {/* Progress Dots & Navigation Footer */}
        <div className="flex items-center justify-between pt-3 border-t border-gray-100 dark:border-zinc-800">
          {/* Step Dots */}
          <div className="flex items-center gap-1.5">
            {Array.from({ length: totalSteps }).map((_, idx) => (
              <div
                key={idx}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  idx === currentStepIndex
                    ? 'w-6 bg-[#198341]'
                    : 'w-1.5 bg-gray-200 dark:bg-zinc-700'
                }`}
              />
            ))}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {!isFirstStep && (
              <Button
                type="button"
                variant="ghost"
                onClick={prevStep}
                className="h-8 px-2.5 rounded-xl text-xs font-semibold text-gray-500 hover:text-gray-900"
              >
                {isArabic ? 'السابق' : 'Back'}
              </Button>
            )}

            <Button
              type="button"
              onClick={nextStep}
              className="h-8 px-4 rounded-xl bg-gradient-to-r from-[#198341] to-[#ABDE3B] text-white text-xs font-bold shadow-md hover:shadow-lg transition-all"
            >
              {isLastStep ? (
                <div className="flex items-center gap-1.5">
                  <Check size={14} />
                  <span>{isArabic ? 'إنهاء' : 'Got it!'}</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <span>{isArabic ? 'التالي' : 'Next'}</span>
                  {isArabic ? <ChevronLeft size={14} /> : <ChevronRight size={14} />}
                </div>
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
