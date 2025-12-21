import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { getLocale } from 'next-intl/server';
import { checkAuth } from '@/core/infrastructure-adapters/actions/auth/auth.actions';
import { getUserProfileInfo } from '@/core/infrastructure-adapters/actions/visitors/public-profile.actions';
import { getSession } from '@/core/lib/web/session';
import ProfileClient from './profile-client';
import MobileProfileClient from './mobile-profile-client';
import { APP_URL } from '@/core/lib/web/constants';
import {
  generateProfileMetadata,
  generateSettingsBasedMetadata,
} from '@/utils/settings-metadata.utils';
import { logger } from '@/lib/logger';

interface ProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export async function generateMetadata({
  params,
}: ProfilePageProps): Promise<Metadata> {
  const { id } = await params;

  try {
    // Fetch user profile data
    const profileResponse = await getUserProfileInfo(Number(id));

    if (!profileResponse.success || !profileResponse.data) {
      // Fallback to settings-based metadata for user profile page
      return generateSettingsBasedMetadata('user_profile');
    }

    const locale = await getLocale();
    const profile = profileResponse.data;

    // Build absolute canonical URL
    const baseUrl = APP_URL;
    const canonicalPath = `${baseUrl}/${locale}/profile/${id}`;

    // Use the new generateProfileMetadata function with actual profile data
    return await generateProfileMetadata({
      name: profile.name,
      profileUrl: profile.profileUrl,
      totalListings: profile.totalListings,
      createdAt: profile.createdAt,
      canonical: canonicalPath,
    });
  } catch (error) {
    console.error('Error generating metadata:', error);
    return generateSettingsBasedMetadata('user_profile');
  }
}

const ProfilePage = async ({ params }: ProfilePageProps) => {
  const { id } = await params;

  try {
    // Get session and check auth
    const session = await getSession();
    const currentUserId = session?.user?.id;

    // Check authentication status
    const authResponse = await checkAuth();
    const isAuthenticated = authResponse.success;

    // Fetch user profile data
    const profileResponse = await getUserProfileInfo(Number(id));

    logger.log('Profile Response:', profileResponse);

    if (!profileResponse.success || !profileResponse.data) {
      notFound();
    }

    const locale = await getLocale();
    const isOwnProfile = currentUserId === Number(id);

    // Pass the fetched data to the client component
    return (
      <>
        {/* Desktop Version */}
        <div className="hidden md:block">
          <ProfileClient
            profileDataRes={profileResponse}
            isAuthenticated={isAuthenticated}
            locale={locale}
            isOwnProfile={isOwnProfile}
            userId={Number(id)}
          />
        </div>

        {/* Mobile Version */}
        <div className="block md:hidden">
          <MobileProfileClient
            profileDataRes={profileResponse}
            isAuthenticated={isAuthenticated}
            locale={locale}
            isOwnProfile={isOwnProfile}
            userId={Number(id)}
          />
        </div>
      </>
    );
  } catch (error) {
    console.error('Error in ProfilePage:', error);
    notFound();
  }
};

export default ProfilePage;
