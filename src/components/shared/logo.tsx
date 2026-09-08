'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSettings } from '@/providers/settings.provider';

const FALLBACK_LOGO = '/assets/images/logo/bishola.png';

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
  const [imgSrc, setImgSrc] = useState<string>(logoUrl || FALLBACK_LOGO);

  useEffect(() => {
    if (logoUrl) {
      setImgSrc(logoUrl);
    }
  }, [logoUrl]);

  if (isLoading) {
    return (
      <div className={cn('flex items-center', className)}>
        <div className="h-9 sm:h-10 md:h-11 w-32 sm:w-40 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
    );
  }

  const isCustomSize = width !== undefined || height !== undefined;
  const defaultWidth = width || 270;
  const defaultHeight = height || 82;

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
          'object-contain transition-all',
          !isCustomSize && 'h-9 sm:h-10 md:h-11 w-auto max-w-[200px]',
          imageClassName
        )}
        onError={() => {
          if (imgSrc !== FALLBACK_LOGO) {
            setImgSrc(FALLBACK_LOGO);
          }
        }}
      />
    </div>
  );
};

export default Logo;
