/** @type {import('next').NextConfig} */
const nextConfig = {
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