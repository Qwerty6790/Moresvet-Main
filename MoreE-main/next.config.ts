import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  serverExternalPackages: [],
  analytics: {
    vercelAnalytics: true,
  },
};

export default nextConfig;
