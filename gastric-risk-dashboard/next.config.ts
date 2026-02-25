import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  basePath: '/gastric-risk-manager',
  images: {
    unoptimized: true,
  },
};

export default nextConfig;
