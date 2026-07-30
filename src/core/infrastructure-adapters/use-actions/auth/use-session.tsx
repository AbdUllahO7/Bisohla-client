'use client';

import { UserSession } from '@/core/entities/models/auth/session';
import { getUserSession } from '@/core/lib/web/session';
import { useQuery } from '@tanstack/react-query';

interface SessionReturnType extends UserSession {
  isLoading: boolean;
  isPending: boolean;
  isError: boolean;
  hasRole: (role: string) => boolean;
  hasPermission: (permission: string) => boolean;
  hasAnyPermission: (permissions: string[]) => boolean;
  refetchSession: () => void;
}
export const useSession = (): SessionReturnType => {
  const {
    data: session,
    refetch: refetchSession,
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ['session'],
    queryFn: getUserSession,
    staleTime: 5 * 60 * 1000, // Cache the session for 5 minutes
  });

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
  };
};
