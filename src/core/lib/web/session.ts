'use server';

import { Session, UserSession } from '@/core/entities/models/auth/session';
import { cookies } from 'next/headers';
import {
  SESSION_COOKIE_OPTIONS,
  SESSION_KEY,
  signSessionToken,
  verifySessionToken,
} from './session.token';

export const createSession = async (payload: Session): Promise<void> => {
  try {
    const { token, expiresAt } = await signSessionToken(payload);

    (await cookies()).set(SESSION_KEY, token, {
      ...SESSION_COOKIE_OPTIONS,
      expires: new Date(expiresAt * 1000),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
};

/**
 * A Server Component render gets a READ-ONLY cookie store — `cookies().set()`
 * throws there, and only Server Actions / Route Handlers may write. That matters
 * because the backend rotates the refresh token on EVERY redemption: refreshing
 * from a context that cannot persist the result would burn the session's token
 * and force a re-login. Probed with a throwaway deletion (a no-op for a cookie
 * that was never set) rather than by rewriting the session cookie, which would
 * drop its `expires` and silently downgrade it to a browser-session cookie.
 */
export const canPersistSession = async (): Promise<boolean> => {
  try {
    (await cookies()).set('__session_probe', '', { maxAge: 0, path: '/' });
    return true;
  } catch {
    return false;
  }
};

export const getSession = async (): Promise<Session | null> =>
  verifySessionToken((await cookies()).get(SESSION_KEY)?.value);

export const getUserSession = async (): Promise<UserSession | null> => {
  const session = await getSession();
  if (!session?.user) return null;

  return {
    user: {
      id: session.user.id,
      name: session.user.name,
      roles: session.user.roles || [],
      permissions: session.user.permissions || [],
    },
  };
};

export const deleteSession = async () => {
  (await cookies()).set(SESSION_KEY, '', {
    ...SESSION_COOKIE_OPTIONS,
    maxAge: 0,
    expires: new Date(0),
  });
};

export const updateTokens = async ({
  accessToken,
  refreshToken,
}: {
  accessToken: string;
  refreshToken: string;
}) => {
  const payload = await verifySessionToken(
    (await cookies()).get(SESSION_KEY)?.value,
  );
  // Throw rather than no-op: the caller has already redeemed (and thereby
  // killed) the old refresh token, so a silent failure to store the new one
  // strands the session with a token that will be rejected next time.
  if (!payload) throw new Error('No valid session to attach tokens to');

  await createSession({
    user: { ...payload.user },
    accessToken,
    refreshToken,
  });
};
