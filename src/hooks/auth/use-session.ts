"use client"

import { Session } from "@/interfaces/session.interface"
import { getSession } from "@/lib/session"
import { useQuery } from "@tanstack/react-query"

interface SessionReturnType extends Session {
  isLoading: boolean
  isPending: boolean
  isError: boolean
  hasRole: (role: string) => boolean
  hasPermission: (permission: string) => boolean
  hasAnyPermission: (permissions: string[]) => boolean
  refetchSession: () => void
}

export const useSession = (): SessionReturnType => {
  const {
    data: session,
    refetch: refetchSession,
    isLoading,
    isPending,
    isError,
  } = useQuery({
    queryKey: ["session"],
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // Cache the session for 5 minutes
  })

  const defaultSession: SessionReturnType = {
    user: {
      id: 0,
      name: "",
      roles: [],
      permissions: [],
    },
    accessToken: "",
    refreshToken: "",
    isLoading,
    isPending,
    isError,
    hasRole: () => false,
    hasPermission: () => false,
    hasAnyPermission: () => false,
    refetchSession: () => {},
  }

  if (!session || isError) {
    return defaultSession
  }

  const hasRole = (role: string) => {
    if (!session?.user) return false
    return session.user.roles.includes(role) ?? false
  }

  const hasPermission = (permission: string) => {
    if (!session?.user) return false
    return session.user.permissions.includes(permission) ?? false
  }

  const hasAnyPermission = (permissions: string[]) => {
    return permissions.some((permission) => hasPermission(permission))
  }

  return {
    user: session.user,
    accessToken: session.accessToken,
    refreshToken: session.refreshToken,
    isLoading,
    isPending,
    isError,
    hasRole,
    hasPermission,
    hasAnyPermission,
    refetchSession, // Expose the refetch function
  }
}