'use client';

import { useEffect, useState } from 'react';
import {
  Heart,
  Home,
  LayoutDashboard,
  Settings,
  HomeIcon,
  Bell,
  BellRing,
  LogOut,
  BarChart3,
  MapPin,
  Loader2,
  X,
  Plus,
  Search,
} from 'lucide-react';
import { useSettings } from '@/providers/settings.provider';
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Link, useRouter } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/auth/use-session';
import { useDirection } from '@/hooks/use-direction';
import { useProfileContext } from '@/providers/profile.provider';
import Image from 'next/image';
import { logoutAction } from '@/app/[locale]/auth/actions';
import ThemeToggle from '@/components/shared/ThemeToggle';
import LocaleSwitcher from '@/components/locale/LocaleSwitcher';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [mobileSearchQuery, setMobileSearchQuery] = useState('');
  const router = useRouter();
  const session = useSession();
  const direction = useDirection();
  const { profile } = useProfileContext();
  const { state, isMobile, setOpenMobile } = useSidebar();

  // On mobile, the sidebar is NEVER in collapsed icon mode — it is always a full drawer
  const isCollapsed = !isMobile && state === 'collapsed';

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

  const handleMobileSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (mobileSearchQuery.trim()) {
      setOpenMobile(false);
      router.push(`/products?search=${encodeURIComponent(mobileSearchQuery.trim())}`);
    }
  };

  const handleLogout = async () => {
    if (isLoggingOut) return;
    setIsLoggingOut(true);
    try {
      session.invalidateSession();
      await logoutAction();
    } catch (error: any) {
      if (error?.message?.includes('NEXT_REDIRECT') || error?.digest?.includes('NEXT_REDIRECT')) {
        return;
      }
      console.error('Logout error:', error);
    } finally {
      window.location.href = `/${direction === 'ltr' ? 'en' : 'ar'}`;
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Helper function to check if route is active
  const isActiveRoute = (href: string) => {
    const path = pathname.replace(/\/(en|ar)/, '') || '/';
    if (href === '/userProfile') {
      return path === '/userProfile' || path === '/userProfile/Home';
    }
    if (href === '/userProfile/Statistics') {
      return path.startsWith('/userProfile/Statistics') || path.startsWith('/statistics');
    }
    if (href === '/userProfile/Products') {
      return (
        path.startsWith('/userProfile/Products') ||
        path.startsWith('/my-listings') ||
        path.startsWith('/products/EditProduct') ||
        path.startsWith('/products/edit')
      );
    }
    if (href === '/userProfile/Favorites') {
      return path.startsWith('/userProfile/Favorites') || path.startsWith('/favorites');
    }
    if (href === '/userProfile/Alerts') {
      return path.startsWith('/userProfile/Alerts') || path.startsWith('/car-alerts');
    }
    if (href === '/userProfile/Notification') {
      return path.startsWith('/userProfile/Notification') || path.startsWith('/notifications');
    }
    if (href === '/userProfile/SavedAddresses') {
      return path.startsWith('/userProfile/SavedAddresses');
    }
    if (href === '/userProfile/UserInfo') {
      return (
        path.startsWith('/userProfile/UserInfo') ||
        path.startsWith('/settings') ||
        path.startsWith('/profile/edit')
      );
    }
    return path === href;
  };

  const { getListingsSettings } = useSettings();
  const isSavedAddressesEnabled =
    getListingsSettings()?.location?.saved_addresses_enabled ?? true;

  // Navigation items
  const navItems = [
    {
      href: '/userProfile',
      icon: LayoutDashboard,
      label: direction === 'ltr' ? 'Dashboard' : 'لوحة التحكم',
    },
    {
      href: '/userProfile/Statistics',
      icon: BarChart3,
      label: direction === 'ltr' ? 'Statistics & Analytics' : 'الإحصائيات والتحليلات',
    },
    {
      href: '/userProfile/Products',
      icon: Home,
      label: direction === 'ltr' ? 'My Products' : 'إعلاناتي ومنتجاتي',
    },
    {
      href: '/userProfile/Favorites',
      icon: Heart,
      label: direction === 'ltr' ? 'Favorites' : 'المفضلة',
    },
    {
      href: '/userProfile/Alerts',
      icon: BellRing,
      label: direction === 'ltr' ? 'My Alerts' : 'تنبيهاتي',
    },
    {
      href: '/userProfile/Notification',
      icon: Bell,
      label: direction === 'ltr' ? 'Notifications' : 'الإشعارات',
    },
    ...(isSavedAddressesEnabled
      ? [
          {
            href: '/userProfile/SavedAddresses',
            icon: MapPin,
            label: direction === 'ltr' ? 'Saved Addresses' : 'العناوين المحفوظة',
          },
        ]
      : []),
    {
      href: '/userProfile/UserInfo',
      icon: Settings,
      label: direction === 'ltr' ? 'Profile & Settings' : 'الملف والإعدادات',
    },
  ];

  const secondaryNavItems = [
    {
      href: '/',
      icon: HomeIcon,
      label: direction === 'ltr' ? 'Back to Website' : 'العودة للموقع',
    },
  ];

  return (
    <Sidebar
      className="bg-sidebar border-r border-sidebar-border w-64 data-[state=collapsed]:w-16"
      dir={direction}
      side={direction === 'rtl' ? 'right' : 'left'}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b border-sidebar-border p-3">
        <div className="flex items-center justify-between gap-2 w-full">
          <div className="flex items-center gap-2.5 overflow-hidden">
            {!isCollapsed ? (
              <>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-light flex-shrink-0 shadow-xs">
                  <Image
                    src="/assets/images/logo/bisholaLogo2.jpg"
                    alt="Logo"
                    width={24}
                    height={24}
                    className="h-5 w-auto rounded"
                    priority
                    onError={(e) => {
                      console.error('Failed to load logo image');
                      e.currentTarget.style.display = 'none';
                    }}
                  />
                </div>
                <div className="flex flex-col overflow-hidden">
                  <span className="text-base font-bold text-sidebar-foreground truncate">
                    {direction === 'ltr' ? 'Bishola' : 'بسهولة'}
                  </span>
                  <span className="text-[11px] text-sidebar-foreground/70 truncate">
                    {direction === 'ltr' ? 'Dashboard' : 'لوحة التحكم'}
                  </span>
                </div>
              </>
            ) : (
              <div className="relative mx-auto">
                <Image
                  src="/assets/images/logo/bisholaLogo2.jpg"
                  alt="Logo"
                  width={36}
                  height={36}
                  className="rounded-md transition-transform duration-300 hover:scale-105"
                  priority
                  onError={(e) => {
                    console.error('Failed to load logo image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
            )}
          </div>

          {/* Close button for mobile drawer */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="h-8 w-8 rounded-lg text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground flex-shrink-0"
              onClick={() => setOpenMobile(false)}
              aria-label="Close sidebar"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-3 overflow-y-auto">
        {/* Mobile Quick Actions (Add Listing + Search) */}
        {isMobile && (
          <div className="p-2 mb-2 space-y-2 border-b border-sidebar-border">
            {/* Add Listing Button */}
            <Link
              href="/products/AddProducts"
              onClick={() => setOpenMobile(false)}
              className="block w-full"
            >
              <Button className="w-full bg-primary hover:bg-primary-light text-white font-semibold h-11 rounded-xl flex items-center justify-center gap-2 shadow-sm">
                <Plus className="h-4 w-4" />
                <span>{direction === 'ltr' ? 'Add Listing' : 'إضافة إعلان'}</span>
              </Button>
            </Link>

            {/* Quick Search */}
            <form onSubmit={handleMobileSearch} className="relative w-full">
              <Input
                placeholder={direction === 'ltr' ? 'Search cars...' : 'البحث عن السيارات...'}
                value={mobileSearchQuery}
                onChange={(e) => setMobileSearchQuery(e.target.value)}
                className="w-full pl-9 rtl:pl-3 rtl:pr-9 bg-sidebar-accent/50 dark:bg-zinc-850/50 text-sm h-10 rounded-xl border border-sidebar-border"
              />
              <button
                type="submit"
                className="absolute right-3 rtl:right-auto rtl:left-3 top-1/2 -translate-y-1/2 text-sidebar-foreground/60 hover:text-sidebar-foreground p-1"
                aria-label="Search"
              >
                <Search className="h-4 w-4" />
              </button>
            </form>
          </div>
        )}

        <div className="space-y-2">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                {direction === 'ltr' ? 'Main' : 'الرئيسي'}
              </h2>
            </div>
          )}
          <SidebarMenu className="">
            {navItems.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 ${
                    isActiveRoute(href)
                      ? 'bg-primary-light text-black shadow-sm font-semibold'
                      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground'
                  }`}
                  tooltip={isCollapsed ? label : undefined}
                >
                  <Link
                    href={href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium truncate">{label}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
        </div>

        {/* Secondary Navigation */}
        <div className="space-y-2 mt-6">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-sidebar-foreground/40 uppercase tracking-wider">
                {direction === 'ltr' ? 'Quick Access' : 'وصول سريع'}
              </h2>
            </div>
          )}
          <SidebarMenu>
            {secondaryNavItems.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
                  tooltip={isCollapsed ? label : undefined}
                >
                  <Link
                    href={href}
                    onClick={() => {
                      if (isMobile) setOpenMobile(false);
                    }}
                  >
                    <Icon className="h-4 w-4 flex-shrink-0" />
                    {!isCollapsed && (
                      <span className="font-medium truncate">{label}</span>
                    )}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}

            {/* Sign Out Button */}
            <SidebarMenuItem>
              <SidebarMenuButton
                onClick={handleLogout}
                disabled={isLoggingOut}
                className="flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 text-destructive hover:bg-destructive/10 hover:text-destructive cursor-pointer disabled:opacity-60"
                tooltip={isCollapsed ? (direction === 'ltr' ? 'Sign Out' : 'تسجيل الخروج') : undefined}
              >
                {isLoggingOut ? (
                  <Loader2 className="h-4 w-4 flex-shrink-0 animate-spin" />
                ) : (
                  <LogOut className="h-4 w-4 flex-shrink-0" />
                )}
                {!isCollapsed && (
                  <span className="font-medium truncate">
                    {direction === 'ltr' ? 'Sign Out' : 'تسجيل الخروج'}
                  </span>
                )}
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </div>
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-sidebar-border p-3 bg-sidebar mt-auto space-y-2">
        {/* Language & Theme Controls on Mobile */}
        {isMobile && (
          <div className="flex items-center justify-between gap-2 pb-2 border-b border-sidebar-border/60">
            <span className="text-xs font-medium text-sidebar-foreground/70">
              {direction === 'ltr' ? 'Appearance & Language' : 'المظهر واللغة'}
            </span>
            <div className="flex items-center gap-2">
              <ThemeToggle />
              <LocaleSwitcher />
            </div>
          </div>
        )}

        {isClient && (
          <div className="flex items-center gap-3 w-full">
            {!isCollapsed ? (
              <>
                <Avatar className="h-9 w-9 border-2 border-primary-foreground/20 flex-shrink-0">
                  {profile?.profileUrl ? (
                    <AvatarImage src={profile.profileUrl} alt="Profile" />
                  ) : (
                    <AvatarImage
                      src="/placeholder.svg?height=36&width=36"
                      alt="Profile"
                    />
                  )}
                  <AvatarFallback className="bg-primary-light text-white text-xs font-semibold">
                    {getInitials(profile?.name || session.user?.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-semibold text-sidebar-foreground truncate">
                    {profile?.name || session.user?.name || 'User'}
                  </p>
                  <p className="text-xs text-sidebar-foreground/60 truncate">
                    {profile?.email || ''}
                  </p>
                </div>
              </>
            ) : (
              <div className="w-full flex justify-center">
                <Avatar className="h-8 w-8 border-2 border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-300 hover:scale-105">
                  {profile?.profileUrl ? (
                    <AvatarImage src={profile.profileUrl} alt="Profile" />
                  ) : (
                    <AvatarImage
                      src="/placeholder.svg?height=32&width=32"
                      alt="Profile"
                    />
                  )}
                  <AvatarFallback className="bg-primary-light text-white text-xs font-semibold">
                    {getInitials(profile?.name || session.user?.name || '')}
                  </AvatarFallback>
                </Avatar>
              </div>
            )}
          </div>
        )}
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
