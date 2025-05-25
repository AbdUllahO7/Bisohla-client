import Box from '@/components/box/box';
import Text from '@/components/text/text';
import Image from 'next/image';
import { PropsWithChildren, Suspense } from 'react';
import Hero from './components/Hero';
import { useLocale } from 'next-intl';

const AuthLayout = ({ children }: PropsWithChildren) => {
  const locale = useLocale();
  const isRTL = locale === 'ar';

  return (
    <Box className={`w-full h-[100vh] flex-col md:flex-row ${isRTL ? 'rtl' : 'ltr'}`} dir={isRTL ? 'rtl' : 'ltr'}>
        
      {/* Left Section */}
      <Box className="lg:w-[90%]   md:w-[100%] xs:w-[100%] justify-center items-center">
        <Box className="flex-col w-full  items-center justify-center">
          <Box className="w-full  items-center justify-center">
            <Suspense fallback={<Text>Loading...</Text>}>{children}</Suspense>
          </Box>
        </Box>
      </Box>

      {/* Right Section */} 
      <Box className="w-[65%] hidden lg:flex bg-background">
        <Hero />
      </Box>
    </Box>
  );
};

export default AuthLayout;