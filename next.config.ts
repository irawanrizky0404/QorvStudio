import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    // Mock imagery only. Phase 5 replaces these with Vercel Blob URLs.
    // See src/lib/mock-data/images.ts — swapping the source is one file.
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  // Off deliberately: every public href is locale-prefixed and built at runtime
  // (`/${locale}/work/${slug}`), which typedRoutes cannot narrow without casts
  // at each call site. The `href()` helper in lib/routes.ts is the guard instead.
  typedRoutes: false,
};

export default nextConfig;
