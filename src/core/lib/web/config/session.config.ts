import { Duration } from '../../duration';
import { env } from '../../env';

export interface SessionConfig {
  secretKey: string;
  algorithm: string;
  expirationTime: Duration;
  cookieMaxAge: Duration;
}

export const sessionConfig: SessionConfig = {
  secretKey:
    env('SESSION_SECRET_KEY', '') ||
    (() => {
      throw new Error(
        'SESSION_SECRET_KEY must be defined in environment variables',
      );
    })(),
  algorithm: env('SESSION_ALGORITHM', 'HS256'),
  expirationTime: env('SESSION_EXPIRATION_TIME', Duration.parse('7d'), {
    parseDuration: true,
  }),
  cookieMaxAge: env('SESSION_COOKIE_MAX_AGE', Duration.parse('7d'), {
    parseDuration: true,
  }),
};
