export const CONTENT_SCHEMA_VERSION = "6.1.0";

export const CATEGORY_OPTIONS = [
  "OVNIs e Fenômenos",
  "Desaparecimentos",
  "Lendas e Mitos",
  "Civilizações Perdidas",
  "Relatos Proibidos",
  "Deep Web",
  "Relatos",
];

export const STATUS_OPTIONS = ["Publicado", "Rascunho", "Oculto", "Em análise", "Recebido"];
export const CONTENT_TYPE_OPTIONS = ["transmissao", "relato", "short", "especial"];
export const CLASSIFICATION_OPTIONS = ["Desclassificado", "Confidencial", "Restrito", "Ultrassecreto", "Arquivo incompleto", "Em investigação"];

export type SeoFields = {
  seoTitle?: string;
  seoDescription?: string;
  ogImage?: string;
};

export type AutomationFields = {
  aiGenerated?: boolean;
  aiReviewed?: boolean;
  aiNotes?: string;
  aiSourceUrl?: string;
};

function compactArray(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function withSeoDefaults<T extends Record<string, any>>(item: T): T & SeoFields & AutomationFields {
  return {
    ...item,
    seoTitle: item.seoTitle ?? item.title ?? "",
    seoDescription: item.seoDescription ?? item.summary ?? item.description ?? "",
    ogImage: item.ogImage ?? item.image ?? "",
    aiGenerated: Boolean(item.aiGenerated),
    aiReviewed: Boolean(item.aiReviewed),
    aiNotes: item.aiNotes ?? "",
    aiSourceUrl: item.aiSourceUrl ?? "",
  };
}

export function normalizeContent(content: any) {
  const next = structuredClone(content ?? {});

  next.schemaVersion = next.schemaVersion ?? CONTENT_SCHEMA_VERSION;
  next.automation = next.automation ?? {
    enabled: false,
    provider: "manual",
    lastRunAt: "",
    notes: "Campos preparados para futura automação com IA no Admin.",
  };

  next.categories = (next.categories ?? []).map((category: any, index: number) => ({
    ...withSeoDefaults(category),
    status: category.status ?? (category.active === false ? "Oculto" : "Publicado"),
    order: category.order ?? index + 1,
    active: category.active !== false,
  }));

  const legacyReportsAsVideos = (next.relatos ?? []).map((report: any, index: number) => ({
    code: report.code ?? `RP-${String(index + 1).padStart(3, "0")}`,
    title: report.title ?? "Relato",
    slug: report.slug ?? report.relatedTransmissionSlug ?? `relato-${index + 1}`,
    description: report.description ?? report.subtitle ?? "Relato catalogado no acervo.",
    image: report.image ?? "",
    youtubeUrl: report.youtubeUrl ?? "",
    category: report.category ?? "Relatos",
    status: report.status ?? "Publicado",
    location: report.location ?? "Brasil",
    year: report.year ?? "2026",
    tags: report.tags ?? ["Relato"],
    relatedArchives: compactArray(report.relatedArchiveSlug ? [report.relatedArchiveSlug] : report.relatedArchives),
    relatedReportCodes: [],
    contentType: "relato",
    seoTitle: report.seoTitle ?? report.title ?? "",
    seoDescription: report.seoDescription ?? report.description ?? report.subtitle ?? "",
    ogImage: report.ogImage ?? report.image ?? "",
    aiNotes: report.aiNotes ?? "Migrado do modelo legado de relatos para conteúdo unificado de vídeo.",
  }));

  const normalizedVideos = (next.videos ?? []).map((video: any) => ({
    ...withSeoDefaults(video),
    relatedArchives: compactArray(video.relatedArchives),
    relatedReportCodes: compactArray(video.relatedReportCodes),
    status: video.status ?? "Publicado",
    contentType: video.contentType ?? (String(video.category ?? "").toLowerCase().includes("relato") ? "relato" : "transmissao"),
  }));

  const bySlug = new Map<string, any>();
  [...normalizedVideos, ...legacyReportsAsVideos].forEach((video: any) => {
    const key = video.slug ?? video.code ?? video.title;
    if (key && !bySlug.has(key)) bySlug.set(key, video);
  });

  next.videos = Array.from(bySlug.values());

  if (next.featuredTransmission) {
    next.featuredTransmission = {
      ...withSeoDefaults(next.featuredTransmission),
      relatedArchives: compactArray(next.featuredTransmission.relatedArchives),
      relatedReportCodes: compactArray(next.featuredTransmission.relatedReportCodes),
      status: next.featuredTransmission.status ?? "Publicado",
    };
  }

  next.archives = (next.archives ?? []).map((archive: any) => ({
    ...withSeoDefaults(archive),
    relatedArchives: compactArray(archive.relatedArchives),
    relatedReportCodes: compactArray(archive.relatedReportCodes),
    relatedTransmissionSlug: archive.relatedTransmissionSlug ?? "",
    classification: archive.classification ?? "Confidencial",
    status: archive.status ?? "Publicado",
  }));

  // Relatos agora são vídeos com contentType="relato". Mantemos next.relatos como visão derivada
  // para as páginas públicas e componentes legados, sem exigir CRUD separado.
  next.relatos = (next.videos ?? [])
    .filter((video: any) => video.contentType === "relato" || String(video.category ?? "").toLowerCase().includes("relato"))
    .map((video: any) => ({
      ...withSeoDefaults(video),
      subtitle: video.subtitle ?? "Relato audiovisual",
      relatedArchiveSlug: video.relatedArchives?.[0] ?? video.relatedArchiveSlug ?? "",
      relatedTransmissionSlug: video.slug ?? "",
      status: video.status ?? "Publicado",
    }));

  return next;
}
