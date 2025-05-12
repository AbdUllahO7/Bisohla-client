import axios from 'axios';
import { getSession } from './session';
// import { handleRefreshToken } from '@/services/auth.service';

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true,
  validateStatus: (status) => {
    if (status >= 500) {
      console.error(`API request failed with status code ${status}`);
      return true;
    }
    if (status === 401) {
      console.log('Unauthorized. Refreshing token...');
      return true;
    }
    return true;
  },
});

api.interceptors.request.use(
  async (config) => {
    // Get token from wherever you store it (localStorage, cookie, etc)
    const session = await getSession();
    const token = session?.accessToken;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  },
);
