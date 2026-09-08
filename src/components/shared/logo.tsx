'use client';
import { cn } from '@/lib/utils';
import Image from 'next/image';
import { useEffect, useState } from 'react';
import { useRouter } from '@/i18n/routing';
import { useSettings } from '@/providers/settings.provider';

const FALLBACK_LOGO = '/assets/images/logo/bishola.png';

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
  const logoUrl = getLogo();
  const [imgSrc, setImgSrc] = useState<string>(logoUrl || FALLBACK_LOGO);

  useEffect(() => {
    if (logoUrl) {
      setImgSrc(logoUrl);
    }
  }, [logoUrl]);

  if (isLoading) {
    return (
      <div className="flex items-center">
        <div className="h-6 w-28 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div
      className={cn('flex cursor-pointer items-center', className)}
      onClick={() => router.push('/')}
    >
      <Image
        src={imgSrc || FALLBACK_LOGO}
        alt="Bishola Logo"
        width={width || 120}
        height={height || 30}
        priority
        className=" object-contain"
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
