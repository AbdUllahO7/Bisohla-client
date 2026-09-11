// Enhanced DashboardHeader with search loading effect
'use client';

import { useState, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import LocaleSwitcher from '@/components/locale/LocaleSwitcher';
import { Link } from '@/i18n/routing';
import {
  Plus,
  Search,
  Menu,
  PanelLeftClose,
  PanelLeftOpen,
  Loader2,
  X,
} from 'lucide-react';
import NotificationDropdown from '@/components/web/Home/NotificationDropdown';
import { useRouter } from 'next/navigation';
import { useSession } from '@/hooks/auth/use-session';
import { useTranslations } from 'next-intl';
import { logoutAction } from '@/app/[locale]/auth/actions';
import { useDirection } from '@/hooks/use-direction';

import { useSidebar } from '@/components/ui/sidebar';
import { useProfileContext } from '@/providers/profile.provider';
import Image from 'next/image';
import ThemeToggle from '@/components/shared/ThemeToggle';
import Logo from '@/components/shared/logo';


interface DashboardHeaderImprovedProps {
  translations: {
    home: string;
    rent: string;
    sale: string;
    map?: string;
    join: string;
    BrowseAll: string;
    Privacypolicy: string;
  };
}

export function DashboardHeader({
  translations,
}: DashboardHeaderImprovedProps) {
  const t = useTranslations('homePage');
  const direction = useDirection();
  const { user, isLoading, invalidateSession, refetchSession } =
    useSession();
  const { profile } = useProfileContext();
  const router = useRouter();
  const [isClient, setIsClient] = useState(false);
  const [isAuthChanging, setIsAuthChanging] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [searchSuggestions, setSearchSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const prevAuthState = useRef<boolean | null>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const { toggleSidebar, isMobile, state } = useSidebar();

  const isCollapsed = state === 'collapsed';

  // Determine if user is authenticated
  const isAuthenticated = !!user?.id;

  // Track authentication state changes
  useEffect(() => {
    if (
      prevAuthState.current !== null &&
      prevAuthState.current !== isAuthenticated
    ) {
      setIsAuthChanging(true);
      const timer = setTimeout(() => {
        setIsAuthChanging(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
    prevAuthState.current = isAuthenticated;
  }, [isAuthenticated]);

  // Ensure client-side rendering
  useEffect(() => {
    setIsClient(true);
  }, []);

  // Refetch session on component mount and when route changes
  useEffect(() => {
    if (isClient) {
      refetchSession();
    }
  }, [isClient, refetchSession]);

  // Handle logout
  const handleLogout = async () => {
    try {
      invalidateSession();
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

  // Debounced search suggestions (optional)
  useEffect(() => {
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current);
    }

    if (searchQuery.trim().length > 2) {
      searchTimeoutRef.current = setTimeout(() => {
        // Mock search suggestions - replace with actual API call
        const mockSuggestions = [
          'Toyota Camry',
          'BMW X5',
          'Mercedes-Benz C-Class',
          'Honda Accord',
          'Nissan Altima',
        ].filter((suggestion) =>
          suggestion.toLowerCase().includes(searchQuery.toLowerCase()),
        );
        setSearchSuggestions(mockSuggestions);
        setShowSuggestions(true);
      }, 300);
    } else {
      setShowSuggestions(false);
      setSearchSuggestions([]);
    }

    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current);
      }
    };
  }, [searchQuery]);

  // Handle search with loading effect
  const handleSearch = async (e: React.FormEvent, query?: string) => {
    e.preventDefault();
    const searchTerm = query || searchQuery.trim();

    if (searchTerm) {
      setIsSearching(true);
      setShowSuggestions(false);

      try {
        // Add a small delay to show the loading effect
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Navigate to search results
        router.push(`/products?search=${encodeURIComponent(searchTerm)}`);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        // Keep loading state for a bit longer to show transition
        setTimeout(() => {
          setIsSearching(false);
        }, 1000);
      }
    }
  };

  // Handle search input change
  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion: string) => {
    setSearchQuery(suggestion);
    setShowSuggestions(false);
    handleSearch(new Event('submit') as any, suggestion);
  };

  // Clear search
  const handleClearSearch = () => {
    setSearchQuery('');
    setShowSuggestions(false);
    setSearchSuggestions([]);
    searchInputRef.current?.focus();
  };

  // Handle click outside to close suggestions
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchInputRef.current &&
        !searchInputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Get user initials
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .substring(0, 2);
  };

  // Show loading state during hydration, session loading, or auth changing
  if (!isClient || isLoading || isAuthChanging) {
    return (
      <header className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center px-4 gap-4">
          {/* Left side skeleton */}
          <div className="flex items-center gap-4">
            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
            <div className="h-6 w-32 bg-gray-200 dark:bg-zinc-800 rounded animate-pulse"></div>
          </div>

          {/* Right side skeleton */}
          <div className="flex items-center gap-3 ml-auto">
            <div className="h-9 w-64 bg-gray-200 dark:bg-zinc-800 rounded-md animate-pulse hidden sm:block"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-9 w-9 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
            <div className="h-8 w-8 bg-gray-200 dark:bg-zinc-800 rounded-full animate-pulse"></div>
          </div>
        </div>
      </header>
    );
  }

  return (
    <header
      className="sticky top-0 z-40 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60"
      dir={direction}
    >
      <div className="flex h-16 items-center px-3 sm:px-4 justify-between gap-2 sm:gap-4">
        {/* Left side */}
        <div className="flex items-center gap-2 sm:gap-4 shrink-0">
          {/* Desktop sidebar toggle */}
          {!isMobile && (
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleSidebar}
              className="hidden md:flex"
            >
              {isCollapsed ? (
                <PanelLeftOpen className="h-5 w-5" />
              ) : (
                <PanelLeftClose className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle sidebar</span>
            </Button>
          )}

          {/* Mobile sidebar toggle */}
          {isMobile && (
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-10 w-10 p-0"
              onClick={toggleSidebar}
            >
              <Menu className="h-6 w-6" />
              <span className="sr-only">Toggle menu</span>
            </Button>
          )}

          {/* Dashboard title */}
          <div className="flex items-center gap-2">
            <h1 className="text-base sm:text-lg font-semibold text-foreground hidden sm:block">
              {direction === 'ltr' ? 'Dashboard' : 'لوحة التحكم'}
            </h1>
          </div>
        </div>

        {/* Center - Enhanced Search bar with loading (Desktop only, mobile has it in sidebar) */}
        <div className="hidden md:flex flex-1 justify-center max-w-md mx-auto relative">
          <form onSubmit={handleSearch} className="w-full relative">
            <div className="relative">
              {/* Search Input */}
              <Input
                ref={searchInputRef}
                placeholder={
                  direction === 'ltr'
                    ? 'Search cars...'
                    : 'البحث عن السيارات...'
                }
                value={searchQuery}
                onChange={handleSearchInputChange}
                disabled={isSearching}
                className={`pl-9 rtl:pl-3 rtl:pr-9 bg-muted/50 dark:bg-zinc-900/50 w-full pr-9 rtl:pr-3 rtl:pl-9 transition-all duration-200 dark:text-white dark:border-zinc-800 dark:placeholder:text-zinc-500 ${
                  isSearching ? 'opacity-75' : ''
                } ${showSuggestions ? 'rounded-b-none border-b-0' : ''}`}
                onFocus={() => {
                  if (searchSuggestions.length > 0) {
                    setShowSuggestions(true);
                  }
                }}
              />

              {/* Search Icon or Loading Spinner */}
              <div className="absolute right-8 rtl:right-auto rtl:left-8 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground">
                {isSearching ? (
                  <Loader2 className="h-4 w-4 animate-spin text-primary dark:text-[#ABDE3B]" />
                ) : (
                  <Search className="h-4 w-4 dark:text-zinc-400" />
                )}
              </div>

              {/* Clear Search Button */}
              {searchQuery && !isSearching && (
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 rtl:right-auto rtl:left-1 top-1/2 h-6 w-6 -translate-y-1/2 hover:bg-muted dark:hover:bg-zinc-800"
                  onClick={handleClearSearch}
                >
                  <X className="h-3 w-3 dark:text-zinc-400" />
                </Button>
              )}
            </div>

            {/* Search Progress Bar */}
            {isSearching && (
              <div className="absolute -bottom-0.5 left-0 right-0 h-0.5 bg-muted dark:bg-zinc-800 rounded-full overflow-hidden">
                <div className="h-full bg-primary dark:bg-emerald-600 animate-pulse"></div>
              </div>
            )}

            {/* Search Suggestions Dropdown */}
            {showSuggestions &&
              searchSuggestions.length > 0 &&
              !isSearching && (
                <div className="absolute top-full left-0 right-0 bg-background dark:bg-zinc-900 border border-border dark:border-zinc-800 border-t-0 rounded-b-md shadow-lg z-50 max-h-48 overflow-y-auto">
                  {searchSuggestions.map((suggestion, index) => (
                    <button
                      key={index}
                      type="button"
                      className="w-full px-3 py-2 text-left hover:bg-muted dark:hover:bg-zinc-850 text-sm transition-colors duration-150 flex items-center gap-2 dark:text-zinc-200"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <Search className="h-3 w-3 text-muted-foreground dark:text-zinc-400" />
                      <span>{suggestion}</span>
                    </button>
                  ))}
                </div>
              )}
          </form>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
          {/* Add Listing Button (Desktop only) */}
          <Link href="/products/AddProducts" className="hidden md:inline-flex">
            <Button
              size="sm"
              className="bg-primary hover:bg-primary-light text-white"
              disabled={isSearching}
            >
              <Plus className="h-4 w-4 sm:mr-2 rtl:sm:mr-0 rtl:sm:ml-2" />
              <span className="hidden sm:inline">
                {direction === 'ltr' ? 'Add Listing' : 'إضافة إعلان'}
              </span>
            </Button>
          </Link>

          {/* Notifications */}
          {isAuthenticated && <NotificationDropdown />}

          {/* Theme Toggle (Desktop only) */}
          <div className="hidden md:flex">
            <ThemeToggle />
          </div>

          {/* Language Switcher (Desktop only) */}
          <div className="hidden md:flex">
            <LocaleSwitcher />
          </div>

          {/* Logo */}
          <Logo className="shrink-0" />
        </div>
      </div>
    </header>
  );
}
