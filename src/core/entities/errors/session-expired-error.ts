/**
 * The backend rejected our refresh token itself (401/403), so the session is
 * unrecoverable and the cookie has been cleared.
 *
 * Deliberately distinct from a transient refresh failure (network drop, 5xx,
 * 429): those must leave the session intact, because a flaky connection is not
 * a sign-out.
 */
export class SessionExpiredError extends Error {
  constructor(message = 'Session expired') {
    super(message);
    Object.setPrototypeOf(this, SessionExpiredError.prototype);
    this.name = 'SessionExpiredError';
  }
}
