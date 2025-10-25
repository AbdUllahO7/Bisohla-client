'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme.provider';
import QueryProvider from './query.provider';
import ClientConfigProvider from './client-config.provider';
import NavigationProvider from './navigation.provider';
import { SettingsProvider } from './settings.provider';

const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <SettingsProvider>
        <NavigationProvider>
          <ClientConfigProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="system"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </ClientConfigProvider>
        </NavigationProvider>
      </SettingsProvider>
    </QueryProvider>
  );
};

export default GlobalProvider;
