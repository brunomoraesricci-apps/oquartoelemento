import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "O Quarto Elemento",
    short_name: "Quarto Elemento",
    description: "Arquivo digital de mistérios, casos reais e relatos proibidos.",
    start_url: "/",
    display: "standalone",
    background_color: "#050302",
    theme_color: "#050302",
  };
}
