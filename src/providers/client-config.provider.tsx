// src/providers/zod-config.provider.tsx
'use client';

import { initConfigs } from '@/config';
import { PropsWithChildren, useEffect } from 'react';

// this component is used to initialize configs for client side
export default function ClientConfigProvider({ children }: PropsWithChildren) {
  useEffect(() => {
    initConfigs();
  }, []);

  return <>{children}</>;
}
