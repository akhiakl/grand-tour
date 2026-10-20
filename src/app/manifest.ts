import type { MetadataRoute } from "next";

/** Installable app metadata; colors are the light-theme paper and ink. */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Grand Tour",
    short_name: "Grand Tour",
    description:
      "Beautiful, interactive travel route maps, drawn by AI or by hand and shared with one link.",
    start_url: "/",
    display: "standalone",
    background_color: "#F5F1E8",
    theme_color: "#16233A",
    icons: [
      { src: "/icons/mark.svg", sizes: "any", type: "image/svg+xml" },
      { src: "/icons/192", sizes: "192x192", type: "image/png" },
      { src: "/icons/512", sizes: "512x512", type: "image/png" },
      {
        src: "/icons/512",
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      },
    ],
  };
}
