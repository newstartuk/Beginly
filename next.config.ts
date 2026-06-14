import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  outputFileTracingRoot: __dirname,
  trailingSlash: false,
  // Standalone ONLY for Namecheap cPanel Node.js (not Cloudflare Pages)
  // Cloudflare Pages does NOT need output:standalone — it serves Next.js natively
  output: process.env.DEPLOY_TARGET === "namecheap" ? "standalone" : undefined,
};

export default nextConfig;
