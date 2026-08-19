'use client';

import { useState, useCallback, useEffect } from 'react';
import {
  getRatingState,
  recordAppOpen,
  recordDismissed,
  recordPromptShown,
  recordRated,
  isEligible,
  RatePromptAction,
  RatingPromptSettings,
} from '@/utils/rating-storage';

interface UseRateAppOptions {
  settings?: RatingPromptSettings;
}

export function useRateApp(options?: UseRateAppOptions) {
  const [isOpen, setIsOpen] = useState(false);
  const [trigger, setTrigger] = useState<RatePromptAction>('manual');

  // Track app open once on mount
  useEffect(() => {
    recordAppOpen();
  }, []);

  const openRateModal = useCallback(
    (actionTrigger: RatePromptAction = 'manual') => {
      if (isEligible(actionTrigger, options?.settings)) {
        recordPromptShown();
        setTrigger(actionTrigger);
        setIsOpen(true);
      }
    },
    [options?.settings],
  );

  const closeRateModal = useCallback(() => {
    setIsOpen(false);
  }, []);

  const handleRate = useCallback((ratingValue?: number) => {
    recordRated(ratingValue);
    setIsOpen(false);
  }, []);

  const handleLater = useCallback(() => {
    recordDismissed();
    setIsOpen(false);
  }, []);

  return {
    isOpen,
    trigger,
    openRateModal,
    closeRateModal,
    handleRate,
    handleLater,
    ratingState: getRatingState(),
  };
}
