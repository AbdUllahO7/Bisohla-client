'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme.provider';
import QueryProvider from './query.provider';
import ClientConfigProvider from './client-config.provider';
import { SessionProvider } from './session.provider';

const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <ClientConfigProvider>
      <QueryProvider>
        <SessionProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
        </SessionProvider>
      </QueryProvider>
    </ClientConfigProvider>
  );
};

export default GlobalProvider;
