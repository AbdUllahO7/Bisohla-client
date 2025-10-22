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

  // Custom separator component with enhanced styling
  const CustomSeparator = () => {
    if (separator === 'chevron') {
      return (
        <BreadcrumbSeparator>
          <div className="relative group/sep">
            {/* Glow effect on hover */}
            <div className="absolute inset-0 bg-[#ABDE3B] blur-md opacity-0 group-hover/sep:opacity-30 transition-opacity duration-300"></div>
            
            <ChevronRight
              className={`relative h-4 w-4 text-gray-400 group-hover/sep:text-[#198341] transition-colors duration-300 ${isRTL ? 'rotate-180' : ''}`}
            />
          </div>
        </BreadcrumbSeparator>
      );
    }
    if (separator === 'slash') {
      return (
        <BreadcrumbSeparator>
          <span className="text-gray-400 mx-2 group-hover:text-[#198341] transition-colors duration-300">/</span>
        </BreadcrumbSeparator>
      );
    }
    return (
      <BreadcrumbSeparator>
        <div className="relative group/sep">
          <div className="absolute inset-0 bg-[#ABDE3B] blur-md opacity-0 group-hover/sep:opacity-30 transition-opacity duration-300"></div>
          <span className="relative text-gray-400 group-hover/sep:text-[#198341] transition-colors duration-300">/</span>
        </div>
      </BreadcrumbSeparator>
    );
  };

  // Get variant styles with enhanced colors
  const getVariantStyles = () => {
    switch (variant) {
      case 'minimal':
        return {
          container: 'bg-transparent',
          link: 'text-gray-600 hover:text-[#198341] text-sm',
          active: 'text-[#2C3C39] font-medium',
        };
      case 'modern':
        return {
          container: 'bg-gradient-to-r from-white via-[#ABDE3B]/5 to-white rounded-lg px-4 py-2 border border-slate-200',
          link: 'text-gray-700 hover:text-[#198341] text-sm font-medium',
          active: 'text-[#198341] font-semibold',
        };
      default:
        return {
          container: '',
          link: 'hover:text-[#198341] text-[#2C3C39]',
          active: 'text-[#198341] hover:text-[#2C3C39]',
        };
    }
  };

  const styles = getVariantStyles();

  return (
    <div className={`w-full ${styles.container} ${className} relative overflow-hidden`}>
      {/* Decorative elements for modern variant */}
      {variant === 'modern' && (
        <>
          {/* Top gradient accent */}
          <div className="absolute top-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341]"></div>
          
          {/* Corner accents */}
          <div className="absolute top-0 left-0 w-16 h-16 bg-gradient-to-br from-[#198341]/10 to-transparent rounded-br-full pointer-events-none"></div>
          <div className="absolute bottom-0 right-0 w-16 h-16 bg-gradient-to-tl from-[#ABDE3B]/10 to-transparent rounded-tl-full pointer-events-none"></div>
        </>
      )}
      
      <Breadcrumb dir={isRTL ? 'rtl' : 'ltr'} className="relative z-10">
        <BreadcrumbList dir={isRTL ? 'rtl' : 'ltr'}>
          {allItems.map((item, index) => {
            const isLast = index === allItems.length - 1;
            const displayLabel =
              item.arLabel && isRTL ? item.arLabel : item.label;

            return (
              <React.Fragment key={index}>
                <BreadcrumbItem dir={isRTL ? 'rtl' : 'ltr'}>
                  {item.href && !isLast ? (
                    <div className="relative group">
                      {/* Hover glow effect */}
                      <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-lg opacity-0 group-hover:opacity-20 blur transition-all duration-300"></div>
                      
                      <BreadcrumbLink
                        className={`${styles.link} transition-all duration-300 relative px-2 py-1 rounded-md group-hover:bg-[#ABDE3B]/10`}
                        href={item.href}
                      >
                        {index === 0 && showHome && variant === 'modern' ? (
                          <span className="flex items-center gap-1.5">
                            <div className="relative">
                              {/* Icon glow */}
                              <div className="absolute inset-0 bg-[#198341] blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                              <Home className="relative h-4 w-4 group-hover:scale-110 transition-transform duration-300" />
                            </div>
                            <span className="group-hover:font-semibold transition-all duration-300">{displayLabel}</span>
                          </span>
                        ) : (
                          <span className="group-hover:font-semibold transition-all duration-300">{displayLabel}</span>
                        )}
                        
                        {/* Bottom accent line on hover */}
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-[#198341] to-[#ABDE3B] transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left"></div>
                      </BreadcrumbLink>
                    </div>
                  ) : (
                    <div className="relative">
                      {/* Active item background glow */}
                      {isLast && (
                        <div className="absolute inset-0 bg-[#ABDE3B]/10 blur-xl rounded-full"></div>
                      )}
                      
                      <span
                        className={`${styles.active} ${
                          isLast ? 'cursor-default' : 'cursor-pointer'
                        } relative px-2 py-1 inline-block`}
                      >
                        {/* Active indicator dot */}
                      
                        <span className={isLast ? 'font-bold' : ''}>{displayLabel}</span>
                      </span>
                    </div>
                  )}
                </BreadcrumbItem>

                {!isLast && <CustomSeparator />}
              </React.Fragment>
            );
          })}
        </BreadcrumbList>
      </Breadcrumb>
    </div>
  );
};

export default SmartBreadcrumb;