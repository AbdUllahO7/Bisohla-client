import prodConfig from '@/../config.prod.json';
import stagingConfig from '@/../config.staging.json';
import devConfig from '@/../config.dev.json';

// Use NEXT_PUBLIC_APP_ENV for client-side, APP_ENV for server-side
const APP_ENV = process.env.NEXT_PUBLIC_APP_ENV || process.env.APP_ENV;

export const isProduction = APP_ENV === 'production';
export const isStaging = APP_ENV === 'staging';

const config = isProduction
  ? prodConfig
  : isStaging
  ? stagingConfig
  : devConfig;

// constants
export const BACKEND_URL = config.BACKEND_URL;
export const APP_URL = config.APP_URL;
