import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  /* config options here */
  allowedDevOrigins: [
    "carry-experiments-electro-represented.trycloudflare.com",
    'program-taste-quickstep.ngrok-free.dev'],
  // Hacemos que Next.js funcione como un puente hacia Spring Boot
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://localhost:8080/api/:path*',
      },
    ];
  },
};

export default nextConfig;
