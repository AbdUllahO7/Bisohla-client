import { Session } from '@/core/entities/models/auth/session';
import { NextRequest } from 'next/server';

import { BACKEND_URL } from './constants';
import {
  isAccessTokenExpired,
  signSessionToken,
  SESSION_KEY,
  verifySessionToken,
} from './session.token';

/**
 * Refresh the backend tokens from MIDDLEWARE.
 *
 * Middleware is the only point on the request path that can both read the
 * incoming cookie and write a new one: a Server Component render gets a
 * read-only cookie store, so refreshing there would rotate the token
 * server-side and then fail to persist it — burning the session. Doing it here
 * means a page render always starts from a live access token, and a session
 * whose refresh token the backend has rejected (expired, or revoked by "sign
 * out my other devices") is signed out the moment the user opens the site.
 *
 * Returns the new cookie rather than writing it, because the caller has to
 * decide *how* to apply it — see `middleware.ts`.
 */

export type SessionRefreshOutcome =
  /** Nothing to do — no session, or the access token is still live. */
  | { status: 'untouched'; session: Session | null }
  /** Tokens were rotated; the caller must persist `cookie`. */
  | {
      status: 'refreshed';
      session: Session;
      cookie: { token: string; expiresAt: number };
    }
  /** The backend rejected the refresh token; the caller must clear the cookie. */
  | { status: 'expired'; session: null };

/**
 * Collapses concurrent refreshes of the SAME token, keyed by that token.
 *
 * This is a correctness guard, not an optimisation. The backend consumes a
 * replayed token from its grace window on first use, so the *third* concurrent
 * redemption of one token matches neither the live hash nor the grace list and
 * is classified as token reuse — which revokes the whole session. One page load
 * can easily emit three parallel requests, so without this a normal navigation
 * could sign the user out.
 */
const inFlight = new Map<string, Promise<SessionRefreshOutcome>>();

export const refreshSessionIfNeeded = async (
  req: NextRequest,
): Promise<SessionRefreshOutcome> => {
  const session = await verifySessionToken(req.cookies.get(SESSION_KEY)?.value);

  if (!session?.refreshToken || !isAccessTokenExpired(session.accessToken)) {
    return { status: 'untouched', session };
  }

  const key = session.refreshToken;
  const pending = inFlight.get(key);
  if (pending) return pending;

  const attempt = redeem(session).finally(() => inFlight.delete(key));
  inFlight.set(key, attempt);

  return attempt;
};

const redeem = async (session: Session): Promise<SessionRefreshOutcome> => {
  let backendRes: Response;
  try {
    backendRes = await fetch(BACKEND_URL + '/auth/refresh', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh: session.refreshToken }),
    });
  } catch {
    // Never reached the backend. A blip of downtime must not sign anyone out,
    // so keep the session and let the request through unchanged.
    return { status: 'untouched', session };
  }

  const data = await backendRes.json().catch(() => null);

  if (!backendRes.ok || !data?.success) {
    // Only an explicit rejection of the token itself ends the session; a
    // 5xx/429 is transient.
    if (backendRes.status === 401 || backendRes.status === 403) {
      return { status: 'expired', session: null };
    }
    return { status: 'untouched', session };
  }

  const { accessToken, refreshToken } = data.data as {
    accessToken: string;
    refreshToken: string;
  };

  // Rotation is unconditional server-side: dropping the new refresh token here
  // makes the NEXT refresh present a dead token and force a re-login.
  const refreshed: Session = { user: session.user, accessToken, refreshToken };

  return {
    status: 'refreshed',
    session: refreshed,
    cookie: await signSessionToken(refreshed),
  };
};
