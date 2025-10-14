// HeaderTwo.tsx - Improved centering and RTL support
'use client';
import { useSession } from '@/hooks/auth/use-session';
import type { HeaderTowProps } from '@/types/homePageTypes';
import { MenuIcon, ChevronDown } from 'lucide-react';
import { Link } from '@/i18n/routing';
import type React from 'react';
import { useState } from 'react';
import { useLocale } from 'next-intl';
import { Button } from '../../ui/button';

const HeaderTwo: React.FC<HeaderTowProps> = ({ translations }) => {
  const [showMobileNav, setShowMobileNav] = useState(false);
  const session = useSession();
  const locale = useLocale();
  const isRTL = locale === 'ar';

  const navItems = [
    { href: '/', label: translations.home },
    { href: '/products?listingType=for_rent', label: translations.rent },
    { href: '/products?listingType=for_sale', label: translations.sale },
    { href: '/products', label: translations.BrowseAll },
    { href: '/Privacypolicy', label: translations.Privacypolicy },
    { href: '/ContactUs', label: translations.ContactUs},

  ];

  return (
    <div className="bg-primary text-white relative">
      {/* Desktop Navigation */}
      <div className="hidden md:block">
        <div className="w-full px-4 py-2">
          <div className="flex justify-center">
            <nav
              className={`inline-flex items-center ${
                isRTL ? 'gap-x-6 flex-row' : 'gap-x-6'
              }`}
              dir={isRTL ? 'rtl' : 'ltr'}
            >
              {navItems.map((item, index) => (
                <Link
                  key={item.href}
                  href={item.href}
                  className="relative text-white hover:text-emerald-100 transition-all duration-300 ease-in-out px-3 py-2 rounded-md text-sm font-medium transform hover:scale-105 hover:shadow-lg group whitespace-nowrap"
                  style={{
                    animationDelay: `${index * 100}ms`,
                    animation: 'fadeInUp 0.6s ease-out forwards',
                  }}
                >
                  {item.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-100 transition-all duration-300 ease-out group-hover:w-full"></span>
                </Link>
              ))}
            </nav>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="md:hidden">
        <div className="px-4 py-3">
          <Button
            variant="ghost"
            className="w-full text-white hover:bg-emerald-700 flex items-center justify-between py-2 transition-all duration-300 ease-in-out transform hover:scale-102"
            onClick={() => setShowMobileNav(!showMobileNav)}
          >
            <span className="flex items-center gap-2 transition-all duration-200">
              <MenuIcon
                className={`w-4 h-4 transition-transform duration-300 ${
                  showMobileNav ? 'rotate-90' : ''
                }`}
              />
              <span className="text-sm font-medium">
                {isRTL ? 'التصفح' : 'Browse'}
              </span>
            </span>
            <ChevronDown
              className={`w-4 h-4 transition-transform duration-300 ease-in-out ${
                showMobileNav ? 'rotate-180' : ''
              }`}
            />
          </Button>

          {/* Mobile Dropdown with slide animation */}
          <div
            className={`overflow-hidden transition-all duration-500 ease-in-out ${
              showMobileNav ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
            }`}
          >
            <div className="mt-2 bg-emerald-700 rounded-lg overflow-hidden shadow-lg">
              <nav className="py-2" dir={isRTL ? 'rtl' : 'ltr'}>
                {navItems.map((item, index) => (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={`block px-4 py-3 text-white hover:bg-emerald-800 transition-all duration-300 ease-in-out text-sm transform hover:shadow-md relative overflow-hidden group ${
                      isRTL ? 'hover:-translate-x-2' : 'hover:translate-x-2'
                    }`}
                    onClick={() => setShowMobileNav(false)}
                    style={{
                      animationDelay: showMobileNav ? `${index * 50}ms` : '0ms',
                      animation: showMobileNav
                        ? 'slideInLeft 0.4s ease-out forwards'
                        : 'none',
                    }}
                  >
                    {/* Background hover effect */}
                    <span className="absolute inset-0 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    <span className="relative z-10">{item.label}</span>
                  </Link>
                ))}
                {!session.user.id && (
                  <Link
                    href="/auth/sign-in"
                    className={`block px-4 py-3 text-white hover:bg-emerald-800 transition-all duration-300 ease-in-out text-sm transform hover:shadow-md relative overflow-hidden group bg-emerald-600 ${
                      isRTL ? 'hover:-translate-x-2' : 'hover:translate-x-2'
                    }`}
                    onClick={() => setShowMobileNav(false)}
                    style={{
                      animationDelay: showMobileNav
                        ? `${navItems.length * 50}ms`
                        : '0ms',
                      animation: showMobileNav
                        ? 'slideInLeft 0.4s ease-out forwards'
                        : 'none',
                    }}
                  >
                    <span className="absolute inset-0 bg-emerald-500 transform scale-x-0 origin-left transition-transform duration-300 group-hover:scale-x-100"></span>
                    <span className="relative z-10">{translations.join}</span>
                  </Link>
                )}
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default HeaderTwo;
