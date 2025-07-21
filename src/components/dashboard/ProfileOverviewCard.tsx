// components/dashboard/ProfileOverviewCard.tsx
'use client';

import { Card, CardContent } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Mail, Phone, Calendar, Clock } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { GetUserProfile } from '@/core/entities/models/profile/user.profile.dto';
import { useEffect, useState } from 'react';
import { useDirection } from '@/hooks/use-direction';

interface ProfileOverviewCardProps {
  profile: GetUserProfile;
}

export function ProfileOverviewCard({ profile }: ProfileOverviewCardProps) {
  const t = useTranslations('UserProfile.home');
  const direction = useDirection();
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  // Format date with proper timezone handling
  const formatDate = (dateString: string) => {
    if (!dateString || !isClient) return '';

    try {
      return new Date(dateString).toLocaleDateString(
        direction === 'ltr' ? 'en-US' : 'ar-SA',
        {
          year: 'numeric',
          month: 'long',
          day: 'numeric',
          timeZone: 'UTC',
        },
      );
    } catch (error) {
      console.error('Date formatting error:', error);
      return dateString;
    }
  };

  // Get user initials for avatar fallback
  const getUserInitials = (name: string) => {
    if (!name) return 'U';
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Calculate account age in months
  const getAccountAge = () => {
    if (!profile?.createdAt || !isClient) return 0;

    try {
      return Math.floor(
        (new Date().getTime() - new Date(profile.createdAt).getTime()) /
          (1000 * 60 * 60 * 24 * 30),
      );
    } catch (error) {
      console.error('Account age calculation error:', error);
      return 0;
    }
  };

  return (
    <Card className="bg-gradient-to-r from-primary to-primary-light text-white border-0">
      <CardContent className="p-6">
        <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
          <Avatar className="h-20 w-20 border-4 border-white/20">
            <AvatarImage
              src={profile?.profileUrl || '/placeholder.svg'}
              alt={profile?.name || 'User'}
            />
            <AvatarFallback className="text-xl bg-primary-foreground text-primary">
              {getUserInitials(profile?.name || '')}
            </AvatarFallback>
          </Avatar>

          <div className="space-y-4 flex-1">
            <div>
              <h2 className="text-2xl font-bold">{profile?.name || ''}</h2>
              <div className="flex flex-col sm:flex-row sm:gap-6 text-white/80 mt-2">
                <div className="flex items-center gap-2">
                  <Mail className="h-4 w-4" />
                  <span>{profile?.email || ''}</span>
                </div>
                {profile?.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="h-4 w-4" />
                    <span>{profile.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4">
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 w-fit"
              >
                <Calendar className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                {t('memberSince')} {formatDate(profile?.createdAt || '')}
              </Badge>
              <Badge
                variant="secondary"
                className="bg-white/20 text-white hover:bg-white/30 w-fit"
              >
                <Clock className="h-3 w-3 mr-1 rtl:mr-0 rtl:ml-1" />
                {getAccountAge()} {t('months')}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
