'use client';

import Box from '@/components/box/box';
import MenuButton from '@/components/menu-button';
import { ModeToggle } from '@/components/mode-toggle';

import { SidebarTrigger, useSidebar } from '@/components/ui/sidebar';
import { allRoutes } from '@/constants/routes.constant';
import { SettingsIcon } from 'lucide-react';

const AdminNavbar = () => {
  const { open } = useSidebar();

  return (
    <Box className="w-full pb-10 pt-4 bg-primary-dark border-b-2 ">
      <Box variant="container">
        <Box className="w-full justify-between">
          <Box className="hidden md:flex">{!open && <SidebarTrigger />}</Box>
          <Box className="flex md:hidden">
            <SidebarTrigger />
          </Box>
          <Box className="px-4 py-2">
            <ModeToggle />
            {/* <LangToggle /> */}
            <MenuButton
              triggerLabel={<SettingsIcon />}
              // className='cursor-pointer'
              items={[
                {
                  label: 'Website',
                  type: 'link',
                  href: allRoutes.home.path,
                },
                {
                  label: 'Signout',
                  type: 'link',
                  href: allRoutes.api.auth.signOut.path,
                },
              ]}
            />
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default AdminNavbar;
