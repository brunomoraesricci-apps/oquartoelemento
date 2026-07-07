import type { MetadataRoute } from "next";
import { getContentAsync } from "@/lib/content";
import { SITE_URL } from "@/lib/seo";

function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const content = await getContentAsync();
  const now = new Date();

  const staticRoutes = [
    { path: "", priority: 1 },
    { path: "/transmissoes", priority: 0.9 },
    { path: "/arquivos", priority: 0.9 },
    { path: "/explorar", priority: 0.85 },
    { path: "/relatos", priority: 0.8 },
    { path: "/linha-do-tempo", priority: 0.8 },
    { path: "/contato", priority: 0.6 },
  ];

  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])]
    .filter(Boolean)
    .filter((item: any) => item.contentType !== "relato" && !String(item.category ?? "").toLowerCase().includes("relato"))
    .map((item: any) => ({
      path: `/transmissoes/${item.slug ?? slugify(item.title ?? item.code ?? "transmissao")}`,
      priority: 0.75,
    }));

  const archives = (content.archives ?? []).map((item: any) => ({
    path: `/arquivos/${item.slug ?? slugify(item.title ?? item.code ?? "arquivo")}`,
    priority: 0.75,
  }));

  const categories = (content.categories ?? []).map((item: any) => ({
    path: `/categorias/${item.slug ?? slugify(item.title ?? "categoria")}`,
    priority: 0.7,
  }));

  return [...staticRoutes, ...transmissions, ...archives, ...categories].map((route) => ({
    url: `${SITE_URL}${route.path}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: route.priority,
  }));
}
