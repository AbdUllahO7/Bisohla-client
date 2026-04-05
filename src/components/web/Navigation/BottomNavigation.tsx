'use client';

import React from 'react';
import { Home, Search, PlusCircle, User } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { Link, usePathname } from '@/i18n/routing';
import { motion } from 'framer-motion';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const BottomNavigation = () => {
  const t = useTranslations('homePage.bottomNav');
  const pathname = usePathname();

  const navItems = [
    {
      label: t('home'),
      href: '/',
      icon: Home,
    },
    {
      label: t('explore'),
      href: '/products',
      icon: Search,
    },
    {
      label: t('sell'),
      href: '/products/AddProducts',
      icon: PlusCircle,
    },
    {
      label: t('profile'),
      href: '/userProfile',
      icon: User,
    },
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-[100] bg-white/80 backdrop-blur-lg border-t border-gray-200 pb-safe shadow-[0_-4px_12px_rgba(0,0,0,0.05)]">
      <div className="flex justify-around items-center h-16 max-w-md mx-auto">
        {navItems.map((item) => {
          const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
          const Icon = item.icon;

          return (
            <Link
              key={item.href}
              href={item.href}
              className="flex flex-col items-center justify-center w-full h-full relative"
            >
              <motion.div
                initial={false}
                animate={{
                  scale: isActive ? 1.1 : 1,
                  color: isActive ? '#10b981' : '#6b7280', // emerald-500 or gray-500
                }}
                className={cn(
                  'flex flex-col items-center justify-center transition-colors duration-200',
                  isActive ? 'text-primary-light' : 'text-gray-500'
                )}
              >
                <Icon size={24} className={cn('mb-1', isActive && 'stroke-[2.5px]')} />
                <span className="text-[10px] font-medium tracking-tight">
                  {item.label}
                </span>
                
                {isActive && (
                  <motion.div
                    layoutId="active-indicator"
                    className="absolute -top-1 w-12 h-1 bg-primary-light rounded-full"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </motion.div>
            </Link>
          );
        })}
      </div>
    </div>
  );
};

export default BottomNavigation;
