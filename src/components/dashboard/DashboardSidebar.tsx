// components/dashboard/DashboardSidebarImproved.tsx
'use client';

import { useState, useEffect } from 'react';
import {
  Heart,
  Home,
  LayoutDashboard,
  Settings,
  HomeIcon,
  Bell,

} from 'lucide-react';
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
import { Link } from '@/i18n/routing';
import { usePathname } from 'next/navigation';
import { useSession } from '@/hooks/auth/use-session';
import { useDirection } from '@/hooks/use-direction';
import { useProfileContext } from '@/providers/profile.provider';
import Image from 'next/image';

export function DashboardSidebar() {
  const pathname = usePathname();
  const [isClient, setIsClient] = useState(false);
  const session = useSession();
  const direction = useDirection();
  const { profile } = useProfileContext();
  const { state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  // Initialize client-side state
  useEffect(() => {
    setIsClient(true);
  }, []);

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
    // Remove locale prefix from pathname for comparison
    const pathWithoutLocale = pathname.replace(/\/(en|ar)/, '') || '/';
    return (
      pathWithoutLocale === href ||
      (href === '/userProfile' && pathWithoutLocale === '/userProfile')
    );
  };

  // Navigation items
  const navItems = [
    {
      href: '/userProfile',
      icon: LayoutDashboard,
      label: direction === 'ltr' ? 'Dashboard' : 'لوحة التحكم',
    },
    {
      href: '/userProfile/Products',
      icon: Home,
      label: direction === 'ltr' ? 'My Cars' : 'سياراتي',
    },
    {
      href: '/userProfile/Favorites',
      icon: Heart,
      label: direction === 'ltr' ? 'Favorites' : 'المفضلة',
    },
    {
      href: '/userProfile/Notification',
      icon: Bell,
      label: direction === 'ltr' ? 'Notifications' : 'الإشعارات',
    },
    {
      href: '/userProfile/UserInfo',
      icon: Settings,
      label: direction === 'ltr' ? 'Settings' : 'الإعدادات',
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
      className="bg-primary border-r border-primary-light/20 w-64 data-[state=collapsed]:w-16"
      dir={direction}
      side={direction === 'rtl' ? 'right' : 'left'}
      collapsible="icon"
    >
      {/* Header */}
      <SidebarHeader className="border-b text-primary border-primary-light/20 p-2">
        <div className="flex items-center gap-2">
          {!isCollapsed ? (
            <>
              <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary-light flex-shrink-0">
                <Image
                  src="/assets/images/logo/bisholaLogo2.jpg"
                  alt="Logo"
                  width={24}
                  height={24}
                  className="h-5 w-auto sm:h-6"
                  priority
                  onError={(e) => {
                    console.error('Failed to load logo image');
                    e.currentTarget.style.display = 'none';
                  }}
                />
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-lg font-bold text-primary truncate">
                  {direction === 'ltr' ? 'Bishola' : 'بسهولة'}
                </span>
                <span className="text-xs text-primary truncate">
                  {direction === 'ltr' ? 'Dashboard' : 'لوحة التحكم'}
                </span>
              </div>
            </>
          ) : (
            // Option 3: Full width button-like design
            <div className="relative">
              <Image
                src="/assets/images/logo/bisholaLogo2.jpg"
                alt="Logo"
                width={48}
                height={48}
                className=" rounded-md transition-transform duration-300 group-hover:scale-110"
                priority
                onError={(e) => {
                  console.error('Failed to load logo image');
                  e.currentTarget.style.display = 'none';
                }}
              />
              {/* Optional: Add a subtle glow effect */}
              <div className="absolute inset-0 rounded-xl bg-primary-foreground/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            </div>
          )}
        </div>
      </SidebarHeader>

      {/* Content */}
      <SidebarContent className="px-2 py-4 overflow-y-auto">
        <div className="space-y-2">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
                {direction === 'ltr' ? 'Main' : 'الرئيسي'}
              </h2>
            </div>
          )}
          <SidebarMenu className=''>
            {navItems.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200 ${
                    isActiveRoute(href)
                      ? 'bg-primary-light text-white shadow-sm'
                      : 'hover:bg-primary-light/50 text-primary hover:text-white'
                  }`}
                  tooltip={isCollapsed ? label : undefined}
                >
                  <Link href={href}>
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
        <div className="space-y-2 mt-8">
          {!isCollapsed && (
            <div className="px-3 py-2">
              <h2 className="text-xs font-semibold text-primary uppercase tracking-wider">
                {direction === 'ltr' ? 'Quick Access' : 'وصول سريع'}
              </h2>
            </div>
          )}
          <SidebarMenu>
            {secondaryNavItems.map(({ href, icon: Icon, label }) => (
              <SidebarMenuItem key={href}>
                <SidebarMenuButton
                  asChild
                  className="flex items-center gap-3 px-3 py-2 rounded-lg transition-all duration-200  text-primary hover:bg-primary-light/50 hover:text-white"
                  tooltip={isCollapsed ? label : undefined}
                >
                  <Link href={href}>
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
      </SidebarContent>

      {/* Footer */}
      <SidebarFooter className="border-t border-primary-light/20 p-4 bg-primary">
        {isClient && (
          <div className="flex items-center gap-3">
            {!isCollapsed ? (
              <>
                <Avatar className="h-10 w-10 border-2 border-primary-foreground/20 flex-shrink-0">
                  {profile?.profileUrl ? (
                    <AvatarImage src={profile.profileUrl} alt="Profile" />
                  ) : (
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Profile"
                    />
                  )}
                  <AvatarFallback className="bg-primary-light text-white text-sm font-medium">
                    {getInitials(profile?.name || session.user.name || '')}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-white truncate">
                    {profile?.name || session.user.name || 'User'}
                  </p>
                  <p className="text-xs text-white truncate">
                    {profile?.email || ''}
                  </p>
                </div>
              </>
            ) : (
              // Fixed: Centered avatar with proper container
              <div className="w-full flex justify-center">
                <Avatar className="h-10 w-10 border-2 border-primary-foreground/20 hover:border-primary-foreground/40 transition-all duration-300 hover:scale-105">
                  {profile?.profileUrl ? (
                    <AvatarImage src={profile.profileUrl} alt="Profile" />
                  ) : (
                    <AvatarImage
                      src="/placeholder.svg?height=40&width=40"
                      alt="Profile"
                    />
                  )}
                  <AvatarFallback className="bg-primary-light text-white text-sm font-medium">
                    {getInitials(profile?.name || session.user.name || '')}
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
