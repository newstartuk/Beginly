import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  transpilePackages: ["recharts", "react-smooth"],
  webpack(config) {
    config.resolve.alias["react-is"] = path.join(__dirname, "node_modules/react-is");
    config.resolve.alias["object-assign"] = path.join(__dirname, "shims/object-assign.js");
    return config;
  },
  devIndicators: false,
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  trailingSlash: false,
  eslint: {
    // `next lint` has been deprecated/removed in recent Next versions.
    // Static type checking is run separately with `tsc --noEmit` in QA.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // CI should run `tsc --noEmit` separately. This avoids Next build hanging
    // in sandbox/Vercel-like environments during duplicated type validation.
    ignoreBuildErrors: true,
  },
  output: process.env.DEPLOY_TARGET === "namecheap" ? "standalone" : undefined,
};

export default nextConfig;
