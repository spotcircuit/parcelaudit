import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  outputFileTracingRoot: "C:\\Users\\Big Daddy Pyatt\\CascadeProjects\\tools-data-saas\\parcelaudit",
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  },
  images: {
    domains: ['localhost'],
  },
  typescript: {
    ignoreBuildErrors: false,
  },
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;