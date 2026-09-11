'use client';

import { PropsWithChildren } from 'react';
import { ThemeProvider } from './theme.provider';
import QueryProvider from './query.provider';
import ClientConfigProvider from './client-config.provider';
import NavigationProvider from './navigation.provider';
import { SettingsProvider } from './settings.provider';
import { ProfileProvider } from './profile.provider';
import { LegalGateProvider } from './legal-gate.provider';
import { CookieConsentProvider } from './cookie-consent.provider';
import { ApiResponse } from '@/core/entities/api/success.response';

interface GlobalProviderProps extends PropsWithChildren {
  initialSettings?: ApiResponse<any>;
}

const GlobalProvider = ({ children, initialSettings }: GlobalProviderProps) => {
  return (
    <QueryProvider>
      <SettingsProvider initialSettings={initialSettings}>
        <ProfileProvider>
          <LegalGateProvider>
            <CookieConsentProvider>
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
            </CookieConsentProvider>
          </LegalGateProvider>
        </ProfileProvider>
      </SettingsProvider>
    </QueryProvider>
  );
};

export default GlobalProvider;
