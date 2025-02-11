import { MessageCircle, LayoutDashboard, Network, ChartNoAxesCombined, Heart, User, LogOut } from 'lucide-react';
import { Fragment } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useRouter } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';

interface MenuItem {
    id: string;
    label: string;
    path: string;
    icon: JSX.Element;
    notifications?: number;
}


interface MenuItemsProps {
    setOpen?: (open: boolean) => void;
}

const MenuItems: React.FC<MenuItemsProps> = ({ setOpen }) => {
    const router = useRouter();
    const t = useTranslations('UserProfile');


    const adminSideBarMenuItems: MenuItem[] = [
        {
            id: 'home',
            label: t('SideBar.home'),
            path: '/userProfile/Home',
            icon: <LayoutDashboard />,
        },
        {
            id: 'products',
            label: t('SideBar.products'),
            path: '/userProfile/Products',
            icon: <Network />,
        },
        {
            id: 'favorites',
            label: t('SideBar.favorites'),
            path: '/userProfile/Favorites',
            icon: <Heart />,
            notifications: 0,
        },
        {
            id: 'messages',
            label: t('SideBar.messages'),
            path: '#',
            icon: <MessageCircle />,
            notifications: 0,
        },
        {
            id: 'userInfo',
            label: t('SideBar.userInfo'),
            path: '/userProfile/UserInfo',
            icon: <User />,
            notifications: 0,
        },
        {
            id: 'logout',
            label: t('SideBar.logout'),
            path: '#',
            icon: <LogOut />,
            notifications: 0,
        },
    ];
    return (
        <nav className="mt-8 flex flex-col gap-2">
            {adminSideBarMenuItems.map((menuItem) => (
                <div
                    key={menuItem.id}
                    onClick={() => {
                        router.push(menuItem.path);
                        if (setOpen) setOpen(false);
                    }}
                    className="text-white flex cursor-pointer items-center gap-2 rounded-md px-3 py-2 text-muted-foreground hover:bg-primary-light hover:text-foreground text-xl"
                >
                    {menuItem.icon}
                    <span>{menuItem.label}</span>
                </div>
            ))}
        </nav>
    );
};

interface UserSideBarProps {
    open: boolean;
    setOpen: (open: boolean) => void;
}

const UserSideBar: React.FC<UserSideBarProps> = ({ open, setOpen }) => {
    const router = useRouter();
    const locale = useLocale();
    const direction = locale === 'ar' ? 'rtl' : 'ltr'; // Determine direction


    
    return (
        <Fragment>
            {/* Mobile Sidebar */}
            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent side="left" className="w-64 bg-primary text-white">
                    <div className="flex flex-col h-full">
                        <SheetHeader className="border-b">
                            <SheetTitle className="flex gap-2 mt-5 mb-5">
                                <ChartNoAxesCombined size={30} />
                                <h1 className="text-2xl font-extrabold text-white">{direction === "ltr" ? 'User Panel' : 'لوحة المستخدم'}</h1>
                                </SheetTitle>
                        </SheetHeader>
                        <MenuItems setOpen={setOpen} />
                    </div>
                </SheetContent>
            </Sheet>

            {/* Desktop Sidebar */}
            <aside className="hidden lg:flex w-64 flex-col border-r bg-primary p-6  min-h-[100vh] top-0 mt-[50px] left-0 h-full">
                <div onClick={() => router.push('/userProfile')} className="flex cursor-pointer items-center gap-2">
                    <ChartNoAxesCombined size={30} />
                    <h1 className="text-2xl font-extrabold text-white">{direction === "ltr" ? 'User Panel' : 'لوحة المستخدم'}</h1>
                </div>
                <MenuItems />
            </aside>
        </Fragment>
    );
};

export default UserSideBar;
