'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme.provider';
import QueryProvider from './query.provider';
import ClientConfigProvider from './client-config.provider';
import NavigationProvider from './navigation.provider';
import { SettingsProvider } from './settings.provider';
import { ProfileProvider } from './profile.provider';
import { LegalGateProvider } from './legal-gate.provider';

const GlobalProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryProvider>
      <SettingsProvider>
        <ProfileProvider>
          <LegalGateProvider>
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
          </LegalGateProvider>
        </ProfileProvider>
      </SettingsProvider>
    </QueryProvider>
  );
};

export default GlobalProvider;
