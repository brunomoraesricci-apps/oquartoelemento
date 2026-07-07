export const CONTENT_SCHEMA_VERSION = "3.3.0";

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

  next.videos = (next.videos ?? []).map((video: any) => ({
    ...withSeoDefaults(video),
    relatedArchives: compactArray(video.relatedArchives),
    relatedReportCodes: compactArray(video.relatedReportCodes),
    status: video.status ?? "Publicado",
  }));

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

  next.relatos = (next.relatos ?? []).map((report: any) => ({
    ...withSeoDefaults(report),
    relatedArchiveSlug: report.relatedArchiveSlug ?? "",
    relatedTransmissionSlug: report.relatedTransmissionSlug ?? "",
    status: report.status ?? "Recebido",
  }));

  return next;
}
