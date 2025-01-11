'use client';

import { cn } from '@/lib/utils';
import { useTheme } from 'next-themes';
import Image from 'next/image';
import Box from './box/box';
import { useEffect, useState } from 'react';
import { Images } from '@/assets';

const Logo = (props: { size?: 'sm' | 'md' | 'lg'; className?: string }) => {
  const { size = 'md', className } = props;
  const { resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Prevent hydration mismatch by only rendering after mount
  useEffect(() => {
    setMounted(true);
  }, []);

  const sizeClasses =
    size === 'sm' ? 'w-15 h-7' : size === 'md' ? 'w-20 h-12' : 'w-25 h-20';

  if (!mounted) {
    return (
      <Box variant="center" className={cn(sizeClasses, className)}>
        <Image
          src={Images.lightLogo}
          alt={'website logo alt'}
          width={80}
          height={80}
          className={'w-full h-full object-contain'}
          priority
        />
      </Box>
    );
  }

  const imageSrc =
    resolvedTheme === 'dark' ? Images.darkLogo : Images.lightLogo;

  return (
    <Box variant="center" className={cn(sizeClasses, className)}>
      <Image
        src={imageSrc}
        alt={'website logo alt'}
        width={80}
        height={80}
        className={'w-full h-full object-contain'}
        priority
      />
    </Box>
  );
};

export default Logo;
