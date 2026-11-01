import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
      // Import *.md as raw string so editing data/*.md hot-reloads the page
      "*.md": {
        condition: { not: "foreign" },
        type: "text",
      },
    },
  },
};

export default nextConfig;
