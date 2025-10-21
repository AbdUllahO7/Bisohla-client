"use client"

import { ReactNode } from 'react';

interface AnimatedPageWrapperProps {
  children: ReactNode;
}

export default function AnimatedPageWrapper({ children }: AnimatedPageWrapperProps) {
  return (
    <div className="relative w-full overflow-hidden bg-white">
      {/* Animated Background Layer */}
      <div className="fixed inset-0 -z-10 overflow-hidden pointer-events-none">
        {/* Large Floating Orbs */}
        <div 
          className="absolute top-0 left-0 w-[600px] h-[600px] rounded-full opacity-10 animate-float-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(25, 131, 65, 0.4) 0%, transparent 70%)',
          }}
        ></div>
        <div 
          className="absolute top-1/4 right-0 w-[800px] h-[800px] rounded-full opacity-10 animate-float-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(171, 222, 59, 0.4) 0%, transparent 70%)',
            animationDelay: '5s'
          }}
        ></div>
        <div 
          className="absolute bottom-0 left-1/3 w-[700px] h-[700px] rounded-full opacity-10 animate-float-slow"
          style={{ 
            background: 'radial-gradient(circle, rgba(44, 60, 57, 0.3) 0%, transparent 70%)',
            animationDelay: '10s'
          }}
        ></div>

        {/* Subtle Grid Pattern */}
        <div 
          className="absolute inset-0 opacity-[0.015]"
          style={{
            backgroundImage: `linear-gradient(rgba(25, 131, 65, 0.3) 1px, transparent 1px), linear-gradient(90deg, rgba(25, 131, 65, 0.3) 1px, transparent 1px)`,
            backgroundSize: '60px 60px'
          }}
        ></div>

        {/* Gradient Mesh */}
        <div 
          className="absolute inset-0 opacity-20"
          style={{
            background: `
              radial-gradient(at 20% 30%, rgba(171, 222, 59, 0.2) 0px, transparent 50%),
              radial-gradient(at 80% 70%, rgba(25, 131, 65, 0.2) 0px, transparent 50%),
              radial-gradient(at 40% 80%, rgba(44, 60, 57, 0.1) 0px, transparent 50%)
            `
          }}
        ></div>

        {/* Animated Sparkle Dots */}
        <div className="absolute top-[10%] left-[15%] w-2 h-2 rounded-full bg-primary-light opacity-40 animate-twinkle"></div>
        <div className="absolute top-[25%] right-[20%] w-3 h-3 rounded-full bg-primary-light opacity-30 animate-twinkle" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-[45%] left-[10%] w-2 h-2 rounded-full bg-primary-light opacity-35 animate-twinkle" style={{ animationDelay: '2s' }}></div>
        <div className="absolute top-[60%] right-[15%] w-3 h-3 rounded-full bg-primary-light opacity-40 animate-twinkle" style={{ animationDelay: '3s' }}></div>
        <div className="absolute top-[80%] left-[25%] w-2 h-2 rounded-full bg-primary-light opacity-30 animate-twinkle" style={{ animationDelay: '4s' }}></div>
        <div className="absolute bottom-[15%] right-[30%] w-3 h-3 rounded-full bg-primary-light opacity-35 animate-twinkle" style={{ animationDelay: '5s' }}></div>
      </div>

      {/* Content */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}