// src/lib/auth-utils.ts
'use client';

/**
 * Trigger auth state change events to update UI components
 */
export const triggerAuthStateChange = () => {
  // Dispatch custom events to notify components about auth changes
  window.dispatchEvent(new CustomEvent('auth-changed'));
  window.dispatchEvent(new CustomEvent('login-success'));
  
  // Force a small delay to ensure all event listeners have time to process
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('session-updated'));
  }, 100);
};

/**
 * Trigger logout events to update UI components
 */
export const triggerLogoutStateChange = () => {
  // Dispatch custom events to notify components about logout
  window.dispatchEvent(new CustomEvent('auth-changed'));
  window.dispatchEvent(new CustomEvent('logout-success'));
  
  // Force a small delay to ensure all event listeners have time to process
  setTimeout(() => {
    window.dispatchEvent(new CustomEvent('session-cleared'));
  }, 100);
};

/**
 * Invalidate React Query auth-related caches
 */
export const invalidateAuthCaches = (queryClient: any) => {
  queryClient.invalidateQueries({ queryKey: ['session'] });
  queryClient.invalidateQueries({ queryKey: ['check-auth-user'] });
  queryClient.invalidateQueries({ queryKey: ['user'] });
  queryClient.removeQueries({ queryKey: ['session'] });
};

/**
 * Force refetch of session data
 */
export const refetchSessionData = (queryClient: any) => {
  queryClient.refetchQueries({ queryKey: ['session'] });
  queryClient.refetchQueries({ queryKey: ['check-auth-user'] });
};