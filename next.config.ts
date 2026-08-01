import type { NextConfig } from "next";

// @sparticuz/chromium resolves its Chromium binary from bin/ at runtime, so the
// package must stay unbundled AND the .br archives have to be traced explicitly
// (file tracing can't see a path built at runtime).
const chromiumBin = ["./node_modules/@sparticuz/chromium/bin/**"];

const nextConfig: NextConfig = {
  serverExternalPackages: ["@sparticuz/chromium", "puppeteer-core"],
  outputFileTracingIncludes: {
    "/api/cotizaciones/[id]/pdf": chromiumBin,
    "/cotizaciones/[id]": chromiumBin,
  },
};

export default nextConfig;
