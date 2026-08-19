'use client';

import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useRef,
  useEffect,
} from 'react';
import { TOURS, TourDefinition, TourStep } from '@/constants/tours';
import { hasSeenTour, markTourSeen, resetTour } from '@/utils/tour-storage';

interface TourContextType {
  activeTour: TourDefinition | null;
  currentStepIndex: number;
  currentStep: TourStep | null;
  isRunning: boolean;
  totalSteps: number;
  targetRect: DOMRect | null;
  startTour: (tourId: string, force?: boolean) => void;
  nextStep: () => void;
  prevStep: () => void;
  skipTour: () => void;
  registerTarget: (key: string, el: HTMLElement | null) => void;
  unregisterTarget: (key: string) => void;
}

const TourContext = createContext<TourContextType | undefined>(undefined);

export function TourProvider({ children }: { children: React.ReactNode }) {
  const [activeTour, setActiveTour] = useState<TourDefinition | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [targetRect, setTargetRect] = useState<DOMRect | null>(null);

  const targetsRef = useRef<Map<string, HTMLElement>>(new Map());

  const registerTarget = useCallback((key: string, el: HTMLElement | null) => {
    if (el) {
      targetsRef.current.set(key, el);
    } else {
      targetsRef.current.delete(key);
    }
  }, []);

  const unregisterTarget = useCallback((key: string) => {
    targetsRef.current.delete(key);
  }, []);

  const updateTargetRect = useCallback((key: string) => {
    const el = targetsRef.current.get(key);
    if (el) {
      // Scroll into view smoothly if needed
      el.scrollIntoView({ behavior: 'smooth', block: 'center' });

      // Slight delay to ensure scroll settles before capturing rect
      setTimeout(() => {
        const rect = el.getBoundingClientRect();
        setTargetRect(rect);
      }, 300);
    } else {
      setTargetRect(null);
    }
  }, []);

  const startTour = useCallback((tourId: string, force: boolean = false) => {
    const tour = TOURS[tourId];
    if (!tour) return;

    if (!force && hasSeenTour(tour.id, tour.version)) {
      return;
    }

    setActiveTour(tour);
    setCurrentStepIndex(0);

    const firstStep = tour.steps[0];
    if (firstStep) {
      setTimeout(() => {
        updateTargetRect(firstStep.targetKey);
      }, 400);
    }
  }, [updateTargetRect]);

  const nextStep = useCallback(() => {
    if (!activeTour) return;

    if (currentStepIndex < activeTour.steps.length - 1) {
      const nextIndex = currentStepIndex + 1;
      setCurrentStepIndex(nextIndex);
      const step = activeTour.steps[nextIndex];
      if (step) {
        updateTargetRect(step.targetKey);
      }
    } else {
      // Finished Tour
      markTourSeen(activeTour.id, activeTour.version);
      setActiveTour(null);
      setTargetRect(null);
    }
  }, [activeTour, currentStepIndex, updateTargetRect]);

  const prevStep = useCallback(() => {
    if (!activeTour) return;

    if (currentStepIndex > 0) {
      const prevIndex = currentStepIndex - 1;
      setCurrentStepIndex(prevIndex);
      const step = activeTour.steps[prevIndex];
      if (step) {
        updateTargetRect(step.targetKey);
      }
    }
  }, [activeTour, currentStepIndex, updateTargetRect]);

  const skipTour = useCallback(() => {
    if (activeTour) {
      markTourSeen(activeTour.id, activeTour.version);
    }
    setActiveTour(null);
    setTargetRect(null);
  }, [activeTour]);

  // Window resize handler to reposition spotlight
  useEffect(() => {
    if (!activeTour) return;

    const handleResize = () => {
      const step = activeTour.steps[currentStepIndex];
      if (step) {
        updateTargetRect(step.targetKey);
      }
    };

    window.addEventListener('resize', handleResize);
    window.addEventListener('scroll', handleResize, true);
    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('scroll', handleResize, true);
    };
  }, [activeTour, currentStepIndex, updateTargetRect]);

  const currentStep = activeTour ? activeTour.steps[currentStepIndex] || null : null;
  const isRunning = !!activeTour && !!currentStep;
  const totalSteps = activeTour ? activeTour.steps.length : 0;

  return (
    <TourContext.Provider
      value={{
        activeTour,
        currentStepIndex,
        currentStep,
        isRunning,
        totalSteps,
        targetRect,
        startTour,
        nextStep,
        prevStep,
        skipTour,
        registerTarget,
        unregisterTarget,
      }}
    >
      {children}
    </TourContext.Provider>
  );
}

export function useTour() {
  const context = useContext(TourContext);
  if (!context) {
    throw new Error('useTour must be used within a TourProvider');
  }
  return context;
}
