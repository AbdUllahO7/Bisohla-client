import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';
import { PropsWithChildren } from 'react';

export async function generateMetadata(): Promise<Metadata> {
  return await generateSettingsBasedMetadata('privacy_policy');
}

const PrivacyPolicyPageLayout = ({ children }: PropsWithChildren) => {
  return <>{children}</>;
};

export default PrivacyPolicyPageLayout;
