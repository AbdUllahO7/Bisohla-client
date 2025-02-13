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
      <Box className="lg:w-[90%]  md:w-[35%] justify-center items-center">
        <Box className="flex-col w-full  items-center justify-center">
          <Box className="p-8 gap-2 items-center justify-center">
            <Image 
              src="/assets/images/logo/bishola.png"
              alt='logo'
              width={100}
              height={100}
            />
          </Box>
          <Image
            src="/assets/images/3-car.png"
            alt="login page image"
            className="animate-fadeIn"
            width={500}
            height={500}
          />
          <Box className="px-8">
            <Text variant="lead">
              {isRTL ? 'تسجيل الدخول للتحكم وإدارة كل شيء' : 'Login to control and manage everything'}
            </Text>
          </Box>
          <Box className="w-full p-8 items-center justify-center">
            <Suspense fallback={<Text>Loading...</Text>}>{children}</Suspense>
          </Box>
        </Box>
      </Box>

      {/* Right Section */} 
      <Box className="w-[65%] h-[100vh] hidden md:flex bg-background">
        <Hero />
      </Box>
    </Box>
  );
};

export default AuthLayout;