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
// import { useLangContext } from '@/hooks';
import {
  Check,
  ChevronDown,
  PaintRoller,
  RollerCoaster,
  User,
} from 'lucide-react';

// Menu items.
const groups = [
  {
    label: 'Staff',
    items: [
      {
        title: 'Roles',
        url: '#',
        icon: PaintRoller,
        children: [
          {
            title: 'Roles List',
            url: '#',
            icon: RollerCoaster,
          },
          {
            title: 'Permissions List',
            url: '#',
            icon: Check,
          },
        ],
      },
      {
        title: 'Users',
        url: '#',
        icon: User,
      },
    ],
  },
];

const AdminSidebar = () => {
  const { open } = useSidebar();
  // const { direction } = useLangContext();

  return (
    <Sidebar
      variant="sidebar"
      collapsible="icon"
      title="admin-sidebar"
      side={'left'}
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
        {groups.map((group, key) => (
          <SidebarGroup key={key}>
            <SidebarGroupLabel className="text-sm tracking-widest">
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item, key) =>
                  item.children ? (
                    <Collapsible key={key} defaultOpen className="group">
                      <SidebarMenuItem key={item.title}>
                        <CollapsibleTrigger className="peer/menu-button flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left outline-none ring-sidebar-ring transition-[width,height,padding] focus-visible:ring-2 active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8 aria-disabled:pointer-events-none aria-disabled:opacity-50 data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium data-[active=true]:text-sidebar-accent-foreground data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2 [&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground h-8 text-sm">
                          <item.icon size="16" />
                          {open && (
                            <>
                              <Text variant="p">{item.title}</Text>
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
                          {item.children.map((child, key) => (
                            <Box
                              key={key}
                              className="w-full px-6 hover:bg-sidebar-accent "
                            >
                              <SidebarMenuItem className="w-full">
                                <SidebarMenuButton asChild>
                                  <a href={child.url}>
                                    <child.icon />

                                    <Text variant="p">{child.title}</Text>
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
                        <a href={item.url}>
                          <item.icon />

                          <Text variant="p" as={'span'}>
                            {item.title}
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
