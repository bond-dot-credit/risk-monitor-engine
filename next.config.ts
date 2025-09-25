import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  // swcMinify is not a valid option in Next.js 15
  images: {
    domains: [],
  },
  env: {
    // Environment variables will be set in Vercel dashboard
  },
  // Enable standalone build for Vercel
  output: 'standalone',
  // Disable ESLint during build for deployment
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Disable TypeScript type checking during build for deployment
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;