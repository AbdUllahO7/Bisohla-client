'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme.provider';
import QueryProvider from './query.provider';
import ClientConfigProvider from './client-config.provider';
import NavigationProvider from './navigation.provider';

const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <NavigationProvider>
      <ClientConfigProvider>
        <QueryProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </QueryProvider>
      </ClientConfigProvider>
    </NavigationProvider>
  );
};

export default GlobalProvider;
