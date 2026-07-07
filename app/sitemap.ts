import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://oquartoelemento.com.br";

  const routes = ["", "/transmissoes", "/arquivos", "/relatos", "/linha-do-tempo", "/contato", "/explorar", "/transmissoes/top-10-desaparecimentos-mais-misteriosos"];

  return routes.map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "weekly",
    priority: route === "" ? 1 : 0.8,
  }));
}
