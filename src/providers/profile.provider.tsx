'use client';

import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';
import { useGetMyProfile } from '@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions';
import { createContext, ReactNode, useContext, useEffect } from 'react';
import { setupSyncListeners } from '@/utils/offline-favorites-manager';
import { useToast } from '@/hooks/use-toast';
import { useTranslations, useLocale } from 'next-intl';

interface ProfileContextType {
  profile: GetUserProfile | undefined;
  isLoading: boolean;
  error: Error | null;
  refetch: () => void;
}

// Create context
const ProfileContext = createContext<ProfileContextType | undefined>(undefined);

// Provider component
interface ProfileProviderProps {
  children: ReactNode;
}

export const ProfileProvider: React.FC<ProfileProviderProps> = ({
  children,
}) => {
  const { data: profile, isLoading, error, refetch } = useGetMyProfile();
  const { toast } = useToast();
  const t = useTranslations('UserProfile.favorites');
  const locale = useLocale();

  useEffect(() => {
    if (typeof window !== 'undefined' && profile?.data?.id) {
      localStorage.setItem('bishola_current_user_id', String(profile.data.id));
      const cleanup = setupSyncListeners(profile.data.id);
      return cleanup;
    }
  }, [profile]);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const handleOfflineToggled = (e: Event) => {
      const customEvent = e as CustomEvent;
      toast({
        title: customEvent.detail.isFavorited 
          ? (locale === 'ar' ? 'تمت الإضافة للمفضلة محلياً' : 'Added to favorites offline')
          : (locale === 'ar' ? 'تمت الإزالة من المفضلة محلياً' : 'Removed from favorites offline'),
        description: t('offline.savedOffline'),
      });
    };

    const handleSyncSuccess = () => {
      toast({
        title: locale === 'ar' ? 'مزامنة المفضلة' : 'Sync Favorites',
        description: t('offline.syncSuccess'),
      });
      refetch();
    };

    window.addEventListener('offline-favorite-toggled', handleOfflineToggled);
    window.addEventListener('offline-favorites-sync-success', handleSyncSuccess);

    return () => {
      window.removeEventListener('offline-favorite-toggled', handleOfflineToggled);
      window.removeEventListener('offline-favorites-sync-success', handleSyncSuccess);
    };
  }, [toast, t, locale, refetch]);

  const value: ProfileContextType = {
    profile: profile?.data,
    isLoading,
    error,
    refetch,
  };

  return (
    <ProfileContext.Provider value={value}>{children}</ProfileContext.Provider>
  );
};

// Hook to use the profile context
export const useProfileContext = (): ProfileContextType => {
  const context = useContext(ProfileContext);

  if (context === undefined) {
    throw new Error('useProfileContext must be used within a ProfileProvider');
  }

  return context;
};

// Convenience hook that matches your original pattern
export const useProfile = () => {
  const { profile } = useProfileContext();
  return { profile };
};
