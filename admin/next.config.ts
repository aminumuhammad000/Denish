import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
  },
  outputFileTracingRoot: path.join(__dirname, "./"),
  async rewrites() {
    const isProd = process.env.NODE_ENV === 'production';
    const apiUrl = 'https://denish-production.up.railway.app/api/:path*';
    
    return [
      {
        source: "/api/:path*",
        destination: apiUrl,
      },
    ];
  },

};


export default nextConfig;
