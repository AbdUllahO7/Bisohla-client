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
    queryClient.invalidateQueries({ queryKey: ['session'] });
    queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
    queryClient.removeQueries({ queryKey: ['session'] });
  };

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