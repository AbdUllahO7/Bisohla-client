'use client';

import type React from 'react';
import Box from '@/components/ui/box';
import Text from '@/components/ui/text';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { CheckCircle2, Mail, Phone, Calendar } from 'lucide-react';
import { useLocale, useTranslations } from 'next-intl';
import { PublicProfileData } from '@/core/entities/models/public-profile/public-profile.dto';
import ThemeToggle from '@/components/shared/ThemeToggle';

interface ProfileHeaderProps {
  profile: PublicProfileData;
  isLoading?: boolean;
  isOwnProfile?: boolean;
}

const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  profile,
  isLoading = false,
  isOwnProfile = false,
}) => {
  const t = useTranslations('publicProfile');
  const locale = useLocale();
  const isRTL = locale === 'ar';

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Format date
  const formatDate = (dateString: string) => {
    if (!dateString) return '';

    try {
      return new Date(dateString).toLocaleDateString(
        locale === 'ar' ? 'ar-SA' : 'en-US',
        {
          year: 'numeric',
          month: 'short',
        },
      );
    } catch (error) {
      console.error('Date formatting error:', error);
      return '';
    }
  };

  // Render skeleton loading state
  if (isLoading) {
    return (
      <Box className="w-full bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 md:p-8">
        <Box variant="row" className="gap-6 items-start">
          <Skeleton className="h-24 w-24 md:h-32 md:w-32 rounded-full" />
          <Box variant="column" className="flex-1 gap-4 items-start">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-4 w-32" />
            <div className="flex gap-4">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-24" />
            </div>
          </Box>
        </Box>
      </Box>
    );
  }

  return (
    <>
      {/* Mobile Layout */}
      <div className="md:hidden w-full">
        <div className="relative">
          {/* Outer glow effect */}
          {/* <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-2xl opacity-20 blur-xl"></div> */}

          <Box
            variant="center"
            className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-6 border-2 border-[#198341]/30 dark:border-zinc-800 overflow-hidden"
          >
            {/* Theme Toggle */}
            {isOwnProfile && (
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-20`}>
                <ThemeToggle />
              </div>
            )}

            {/* Decorative corner accents */}
            <div className="absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl from-[#198341]/20 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-[#ABDE3B]/20 to-transparent rounded-tr-full pointer-events-none"></div>

            {/* Content */}
            <Box variant="column" className="gap-6 items-center relative z-10">
              {/* Avatar */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-full opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                <Avatar className="relative h-24 w-24 border-4 border-white dark:border-zinc-800 shadow-xl">
                  <AvatarImage
                    src={profile.profileUrl || '/placeholder.svg'}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-2xl bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white font-bold">
                    {getUserInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-1 -right-1 bg-white dark:bg-zinc-900 rounded-full p-1 shadow-lg border dark:border-zinc-800">
                  <CheckCircle2 className="h-5 w-5 text-[#198341]" />
                </div>
              </div>

              {/* User Info */}
              <Box variant="column" className="gap-3 items-center text-center">
                <Box variant="row" className="gap-2 items-center">
                  <Text variant="h3" className="font-bold text-[#2C3C39] dark:text-white">
                    {profile.name}
                  </Text>
                  <Badge className="bg-[#198341] text-white border-0">
                    {t('verified')}
                  </Badge>
                </Box>

                {/* Contact Info */}
                <Box variant="column" className="gap-2 items-center">
                  {/* {profile.email && (
                    <Box variant="row" className="gap-2 items-center">
                      <Mail className="h-4 w-4 text-[#198341]" />
                      <Text variant="small" className="text-gray-600">
                        {profile.email}
                      </Text>
                    </Box>
                  )}
                  {profile.phone && (
                    <Box variant="row" className="gap-2 items-center">
                      <Phone className="h-4 w-4 text-[#198341]" />
                      <Text variant="small" className="text-gray-600">
                        {profile.phone}
                      </Text>
                    </Box>
                  )} */}
                  <Box variant="row" className="gap-2 items-center">
                    <Calendar className="h-4 w-4 text-[#198341] dark:text-[#ABDE3B]" />
                    <Text variant="small" className="text-gray-600 dark:text-zinc-300">
                      {t('memberSince')} {formatDate(profile.createdAt)}
                    </Text>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:block w-full">
        <div className="relative">
          {/* Outer glow effect */}
          {/* <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] via-[#ABDE3B] to-[#198341] rounded-2xl opacity-20 blur-xl"></div> */}

          <Box className="relative bg-white dark:bg-zinc-900 rounded-2xl shadow-xl p-8 border-2 border-[#198341]/30 dark:border-zinc-800 hover:border-[#198341] transition-all duration-300 overflow-hidden">
            {/* Theme Toggle */}
            {isOwnProfile && (
              <div className={`absolute top-4 ${isRTL ? 'left-4' : 'right-4'} z-20`}>
                <ThemeToggle />
              </div>
            )}

            {/* Decorative corner accents */}
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#198341]/20 to-transparent rounded-bl-full pointer-events-none"></div>
            <div className="absolute bottom-0 left-0 w-32 h-32 bg-gradient-to-tr from-[#ABDE3B]/20 to-transparent rounded-tr-full pointer-events-none"></div>

            {/* Content */}
            <Box variant="row" className="gap-8 items-start relative z-10">
              {/* Avatar */}
              <div className="relative group flex-shrink-0">
                <div className="absolute -inset-1 bg-gradient-to-r from-[#198341] to-[#ABDE3B] rounded-full opacity-30 blur-lg group-hover:opacity-50 transition-opacity duration-300"></div>
                <Avatar className="relative h-32 w-32 border-4 border-white dark:border-zinc-800 shadow-2xl">
                  <AvatarImage
                    src={profile.profileUrl || '/placeholder.svg'}
                    alt={profile.name}
                    referrerPolicy="no-referrer"
                  />
                  <AvatarFallback className="text-3xl bg-gradient-to-br from-[#198341] to-[#ABDE3B] text-white font-bold">
                    {getUserInitials(profile.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="absolute -bottom-2 -right-2 bg-white dark:bg-zinc-900 rounded-full p-1.5 shadow-lg border dark:border-zinc-800">
                  <CheckCircle2 className="h-6 w-6 text-[#198341]" />
                </div>
              </div>

              {/* User Info */}
              <Box variant="column" className="gap-4 flex-1 items-start">
                <Box variant="row" className="gap-3 items-center">
                  <Text variant="h2" className="font-bold text-[#2C3C39] dark:text-white">
                    {profile.name}
                  </Text>
                  <Badge className="bg-[#198341] text-white border-0 px-3 py-1">
                    {t('verified')}
                  </Badge>
                </Box>

                {/* Contact Info Grid */}
                <Box variant="row" className="gap-6 flex-wrap">
                  {/* {profile.email && (
                    <Box variant="row" className="gap-2 items-center group">
                      <div className="p-2 bg-[#198341]/10 dark:bg-emerald-950/20 rounded-lg group-hover:bg-[#198341]/20 dark:group-hover:bg-emerald-900/30 transition-colors duration-300">
                        <Mail className="h-5 w-5 text-[#198341]" />
                      </div>
                      <Box variant="column" className="gap-0.5">
                        <Text variant="small" className="text-gray-500 dark:text-zinc-400 text-xs">
                          {t('email')}
                        </Text>
                        <Text
                          variant="small"
                          className="text-gray-700 dark:text-zinc-200 font-medium"
                        >
                          {profile.email}
                        </Text>
                      </Box>
                    </Box>
                  )} */}
                  {/* {profile.phone && (
                    <Box variant="row" className="gap-2 items-center group">
                      <div className="p-2 bg-[#198341]/10 dark:bg-emerald-950/20 rounded-lg group-hover:bg-[#198341]/20 dark:group-hover:bg-emerald-900/30 transition-colors duration-300">
                        <Phone className="h-5 w-5 text-[#198341]" />
                      </div>
                      <Box variant="column" className="gap-0.5">
                        <Text variant="small" className="text-gray-500 dark:text-zinc-400 text-xs">
                          {t('phone')}
                        </Text>
                        <Text
                          variant="small"
                          className="text-gray-700 dark:text-zinc-200 font-medium"
                        >
                          {profile.phone}
                        </Text>
                      </Box>
                    </Box>
                  )} */}
                  <Box variant="row" className="gap-2 items-center group">
                    <div className="p-2 bg-[#198341]/10 dark:bg-emerald-950/20 rounded-lg group-hover:bg-[#198341]/20 dark:group-hover:bg-emerald-900/30 transition-colors duration-300">
                      <Calendar className="h-5 w-5 text-[#198341] dark:text-[#ABDE3B]" />
                    </div>
                    <Box variant="column" className="gap-0.5 items-start">
                      <Text variant="small" className="text-gray-500 dark:text-zinc-400 text-xs">
                        {t('memberSince')}
                      </Text>
                      <Text
                        variant="small"
                        className="text-gray-700 dark:text-zinc-200 font-medium"
                      >
                        {formatDate(profile.createdAt)}
                      </Text>
                    </Box>
                  </Box>
                </Box>
              </Box>
            </Box>
          </Box>
        </div>
      </div>
    </>
  );
};

export default ProfileHeader;
