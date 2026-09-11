'use client';

import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Box from '@/components/ui/box';
import LocaleSwitcher from '@/components/locale/LocaleSwitcher';
import { Link } from '@/i18n/routing';
import { UserCheck2Icon, LogOut, Plus, Menu, X } from 'lucide-react';
import NotificationDropdown from './NotificationDropdown';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/auth/use-session';
import { useTranslations, useLocale } from 'next-intl';
import { useEffect, useState } from 'react';
import { logoutAction } from '@/app/[locale]/auth/actions';
import Logo from '@/components/shared/logo';
import ThemeToggle from '@/components/shared/ThemeToggle';

const HeaderOne = () => {
  const t = useTranslations('homePage');
  const locale = useLocale();
  const isRTL = locale === 'ar';
  const { user, isLoading } = useSession();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);

  // Determine if user is authenticated
  const isAuthenticated = !!user?.id;

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Handle logout
  const handleLogout = async () => {
    try {
      await logoutAction();
    } catch (error) {
      console.error('Logout error:', error);
      router.push('/');
    }
  };

  // Show loading state during hydration or session loading
  if (!isClient || isLoading) {
    return (
      <Box className="flex justify-between items-center py-2 w-full px-2.5 sm:px-4 container border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {/* Logo Skeleton */}
        <div className="flex items-center flex-shrink-0">
          <div className="h-6 sm:h-7 md:h-8 w-20 sm:w-24 md:w-28 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
        </div>

        {/* Right side skeleton */}
        <div className="flex items-center gap-1.5 sm:gap-2 justify-end">
          {/* Desktop skeleton */}
          <div className="hidden md:flex items-center gap-2.5 justify-end">
            <div className="h-8 w-24 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-8 w-20 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-8 w-12 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
          </div>

          {/* Mobile skeleton */}
          <div className="flex md:hidden items-center gap-1 sm:gap-1.5 justify-end">
            <div className="h-7 w-16 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-7 w-7 bg-gray-200 dark:bg-zinc-800 rounded-lg animate-pulse"></div>
          </div>
        </div>
      </Box>
    );
  }

  return (
    <>
      <Box className="flex justify-between items-center py-2 w-full px-2.5 sm:px-4 container border-b border-gray-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
        {/* Logo */}
        <Logo
          className="flex-shrink-0"
          imageClassName="h-6 sm:h-7 md:h-8 w-auto max-w-[85px] sm:max-w-[105px] md:max-w-[130px]"
        />

        {/* Desktop Actions - Hidden on mobile */}
        <div className="hidden md:flex items-center gap-2.5">
          {/* Add Listing Button */}
          <Link href="/products/AddProducts">
            <Button
              variant="default"
              className="text-white rounded-full h-8 px-3.5 text-xs sm:text-sm font-medium flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              size="sm"
            >
              <span className="whitespace-nowrap">
                {t('headerOne.adsButton')}
              </span>
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {/* Auth Buttons */}
          {!isAuthenticated ? (
            <Link href="/auth/sign-in">
              <Button
                variant="outline"
                className="text-emerald-600 bg-transparent rounded-full h-8 px-3.5 border border-emerald-600 text-xs sm:text-sm font-medium flex items-center gap-1.5 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-zinc-800"
                size="sm"
              >
                <span className="whitespace-nowrap">
                  {t('headerOne.loginButton')}
                </span>
                <Image
                  src="/assets/icons/user.png"
                  alt="User Icon"
                  width={14}
                  height={14}
                  className="w-3.5 h-3.5 dark:brightness-200 dark:invert"
                />
              </Button>
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Link href="/userProfile">
                <Button
                  variant="outline"
                  className="text-primary bg-transparent rounded-full h-8 px-3.5 border border-primary text-xs sm:text-sm font-medium flex items-center gap-1.5 hover:bg-primary-light dark:hover:bg-zinc-800"
                  size="sm"
                >
                  <span className="whitespace-nowrap truncate max-w-[120px]">
                    {user?.name || t('headerOne.profileButton')}
                  </span>
                  <UserCheck2Icon className="w-3.5 h-3.5" />
                </Button>
              </Link>
              <Button
                variant="outline"
                className="text-red-600 bg-transparent rounded-full h-8 px-3 border border-red-300 text-xs sm:text-sm font-medium flex items-center gap-1.5 hover:bg-red-50 dark:text-red-400 dark:border-red-950 dark:hover:bg-red-950"
                size="sm"
                onClick={handleLogout}
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="whitespace-nowrap">
                  {t('headerOne.logoutButton')}
                </span>
              </Button>
            </div>
          )}

          {/* Notification Icon */}
          {isAuthenticated && (
            <div className="flex-shrink-0">
              <NotificationDropdown />
            </div>
          )}

          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>

          {/* Language Switcher */}
          <div className="flex-shrink-0">
            <LocaleSwitcher />
          </div>
        </div>

        {/* Mobile Actions - Compact & responsive design */}
        <div className="flex md:hidden items-center gap-1 sm:gap-1.5 flex-shrink-0">
          {/* Auth Button for Mobile */}
          {!isAuthenticated ? (
            <Link href="/auth/sign-in" className="flex-shrink-0">
              <Button
                variant="outline"
                className="text-emerald-600 bg-transparent rounded-full h-7 sm:h-8 px-2 sm:px-2.5 border border-emerald-600 text-[11px] sm:text-xs font-medium flex items-center gap-1 hover:bg-emerald-50 dark:text-emerald-400 dark:border-emerald-400 dark:hover:bg-zinc-850"
                size="sm"
              >
                <Image
                  src="/assets/icons/user.png"
                  alt="User Icon"
                  width={12}
                  height={12}
                  className="w-3 h-3 dark:brightness-200 dark:invert"
                />
                <span className="whitespace-nowrap">
                  {t('headerOne.loginButton')}
                </span>
              </Button>
            </Link>
          ) : (
            <>
              <Link href="/userProfile" className="flex-shrink-0">
                <Button
                  variant="outline"
                  className="text-primary bg-transparent rounded-full h-7 sm:h-8 px-2 sm:px-2.5 border border-primary text-[11px] sm:text-xs font-medium flex items-center gap-1 hover:bg-primary-light dark:hover:bg-zinc-800"
                  size="sm"
                >
                  <UserCheck2Icon className="w-3 h-3" />
                  <span className="whitespace-nowrap max-w-[65px] truncate">
                    {user?.name || t('headerOne.profileButton')}
                  </span>
                </Button>
              </Link>
              <div className="flex-shrink-0">
                <NotificationDropdown />
              </div>
            </>
          )}

          {/* Add Listing Button */}
          <Link href="/products/AddProducts" className="flex-shrink-0">
            <Button
              variant="default"
              className="text-white rounded-full h-7 w-7 sm:h-8 sm:w-8 p-0 text-xs font-medium flex items-center justify-center bg-emerald-600 hover:bg-emerald-700 shadow-sm"
              size="sm"
              aria-label={t('headerOne.adsButton')}
            >
              <Plus className="w-3.5 h-3.5" />
            </Button>
          </Link>

          {/* Theme Toggle */}
          <div className="flex-shrink-0">
            <ThemeToggle />
          </div>

          {/* Language Switcher - Minimal */}
          <div className="flex-shrink-0">
            <LocaleSwitcher />
          </div>

          {/* Mobile Menu Toggle */}
          <Button
            variant="ghost"
            className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-lg text-gray-600 dark:text-zinc-400 hover:bg-gray-100 dark:hover:bg-zinc-800 flex-shrink-0"
            size="sm"
            onClick={() => setShowMobileMenu(!showMobileMenu)}
            aria-label="Menu"
          >
            {showMobileMenu ? (
              <X className="w-4 h-4" />
            ) : (
              <Menu className="w-4 h-4" />
            )}
          </Button>
        </div>
      </Box>

      {/* Mobile Menu Overlay */}
      {showMobileMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/50 backdrop-blur-xs z-50 md:hidden"
            onClick={() => setShowMobileMenu(false)}
          />

          {/* Menu Panel */}
          <div
            className={`fixed top-0 ${isRTL ? 'left-0' : 'right-0'
              } h-full w-80 max-w-[85vw] bg-white dark:bg-zinc-950 shadow-2xl z-[60] md:hidden transform transition-transform duration-300`}
          >
            {/* Menu Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-zinc-800">
              <h2 className="text-base font-bold text-gray-900 dark:text-zinc-100">
                {t('headerOne.menuTitle') || 'القائمة'}
              </h2>
              <Button
                variant="ghost"
                className="h-8 w-8 p-0 rounded-full text-gray-500 dark:text-zinc-400"
                onClick={() => setShowMobileMenu(false)}
              >
                <X className="w-5 h-5" />
              </Button>
            </div>

            {/* Menu Content */}
            <div className="p-4 space-y-4">
              {/* Add Listing Button */}
              <Link
                href="/products/AddProducts"
                onClick={() => setShowMobileMenu(false)}
              >
                <Button
                  variant="default"
                  className="w-full text-white rounded-xl h-11 text-sm font-medium flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-700 shadow-sm"
                >
                  <Plus className="w-4 h-4" />
                  <span>{t('headerOne.adsButton')}</span>
                </Button>
              </Link>

              {/* Auth Section */}
              <div className="space-y-3 pt-2">
                {!isAuthenticated ? (
                  <Link
                    href="/auth/sign-in"
                    onClick={() => setShowMobileMenu(false)}
                  >
                    <Button
                      variant="outline"
                      className="w-full text-emerald-600 dark:text-emerald-400 bg-transparent rounded-xl h-11 border border-emerald-600 dark:border-emerald-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-zinc-900"
                    >
                      <Image
                        src="/assets/icons/user.png"
                        alt="User Icon"
                        width={18}
                        height={18}
                        className="w-4.5 h-4.5 dark:brightness-200 dark:invert"
                      />
                      <span>{t('headerOne.loginButton')}</span>
                    </Button>
                  </Link>
                ) : (
                  <div className="space-y-3">
                    {/* User Info */}
                    <div className="bg-gray-50 dark:bg-zinc-900 rounded-xl p-3 border border-gray-100 dark:border-zinc-800">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 bg-emerald-100 dark:bg-emerald-950 rounded-full flex items-center justify-center">
                          <UserCheck2Icon className="w-4.5 h-4.5 text-emerald-600 dark:text-emerald-400" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium text-gray-900 dark:text-zinc-100 truncate">
                            {user?.name || t('headerOne.profileButton')}
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Profile Button */}
                    <Link
                      href="/userProfile"
                      onClick={() => setShowMobileMenu(false)}
                    >
                      <Button
                        variant="outline"
                        className="w-full text-emerald-600 dark:text-emerald-400 bg-transparent rounded-xl h-11 border border-emerald-600 dark:border-emerald-500 text-sm font-medium flex items-center justify-center gap-2 hover:bg-emerald-50 dark:hover:bg-zinc-900"
                      >
                        <UserCheck2Icon className="w-4.5 h-4.5" />
                        <span>{t('headerOne.profileButton')}</span>
                      </Button>
                    </Link>

                    {/* Logout Button */}
                    <Button
                      variant="outline"
                      className="w-full text-red-600 bg-transparent rounded-xl h-11 border border-red-300 dark:border-red-950 text-sm font-medium flex items-center justify-center gap-2 hover:bg-red-50 dark:hover:bg-red-950"
                      onClick={() => {
                        setShowMobileMenu(false);
                        handleLogout();
                      }}
                    >
                      <LogOut className="w-4.5 h-4.5" />
                      <span>{t('headerOne.logoutButton')}</span>
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </>
  );
};

export default HeaderOne;
