import { generateSettingsBasedMetadata } from '@/utils/settings-metadata.utils';
import { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  return await generateSettingsBasedMetadata('contact_us');
}

export default function ContactUsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
