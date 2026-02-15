/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.openfoodfacts.org',
        port: '',
        pathname: '/images/products/**',
      },
    ],
  },

  async headers() {
    return [
      {
        // Cache static assets (images, fonts, icons) for 1 year
        source: '/:path(.+\\.(?:ico|png|jpg|jpeg|svg|webp|avif|gif|woff|woff2|ttf|eot)$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=31536000, immutable',
          },
        ],
      },
      {
        // Cache PDF and other downloadable files for 1 week
        source: '/:path(.+\\.pdf$)',
        headers: [
          {
            key: 'Cache-Control',
            value: 'public, max-age=604800, stale-while-revalidate=86400',
          },
        ],
      },
      {
        // Default: prevent iframe embedding for all routes + page caching
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors 'self'",
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
      {
        // allow iframe embedding for /embed/* routes
        source: '/embed/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: '',
          },
          {
            key: 'Content-Security-Policy',
            value: "frame-ancestors *; img-src 'self' https://*.openstreetmap.fr https://*.tile.openstreetmap.fr data:; style-src 'self' 'unsafe-inline'",
          },
        ],
      },
    ];
  },
};

module.exports = nextConfig;
