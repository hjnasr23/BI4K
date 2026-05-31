/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tse3.mm.bing.net',
      },
      {
        protocol: 'https',
        hostname: '*.bing.net',
      },
      {
        protocol: 'https',
        hostname: 'dynamicmockups.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.googleusercontent.com',
      }
    ],
  },
};

export default nextConfig;
