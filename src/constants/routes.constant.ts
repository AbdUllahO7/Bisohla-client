// import { generateRoutes } from '@/lib/routes.utils';

import { APP_URL } from './constants';

// export const routes = generateRoutes();

// You can also add manual routes if needed
export const allRoutes = {
  // ...routes,
  home: {
    path: '/',
    pageName: 'Home',
  },
  auth: {
    children: {
      signIn: {
        path: '/auth/sign-in',
        pageName: 'SignIn',
      },
      register: {
        path: '/auth/register',
        pageName: 'Register',
      },
      verifyEmail: {
        path: '/auth/verify-email',
      },
      emailVerified: {
        path: '/auth/email-verified',
      },
      resetPassword: {
        path: '/auth/reset-password',
      },
      sendResetPasswordEmail: {
        path: '/auth/send-reset-password-email',
      },
    },
  },
  user: {
    // path: '/user',
    children: {
      dashboard: {
        path: '/user/dashboard',
        pageName: 'User Dashboard',
      },
    },
  },
  admin: {
    // path: '/admin',
    pageName: 'Admin',
    children: {
      auth: {
        children: {
          signIn: {
            path: '/admin/sign-in',
            pageName: 'Admin SignIn',
          },
          register: {
            path: '/admin/register',
            pageName: 'Admin Register',
          },
        },
      },
      dashboard: {
        path: '/admin/dashboard',
        pageName: 'Admin Dashboard',
      },
    },
  },
  api: {
    auth: {
      signOut: {
        path: APP_URL + '/api/auth/signout',
      },
    },
  },
};
