import { Duration } from '../../duration';
import { env } from '../../env';

export interface SessionConfig {
  secretKey: string;
  algorithm: string;
  /**
   * Upper bound only. The cookie's real lifetime comes from the backend refresh
   * token's own `exp` (see `resolveSessionExpiry`), so it can never outlive the
   * credentials it carries.
   */
  expirationTime: Duration;
}

const defaultDuration = env(
  'SESSION_SECRET_KEY_EXPIRATION_TIME',
  Duration.parse('7d'),
  { parseDuration: true },
);

export const sessionConfig: SessionConfig = {
  secretKey:
    env('SESSION_SECRET_KEY', '') ||
    (() => {
      throw new Error(
        'SESSION_SECRET_KEY must be defined in environment variables',
      );
    })(),
  algorithm: env('SESSION_SECRET_KEY_ALGORITHM', 'HS256'),
  expirationTime: defaultDuration,
};
