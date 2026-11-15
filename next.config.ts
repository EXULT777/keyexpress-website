import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Builds a self-contained server into .next/standalone. `npm run bundle` turns it
  // into the folder you upload to the hosting (see DEPLOY.md).
  output: "standalone",
  // This folder is the project, even when a parent folder has its own lockfile.
  outputFileTracingRoot: path.resolve(import.meta.dirname),
  poweredByHeader: false,
  // Services and Questions used to be pages of their own; they are now sections of the home page.
  async redirects() {
    return [
      { source: "/services", destination: "/#services", permanent: false },
      { source: "/faq", destination: "/#faq", permanent: false },
    ];
  },
  images: {
    // Only uploaded photos go through the image resizer, and never with a query string.
    localPatterns: [{ pathname: "/uploads/**", search: "" }],
  },
  experimental: {
    serverActions: {
      // Uploads are capped at exactly 2 MB in src/server/uploads.ts. This limit
      // only needs to leave room for the rest of the form around the file.
      bodySizeLimit: "3mb",
    },
  },
  turbopack: {
    root: path.resolve(import.meta.dirname),
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
