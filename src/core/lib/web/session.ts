'use server';

import { Session, UserSession } from '@/core/entities/models/auth/session';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { sessionConfig } from './config/session.config';

const encodedKey = new TextEncoder().encode(sessionConfig.secretKey);
const SESSION_KEY = 'session';

const COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

export const createSession = async (payload: Session): Promise<void> => {
  try {
    const session = await new SignJWT(payload)
      .setProtectedHeader({ alg: sessionConfig.algorithm })
      .setIssuedAt()
      .setExpirationTime(
        Math.floor(Date.now() / 1000) +
          sessionConfig.expirationTime.toSeconds(),
      )
      .sign(encodedKey);

    (await cookies()).set(SESSION_KEY, session, {
      ...COOKIE_OPTIONS,
      expires: new Date(
        Date.now() + sessionConfig.cookieMaxAge.toMilliseconds(),
      ),
    });
  } catch (error) {
    console.error('Error creating session:', error);
    throw new Error('Failed to create session');
  }
};

export const getSession = async (): Promise<Session | null> => {
  const sessionCookie = (await cookies()).get(SESSION_KEY);

  if (!sessionCookie?.value) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(sessionCookie.value, encodedKey, {
      algorithms: [sessionConfig.algorithm],
    });

    return payload as Session;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
};

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
    ...COOKIE_OPTIONS,
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
  const cookie = (await cookies()).get(SESSION_KEY)?.value;
  if (!cookie) return null;

  try {
    const { payload } = await jwtVerify<Session>(cookie, encodedKey, {
      algorithms: [sessionConfig.algorithm],
    });

    if (!payload) throw new Error('Session not found');

    const newPayload: Session = {
      user: {
        ...payload.user,
      },
      accessToken,
      refreshToken,
    };
    await createSession(newPayload);
  } catch (error) {
    console.error('Error updating tokens:', error);
    await deleteSession();
    throw error;
  }
};
