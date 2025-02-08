/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import Box from '@/components/box/box';
import Logo from '@/components/logo';
import Text from '@/components/text/text';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';

import {
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
  Sidebar,
  SidebarHeader,
  SidebarFooter,
  SidebarTrigger,
} from '@/components/ui/sidebar';
import { useDirection } from '@/hooks/use-direction';
// import { useLangContext } from '@/hooks';
import {
  // Check,
  ChevronDown,
  PaintRoller,
  RollerCoaster,
  User,
} from 'lucide-react';
import { useTranslations } from 'next-intl';

// Menu items.
const groups = {
  staff: {
    label: 'Staff',
    items: [
      {
        title: 'Roles and Permissions',
        url: '/permissions/roles-list',
        icon: PaintRoller,
        children: [
          {
            title: 'Roles List',
            url: '/permissions/roles-list',
            icon: RollerCoaster,
          },
        ],
      },
    ],
  },
  users: {
    label: 'Users',
    items: [
      {
        title: 'Users List',
        url: '/users',
        icon: User,
      },
    ],
  },
};

type GroupItem = {
  title: string;
  url: string;
  icon: React.FC<any>;
  children?: GroupItem[];
};

const AdminSidebar = () => {
  const { open } = useSidebar();
  const t = useTranslations('adminPage.sidebar.groups');
  const dir = useDirection();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      title="admin-sidebar"
      side={dir === 'rtl' ? 'right' : 'left'}
      aria-describedby="admin-sidebar"
      aria-description="admin-sidebar"
    >
      <SidebarHeader className="items-center justify-between flex-row">
        <Logo size={open ? 'md' : 'sm'} />
        {open && (
          <Box>
            <SidebarTrigger />
          </Box>
        )}
      </SidebarHeader>
      <SidebarContent>
        {Object.entries(groups).map(([groupKey, group]: [string, any], key) => (
          <SidebarGroup key={key}>
            <SidebarGroupLabel className="text-sm tracking-widest">
              {t(`${groupKey}.label`)}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item: GroupItem, key: number) =>
                  item.children ? (
                    <Collapsible key={key} defaultOpen className="group">
                      <SidebarMenuItem key={item.title}>
                        <CollapsibleTrigger className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm">
                          <item.icon size="16" />
                          {open && (
                            <>
                              <Text variant="p">
                                {t(`${groupKey}.items.${key}.title`)}
                              </Text>
                              <ChevronDown
                                size="16"
                                className="ml-auto transition-transform duration-200 group-data-[state=open]:rotate-180"
                              />
                            </>
                          )}
                        </CollapsibleTrigger>
                      </SidebarMenuItem>

                      {open && (
                        <CollapsibleContent className="overflow-hidden transition-all duration-300">
                          {item.children.map((child, childKey) => (
                            <Box
                              key={childKey}
                              className="w-full px-6 hover:bg-sidebar-accent"
                            >
                              <SidebarMenuItem className="w-full">
                                <SidebarMenuButton asChild>
                                  <a href={'/admin/dashboard' + child.url}>
                                    <child.icon />
                                    <Text variant="p">
                                      {t(
                                        `${groupKey}.items.${key}.children.${childKey}.title`,
                                      )}
                                    </Text>
                                  </a>
                                </SidebarMenuButton>
                              </SidebarMenuItem>
                            </Box>
                          ))}
                        </CollapsibleContent>
                      )}
                    </Collapsible>
                  ) : (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild>
                        <a href={'/admin/dashboard' + item.url}>
                          <item.icon />
                          <Text variant="p">
                            {t(`${groupKey}.items.${key}.title`)}
                          </Text>
                        </a>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  ),
                )}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
      <SidebarFooter></SidebarFooter>
    </Sidebar>
  );
};

export default AdminSidebar;
