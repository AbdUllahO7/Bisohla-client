'use client';

import React from 'react';
import { useLocale } from 'next-intl';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItemData {
  label: string;
  href?: string;
  isActive?: boolean;
  arLabel?: string; // Optional Arabic label
}

interface SmartBreadcrumbProps {
  items: BreadcrumbItemData[];
  showHome?: boolean;
  homeLabel?: { en: string; ar: string };
  homeHref?: string;
  className?: string;
  separator?: 'chevron' | 'slash' | 'default';
  variant?: 'default' | 'minimal' | 'modern';
}

const SmartBreadcrumb: React.FC<SmartBreadcrumbProps> = ({
  items,
  showHome = true,
  homeLabel = { en: 'Home', ar: 'الرئيسية' },
  homeHref = '/',
  className = '',
  separator = 'default',
  variant = 'default',
}) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Combine home item with provided items
  const allItems: BreadcrumbItemData[] = showHome
    ? [
        {
          label: homeLabel[locale as 'en' | 'ar'],
          href: homeHref,
          isActive: false,
        },
        ...items,
      ]
    : items;

  // Custom separator component
  const CustomSeparator = () => {
    if (separator === 'chevron') {
      return (
        <ChevronRight
          className={`h-4 w-4 text-gray-400 ${isRTL ? 'rotate-180' : ''}`}
        />
      );
    }
    if (separator === 'slash') {
      return <span className="text-gray-400 mx-2">/</span>;
    }
    return <BreadcrumbSeparator />;
  };

  // Get variant styles
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent',
          link: 'text-gray-600 hover:text-gray-900 text-sm',
          active: 'text-gray-900 font-medium',
        };
      case 'modern':
        return {
          container: 'bg-gray-50 rounded-lg px-4 py-2',
          link: 'text-gray-700 hover:text-primary-light text-sm font-medium',
          active: 'text-primary font-semibold',
        };
      default:
        return {
          container: 'bg-background',
          link: 'hover:text-black text-black',
          active: 'text-primary hover:text-primary-light',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`w-full ${styles.container} ${className}`}>
      <Breadcrumb dir={isRTL ? 'rtl' : 'ltr'}>
        <BreadcrumbList dir={isRTL ? 'rtl' : 'ltr'}>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const displayLabel =
              item.arLabel && isRTL ? item.arLabel : item.label;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem dir={isRTL ? 'rtl' : 'ltr'}>
                  {item.href && !isLast ? (
                    <BreadcrumbLink
                      className={`${styles.link} transition-colors duration-200`}
                      href={item.href}
                    >
                      {index === 0 && showHome && variant === 'modern' ? (
                        <span className="flex items-center gap-1">
                          <Home className="h-4 w-4" />
                          {displayLabel}
                        </span>
                      ) : (
                        displayLabel
                      )}
                    </BreadcrumbLink>
                  ) : (
                    <span
                      className={`${styles.active} ${
                        isLast ? 'cursor-default' : 'cursor-pointer'
                      }`}
                    >
                      {displayLabel}
                    </span>
                  )}
                </BreadcrumbItem>

                {!isLast && (
                  <li className="flex items-center">
                    <CustomSeparator />
                  </li>
                )}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default SmartBreadcrumb;
