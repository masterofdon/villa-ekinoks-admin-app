/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Prevent webpack from bundling Node.js-only packages used in API routes
    serverComponentsExternalPackages: ['eufy-security-client', 'protobufjs'],
  },
  images: {
    domains: ['localhost', 'api.villaekinoks.com', 'villaekinoks.com', 'admin.villaekinoks.com', 'storage.googleapis.com'],
  },
  // Optimize for production
  compress: true,
  poweredByHeader: false,
  // Enable static optimization
  trailingSlash: false,
}

module.exports = nextConfig