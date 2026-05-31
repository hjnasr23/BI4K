const isGithubActions = process.env.GITHUB_ACTIONS || false;
const repo = 'BI4K';

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',
  basePath: isGithubActions ? `/${repo}` : '',
  images: {
    unoptimized: true,
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
