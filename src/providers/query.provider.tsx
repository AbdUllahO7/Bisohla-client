'use client';

import { allRoutes } from '@/constants/routes.constant';
// next-intl's router, not next/navigation's — the plain one would drop the
// active locale and bounce an Arabic visitor onto the default-locale sign-in.
import { useRouter } from '@/i18n/routing';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { PropsWithChildren, useEffect } from 'react';

const client = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 60 * 1000,
      gcTime: 5 * 60 * 1000,
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

/**
 * A backend 401 resolves as `{ success: false }` rather than rejecting, so
 * React Query reports no error and every screen would render its own empty
 * state instead ("profile not found"). `makeRequest` flags the one case that is
 * not a per-call failure — the refresh token itself was rejected and the cookie
 * is already cleared server-side — and this turns it into an actual sign-out.
 * Watched centrally so no individual query has to remember to handle it.
 */
const SessionExpiryWatcher = () => {
  const router = useRouter();

  useEffect(
    () =>
      client.getQueryCache().subscribe((event) => {
        const data = event.query.state.data as
          | { sessionExpired?: boolean }
          | undefined;

        if (!data?.sessionExpired) return;

        client.clear();
        router.replace(allRoutes.auth.children.signIn.path);
      }),
    [router],
  );

  return null;
};

const QueryProvider = ({ children }: PropsWithChildren) => {
  return (
    <QueryClientProvider client={client}>
      <SessionExpiryWatcher />
      {children}
    </QueryClientProvider>
  );
};

export default QueryProvider;
