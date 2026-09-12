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
    staleTime: 10 * 1000, // 10 seconds fresh cache
    gcTime: 10 * 60 * 1000, // Keep in cache for 10 minutes
    refetchOnMount: true, // Always re-check session when mounting so header updates immediately
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
    retry: 1,
  });

  const invalidateSession = () => {
    queryClient.setQueryData(['session'], null);
    queryClient.setQueryData(['check-auth-user'], null);
    queryClient.invalidateQueries({ queryKey: ['session'] });
    queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
    queryClient.invalidateQueries({ queryKey: ['profile'] });
    queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
    queryClient.invalidateQueries({ queryKey: ['legal-my-acceptances'] });
    queryClient.removeQueries({ queryKey: ['session'] });
    queryClient.removeQueries({ queryKey: ['check-auth-user'] });
    queryClient.removeQueries({ queryKey: ['legal-pending'] });
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('logout-success'));
      window.dispatchEvent(new CustomEvent('session-invalidated'));
    }
  };

  // Listen for storage, login, and custom logout events
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
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      queryClient.invalidateQueries({ queryKey: ['legal-my-acceptances'] });
      queryClient.removeQueries({ queryKey: ['legal-pending'] });
    };

    const handleAuthUpdated = () => {
      queryClient.invalidateQueries({ queryKey: ['session'] });
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      queryClient.invalidateQueries({ queryKey: ['legal-pending'] });
      queryClient.invalidateQueries({ queryKey: ['legal-my-acceptances'] });
      refetchSession();
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('logout-success', handleCustomLogout);
    window.addEventListener('session-invalidated', handleCustomLogout);
    window.addEventListener('login-success', handleAuthUpdated);
    window.addEventListener('session-updated', handleAuthUpdated);
    window.addEventListener('auth-changed', handleAuthUpdated);
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('logout-success', handleCustomLogout);
      window.removeEventListener('session-invalidated', handleCustomLogout);
      window.removeEventListener('login-success', handleAuthUpdated);
      window.removeEventListener('session-updated', handleAuthUpdated);
      window.removeEventListener('auth-changed', handleAuthUpdated);
    };
  }, [queryClient, refetchSession]);

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