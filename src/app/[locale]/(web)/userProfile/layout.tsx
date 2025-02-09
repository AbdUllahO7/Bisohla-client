'use client'
import UserSideBar from '@/components/web/UserProfilePage/UserSideBar';
import { Menu } from 'lucide-react';
import { ReactNode, useState } from 'react';

export default function UserProfileLayout({ children }: { children: ReactNode }) {
    const [openSideBar, setOpenSideBar] = useState(false);

    return (
        <div className="flex min-h-screen w-full bg-background overflow-hidden">
            {/* Sidebar - Always visible on md and larger screens */}
            <UserSideBar open={openSideBar} setOpen={setOpenSideBar} />

            <div className="flex flex-1 justify-start min-h-[100vh] items-start w-full relative mt-[53px] top-0">
                {/* Hide the toggle button on md+ screens */}
                <button
                    onClick={() => setOpenSideBar(true)}
                    className="block lg:hidden md:hidden sm:hidden w-[50px] p-2 top-0 min-h-[100vh] bg-primary text-white hover:bg-primary/90 transition-colors"
                >
                    <Menu />
                </button>

                <main className="p-4 md:p-6 w-full">
                    {children} {/* This will show the current page */}
                </main>
            </div>
        </div>
    );
}

