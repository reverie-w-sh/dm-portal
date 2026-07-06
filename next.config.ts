import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "dm-game.com",
      },
    ],
  },
};

export default nextConfig;
