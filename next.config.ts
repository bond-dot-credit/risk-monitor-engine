import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  output: 'export',
  basePath: isGithubActions ? '/risk-monitor-engine' : '',
  assetPrefix: isGithubActions ? '/risk-monitor-engine/' : '',
  images: {
    unoptimized: true,
    domains: [],
  },
  env: {
    // Environment variables will be set in GitHub Actions
  },
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
  // Optimize for Vercel deployment
  // output: 'standalone',
  // Ensure proper CSS handling
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
};

export default nextConfig;