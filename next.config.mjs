/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    workerThreads: false,
    cpus: 1,
    // Force use of WebAssembly SWC instead of native binary
    swcMinify: false,
  },
  // Force Next.js to use the WebAssembly version of SWC
  swcMinify: false,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        net: false,
        tls: false,
      };
    }
    
    // Optimize build performance
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 1,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
        },
      },
    };

    return config;
  },
  images: {
    domains: ['localhost'],
    unoptimized: true
  },
  env: {
    NODE_OPTIONS: '--max-old-space-size=4096'
  }
};

export default nextConfig;