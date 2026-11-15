import type { MetadataRoute } from "next";

// What a phone reads when a resident adds ReserBa to the home screen: the
// name, the colours, and the icons. With this the site opens full screen like
// an app, without the browser bar.
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ReserBa",
    short_name: "ReserBa",
    description: "Book the clubhouse, court, or pool of your subdivision.",
    start_url: "/home",
    display: "standalone",
    background_color: "#f4f2ed",
    theme_color: "#14392d",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
