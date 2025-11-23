import type { NextConfig } from "next";
import withPWA from "next-pwa";

const nextConfig: NextConfig = {
  /* config options here */
  reactCompiler: true,
  output: 'export', // Enable static export for Cloudflare Pages
  turbopack: {}, // Empty config to silence turbopack/webpack warning
  // Note: API routes are not supported in static export mode
  // All data operations now happen client-side via localStorage
};

export default withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
})(nextConfig);
