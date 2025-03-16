import { env } from '../env';

export const BACKEND_URL = env(
  'NEXT_PUBLIC_BACKEND_URL',
  'http://localhost:4000/api/v1',
);

export const APP_URL = env('APP_URL', 'http://localhost:3000');

export const COOKIE_DOMAIN = env('COOKIE_DOMAIN', '');
