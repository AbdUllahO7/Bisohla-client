import { Duration } from '../../duration';
import { env } from '../../env';

export interface SessionConfig {
  secretKey: string;
  algorithm: string;
  expirationTime: Duration;
  cookieMaxAge: Duration;
}

const defaultDuration = env('SESSION_EXPIRATION_TIME', Duration.parse('7d'), {
  parseDuration: true,
});

export const sessionConfig: SessionConfig = {
  secretKey:
    env('SESSION_SECRET_KEY', '') ||
    (() => {
      throw new Error(
        'SESSION_SECRET_KEY must be defined in environment variables',
      );
    })(),
  algorithm: env('SESSION_ALGORITHM', 'HS256'),
  expirationTime: defaultDuration,
  cookieMaxAge: defaultDuration,
};
