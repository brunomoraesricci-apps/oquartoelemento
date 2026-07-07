import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "O Quarto Elemento",
    short_name: "Quarto Elemento",
    description: "Arquivo digital investigativo de mistérios, transmissões, dossiês e relatos classificados.",
    start_url: "/",
    display: "standalone",
    background_color: "#050302",
    theme_color: "#050302",
    lang: "pt-BR",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png" },
    ],
  };
}
