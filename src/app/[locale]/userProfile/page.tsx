// app/[locale]/userProfile/page.tsx
import UserHomePage from '@/components/dashboard/UserHomePage';
import React from 'react';
import type { Metadata } from 'next';
import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';

export async function generateMetadata(): Promise<Metadata> {
  try {
    return await generateSettingsBasedMetadata('profile');
  } catch {
    return {
      title: 'Dashboard',
      description: 'Manage your account, products, and preferences',
    };
  }
}

async function UserProfilePage() {
  return <UserHomePage />;
}

export default UserProfilePage;
