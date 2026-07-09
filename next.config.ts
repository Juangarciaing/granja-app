import type { NextConfig } from "next";
import withSerwistInit from "@serwist/next";

const withSerwist = withSerwistInit({
  swSrc: "app/sw.ts",
  swDest: "public/sw.js",
  // `dev` and `build` both run with `--webpack` (@serwist/next only ships a
  // webpack plugin; Next 16 defaults to Turbopack). Still disable the SW in
  // dev so caching does not interfere with hot reload — only prod builds
  // get a real service worker.
  disable: process.env.NODE_ENV !== "production",
});

const nextConfig: NextConfig = {
  /* config options here */
};

export default withSerwist(nextConfig);
