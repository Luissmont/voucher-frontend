import type { NextConfig } from "next";

const isVercel = process.env.VERCEL === '1';

const nextConfig: NextConfig = {
  // Static export is needed for Capacitor (mobile). On Vercel we skip it
  // so that server-side rewrites (proxy) work.
  ...(isVercel ? {} : { output: 'export' }),

  // @ts-ignore - Next.js 15+ turbopack root config may not be fully typed yet
  turbopack: {
    root: process.cwd(),
  },

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
          destination: `${process.env.NEXT_PUBLIC_API_URL}/:path*`,
        },
      ];
    },
  }),
};

export default nextConfig;
