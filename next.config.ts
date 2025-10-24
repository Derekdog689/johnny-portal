import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Optional: other config settings can go here

  eslint: {
    ignoreDuringBuilds: true, // ✅ allows deploys even with lint errors
  },
};

export default nextConfig;
