import type { NextConfig } from "next";

// Keep static generation within the memory budget of Windows/local CI hosts.
const nextConfig: NextConfig = {
  experimental: {
    cpus: 1,
    staticGenerationMaxConcurrency: 1,
  },
};

export default nextConfig;
