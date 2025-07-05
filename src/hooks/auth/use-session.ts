'use client';

import { Session } from '@/core/entities/models/auth/session';
import { getSession } from '@/core/lib/web/session';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface SessionReturnType extends Session {
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refetchSession: () => void;
  invalidateSession: () => void;
}

export const useSession = (): SessionReturnType => {
  const queryClient = useQueryClient();
  const router = useRouter();
  const pathname = usePathname();

  const {
    data: session,
    refetch: refetchSession,
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: 1 * 60 * 1000, // Cache for 1 minute (reduced from 5 minutes)
    gcTime: 5 * 60 * 1000, // Keep in cache for 5 minutes
    refetchOnMount: 'always',
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  const invalidateSession = () => {
    queryClient.invalidateQueries({ queryKey: ['session'] });
    queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
    queryClient.removeQueries({ queryKey: ['session'] });
  };

  // Listen for route changes and refetch session
  useEffect(() => {
    refetchSession();
  }, [pathname, refetchSession]);

  // Listen for storage events (useful when login happens in another tab)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session' || e.key === 'accessToken' || e.key?.includes('auth')) {
        invalidateSession();
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [queryClient]);

  // Listen for visibility change to refetch when user returns to tab
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        refetchSession();
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);
    return () => document.removeEventListener('visibilitychange', handleVisibilityChange);
  }, [refetchSession]);

  // Listen for custom auth events
  useEffect(() => {
    const handleAuthChange = () => {
      invalidateSession();
    };

    window.addEventListener('auth-changed', handleAuthChange);
    window.addEventListener('login-success', handleAuthChange);
    window.addEventListener('logout-success', handleAuthChange);
    
    return () => {
      window.removeEventListener('auth-changed', handleAuthChange);
      window.removeEventListener('login-success', handleAuthChange);
      window.removeEventListener('logout-success', handleAuthChange);
    };
  }, [queryClient]);

  const defaultSession = {
    user: {
      id: 0,
      name: '',
      roles: [],
      permissions: [],
    },
    isLoading: isLoading,
    isPending: isPending,
    isError: isError,
    accessToken: '',
    refreshToken: '',
    hasRole: () => false,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    refetchSession: () => refetchSession(),
    invalidateSession,
  };

  if (!session || isError) return defaultSession;

  const user = session?.user;

  const hasRole = (role: string) => {
    if (!session || !session.user) return false;
    return session?.user.roles.includes(role) ?? false;
  };

  const hasPermission = (permission: string) => {
    if (!session || !session.user) return false;
    return session?.user.permissions.includes(permission) ?? false;
  };

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission));
  };

  return {
    user,
    accessToken: session?.accessToken,
    refreshToken: session?.refreshToken,
    isLoading,
    isPending,
    isError,
    hasRole,
    hasPermission,
    hasAnyPermission,
    refetchSession: () => refetchSession(),
    invalidateSession,
  };
};