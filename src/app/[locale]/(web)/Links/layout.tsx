import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await generateSettingsBasedMetadata('links');
}

export default function LinksLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
