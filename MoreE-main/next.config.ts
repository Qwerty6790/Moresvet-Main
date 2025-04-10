import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  swcMinify: true,
  experimental: {
    // Позволяет применять use client к импортированным компонентам
    serverComponentsExternalPackages: [],
  }
};

export default nextConfig;
