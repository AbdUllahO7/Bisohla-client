'use server';

import { Session } from '@/core/entities/models/auth/session';
import { jwtVerify, SignJWT } from 'jose';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { sessionConfig } from './config/session.config';
import { COOKIE_DOMAIN } from './constants';

const encodedKey = new TextEncoder().encode(sessionConfig.secretKey);
const SESSION_KEY = 'session';

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

    console.log('create session 1');

    (await cookies()).set(SESSION_KEY, session, {
      httpOnly: true,
      secure: true, //TODO: convert to process.env.NODE_ENV === 'production'
      expires: new Date(
        Date.now() + sessionConfig.cookieMaxAge.toMilliseconds(),
      ),
      sameSite: 'lax',
      path: '/',
      domain: COOKIE_DOMAIN,
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
    (await cookies()).delete(SESSION_KEY);
    redirect('/');
  }
};

export const deleteSession = async () => {
  (await cookies()).delete(SESSION_KEY);
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

  const { payload } = await jwtVerify<Session>(cookie, encodedKey);

  if (!payload) throw new Error('Session not found');

  const newPayload: Session = {
    user: {
      ...payload.user,
    },
    accessToken,
    refreshToken,
  };
  await createSession(newPayload);
};
