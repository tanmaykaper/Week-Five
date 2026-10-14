import type { NextConfig } from "next";

// GitHub Pages serves the site from /week-five; local dev serves from the root.
const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Dev-only pages (the QR generator) use the .dev.tsx extension and are left out of
// production builds unless NEXT_PUBLIC_DEV_PAGES=1.
const devPages = process.env.NODE_ENV !== "production" || process.env.NEXT_PUBLIC_DEV_PAGES === "1";

const config: NextConfig = {
  output: "export",
  basePath: basePath || undefined,
  assetPrefix: basePath || undefined,
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
  pageExtensions: devPages ? ["tsx", "ts", "dev.tsx"] : ["tsx", "ts"],
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  experimental: { optimizePackageImports: ["@phosphor-icons/react"] },
};

export default config;
