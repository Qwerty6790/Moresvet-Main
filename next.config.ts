import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: process.env.NODE_ENV === 'production',
  serverExternalPackages: [],
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
      };
    }
    
    // Оптимизация для уменьшения потребления памяти
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
          },
        },
      },
    };
    
    return config;
  },
  // Добавляем оптимизации для продакшена
  compress: true,
  poweredByHeader: false,
  generateEtags: false,
};

export default nextConfig;
