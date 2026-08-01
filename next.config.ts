import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // @sparticuz/chromium ships a Chromium binary next to its JS. Bundling it
  // relocates the JS away from bin/, so the launcher can't find the binary.
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
};

export default nextConfig;
