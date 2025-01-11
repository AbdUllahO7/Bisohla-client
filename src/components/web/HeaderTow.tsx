'use client';

import React, { useState } from 'react';

const HeaderTow: React.FC = () => {
    const [isOpen, setIsOpen] = useState<boolean>(false);

return (
    <nav className="bg-primary text-white mt-5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-center h-16">
            <div className="hidden md:block">
                <div className="flex space-x-4">
                <a href="#home" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                    Home
                </a>
                <a href="#about" className="hover:bg-primary-light transition-all px-3 py-2 rounded">
                    Rent
                </a>
                <a
                    href="#services"
                    className="hover:bg-primary-light transition-all px-3 py-2 rounded"
                >
                    Sale
                </a>
                <a
                    href="#contact"
                    className="hover:bg-primary-light transition-all px-3 py-2 rounded"
                >
                    News
                </a>
                <a
                    href="#contact"
                    className="hover:bg-primary-light transition-all px-3 py-2 rounded"
                >
                    Join
                </a>
                </div>
            </div>
            <div className="-mr-2 flex md:hidden">
                <button
                onClick={() => setIsOpen(!isOpen)}
                className="inline-flex items-center justify-center p-2 rounded-md text-white hover:bg-primary-light transition-all focus:outline-none"
                >
                <svg
                    className="h-6 w-6"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    {isOpen ? (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M6 18L18 6M6 6l12 12"
                    />
                    ) : (
                    <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M4 6h16M4 12h16m-7 6h7"
                    />
                    )}
                </svg>
                </button>
            
            </div>
                
            </div>
        </div>

        {isOpen && (
            <div className="md:hidden">
            <div className="space-y-1 px-2 pt-2 pb-3">
                <a
                href="#home"
                className="block px-3 py-2 rounded hover:bg-primary-light transition-all"
                >
                Home
                </a>
                <a
                href="#about"
                className="block px-3 py-2 rounded hover:bg-primary-light transition-all"
                >
                About
                </a>
                <a
                href="#services"
                className="block px-3 py-2 rounded hover:bg-primary-light transition-all"
                >
                Services
                </a>
                <a
                href="#contact"
                className="block px-3 py-2 rounded hover:bg-primary-light transition-all"
                >
                Contact
                </a>
            </div>
            </div>
        )}
    </nav>
);
};

export default HeaderTow;
