import type { NextConfig } from 'next';
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    domains: [
      'example.com',
      'res.cloudinary.com',
      'lh3.googleusercontent.com',
      'storage.bishola.com',
    ],

    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'loremflickr.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
      },
      {
        protocol: 'https',
        hostname: 'img.freepik.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn-icons-png.flaticon.com',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'pub-95b97c0514c8484495b7a3d11d85ebcc.r2.dev',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'storage.bishola.com',
        pathname: '/**',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
    optimizeCss: false,
  },
};

export default withNextIntl(nextConfig);
