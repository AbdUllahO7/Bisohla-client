'use client';

import { useEffect, useState } from 'react';
import { ArrowUp } from 'lucide-react';

interface BackToTopProps {
  locale: string;
}

export default function BackToTop({ locale }: BackToTopProps) {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.pageYOffset > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener('scroll', toggleVisibility);

    return () => {
      window.removeEventListener('scroll', toggleVisibility);
    };
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={`fixed bottom-8 ${locale === 'ar' ? 'left-8' : 'right-8'} z-50 p-4 rounded-full shadow-2xl transition-all duration-500 hover:scale-110 group ${
        isVisible ? 'opacity-100 visible translate-y-0' : 'opacity-0 invisible translate-y-10'
      }`}
      style={{
        background: 'linear-gradient(135deg, #198341 0%, #2C3C39 100%)',
      }}
      aria-label={locale === 'ar' ? 'العودة إلى الأعلى' : 'Back to top'}
    >
      <ArrowUp 
        className="w-6 h-6 text-white transition-transform duration-300 group-hover:-translate-y-1" 
      />
      
      {/* Ripple Effect on Hover */}
      <span 
        className="absolute inset-0 rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'radial-gradient(circle, rgba(171, 222, 59, 0.3) 0%, transparent 70%)',
        }}
      />
    </button>
  );
}