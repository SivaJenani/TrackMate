import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**.supabase.co",
      },
      {
        protocol: "https",
        hostname: "**.supabase.in",
      },
    ],
  },
  // Skip static prerendering for pages that use Supabase auth
  // These pages will be rendered on-demand
  experimental: {
    // Turbopack is used by default in dev
  },
};

export default nextConfig;
