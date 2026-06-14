import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  trailingSlash: false,
  // Standalone ONLY for Namecheap cPanel Node.js (not Cloudflare Pages)
  // Cloudflare Pages does NOT need output:standalone — it serves Next.js natively
  output: process.env.DEPLOY_TARGET === "namecheap" ? "standalone" : undefined,
  // Put webpack cache OUTSIDE .next/ so Wrangler doesn't upload it (25 MiB limit)
  experimental: {
    webpackBuildCacheDir: path.join(__dirname, ".webpack-cache"),
  },
};
