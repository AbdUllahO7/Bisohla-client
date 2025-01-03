import Box from '@/components/box/box';
import Logo from '@/components/logo';
import Text from '@/components/text/text';

import Image from 'next/image';
import { PropsWithChildren } from 'react';

const AdminAuthLayout = ({ children }: PropsWithChildren) => {
  return (
    <Box className="w-full h-[100vh] flex-col md:flex-row">
      {/* Left Section */}
      <Box className="w-[90%] md:w-[35%]">
        <Box className="flex-col w-full items-start">
          <Box className="p-8 gap-2 items-center">
            <Logo size="lg" />
            <Box>
              <Text
                variant="h1"
                className="text-primary-light tracking-wider capitalize text-2xl animate-typewriter overflow-hidden whitespace-nowrap border-r-4 border-primary lg:text-4xl"
              >
                Bishola
              </Text>
            </Box>
          </Box>
          <Box className="px-8">
            <Text variant="lead">Login to control and manage everything</Text>
          </Box>
          <Box className="w-full p-8">{children}</Box>
        </Box>
      </Box>

      {/* Right Section */}
      <Box className="w-[65%] h-[100vh] hidden md:flex">
        <Box className="w-full h-full overflow-hidden">
          <Image
            src="https://picsum.photos/920/800?random=1"
            alt="login page image"
            className="object-cover w-[110%] h-[110%] animate-projectImageAnimation"
            width={920}
            height={800}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default AdminAuthLayout;
