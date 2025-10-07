import prodConfig from '@/../config.prod.json';
import stagingConfig from '@/../config.staging.json';
import devConfig from '@/../config.dev.json';

export const isProduction = process.env.APP_ENV === 'production';
export const isStaging = process.env.APP_ENV === 'staging';

const config = isProduction
  ? prodConfig
  : isStaging
  ? stagingConfig
  : devConfig;

// constants
export const BACKEND_URL = config.BACKEND_URL;
export const APP_URL = config.APP_URL;
