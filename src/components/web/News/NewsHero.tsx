import React from 'react';
import Image from 'next/image';
import { Sparkles } from 'lucide-react';

interface NewsHeroProps {
  title: string;
  description: string;
  subtitle: string;
}

export default function NewsHero({ title, description, subtitle }: NewsHeroProps) {
  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-primary via-primary to-primary-light">
      <div
        className="absolute top-0 right-0 w-96 h-96 bg-primary-foreground rounded-full opacity-10"
        style={{ transform: 'translate(30%, -30%)' }}
      />
      <div
        className="absolute bottom-0 left-0 w-80 h-80 bg-primary-foreground rounded-full opacity-10"
        style={{ transform: 'translate(-30%, 30%)' }}
      />

      <div className="relative max-w-7xl mx-auto py-20 px-4 md:px-6">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="text-white space-y-6 animate-fadeIn">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-primary-foreground/20 backdrop-blur-sm rounded-full">
              <Sparkles className="w-4 h-4 text-primary-foreground" />
              <span className="text-sm font-medium text-primary-foreground">
                {description}
              </span>
            </div>
            <h1 className="text-5xl md:text-6xl font-bold leading-tight">
              {title}
            </h1>
            <p className="text-xl text-white/90">{subtitle}</p>
          </div>
          <div
            className="relative animate-fadeIn"
            style={{ animationDelay: '0.2s' }}
          >
            <div className="absolute inset-0 bg-primary-foreground rounded-3xl opacity-20 blur-3xl" />
            <div className="relative transition-all duration-700 hover:scale-105">
              <Image
                src="/assets/images/3-car.png"
                alt="logo"
                width={500}
                height={500}
                className="relative transition-all duration-700 hover:scale-105 drop-shadow-2xl"
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
