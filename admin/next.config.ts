import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [60, 75],
  },
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
