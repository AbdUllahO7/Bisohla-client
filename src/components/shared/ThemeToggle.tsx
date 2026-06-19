'use client';

import { useTheme } from 'next-themes';
import { useEffect, useState } from 'react';
import { Sun, Moon } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function ThemeToggle() {
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) {
    return (
      <Button
        variant="ghost"
        size="sm"
        className="w-9 h-9 p-0 rounded-full border border-transparent"
        aria-label="Toggle theme"
      >
        <div className="w-5 h-5" />
      </Button>
    );
  }

  const currentTheme = theme === 'system' ? resolvedTheme : theme;
  const isDark = currentTheme === 'dark';

  return (
    <Button
      variant="ghost"
      size="sm"
      className="w-9 h-9 p-0 rounded-full border border-gray-200 dark:border-zinc-800 text-gray-600 dark:text-zinc-300 hover:bg-gray-100 dark:hover:bg-zinc-800 transition-all duration-300 flex items-center justify-center"
      onClick={() => setTheme(isDark ? 'light' : 'dark')}
      aria-label="Toggle theme"
    >
      <div className="relative w-5 h-5 flex items-center justify-center overflow-hidden">
        {/* Sun Icon */}
        <Sun className="w-5 h-5 text-amber-500 transition-all duration-500 rotate-0 scale-100 dark:-rotate-90 dark:scale-0 absolute" />
        {/* Moon Icon */}
        <Moon className="w-5 h-5 text-emerald-600 dark:text-emerald-400 transition-all duration-500 rotate-90 scale-0 dark:rotate-0 dark:scale-100 absolute" />
      </div>
    </Button>
  );
}
