import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'pbs.twimg.com',
      },
    ],
  },
  // Hacemos que Next.js funcione como un puente hacia Spring Boot
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'https://anime-backend-prod.onrender.com/api/:path*',
      },
    ];
  },
};

export default nextConfig;
