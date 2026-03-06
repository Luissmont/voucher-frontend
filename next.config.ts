import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // Static export is needed for Capacitor (mobile). On Vercel we skip it
  // so that server-side rewrites (proxy) work.
  ...(isVercel ? {} : { output: 'export' }),

  images: {
    unoptimized: true,
  },

  // Only active on Vercel: proxies /api-proxy/* → AWS backend (HTTP→HTTP server-side,
  // so the browser never sees the insecure HTTP call).
  ...(isVercel && {
    async rewrites() {
      return [
        {
          source: '/api-proxy/:path*',
          destination: `http://3.216.97.117:3000/api/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
