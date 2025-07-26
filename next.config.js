// next.config.js
/** @type {import('next').NextConfig} */
export default {
  trailingSlash: true,
  reactStrictMode: true,
  useFileSystemPublicRoutes: false,
  cacheMaxMemorySize: 512,
  compress: true,
  cleanDistDir: true,
  staticPageGenerationTimeout: 60,
  output: 'standalone',
  // swcMinify: true,
  experimental: {
    scrollRestoration: true,
    serverActions: {
      enabled: true,
    },
    // serverComponentsExternalPackages: ['@emotion/react'],
  },
  poweredByHeader: false,
  eslint: {
    ignoreDuringBuilds: true,
  },
  turbopack: {
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    unoptimized: true,
  },
  pageExtensions: ['js', 'jsx', 'ts', 'tsx'],
};