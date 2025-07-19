import prodConfig from '@/../config.prod.json';
import devConfig from '@/../config.dev.json';

export const isProduction = process.env.NODE_ENV === 'production';

const config = isProduction ? prodConfig : devConfig;

// constants
export const BACKEND_URL = config.BACKEND_URL;
export const APP_URL = config.APP_URL;
