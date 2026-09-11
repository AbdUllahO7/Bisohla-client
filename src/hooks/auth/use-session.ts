'use client';

import { UserSession } from '@/core/entities/models/auth/session';
import { getUserSession } from '@/core/lib/web/session';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter, usePathname } from 'next/navigation';
import { useEffect } from 'react';

interface SessionReturnType extends UserSession {
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
    queryFn: getUserSession,
    staleTime: 5 * 60 * 1000, // 5 minutes fresh cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: false, // Prevent request storms across component instances
    refetchOnWindowFocus: false,
    refetchOnReconnect: true,
    retry: 1,
  });

  const invalidateSession = () => {
    queryClient.setQueryData(['session'], null);
    queryClient.setQueryData(['check-auth-user'], null);
    queryClient.invalidateQueries({ queryKey: ['session'] });
    queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
    queryClient.removeQueries({ queryKey: ['session'] });
    queryClient.removeQueries({ queryKey: ['check-auth-user'] });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('logout-success'));
      window.dispatchEvent(new CustomEvent('session-invalidated'));
    }
  };

  // Listen for storage and custom logout events
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'session' || e.key === 'accessToken' || e.key?.includes('auth')) {
        invalidateSession();
      }
    };

    const handleCustomLogout = () => {
      queryClient.setQueryData(['session'], null);
      queryClient.setQueryData(['check-auth-user'], null);
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout-success', handleCustomLogout);
    window.addEventListener('session-invalidated', handleCustomLogout);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout-success', handleCustomLogout);
      window.removeEventListener('session-invalidated', handleCustomLogout);
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
    isLoading,
    isPending,
    isError,
    hasRole,
    hasPermission,
    hasAnyPermission,
    refetchSession,
    invalidateSession,
  };
};