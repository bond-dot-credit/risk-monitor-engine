import type { NextConfig } from "next";

const isGithubActions = process.env.GITHUB_ACTIONS === 'true';
const isNetlify = process.env.NETLIFY === 'true';

// For Netlify, we don't need basePath
const basePath = isNetlify ? '' : (isGithubActions ? '/risk-monitor-engine' : '');
const assetPrefix = isNetlify ? '' : (isGithubActions ? '/risk-monitor-engine' : '');

// Disable image optimization for static export
const withExportImages = require('next-export-optimize-images');

const nextConfig: NextConfig = {
  // Core settings
  reactStrictMode: true,
  output: 'export',
  basePath: basePath,
  assetPrefix: assetPrefix,
  trailingSlash: true,
  
  // Image optimization
  images: {
    unoptimized: true,
    domains: [],
  },
  
  // Environment variables
  env: {
    NEXT_PUBLIC_BASE_PATH: isGithubActions ? '/risk-monitor-engine' : '',
  },
  
  // Build optimizations
  eslint: {
    ignoreDuringBuilds: true,
  },
  
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // Compiler options
  compiler: {
    removeConsole: process.env.NODE_ENV === 'production',
  },
  
  // Webpack configuration
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
        dns: false,
      };
    }
    return config;
  },
  
  // Disable server components for static export
  experimental: {
    serverComponentsExternalPackages: [],
  },
  
  // Static export settings
  generateBuildId: () => 'build',
  distDir: 'out',
  
  // Disable ETag generation
  generateEtags: false,
  
  // Disable X-Powered-By header
  poweredByHeader: false,
};

export default nextConfig;