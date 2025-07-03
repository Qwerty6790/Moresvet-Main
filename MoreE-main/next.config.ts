import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,
  serverExternalPackages: [],
  experimental: {
    // Убираем потенциально проблематичные экспериментальные функции
    esmExternals: true,
  },
  webpack: (config, { isServer, nextRuntime }) => {
    // Настройки для Edge Runtime
    if (nextRuntime === 'edge') {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        path: false,
        crypto: false,
      }
    }
    return config
  },
};

export default nextConfig;
