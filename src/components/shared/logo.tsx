'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSettings } from '@/providers/settings.provider';

const FALLBACK_LOGO = '/assets/images/logo/bishola.png';

const getOptimizedLogoSrc = (url: string | undefined | null) => {
  if (!url) return FALLBACK_LOGO;
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return `/api/logo?url=${encodeURIComponent(url)}`;
  }
  return url;
};

const Logo = ({
  className,
  imageClassName,
  width,
  height,
}: {
  className?: string;
  imageClassName?: string;
  width?: number;
  height?: number;
}) => {
  const router = useRouter();
  const { getLogo, isLoading } = useSettings();
  const logoUrl = getLogo();
  const [imgSrc, setImgSrc] = useState<string>(() => getOptimizedLogoSrc(logoUrl));

  useEffect(() => {
    if (logoUrl) {
      setImgSrc(getOptimizedLogoSrc(logoUrl));
    }
  }, [logoUrl]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center flex-shrink-0', className)}>
        <div className="h-6 sm:h-7 md:h-8 w-20 sm:w-24 md:w-28 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const isCustomSize = width !== undefined || height !== undefined;
  const defaultWidth = width || 135;
  const defaultHeight = height || 32;

  return (
    <div
      className={cn('flex cursor-pointer items-center flex-shrink-0', className)}
      onClick={() => router.push('/')}
    >
      <Image
        src={imgSrc || FALLBACK_LOGO}
        alt="Bishola Logo"
        width={defaultWidth}
        height={defaultHeight}
        priority
        className={cn(
          'object-contain transition-all duration-200',
          !isCustomSize && 'h-6 sm:h-7 md:h-8 w-auto max-w-[85px] sm:max-w-[105px] md:max-w-[130px]',
          imageClassName
        )}
        onError={() => {
          if (imgSrc.startsWith('/api/logo') && logoUrl) {
            setImgSrc(logoUrl);
          } else if (imgSrc !== FALLBACK_LOGO) {
            setImgSrc(FALLBACK_LOGO);
          }
        }}
      />
    </div>
  );
};

export default Logo;
