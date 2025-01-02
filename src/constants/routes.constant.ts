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
        path: '/sign-in',
        pageName: 'SignIn',
      },
      register: {
        path: '/register',
        pageName: 'Register',
      },
    },
  },
  profile: {
    path: '/profile',
    children: {
      dashboard: {
        path: '/dashboard',
        pageName: 'User Dashboard',
      },
    },
  },
  admin: {
    path: '/admin',
    pageName: 'Admin',
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
  api: {
    auth: {
      signOut: {
        path: APP_URL + '/api/auth/signout',
      },
    },
  },
};
