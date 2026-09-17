import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  allowedDevOrigins: [
    "infanimetv.vercel.app",
    "localhost:3000"
  ],
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
