'use client';

import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';
import { useGetMyProfile } from '@/core/infrastructure-adapters/use-actions/users/user-profile.use-actions';
import { createContext, ReactNode, useContext } from 'react';

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
