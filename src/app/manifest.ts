import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "PARFS — Maison de Parfum",
    short_name: "PARFS",
    description: "Scent for every soul: eaux de parfum and extraits in weighted glass and solid brass.",
    start_url: "/",
    display: "standalone",
    background_color: "#f3eee6",
    theme_color: "#0a0a0b",
    icons: [{ src: "/icon.svg", sizes: "any", type: "image/svg+xml" }],
  };
}
