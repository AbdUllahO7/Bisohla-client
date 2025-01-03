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

// axios.ts
// Refresh the token when 401 Unauthorized is received
// api.interceptors.response.use(
//   (response) => response,
//   async (error) => {
//     console.error('Error from axios interceptor:', error);
//     const originalRequest = error.config;

//     if (error.response?.status === 401 && !originalRequest._retry) {
//       console.log('Refreshing token...');
//       originalRequest._retry = true;

//       const session = await getSession();
//       if (!session?.refreshToken) {
//         return Promise.reject(error);
//       }

//       try {
//         const newAccessToken = await handleRefreshToken(session.refreshToken);
//         originalRequest.headers.Authorization = `Bearer ${newAccessToken}`;
//         return api(originalRequest);
//       } catch (refreshError) {
//         // Handle refresh token failure (e.g., logout user)
//         return Promise.reject(refreshError);
//       }
//     }

//     return Promise.reject(error);
//   },
// );
