export interface DeepLinkMappingResult {
  /** The mobile deep link */
  deepLink: string | null;
  /** Original web URL */
  webUrl: string;
  /** Whether mapping was successful */
  success: boolean;
  /** Extracted parameters */
  params?: Record<string, any>;
}

export interface DeepLinkMapperConfig {
  /** Mobile app scheme (e.g., 'bishola') */
  appScheme: string;
}

/**
 * Convert web URL to mobile deep link
 * Based on the mobile app's routing structure
 */
export function mapWebUrlToDeepLink(
  webUrl: string,
  config: DeepLinkMapperConfig,
): DeepLinkMappingResult {
  try {
    const url = new URL(webUrl);
    const pathname = url.pathname;

    // Remove locale prefix (e.g., /en/, /ar/)
    const pathWithoutLocale = pathname.replace(/^\/(en|ar)/, '');

    // Extract query parameters
    const searchParams: Record<string, string> = {};
    url.searchParams.forEach((value, key) => {
      searchParams[key] = value;
    });

    // ========== Public Routes ==========

    // Home page -> Explore tab
    if (pathWithoutLocale === '/' || pathWithoutLocale === '') {
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
        webUrl,
        success: true,
      };
    }

    // Products listing -> Explore tab
    if (pathWithoutLocale === '/products') {
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
        webUrl,
        success: true,
      };
    }

    // Product detail page: /products/product/[id]
    const productMatch = pathWithoutLocale.match(
      /^\/products\/product\/(\d+)$/,
    );
    if (productMatch) {
      const productId = productMatch[1];
      return {
        deepLink: `${config.appScheme}://(screens)/CarDetailsScreen?id=${productId}&type=for_sale`,
        webUrl,
        success: true,
        params: { id: productId, type: 'for_sale' },
      };
    }

    // Edit Product: /products/EditProduct/[id] -> Update screen
    const editProductMatch = pathWithoutLocale.match(
      /^\/products\/EditProduct\/(\d+)$/,
    );
    if (editProductMatch) {
      const productId = editProductMatch[1];
      return {
        deepLink: `${config.appScheme}://(update)/Update?id=${productId}`,
        webUrl,
        success: true,
        params: { id: productId },
      };
    }

    // Add Products -> Add tab
    if (pathWithoutLocale === '/products/AddProducts') {
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/(add)/Add`,
        webUrl,
        success: true,
      };
    }

    // Product Success Page -> Navigate back to Explore
    if (pathWithoutLocale === '/products/AddProducts/ProductSuccessPage') {
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
        webUrl,
        success: true,
      };
    }

    // Contact Us
    if (pathWithoutLocale === '/ContactUs') {
      return {
        deepLink: `${config.appScheme}://(screens)/ContactUs`,
        webUrl,
        success: true,
      };
    }

    if (pathWithoutLocale === '/news') {
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/News`,
        webUrl,
        success: true,
      };
    }

    // TODO: add news details

    // Privacy Policy
    if (pathWithoutLocale === '/Privacypolicy') {
      // Screen doesn't exist in mobile yet, fallback to home
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
        webUrl,
        success: false,
      };
    }

    // Links page
    if (pathWithoutLocale === '/Links') {
      // Screen doesn't exist in mobile yet, fallback to home
      return {
        deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
        webUrl,
        success: false,
      };
    }

    // ========== Authentication Routes ==========

    if (pathWithoutLocale.startsWith('/auth/')) {
      const authPath = pathWithoutLocale.replace('/auth/', '');

      switch (authPath) {
        case 'sign-in':
          return {
            deepLink: `${config.appScheme}://(auth)/LoginScreen`,
            webUrl,
            success: true,
          };

        case 'register':
          return {
            deepLink: `${config.appScheme}://(auth)/SignupScreen`,
            webUrl,
            success: true,
          };

        case 'oauth-success':
          return {
            deepLink: `${config.appScheme}://(auth)/oauth-success`,
            webUrl,
            success: true,
          };

        case 'error':
          return {
            deepLink: `${config.appScheme}://(auth)/error`,
            webUrl,
            success: true,
          };

        case 'verify-email': {
          const verifyToken = searchParams.token;
          if (verifyToken) {
            return {
              deepLink: `${config.appScheme}://(auth)/LoginScreen?token=${verifyToken}`,
              webUrl,
              success: true,
              params: { token: verifyToken },
            };
          } else {
            return {
              deepLink: `${config.appScheme}://(auth)/LoginScreen`,
              webUrl,
              success: true,
            };
          }
        }

        case 'email-verified':
          // Redirect to login after email verification
          return {
            deepLink: `${config.appScheme}://(auth)/LoginScreen`,
            webUrl,
            success: true,
          };

        case 'send-reset-password-email':
          return {
            deepLink: `${config.appScheme}://(auth)/SendResetEmailScreen`,
            webUrl,
            success: true,
          };

        case 'reset-password': {
          const resetToken = searchParams.token;
          if (resetToken) {
            return {
              deepLink: `${config.appScheme}://(auth)/ResetPasswordScreen?token=${resetToken}`,
              webUrl,
              success: true,
              params: { token: resetToken },
            };
          } else {
            return {
              deepLink: `${config.appScheme}://(auth)/ResetPasswordScreen`,
              webUrl,
              success: true,
            };
          }
        }

        default:
          return {
            deepLink: null,
            webUrl,
            success: false,
          };
      }
    }

    // ========== User Profile Routes ==========

    if (pathWithoutLocale.startsWith('/userProfile')) {
      const profilePath = pathWithoutLocale.replace('/userProfile', '');

      switch (profilePath) {
        case '':
        case '/':
        case '/Home':
          // User home -> Profile tab
          return {
            deepLink: `${config.appScheme}://(screens)/(tabs)/(protected)/Profile`,
            webUrl,
            success: true,
          };

        case '/UserInfo':
          return {
            deepLink: `${config.appScheme}://(screens)/EditProfileScreen`,
            webUrl,
            success: true,
          };

        case '/Products':
          return {
            deepLink: `${config.appScheme}://(screens)/MyCarsScreen`,
            webUrl,
            success: true,
          };

        case '/Favorites':
          return {
            deepLink: `${config.appScheme}://(screens)/MyFavoriteScreen`,
            webUrl,
            success: true,
          };

        case '/Notification':
          return {
            deepLink: `${config.appScheme}://(screens)/NotificationScreen`,
            webUrl,
            success: true,
          };

        default:
          return {
            deepLink: null,
            webUrl,
            success: false,
          };
      }
    }

    // No matching route found - fallback to home
    return {
      deepLink: `${config.appScheme}://(screens)/(tabs)/Explore`,
      webUrl,
      success: false,
    };
  } catch (error) {
    // URL parsing failed
    return {
      deepLink: null,
      webUrl,
      success: false,
    };
  }
}
