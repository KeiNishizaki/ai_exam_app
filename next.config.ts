import type { NextConfig } from "next";
const nextConfig: NextConfig = {
  output: 'export',          // これが重要！
  images: { unoptimized: true },
};
export default nextConfig;