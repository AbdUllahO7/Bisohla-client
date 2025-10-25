'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Box from './box/box';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSettings } from '@/providers/settings.provider';

const Logo = ({
  className,
  width,
  height,
}: {
  className?: string;
  width?: number;
  height?: number;
}) => {
  const router = useRouter();

  const { getLogo, isLoading } = useSettings();

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="h-5 w-24 bg-gray-200 rounded animate-pulse sm:h-6 sm:w-28"></div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex cursor-pointer items-center', className)}
      onClick={() => router.push('/')}
    >
      <Image
        src={getLogo()}
        alt="Logo"
        width={width || 100}
        height={height || 24}
        priority
        onError={(e) => {
          console.error('Failed to load logo image');
          e.currentTarget.style.display = 'none';
        }}
      />
    </div>
  );
};

export default Logo;
