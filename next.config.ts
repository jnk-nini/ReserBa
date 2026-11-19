import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  agentRules: false,
  partialPrefetching: true,
  // Security headers on every page.
  async headers() {
    return [
      {
        source: "/:path*",
        headers: [
          // Browsers always use HTTPS for this site from now on.
          { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains" },
          // No other site can show ReserBa inside a frame (stops click-jacking).
          { key: "X-Frame-Options", value: "DENY" },
          { key: "Content-Security-Policy", value: "frame-ancestors 'none'" },
          // Files are opened as the type the server says, never guessed.
          { key: "X-Content-Type-Options", value: "nosniff" },
          // Other sites are told only the domain a visitor came from, not the full address.
          { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
          // The app never needs the camera stream, microphone, or location.
          { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=()" },
        ],
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
