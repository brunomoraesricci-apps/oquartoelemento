export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

export function archivePath(archive: { slug?: string; title?: string; code?: string }) {
  return `/arquivos/${archive.slug || slugify(archive.title || archive.code || "arquivo")}`;
}

export function transmissionPath(video: { slug?: string; title?: string; code?: string }) {
  return `/transmissoes/${video.slug || slugify(video.title || video.code || "transmissao")}`;
}

export function categoryTransmissionPath(category: { slug?: string; title?: string } | string) {
  const slug = typeof category === "string" ? slugify(category) : category.slug || slugify(category.title || "categoria");
  return `/transmissoes?categoria=${slug}`;
}
