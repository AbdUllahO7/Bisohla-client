'use client';

import LocaleSwitcher from '@/components/local/LocalSwitcher';
import { HeaderTowProps } from '@/types/homePageTypes';
import { MenuIcon, XCircleIcon } from 'lucide-react';
import Link from 'next/link';
import React, { useState } from 'react';


const HeaderTow: React.FC<HeaderTowProps> = ({ translations }) => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

    return (
        <nav className="bg-primary text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-center h-16">
                    <div className="hidden md:block">
                        <div className="flex space-x-4">
                            <Link href="/" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.home}
                            </Link>
                            <Link href="/rentProducts" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.rent}
                            </Link>
                            <Link href="/saleProducts" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.sale}
                            </Link>
                            {/* <Link href="#" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.news}
                            </Link> */}
                            <Link href="/products" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.BrowseAll}
                            </Link>
                            <Link href="/products/AddProducts" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.join}
                            </Link>
                        </div>
                    </div>
                    <div className="-mr-2 flex md:hidden">
                        <button
                            onClick={() => setIsOpen(!isOpen)}
                            className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-light transition-all focus:outline-none"
                        >
                            {isOpen ? (
                                <XCircleIcon />
                            ) : (
                                <MenuIcon />
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {isOpen && (
                <div className="md:hidden">
                    <div className="space-y-1 px-2 pt-2 pb-3 h-[300px] flex flex-col items-center absolute  bg-primary-dark w-full">
                            <Link href="#home" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.home}
                            </Link>
                            <Link href="#rent" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.rent}
                            </Link>
                            <Link href="#sale" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.sale}
                            </Link>
                            <Link href="#news" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.news}
                            </Link>
                            <Link href="#join" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                                {translations.join}
                            </Link>
                            <div className='xs:block hidden'>
                                <LocaleSwitcher/>
                            </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default HeaderTow;
