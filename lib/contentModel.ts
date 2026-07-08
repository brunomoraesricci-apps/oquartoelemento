export const CONTENT_SCHEMA_VERSION = "7.1.0";

export const CATEGORY_OPTIONS = [
  "OVNIs e Fenômenos",
  "Desaparecimentos",
  "Lendas e Mitos",
  "Civilizações Perdidas",
  "Relatos Proibidos",
  "Deep Web",
];

export const STATUS_OPTIONS = ["Público", "Privado"];
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
function normalizeCategory(value: any) {
  const text = String(value ?? "").trim();
  if (/^relatos?$/i.test(text) || /relatos?\s+proibidos?/i.test(text)) return "Relatos Proibidos";
  return text;
}

function normalizeVisibilityStatus(status: any): "Público" | "Privado" {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["público", "publico", "public", "published", "publicado", "ativo", "active"].includes(normalized)) return "Público";
  return "Privado";
}

function normalizeContentType(value: any, category?: any) {
  const normalized = String(value ?? "").trim().toLowerCase();
  if (["relato", "report", "reports", "rp"].includes(normalized)) return "relato";
  if (["short", "shorts"].includes(normalized)) return "short";
  if (["especial", "special"].includes(normalized)) return "especial";
  if (String(category ?? "").toLowerCase().includes("relato")) return "relato";
  return "transmissao";
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
    status: normalizeVisibilityStatus(category.status ?? (category.active === false ? "Privado" : "Público")),
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
    category: normalizeCategory(report.category ?? "Relatos Proibidos"),
    status: normalizeVisibilityStatus(report.status),
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
    status: normalizeVisibilityStatus(video.status),
    category: normalizeCategory(video.category),
    contentType: normalizeContentType(video.contentType, video.category),
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
      status: normalizeVisibilityStatus(next.featuredTransmission.status),
      category: normalizeCategory(next.featuredTransmission.category),
      contentType: normalizeContentType(next.featuredTransmission.contentType, next.featuredTransmission.category),
    };
  }

  next.archives = (next.archives ?? []).map((archive: any) => ({
    ...withSeoDefaults(archive),
    relatedArchives: compactArray(archive.relatedArchives),
    relatedReportCodes: compactArray(archive.relatedReportCodes),
    relatedTransmissionSlug: archive.relatedTransmissionSlug ?? "",
    classification: archive.classification ?? "Confidencial",
    status: normalizeVisibilityStatus(archive.status),
  }));

  next.timeline = (next.timeline ?? []).map((event: any, index: number) => ({
    ...event,
    year: String(event.year ?? event.eventYear ?? new Date().getFullYear()),
    title: event.title ?? "Evento do acervo",
    text: event.text ?? event.description ?? "Evento catalogado automaticamente.",
    description: event.description ?? event.text ?? "Evento catalogado automaticamente.",
    archiveSlug: event.archiveSlug ?? event.archive_slug ?? "",
    relatedTransmissionSlug: event.relatedTransmissionSlug ?? event.contentSlug ?? event.transmissionSlug ?? "",
    contentSlug: event.contentSlug ?? event.relatedTransmissionSlug ?? event.transmissionSlug ?? "",
    contentType: event.contentType ?? "transmissao",
    eventType: event.eventType ?? "publication",
    precision: event.precision ?? "year",
    isAuto: event.isAuto !== false,
    order: Number(event.order ?? event.sortOrder ?? index + 1),
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
      status: normalizeVisibilityStatus(video.status),
    }));

  return next;
}
