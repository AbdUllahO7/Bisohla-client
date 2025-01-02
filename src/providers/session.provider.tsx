// context/SessionContext.tsx
'use client';

import React, { createContext, useContext } from 'react';
import { getSession } from '@/lib/session';
import { Session } from '@/interfaces/session.interface';
import { useQuery } from '@tanstack/react-query';

interface SessionContextProps {
  session?: Session | null;
  refetchSession: () => void;
}

const SessionContext = createContext<SessionContextProps | undefined>(
  undefined,
);

export const SessionProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const { data: session, refetch: refetchSession } = useQuery({
    queryKey: ['session'],
    queryFn: getSession,
    staleTime: 5 * 60 * 1000, // Cache the session for 5 minutes
  });

  return (
    <SessionContext.Provider value={{ session, refetchSession }}>
      {children}
    </SessionContext.Provider>
  );
};

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};
