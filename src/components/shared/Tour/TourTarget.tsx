'use client';

import React, { useEffect, useRef } from 'react';
import { useTour } from '@/context/tour-context';

interface TourTargetProps {
  tourKey: string;
  children: React.ReactNode;
  className?: string;
}

export function TourTarget({ tourKey, children, className = '' }: TourTargetProps) {
  const elRef = useRef<HTMLDivElement>(null);
  const { registerTarget, unregisterTarget } = useTour();

  useEffect(() => {
    if (elRef.current) {
      registerTarget(tourKey, elRef.current);
    }
    return () => {
      unregisterTarget(tourKey);
    };
  }, [tourKey, registerTarget, unregisterTarget]);

  return (
    <div ref={elRef} data-tour-key={tourKey} className={`inline-block ${className}`}>
      {children}
    </div>
  );
}
