import { Session } from '@/core/entities/models/auth/session';
import { decodeJwt, jwtVerify, SignJWT } from 'jose';

import { sessionConfig } from './config/session.config';

/**
 * Signing/verification for the website's own session cookie, with NO dependency
 * on `next/headers`.
 *
 * Split out from `session.ts` because that file is `'use server'` and reads
 * cookies through `next/headers`, neither of which middleware can use — and
 * middleware needs the identical signing rules, or a cookie it writes would not
 * be readable by the server actions (and vice versa).
 */

export const SESSION_KEY = 'session';

export const SESSION_COOKIE_OPTIONS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
};

const encodedKey = new TextEncoder().encode(sessionConfig.secretKey);

/**
 * When this cookie should die, in epoch seconds.
 *
 * The cookie is only a wrapper around the backend's refresh token, so it must
 * not outlive it — otherwise the middleware (which validates ONLY this cookie,
 * with no network call) keeps reporting "signed in" long after the credentials
 * inside are dead, and the user lands on a logged-in-but-broken page. Read from
 * the refresh token's own `exp` rather than a locally configured duration, for
 * the same reason the backend derives `refreshSessions.expiresAt` that way: two
 * independently-configured lifetimes eventually disagree.
 *
 * `decodeJwt` does not verify — correct here, we are not the issuer and only
 * read a claim. The configured duration remains a defensive upper bound.
 */
export const resolveSessionExpiry = (refreshToken?: string): number => {
  const ceiling =
    Math.floor(Date.now() / 1000) + sessionConfig.expirationTime.toSeconds();

  if (!refreshToken) return ceiling;

  try {
    const { exp } = decodeJwt(refreshToken);
    return exp ? Math.min(exp, ceiling) : ceiling;
  } catch {
    return ceiling;
  }
};

export const signSessionToken = async (
  payload: Session,
): Promise<{ token: string; expiresAt: number }> => {
  const expiresAt = resolveSessionExpiry(payload.refreshToken);

  const token = await new SignJWT(payload)
    .setProtectedHeader({ alg: sessionConfig.algorithm })
    .setIssuedAt()
    .setExpirationTime(expiresAt)
    .sign(encodedKey);

  return { token, expiresAt };
};

export const verifySessionToken = async (
  token?: string,
): Promise<Session | null> => {
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, encodedKey, {
      algorithms: [sessionConfig.algorithm],
    });

    return payload as Session;
  } catch {
    return null;
  }
};

/**
 * Read the session straight off a request, for middleware — which cannot use
 * `next/headers`, and so cannot use `getSession()` from `session.ts`.
 */
export const getSessionFromRequest = (req: {
  cookies: { get: (name: string) => { value: string } | undefined };
}): Promise<Session | null> =>
  verifySessionToken(req.cookies.get(SESSION_KEY)?.value);

/** True once the backend access token inside the session has expired. */
export const isAccessTokenExpired = (accessToken?: string): boolean => {
  if (!accessToken) return true;

  try {
    const { exp } = decodeJwt(accessToken);
    // No `exp` claim means the backend signed it without one — treat as live
    // rather than refreshing on every single request.
    return exp ? exp <= Math.floor(Date.now() / 1000) : false;
  } catch {
    return true;
  }
};
