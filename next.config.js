/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent webpack from bundling Node.js-only packages used in API routes
    serverComponentsExternalPackages: ['eufy-security-client', 'protobufjs'],
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'localhost' },
      { protocol: 'https', hostname: 'api.villaekinoks.com' },
      { protocol: 'https', hostname: 'villaekinoks.com' },
      { protocol: 'https', hostname: 'admin.villaekinoks.com' },
      { protocol: 'https', hostname: 'storage.googleapis.com' },
    ],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  trailingSlash: false,
}

module.exports = nextConfig