"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";

type Section = "dashboard" | "transmissions" | "archives" | "reports" | "categories" | "youtube" | "pipeline" | "hero" | "timeline" | "graph" | "database" | "diagnostics" | "settings" | "json";

type FieldGroup = {
  title: string;
  description?: string;
  fields: string[];
  defaultOpen?: boolean;
};

const labels: Record<Section, string> = {
  dashboard: "Dashboard",
  transmissions: "Transmissões",
  archives: "Arquivos",
  reports: "Relatos (legado)",
  categories: "Categorias",
  youtube: "Nova Publicação",
  pipeline: "Central de Publicação",
  hero: "Hero",
  timeline: "Timeline",
  database: "Fonte de Dados",
  graph: "Grafo",
  diagnostics: "Diagnóstico",
  settings: "Configurações",
  json: "Modo Dev",
};

const sidebarGroups: { title: string; items: Section[] }[] = [
  { title: "Central", items: ["dashboard"] },
  { title: "Conteúdo", items: ["transmissions", "archives", "categories"] },
  { title: "Publicação", items: ["youtube", "pipeline", "hero", "timeline"] },
  { title: "Inteligência", items: ["graph"] },
  { title: "Dados", items: ["database", "diagnostics"] },
  { title: "Sistema", items: ["settings", "json"] },
];

const CATEGORY_OPTIONS = ["OVNIs e Fenômenos", "Desaparecimentos", "Lendas e Mitos", "Civilizações Perdidas", "Relatos Proibidos", "Deep Web", "Relatos"];
const STATUS_OPTIONS = ["Público", "Privado"];
const CONTENT_TYPE_OPTIONS = ["transmissao", "relato", "short", "especial"];
const CLASSIFICATION_OPTIONS = ["Desclassificado", "Confidencial", "Restrito", "Ultrassecreto", "Arquivo incompleto", "Em investigação"];
const CHIP_FIELDS = ["tags", "relatedArchives", "relatedReportCodes"];

const transmissionGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Campos que aparecem diretamente para o visitante.", fields: ["contentType", "code", "title", "slug", "description", "image", "youtubeUrl", "category", "status"], defaultOpen: true },
  { title: "Metadados editoriais", description: "Informações de classificação e organização do acervo.", fields: ["location", "year", "tags"] },
  { title: "Relacionamentos", description: "Conexões manuais entre transmissões, arquivos e relatos.", fields: ["relatedArchives", "relatedReportCodes"] },
  { title: "SEO e compartilhamento", description: "Preparado para Google, WhatsApp, Facebook, Discord e outras redes.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Campos reservados para o copiloto editorial com IA.", fields: ["aiNotes"] },
  { title: "Hero", description: "Controle se esta transmissão aparece no carrossel da Home.", fields: ["showInHero", "heroOrder"] },
];

const archiveGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Base do dossiê exibido no site.", fields: ["code", "title", "slug", "summary", "description", "longDescription", "image", "category", "status"], defaultOpen: true },
  { title: "Classificação do arquivo", description: "Elementos de imersão do sistema investigativo.", fields: ["location", "year", "classification", "accessLevel", "tags"] },
  { title: "Relacionamentos", description: "Conecta o dossiê a uma transmissão, outros arquivos e relatos.", fields: ["relatedTransmissionSlug", "relatedArchives", "relatedReportCodes"] },
  { title: "SEO e compartilhamento", description: "Campos técnicos para indexação e prévia de links.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas usadas futuramente pela IA para sugerir conteúdo e conexões.", fields: ["aiNotes"] },
];

const reportGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Campos do relato exibido para a comunidade.", fields: ["code", "title", "subtitle", "description", "image", "youtubeUrl", "category", "status"], defaultOpen: true },
  { title: "Metadados editoriais", description: "Contexto básico para organizar o relato no acervo.", fields: ["location", "year", "tags"] },
  { title: "Relacionamentos", description: "Amarra o relato ao dossiê e à transmissão mais relevantes.", fields: ["relatedArchiveSlug", "relatedTransmissionSlug"] },
  { title: "SEO e compartilhamento", description: "Campos opcionais caso o relato ganhe página ou destaque futuro.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas para classificação automática com IA.", fields: ["aiNotes"] },
];

const categoryGroups: FieldGroup[] = [
  { title: "Conteúdo principal", description: "Definição da categoria exibida no site.", fields: ["title", "slug", "symbol", "description", "image", "status", "order", "active"], defaultOpen: true },
  { title: "SEO e compartilhamento", description: "Prévia e indexação da página de categoria.", fields: ["seoTitle", "seoDescription", "ogImage"] },
  { title: "Automação futura", description: "Notas para uso posterior pelo copiloto editorial.", fields: ["aiNotes"] },
];

const timelineGroups: FieldGroup[] = [
  { title: "Evento cronológico", fields: ["year", "title", "text", "archiveSlug", "contentSlug", "contentType", "eventType", "precision", "isAuto"], defaultOpen: true },
];

function slugify(value: string) {
  return value.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)+/g, "");
}

function label(field: string) {
  const map: Record<string, string> = {
    title: "Título", slug: "Slug", code: "Código", contentType: "Tipo de conteúdo", description: "Descrição curta", longDescription: "Texto principal",
    summary: "Resumo", image: "Imagem / Thumbnail", youtubeUrl: "YouTube URL", category: "Categoria", status: "Status",
    tags: "Tags", location: "Local", year: "Ano", subtitle: "Subtítulo", classification: "Classificação",
    accessLevel: "Nível de acesso", relatedTransmissionSlug: "Transmissão relacionada", showInHero: "Exibir no Hero",
    heroOrder: "Ordem no Hero", emailRelatos: "E-mail de relatos", youtubeUrlSite: "URL YouTube", instagramUrl: "URL Instagram",
    text: "Texto", contentSlug: "Conteúdo relacionado", eventType: "Tipo de evento", precision: "Precisão", isAuto: "Gerado automaticamente", eyebrow: "Texto superior", primaryActionLabel: "Botão principal", secondaryActionLabel: "Botão secundário",
    featuredArchiveSlug: "Arquivo destaque", featuredTransmissionSlug: "Transmissão destaque", featuredTransmissionYoutubeUrl: "YouTube destaque",
    seoTitle: "SEO: título", seoDescription: "SEO: descrição", ogImage: "OpenGraph: imagem", aiNotes: "IA: notas para automação", aiSourceUrl: "IA: URL fonte", aiGenerated: "Gerado por IA", aiReviewed: "Revisado",
    relatedArchives: "Arquivos relacionados", relatedReportCodes: "Relatos relacionados", relatedArchiveSlug: "Arquivo relacionado", active: "Categoria ativa", order: "Ordem", symbol: "Símbolo", videoId: "YouTube Video ID", embedUrl: "YouTube Embed URL", sourceProvider: "Fonte", sourceUrl: "URL original"
  };
  return map[field] ?? field;
}

function emptyTransmission(index: number) {
  return { contentType: "transmissao", code: `QE-TX-${String(index + 1).padStart(3, "0")}`, title: "Nova transmissão", slug: "nova-transmissao", description: "Descrição da transmissão.", image: "", youtubeUrl: "", category: "OVNIs e Fenômenos", status: "Privado", tags: ["Transmissão"], location: "Brasil", year: "2026", relatedArchives: [], relatedReportCodes: [], seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", showInHero: false, heroOrder: index + 1 };
}
function emptyArchive(index: number) {
  return { code: `QE-${String(index + 1).padStart(3, "0")}`, title: "Novo arquivo", slug: "novo-arquivo", summary: "Resumo do arquivo.", description: "Descrição curta do arquivo.", longDescription: "Texto principal do dossiê.", image: "", category: "OVNIs e Fenômenos", status: "Privado", location: "Brasil", year: "2026", classification: "Confidencial", accessLevel: "LV.04", relatedTransmissionSlug: "", relatedArchives: [], relatedReportCodes: [], seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", tags: ["Arquivo"] };
}
function emptyReport(index: number) {
  return { code: `RP-${String(index + 1).padStart(3, "0")}`, title: "Novo relato", subtitle: "Relato recebido", description: "Breve descrição do relato.", image: "", youtubeUrl: "", category: "Relatos", status: "Privado", location: "Brasil", year: "2026", relatedArchiveSlug: "", relatedTransmissionSlug: "", seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", tags: ["Relato"] };
}
function emptyCategory(index: number) {
  return { title: "Nova categoria", slug: `nova-categoria-${index + 1}`, symbol: "◇", image: "", description: "Descrição da categoria.", status: "Público", order: index + 1, seoTitle: "", seoDescription: "", ogImage: "", aiNotes: "", active: true };
}


type QePackageBlock = { type: string; data: Record<string, any> };
type QePackageResult = { version: string; blocks: QePackageBlock[]; errors: string[] };

const BLOCK_TYPES = ["TRANSMISSION", "ARCHIVE", "REPORT", "CATEGORY", "HERO", "TIMELINE"];

function normalizeKey(key: string) {
  return key.trim().toLowerCase().replace(/[\s-]+/g, "_");
}

function normalizeValue(key: string, raw: string) {
  const value = raw.trim();
  const lines = value.split("\n").map((line) => line.trim()).filter(Boolean);
  const arrayKeys = ["tags", "related_archives", "related_reports", "related_report_codes", "keywords"];
  if (arrayKeys.includes(key)) {
    if (lines.some((line) => line.startsWith("-"))) return lines.map((line) => line.replace(/^-\s*/, "")).filter(Boolean);
    return value.split(",").map((item) => item.trim()).filter(Boolean);
  }
  if (lines.length && lines.every((line) => line.startsWith("-"))) return lines.map((line) => line.replace(/^-\s*/, "")).filter(Boolean);
  if (["hero", "show_in_hero", "active"].includes(key)) return ["true", "sim", "yes", "1", "published", "publicado"].includes(value.toLowerCase());
  return value;
}

function parseQePackage(input: string): QePackageResult {
  const lines = input.replace(/\r\n/g, "\n").split("\n");
  const result: QePackageResult = { version: "1.0", blocks: [], errors: [] };
  let currentType = "";
  let currentData: Record<string, any> = {};
  let currentKey = "";
  let buffer: string[] = [];

  const flushField = () => {
    if (!currentType || !currentKey) return;
    currentData[currentKey] = normalizeValue(currentKey, buffer.join("\n"));
    currentKey = "";
    buffer = [];
  };
  const closeBlock = () => {
    flushField();
    if (currentType) result.blocks.push({ type: currentType, data: currentData });
    currentType = "";
    currentData = {};
  };

  for (const rawLine of lines) {
    const line = rawLine.trim();
    if (!line || line.startsWith("#") || /^=+$/.test(line)) continue;
    const upper = line.toUpperCase();
    const headerMatch = line.match(/^(QE_PACKAGE_VERSION|VERSION)\s*:\s*(.+)$/i);
    if (!currentType && headerMatch) { result.version = headerMatch[2].trim(); continue; }
    if (BLOCK_TYPES.includes(upper)) { if (currentType) closeBlock(); currentType = upper; currentData = {}; continue; }
    if (currentType && upper === `END_${currentType}`) { closeBlock(); continue; }
    if (!currentType) continue;
    const fieldMatch = rawLine.match(/^\s*([A-Za-z0-9_ -]+)\s*:\s*(.*)$/);
    if (fieldMatch) {
      flushField();
      currentKey = normalizeKey(fieldMatch[1]);
      buffer = fieldMatch[2] ? [fieldMatch[2]] : [];
    } else if (currentKey) {
      buffer.push(rawLine);
    }
  }
  if (currentType) closeBlock();
  if (!result.blocks.length) result.errors.push("Nenhum bloco válido encontrado. Use TRANSMISSION, ARCHIVE, REPORT, CATEGORY, HERO ou TIMELINE.");
  return result;
}

function getField(data: Record<string, any>, ...keys: string[]) {
  for (const key of keys) {
    const normalized = normalizeKey(key);
    if (data[normalized] !== undefined && data[normalized] !== "") return data[normalized];
  }
  return undefined;
}

function asArray(value: any): string[] {
  if (Array.isArray(value)) return value.map(String).filter(Boolean);
  if (!value) return [];
  return String(value).split(",").map((item) => item.trim()).filter(Boolean);
}

function extractYouTubeId(url: string) {
  const trimmed = url.trim();
  if (!trimmed) return "";
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = trimmed.match(pattern);
    if (match?.[1]) return match[1].split(/[?&]/)[0];
  }
  try {
    const parsed = new URL(trimmed);
    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

function youtubeThumb(videoId: string) {
  return videoId ? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` : "";
}

function youtubeEmbed(videoId: string) {
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function youtubeWatchUrl(videoId: string) {
  return videoId ? `https://www.youtube.com/watch?v=${videoId}` : "";
}

function youtubeThumbnailSet(videoId: string) {
  if (!videoId) return [];
  return [
    { label: "Maxres", url: `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg` },
    { label: "HQ", url: `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` },
    { label: "MQ", url: `https://img.youtube.com/vi/${videoId}/mqdefault.jpg` },
  ];
}

function nextCode(prefix: string, existing: any[] = []) {
  const numbers = existing
    .map((item) => String(item?.code ?? ""))
    .map((code) => Number(code.match(/(\d+)$/)?.[1] ?? 0))
    .filter((number) => Number.isFinite(number));
  const next = Math.max(0, ...numbers) + 1;
  return `${prefix}-${String(next).padStart(3, "0")}`;
}

function draftTitleFromVideoId(videoId: string) {
  return videoId ? `Transmissão ${videoId}` : "Nova transmissão";
}

function upsertBySlug(list: any[], item: any) {
  const slug = item.slug || slugify(item.title || "novo-item");
  const normalized = { ...item, slug };
  const index = list.findIndex((existing) => existing.slug === slug || existing.code === item.code);
  if (index >= 0) {
    const next = [...list];
    next[index] = { ...next[index], ...normalized };
    return next;
  }
  return [...list, normalized];
}

function blockToContent(block: QePackageBlock, content: any) {
  const data = block.data;
  if (block.type === "TRANSMISSION") {
    const item = emptyTransmission(content.videos?.length ?? 0);
    return {
      ...item,
      code: getField(data, "code") ?? item.code,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      description: getField(data, "description", "summary") ?? item.description,
      image: getField(data, "image", "thumbnail") ?? item.image,
      youtubeUrl: getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      videoId: getField(data, "video_id", "youtube_video_id") ?? extractYouTubeId(String(getField(data, "youtube", "youtube_url", "youtubeUrl") ?? "")),
      embedUrl: getField(data, "embed_url") ?? youtubeEmbed(String(getField(data, "video_id", "youtube_video_id") ?? extractYouTubeId(String(getField(data, "youtube", "youtube_url", "youtubeUrl") ?? "")))),
      sourceProvider: getField(data, "source_provider") ?? "youtube",
      sourceUrl: getField(data, "source_url") ?? getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      contentType: getField(data, "content_type", "contentType", "type") ?? item.contentType ?? "transmissao",
      category: getField(data, "category") ?? item.category,
      status: getField(data, "visibility", "status") ?? "Público",
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      tags: asArray(getField(data, "tags", "keywords")),
      relatedArchives: asArray(getField(data, "related_archives")),
      relatedReportCodes: asArray(getField(data, "related_reports", "related_report_codes")),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      showInHero: Boolean(getField(data, "hero", "show_in_hero")),
      heroOrder: Number(getField(data, "hero_order") ?? item.heroOrder),
    };
  }
  if (block.type === "ARCHIVE") {
    const item = emptyArchive(content.archives?.length ?? 0);
    return {
      ...item,
      code: getField(data, "code") ?? item.code,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      summary: getField(data, "summary") ?? item.summary,
      description: getField(data, "description") ?? getField(data, "summary") ?? item.description,
      longDescription: getField(data, "long_description", "longDescription", "body") ?? item.longDescription,
      image: getField(data, "image", "thumbnail") ?? item.image,
      category: getField(data, "category") ?? item.category,
      status: getField(data, "visibility", "status") ?? "Público",
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      classification: getField(data, "classification") ?? item.classification,
      accessLevel: getField(data, "access_level", "accessLevel") ?? item.accessLevel,
      relatedTransmissionSlug: getField(data, "related_transmission", "related_transmission_slug") ?? "",
      relatedArchives: asArray(getField(data, "related_archives")),
      relatedReportCodes: asArray(getField(data, "related_reports", "related_report_codes")),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      tags: asArray(getField(data, "tags", "keywords")),
    };
  }
  if (block.type === "REPORT") {
    const item = emptyTransmission(content.videos?.length ?? 0);
    const title = getField(data, "title") ?? "Novo relato";
    return {
      ...item,
      contentType: "relato",
      code: getField(data, "code") ?? `QE-R-${String((content.videos?.length ?? 0) + 1).padStart(3, "0")}`,
      title,
      slug: getField(data, "slug") ?? slugify(title),
      description: getField(data, "description", "summary", "subtitle") ?? "Relato audiovisual catalogado no acervo.",
      image: getField(data, "image", "thumbnail") ?? item.image,
      youtubeUrl: getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      videoId: getField(data, "video_id", "youtube_video_id") ?? extractYouTubeId(String(getField(data, "youtube", "youtube_url", "youtubeUrl") ?? "")),
      embedUrl: getField(data, "embed_url") ?? youtubeEmbed(String(getField(data, "video_id", "youtube_video_id") ?? extractYouTubeId(String(getField(data, "youtube", "youtube_url", "youtubeUrl") ?? "")))),
      sourceProvider: getField(data, "source_provider") ?? "youtube",
      sourceUrl: getField(data, "source_url") ?? getField(data, "youtube", "youtube_url", "youtubeUrl") ?? item.youtubeUrl,
      category: getField(data, "category") ?? "Relatos",
      status: getField(data, "visibility", "status") ?? "Público",
      location: getField(data, "location") ?? item.location,
      year: getField(data, "year") ?? item.year,
      relatedArchives: asArray(getField(data, "related_archive", "related_archive_slug", "related_archives")),
      relatedReportCodes: [],
      tags: asArray(getField(data, "tags", "keywords")),
      seoTitle: getField(data, "seo_title") ?? title,
      seoDescription: getField(data, "seo_description") ?? item.seoDescription,
      ogImage: getField(data, "og_image") ?? getField(data, "image", "thumbnail") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Relato migrado para o modelo unificado de vídeos.",
    };
  }
  if (block.type === "CATEGORY") {
    const item = emptyCategory(content.categories?.length ?? 0);
    return {
      ...item,
      title: getField(data, "title") ?? item.title,
      slug: getField(data, "slug") ?? slugify(getField(data, "title") ?? item.title),
      symbol: getField(data, "symbol") ?? item.symbol,
      image: getField(data, "image") ?? item.image,
      description: getField(data, "description") ?? item.description,
      status: getField(data, "visibility", "status") ?? "Público",
      order: Number(getField(data, "order") ?? item.order),
      seoTitle: getField(data, "seo_title") ?? "",
      seoDescription: getField(data, "seo_description") ?? "",
      ogImage: getField(data, "og_image") ?? getField(data, "image") ?? "",
      aiNotes: getField(data, "ai_notes") ?? "Importado via QE Content Package.",
      active: getField(data, "active") ?? true,
    };
  }
  if (block.type === "TIMELINE") return {
    year: getField(data, "year") ?? "2026",
    title: getField(data, "title") ?? "Novo evento",
    text: getField(data, "text", "description") ?? "Evento importado via pacote.",
    description: getField(data, "text", "description") ?? "Evento importado via pacote.",
    archiveSlug: getField(data, "archive_slug", "archiveSlug") ?? "",
    contentSlug: getField(data, "content_slug", "contentSlug", "related_transmission_slug") ?? "",
    relatedTransmissionSlug: getField(data, "content_slug", "contentSlug", "related_transmission_slug") ?? "",
    contentType: getField(data, "content_type", "contentType") ?? "transmissao",
    eventType: getField(data, "event_type", "eventType") ?? "publication",
    precision: getField(data, "precision") ?? "year",
    isAuto: String(getField(data, "is_auto", "isAuto") ?? "true").toLowerCase() !== "false",
  };
  if (block.type === "HERO") return { title: getField(data, "title"), subtitle: getField(data, "subtitle"), description: getField(data, "description"), image: getField(data, "image"), featuredArchiveSlug: getField(data, "featured_archive", "featured_archive_slug"), featuredTransmissionSlug: getField(data, "featured_transmission", "featured_transmission_slug"), featuredTransmissionYoutubeUrl: getField(data, "youtube", "youtube_url") };
  return null;
}

function applyQePackage(content: any, parsed: QePackageResult) {
  const clone = structuredClone(content);
  const summary = { transmissions: 0, archives: 0, reports: 0, categories: 0, hero: 0, timeline: 0 };
  for (const block of parsed.blocks) {
    const item = blockToContent(block, clone);
    if (!item) continue;
    if (block.type === "TRANSMISSION") { clone.videos = upsertBySlug(clone.videos ?? [], item); summary.transmissions += 1; }
    if (block.type === "ARCHIVE") { clone.archives = upsertBySlug(clone.archives ?? [], item); summary.archives += 1; }
    if (block.type === "REPORT") { clone.videos = upsertBySlug(clone.videos ?? [], item); summary.reports += 1; }
    if (block.type === "CATEGORY") { clone.categories = upsertBySlug(clone.categories ?? [], item); summary.categories += 1; }
    if (block.type === "TIMELINE") { clone.timeline = [...(clone.timeline ?? []), item]; summary.timeline += 1; }
    if (block.type === "HERO") { clone.hero = { ...(clone.hero ?? {}), ...Object.fromEntries(Object.entries(item).filter(([, value]) => value !== undefined && value !== "")) }; summary.hero += 1; }
  }
  return { content: clone, summary };
}


type PackageAnalysis = {
  actions: string[];
  warnings: string[];
  creates: number;
  updates: number;
};

function getCollectionForBlock(content: any, type: string) {
  if (type === "TRANSMISSION") return content.videos ?? [];
  if (type === "ARCHIVE") return content.archives ?? [];
  if (type === "REPORT") return content.relatos ?? [];
  if (type === "CATEGORY") return content.categories ?? [];
  return [];
}

function analyzeQePackage(content: any, parsed: QePackageResult): PackageAnalysis {
  const actions: string[] = [];
  const warnings: string[] = [];
  let creates = 0;
  let updates = 0;
  const categoryTitles = new Set((content.categories ?? []).map((category: any) => String(category.title ?? "").toLowerCase()));

  for (const block of parsed.blocks) {
    const title = getField(block.data, "title") ?? getField(block.data, "slug") ?? block.type;
    const slug = getField(block.data, "slug") ?? slugify(String(title));
    const collection = getCollectionForBlock(content, block.type);
    const exists = collection.some((item: any) => item.slug === slug || item.code === getField(block.data, "code"));

    if (["TRANSMISSION", "ARCHIVE", "REPORT", "CATEGORY"].includes(block.type)) {
      exists ? updates++ : creates++;
      actions.push(`${exists ? "Atualizar" : "Criar"} ${block.type.toLowerCase()}: ${title}`);
    }

    if (["TRANSMISSION", "ARCHIVE", "REPORT"].includes(block.type)) {
      const category = getField(block.data, "category");
      if (category && !categoryTitles.has(String(category).toLowerCase())) {
        warnings.push(`Categoria não encontrada para ${title}: ${category}`);
      }
      if (!getField(block.data, "image", "thumbnail")) {
        warnings.push(`Imagem ausente em ${title}. O item será salvo, mas revise a thumbnail depois.`);
      }
      if (!getField(block.data, "seo_title") || !getField(block.data, "seo_description")) {
        warnings.push(`SEO incompleto em ${title}.`);
      }
    }

    if (block.type === "HERO") actions.push(`Atualizar hero: ${title}`);
    if (block.type === "TIMELINE") actions.push(`Adicionar evento de timeline: ${title}`);
  }

  if (!parsed.blocks.length) warnings.push("Nenhum bloco processável encontrado.");
  return { actions, warnings, creates, updates };
}

const SAMPLE_QE_PACKAGE = `QE_PACKAGE_VERSION: 1.0

TRANSMISSION
TITLE: Top 10 Mistérios Brasileiros
SLUG: top-10-misterios-brasileiros
CATEGORY: OVNIs e Fenômenos
YEAR: 2026
STATUS: Público
YOUTUBE: https://youtube.com/watch?v=EXEMPLO
IMAGE: /images/top10-brasil.jpg
HERO: true
DESCRIPTION:
Uma transmissão documental sobre alguns dos maiores mistérios já registrados no Brasil.
TAGS:
- ovni
- mistérios brasileiros
- operação prato
SEO_TITLE: Top 10 Mistérios Brasileiros | O Quarto Elemento
SEO_DESCRIPTION: Explore casos inexplicáveis, arquivos classificados e mistérios brasileiros no O Quarto Elemento.
RELATED_ARCHIVES:
- operacao-prato
- incidente-de-ubatuba
AI_NOTES:
Pacote gerado via ChatGPT e revisado manualmente antes da publicação.
END_TRANSMISSION

ARCHIVE
TITLE: Operação Prato
SLUG: operacao-prato
CATEGORY: OVNIs e Fenômenos
YEAR: 1977
LOCATION: Pará, Brasil
CLASSIFICATION: Desclassificado
ACCESS_LEVEL: LV.04
SUMMARY:
Dossiê sobre uma das investigações ufológicas mais famosas da história brasileira.
DESCRIPTION:
Arquivo investigativo relacionado à série de eventos observados na região amazônica durante a década de 1970.
IMAGE: /images/operacao-prato.jpg
RELATED_TRANSMISSION: top-10-misterios-brasileiros
TAGS:
- ovni
- amazônia
- forças armadas
END_ARCHIVE`;

function TextField({ label, value, onChange, textarea = false }: { label: string; value: any; onChange: (value: string) => void; textarea?: boolean }) {
  return <label className="cmsField"><span>{label}</span>{textarea ? <textarea value={value ?? ""} onChange={(e) => onChange(e.target.value)} /> : <input value={value ?? ""} onChange={(e) => onChange(e.target.value)} />}</label>;
}
function SelectField({ label, value, options, onChange }: { label: string; value: any; options: string[]; onChange: (value: string) => void }) {
  return <label className="cmsField"><span>{label}</span><select value={value ?? ""} onChange={(e) => onChange(e.target.value)}><option value="">Selecionar</option>{options.map((o) => <option value={o} key={o}>{o}</option>)}</select></label>;
}
function ChipsField({ label, value, onChange, placeholder = "Adicionar item" }: { label: string; value: string[]; onChange: (value: string[]) => void; placeholder?: string }) {
  const [draft, setDraft] = useState("");
  const add = () => { const item = draft.trim(); if (!item) return; onChange(Array.from(new Set([...(value ?? []), item]))); setDraft(""); };
  return <div className="cmsField"><span>{label}</span><div className="tagEditor">{(value ?? []).map((item) => <button type="button" key={item} onClick={() => onChange((value ?? []).filter((t) => t !== item))}>#{item} ×</button>)}</div><div className="tagInput"><input value={draft} placeholder={placeholder} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }} /><button type="button" onClick={add}>Adicionar</button></div></div>;
}
function TagsField({ value, onChange }: { value: string[]; onChange: (value: string[]) => void }) {
  return <ChipsField label="Tags" value={value} onChange={onChange} placeholder="Adicionar tag" />;
}
function UploadField({ label, value, onChange, onUpload }: { label: string; value: string; onChange: (value: string) => void; onUpload: (file: File) => Promise<string> }) {
  const [uploading, setUploading] = useState(false);
  async function upload(file?: File) { if (!file) return; setUploading(true); try { onChange(await onUpload(file)); } finally { setUploading(false); } }
  return <div className="cmsField"><span>{label}</span><div className="uploadPreview">{value ? <img src={value} alt="" /> : <div>SEM IMAGEM</div>}</div><input value={value ?? ""} onChange={(e) => onChange(e.target.value)} /><label className="uploadButton">{uploading ? "Enviando..." : "Upload"}<input type="file" accept="image/*" onChange={(e) => upload(e.target.files?.[0])} /></label></div>;
}
function PreviewCard({ item, type }: { item: any; type: string }) {
  return <aside className="cmsPreview terminalPanel"><span>{type} // Preview</span><div className="cmsPreviewImage" style={{ "--img": `url("${item?.image || "/images/identity-alt.png"}")` } as any} /><h3>{item?.title || "Sem título"}</h3><p>{item?.description || item?.summary || item?.subtitle || "Sem descrição"}</p><div className="dossierMiniMeta"><span>{item?.category || "Categoria"}</span><span>{item?.year || "Ano"}</span><span>{item?.status || "Status"}</span></div></aside>;
}

function FieldAccordion({ group, children }: { group: FieldGroup; children: ReactNode }) {
  return <details className="cmsAccordion" open={group.defaultOpen}><summary><div><b>{group.title}</b>{group.description && <small>{group.description}</small>}</div><span>ABRIR</span></summary><div className="cmsAccordionBody">{children}</div></details>;
}

function AutomationPanel() {
  return <section className="terminalPanel cmsAutomationPanel"><span>Automação</span><h3>Copiloto editorial</h3><p>Estrutura preparada para IA. Em uma próxima fase, este painel poderá gerar SEO, tags, relações, resumos e classificações a partir de um link do YouTube.</p><button className="btn" type="button" disabled>Processar IA em breve</button></section>;
}

function renderField(field: string, selectedItem: any, updateField: (field: string, value: any) => void, type: string, content: any, uploadImage: (file: File) => Promise<string>) {
  if (field === "category") {
    const options = type === "category" ? CATEGORY_OPTIONS : Array.from(new Set([...(content.categories ?? []).map((c: any) => c.title), ...CATEGORY_OPTIONS]));
    return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={options as string[]} onChange={(v) => updateField(field, v)} />;
  }
  if (field === "contentType") return <SelectField key={field} label={label(field)} value={selectedItem[field] ?? "transmissao"} options={CONTENT_TYPE_OPTIONS} onChange={(v) => updateField(field, v)} />;
  if (field === "status") return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={STATUS_OPTIONS} onChange={(v) => updateField(field, v)} />;
  if (field === "classification") return <SelectField key={field} label={label(field)} value={selectedItem[field]} options={CLASSIFICATION_OPTIONS} onChange={(v) => updateField(field, v)} />;
  if (field === "tags") return <TagsField key={field} value={selectedItem[field] ?? []} onChange={(v) => updateField(field, v)} />;
  if (CHIP_FIELDS.includes(field)) return <ChipsField key={field} label={label(field)} value={selectedItem[field] ?? []} onChange={(v) => updateField(field, v)} />;
  if (["image", "ogImage"].includes(field)) return <UploadField key={field} label={label(field)} value={selectedItem[field] ?? ""} onChange={(v) => updateField(field, v)} onUpload={uploadImage} />;
  if (["showInHero", "active"].includes(field)) return <label key={field} className="cmsCheck"><input type="checkbox" checked={Boolean(selectedItem[field])} onChange={(e) => updateField(field, e.target.checked)} /><span>{label(field)}</span></label>;
  return <TextField key={field} label={label(field)} value={selectedItem[field]} textarea={["description", "summary", "longDescription", "subtitle", "text", "seoDescription", "aiNotes"].includes(field)} onChange={(v) => updateField(field, v)} />;
}

function CollectionManager({ title, type, items, onAdd, onUpdate, onRemove, groups, content, uploadImage }: any) {
  const [selected, setSelected] = useState(0);
  const [search, setSearch] = useState("");
  const filtered = items.map((item: any, index: number) => ({ item, index })).filter(({ item }: any) => `${item.title ?? ""} ${item.code ?? ""}`.toLowerCase().includes(search.toLowerCase()));
  const selectedItem = items[selected] ?? items[0];
  function updateField(field: string, value: any) { const next = { ...selectedItem, [field]: value }; if (field === "title" && !selectedItem.slug) next.slug = slugify(value); onUpdate(selected, next); }
  return <div className="cmsManager"><div className="cmsList terminalPanel"><div className="cmsListHead"><div><span>Content Studio</span><h2>{title}</h2></div><button className="btn btnRed" type="button" onClick={onAdd}>Adicionar</button></div><input className="cmsSearch" placeholder="Pesquisar por título ou código..." value={search} onChange={(e) => setSearch(e.target.value)} /><div className="cmsItems">{filtered.map(({ item, index }: any) => <button type="button" className={index === selected ? "active" : ""} key={`${item.code}-${index}`} onClick={() => setSelected(index)}><span>{item.code ?? item.slug ?? "QE"}</span><b>{item.title}</b><small>{item.status ?? item.category ?? "Ativo"}</small></button>)}</div></div>{selectedItem && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>{selectedItem.code ?? selectedItem.slug}</span><h2>{selectedItem.title}</h2></div><button className="btn danger" type="button" onClick={() => onRemove(selected)}>Remover</button></div><div className="cmsEditorGrid"><div>{groups.map((group: FieldGroup) => <FieldAccordion group={group} key={group.title}>{group.fields.map((field) => renderField(field, selectedItem, updateField, type, content, uploadImage))}</FieldAccordion>)}</div><div className="cmsRightRail"><PreviewCard item={selectedItem} type={title} /><AutomationPanel /></div></div></div>}</div>;
}



type BackupRecord = { file: string; createdAt: string; size: number };

function allEditorialItems(content: any) {
  return [
    ...((content.videos ?? []).map((item: any) => ({ ...item, kind: "Transmissão", section: "transmissions" as Section }))),
    ...((content.archives ?? []).map((item: any) => ({ ...item, kind: "Arquivo", section: "archives" as Section }))),
    ...((content.relatos ?? []).map((item: any) => ({ ...item, kind: "Relato", section: "transmissions" as Section }))),
    ...((content.categories ?? []).map((item: any) => ({ ...item, kind: "Categoria", section: "categories" as Section }))),
  ];
}


function formatDateTime(value?: string) {
  if (!value) return "—";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return date.toLocaleString("pt-BR");
}

function statusType(status?: string) {
  const normalized = String(status ?? "").toLowerCase();
  if (["público", "publico", "public", "published", "publicado"].includes(normalized)) return "published";
  return "private";
}



type KnowledgeNode = { id: string; label: string; type: string; count: number };
type KnowledgeEdge = { from: string; to: string; relation: string; source?: string };

const STOP_WORDS = new Set(["para", "com", "dos", "das", "mais", "menos", "sobre", "uma", "um", "que", "por", "the", "and", "of", "de", "do", "da", "e", "o", "a"]);

function entityKey(type: string, value: string) {
  return `${type}:${slugify(value || "indefinido")}`;
}

function addKnowledgeNode(nodes: Map<string, KnowledgeNode>, type: string, labelValue: string) {
  const label = String(labelValue || "Indefinido").trim();
  const id = entityKey(type, label);
  const current = nodes.get(id);
  if (current) current.count += 1;
  else nodes.set(id, { id, label, type, count: 1 });
  return id;
}

function addKnowledgeEdge(edges: KnowledgeEdge[], from: string, to: string, relation: string, source?: string) {
  if (!from || !to || from === to) return;
  const key = `${from}|${to}|${relation}|${source ?? ""}`;
  if (!edges.some((edge) => `${edge.from}|${edge.to}|${edge.relation}|${edge.source ?? ""}` === key)) edges.push({ from, to, relation, source });
}

function extractTitleEntities(title: string) {
  return String(title || "")
    .split(/[^A-Za-zÀ-ÿ0-9]+/)
    .map((word) => word.trim())
    .filter((word) => word.length >= 4 && !STOP_WORDS.has(word.toLowerCase()))
    .slice(0, 5);
}

function buildKnowledgeGraph(content: any) {
  const nodes = new Map<string, KnowledgeNode>();
  const edges: KnowledgeEdge[] = [];
  const videos = content?.videos ?? [];
  const archives = content?.archives ?? [];

  for (const video of videos) {
    const videoId = addKnowledgeNode(nodes, video.contentType === "relato" ? "relato" : "video", video.title || video.slug || video.code);
    const categoryId = addKnowledgeNode(nodes, "categoria", video.category || "Sem categoria");
    addKnowledgeEdge(edges, videoId, categoryId, "classificado como", video.slug);

    for (const tag of video.tags ?? []) {
      const tagId = addKnowledgeNode(nodes, "tag", tag);
      addKnowledgeEdge(edges, videoId, tagId, "marcado com", video.slug);
    }

    for (const word of extractTitleEntities(video.title)) {
      const entityId = addKnowledgeNode(nodes, "entidade", word);
      addKnowledgeEdge(edges, videoId, entityId, "menciona", video.slug);
    }

    for (const archiveSlug of video.relatedArchives ?? []) {
      const archive = archives.find((item: any) => item.slug === archiveSlug);
      const archiveId = addKnowledgeNode(nodes, "arquivo", archive?.title || archiveSlug);
      addKnowledgeEdge(edges, videoId, archiveId, "possui dossiê", video.slug);
    }
  }

  for (const archive of archives) {
    const archiveId = addKnowledgeNode(nodes, "arquivo", archive.title || archive.slug || archive.code);
    const categoryId = addKnowledgeNode(nodes, "categoria", archive.category || "Sem categoria");
    addKnowledgeEdge(edges, archiveId, categoryId, "classificado como", archive.slug);

    if (archive.relatedTransmissionSlug) {
      const video = videos.find((item: any) => item.slug === archive.relatedTransmissionSlug);
      const videoId = addKnowledgeNode(nodes, video?.contentType === "relato" ? "relato" : "video", video?.title || archive.relatedTransmissionSlug);
      addKnowledgeEdge(edges, archiveId, videoId, "derivado de", archive.slug);
    }

    for (const tag of archive.tags ?? []) {
      const tagId = addKnowledgeNode(nodes, "tag", tag);
      addKnowledgeEdge(edges, archiveId, tagId, "marcado com", archive.slug);
    }
  }

  const topNodes = [...nodes.values()].sort((a, b) => b.count - a.count || a.label.localeCompare(b.label));
  const videosWithoutArchive = videos.filter((video: any) => !(archives ?? []).some((archive: any) => archive.relatedTransmissionSlug === video.slug || archive.slug === video.slug));
  const archivesWithoutVideo = archives.filter((archive: any) => archive.relatedTransmissionSlug && !(videos ?? []).some((video: any) => video.slug === archive.relatedTransmissionSlug));
  const duplicateVideoIds = Object.entries(videos.reduce((acc: Record<string, number>, video: any) => {
    if (video.videoId) acc[video.videoId] = (acc[video.videoId] ?? 0) + 1;
    return acc;
  }, {})).filter(([, count]) => Number(count) > 1);

  return { nodes: topNodes, edges, videosWithoutArchive, archivesWithoutVideo, duplicateVideoIds };
}

function KnowledgeGraphPanel({ content, onNavigate }: { content: any; onNavigate: (section: Section) => void }) {
  const graph = useMemo(() => buildKnowledgeGraph(content), [content]);
  const entityCount = graph.nodes.filter((node) => node.type === "entidade").length;
  const tagCount = graph.nodes.filter((node) => node.type === "tag").length;
  const issueCount = graph.videosWithoutArchive.length + graph.archivesWithoutVideo.length + graph.duplicateVideoIds.length;

  return <div className="dashboardGrid diagnosticsPanel">
    <section className="terminalPanel heroStatusCard">
      <div className="cmsEditorHead"><div><span>QE Knowledge Graph</span><h2>Mapa de Conhecimento</h2></div><button className="btn" type="button" onClick={() => onNavigate("youtube")}>Nova fonte</button></div>
      <p>Esta fundação v7 organiza vídeos, dossiês, categorias, tags e entidades como uma rede de conhecimento. Por enquanto o grafo é inferido de forma determinística a partir do acervo já salvo.</p>
      <div className="issueMetrics">
        <button type="button"><b>{graph.nodes.length}</b><span>Nós</span></button>
        <button type="button"><b>{graph.edges.length}</b><span>Relações</span></button>
        <button type="button"><b>{entityCount}</b><span>Entidades</span></button>
        <button type="button"><b>{issueCount}</b><span>Pendências</span></button>
      </div>
    </section>

    <section className="terminalPanel diagnosticsHero">
      <div><span>Saúde do grafo</span><h2>{issueCount ? "Relações a revisar" : "Grafo consistente"}</h2><p>Tags: <b>{tagCount}</b> · Vídeos sem dossiê: <b>{graph.videosWithoutArchive.length}</b> · Dossiês órfãos: <b>{graph.archivesWithoutVideo.length}</b></p></div>
      <strong>{Math.max(0, 100 - issueCount * 10)}%</strong>
    </section>

    <section className="terminalPanel">
      <span>Entidades principais</span>
      <h2>Nós mais recorrentes</h2>
      <div className="issueList">
        {graph.nodes.slice(0, 12).map((node) => <button type="button" key={node.id}><b>{node.label}</b><span>{node.type} · {node.count} conexão(ões)</span></button>)}
      </div>
    </section>

    <section className="terminalPanel">
      <span>Relações recentes</span>
      <h2>Conexões inferidas</h2>
      <div className="issueList">
        {graph.edges.slice(0, 12).map((edge, index) => {
          const from = graph.nodes.find((node) => node.id === edge.from)?.label ?? edge.from;
          const to = graph.nodes.find((node) => node.id === edge.to)?.label ?? edge.to;
          return <button type="button" key={`${edge.from}-${edge.to}-${index}`}><b>{from} → {to}</b><span>{edge.relation}</span></button>;
        })}
      </div>
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Integridade</span><h2>Pendências do grafo</h2></div></div>
      {!issueCount ? <div className="allClear"><b>Nenhuma pendência crítica detectada.</b><p>Todos os vídeos principais possuem dossiês relacionados e não há duplicidade de vídeo do YouTube.</p></div> : <div className="issueList">
        {graph.videosWithoutArchive.slice(0, 6).map((video: any) => <button type="button" key={`v-${video.slug}`} onClick={() => onNavigate("archives")}><b>{video.title}</b><span>Vídeo sem dossiê relacionado</span></button>)}
        {graph.archivesWithoutVideo.slice(0, 6).map((archive: any) => <button type="button" key={`a-${archive.slug}`} onClick={() => onNavigate("archives")}><b>{archive.title}</b><span>Dossiê aponta para vídeo inexistente</span></button>)}
        {graph.duplicateVideoIds.map(([videoId]) => <button type="button" key={`d-${videoId}`} onClick={() => onNavigate("transmissions")}><b>{String(videoId)}</b><span>YouTube videoId duplicado</span></button>)}
      </div>}
    </section>
  </div>;
}
function AdminDashboard({ content, stats, backups, onNavigate }: { content: any; stats: any; backups: BackupRecord[]; onNavigate: (section: Section) => void }) {
  const items = allEditorialItems(content);
  const privateItems = items.filter((item) => statusType(item.status) === "private");
  const publishedItems = items.filter((item) => statusType(item.status) === "published");
  const seoPending = items.filter((item) => !item.seoTitle || !item.seoDescription);
  const imagePending = items.filter((item) => !item.image && item.kind !== "Relato");
  const categoryImagePending = (content.categories ?? []).filter((category: any) => !category.image);
  const heroSlugs = content.hero?.carouselSelectedSlugs ?? [];
  const heroTitle = content.hero?.carouselItems?.[0]?.title ?? content.featuredTransmission?.title ?? content.hero?.title ?? "Hero não definido";
  const latestTransmission = [...(content.videos ?? [])].reverse().find((item: any) => statusType(item.status) === "published") ?? content.videos?.[0];
  const lastBackup = backups?.[0];
  const healthScore = Math.max(0, 100 - seoPending.length * 8 - imagePending.length * 6 - privateItems.length * 3);
  const criticalIssues = [
    ...seoPending.slice(0, 3).map((item: any) => ({ label: `${item.kind}: ${item.title}`, detail: "SEO pendente", section: item.section })),
    ...imagePending.slice(0, 2).map((item: any) => ({ label: `${item.kind}: ${item.title}`, detail: "Imagem ausente", section: item.section })),
    ...categoryImagePending.slice(0, 2).map((item: any) => ({ label: `Categoria: ${item.title}`, detail: "Imagem de categoria ausente", section: "categories" as Section })),
  ].slice(0, 6);

  return <div className="adminDashboard editorialDashboard">
    <div className="adminDashGrid editorialStats">
      <div><b>{stats.transmissions}</b><span>Transmissões</span></div>
      <div><b>{stats.archives}</b><span>Arquivos</span></div>
      <div><b>{stats.reports}</b><span>Relatos</span></div>
      <div><b>{stats.categories}</b><span>Categorias</span></div>
    </div>

    <section className="terminalPanel editorialCommandCenter">
      <div>
        <span>Status editorial</span>
        <h2>Central de Operação</h2>
        <p>Visão rápida das pendências, publicação e integridade do acervo antes do próximo deploy.</p>
      </div>
      <div className="healthGauge"><b>{healthScore}%</b><small>saúde editorial</small></div>
    </section>

    <div className="editorialDashboardGrid">
      <section className="terminalPanel editorialCard">
        <span>Última transmissão</span>
        <h3>{latestTransmission?.title ?? "Nenhuma transmissão"}</h3>
        <p>{latestTransmission?.description ?? "Cadastre uma transmissão para iniciar o acervo editorial."}</p>
        <button className="btn" type="button" onClick={() => onNavigate("transmissions")}>Revisar transmissões</button>
      </section>
      <section className="terminalPanel editorialCard">
        <span>Hero ativo</span>
        <h3>{heroTitle}</h3>
        <p>{heroSlugs.length ? `${heroSlugs.length} item(ns) no carrossel principal.` : "Nenhum item marcado no carrossel. Revise o Hero antes do deploy."}</p>
        <button className="btn" type="button" onClick={() => onNavigate("hero")}>Abrir Hero</button>
      </section>
      <section className="terminalPanel editorialCard">
        <span>Último backup</span>
        <h3>{lastBackup ? lastBackup.file : "Nenhum backup encontrado"}</h3>
        <p>{lastBackup ? formatDateTime(lastBackup.createdAt) : "O primeiro backup em banco será criado automaticamente no próximo salvamento."}</p>
        <button className="btn" type="button" onClick={() => onNavigate("json")}>Modo Dev</button>
      </section>
    </div>

    <div className="editorialDashboardGrid narrow">
      <section className="terminalPanel editorialOpsPanel">
        <span>Fila editorial</span>
        <div className="opsRows">
          <button type="button" onClick={() => onNavigate("transmissions")}><b>{publishedItems.length}</b><small>Publicados</small></button>
          <button type="button" onClick={() => onNavigate("transmissions")}><b>{privateItems.length}</b><small>Privados</small></button>
          <button type="button" onClick={() => onNavigate("youtube")}><b>QE</b><small>Nova publicação</small></button>
        </div>
      </section>
      <section className="terminalPanel editorialOpsPanel">
        <span>Pendências detectadas</span>
        <div className="opsRows">
          <button type="button" onClick={() => onNavigate("transmissions")}><b>{seoPending.length}</b><small>SEO pendente</small></button>
          <button type="button" onClick={() => onNavigate("archives")}><b>{imagePending.length}</b><small>Imagens faltando</small></button>
          <button type="button" onClick={() => onNavigate("categories")}><b>{categoryImagePending.length}</b><small>Categorias sem imagem</small></button>
          <button type="button" onClick={() => onNavigate("pipeline")}><b>DRY</b><small>Simular pacote</small></button>
        </div>
      </section>
    </div>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Checklist operacional</span><h2>Pontos antes do deploy</h2></div><button className="btn" type="button" onClick={() => onNavigate("youtube")}>Nova publicação</button></div>
      {criticalIssues.length ? <div className="issueList">{criticalIssues.map((issue, index) => <button type="button" key={`${issue.label}-${index}`} onClick={() => onNavigate(issue.section)}><b>{issue.detail}</b><span>{issue.label}</span></button>)}</div> : <div className="allClear"><b>Acervo sem pendências críticas.</b><p>SEO, imagens e categorias principais estão em bom estado para o próximo deploy.</p></div>}
    </section>
  </div>;
}


function YouTubeIntelligencePanel({ content, onApply }: { content: any; onApply: (nextContent: any, message: string) => void }) {
  const [youtubeUrl, setYoutubeUrl] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState(CATEGORY_OPTIONS[0]);
  const [year, setYear] = useState("2026");
  const [status, setStatus] = useState("Privado");
  const [description, setDescription] = useState("Abrir transmissão no arquivo.");
  const [createArchive, setCreateArchive] = useState(true);
  const [contentType, setContentType] = useState("transmissao");
  const [showInHero, setShowInHero] = useState(false);
  const [packageText, setPackageText] = useState("");
  const [localStatus, setLocalStatus] = useState("");

  const videoId = extractYouTubeId(youtubeUrl);
  const canonicalUrl = youtubeWatchUrl(videoId) || youtubeUrl.trim();
  const embedUrl = youtubeEmbed(videoId);
  const thumbnail = youtubeThumb(videoId);
  const thumbs = youtubeThumbnailSet(videoId);
  const effectiveCategory = contentType === "relato" ? "Relatos" : category;
  const safeTitle = title.trim() || draftTitleFromVideoId(videoId);
  const slug = slugify(safeTitle);
  const nextTransmissionCode = nextCode(contentType === "relato" ? "QE-R" : "QE-V", [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean));
  const nextArchiveCode = nextCode("QE", content.archives ?? []);
  const archiveSlug = createArchive ? slug : "";
  const sourceId = videoId ? `youtube:${videoId}` : "";

  function buildPackage() {
    if (!videoId) {
      setLocalStatus("❌ URL do YouTube inválida ou sem video id.");
      return;
    }

    const pkg = `QE_PACKAGE_VERSION: 1.3

TRANSMISSION
CODE: ${nextTransmissionCode}
TITLE: ${safeTitle}
SLUG: ${slug}
CONTENT_TYPE: ${contentType}
CATEGORY: ${effectiveCategory}
YEAR: ${year}
STATUS: ${status}
SOURCE_PROVIDER: youtube
SOURCE_URL: ${canonicalUrl}
VIDEO_ID: ${videoId}
EMBED_URL: ${embedUrl}
YOUTUBE: ${canonicalUrl}
IMAGE: ${thumbnail}
HERO: ${showInHero ? "true" : "false"}
DESCRIPTION:
${description.trim() || "Abrir transmissão no arquivo."}
TAGS:
- ${effectiveCategory.toLowerCase()}
- quarto elemento
- youtube
SEO_TITLE: ${safeTitle} | O Quarto Elemento
SEO_DESCRIPTION: ${description.trim() || `Arquivo investigativo sobre ${safeTitle}.`}
RELATED_ARCHIVES:${archiveSlug ? `\n- ${archiveSlug}` : ""}
AI_NOTES:
Publicação criada pela Visibility Publishing v6.3. Fonte detectada automaticamente a partir da URL. Revisar título, descrição, tags, SEO e relacionamentos antes da publicação.
END_TRANSMISSION${createArchive ? `

ARCHIVE
CODE: ${nextArchiveCode}
TITLE: ${safeTitle}
SLUG: ${archiveSlug}
CONTENT_TYPE: ${contentType}
CATEGORY: ${effectiveCategory}
YEAR: ${year}
STATUS: Privado
CLASSIFICATION: Em investigação
ACCESS_LEVEL: LV.03
LOCATION: Brasil
IMAGE: ${thumbnail}
SUMMARY:
Dossiê inicial criado a partir da transmissão ${safeTitle}.
DESCRIPTION:
Arquivo investigativo vinculado à transmissão ${safeTitle}.
LONG_DESCRIPTION:
Este dossiê foi criado automaticamente como ponto de partida editorial. Complete o texto com o contexto investigativo, evidências, linha do tempo e conexões do caso.
RELATED_TRANSMISSION_SLUG: ${slug}
TAGS:
- ${effectiveCategory.toLowerCase()}
- dossiê
- youtube-source
SEO_TITLE: ${safeTitle} | Dossiê | O Quarto Elemento
SEO_DESCRIPTION: Dossiê investigativo relacionado à transmissão ${safeTitle}.
AI_NOTES:
Arquivo/dossiê inicial gerado automaticamente pela Auto Dossier Generation v6.2. Revisar conteúdo antes de publicar.
END_ARCHIVE` : ""}

TIMELINE
YEAR: ${year}
TITLE: ${safeTitle}
DESCRIPTION:
Publicação catalogada no Arquivo Digital do Quarto Elemento a partir da fonte YouTube. Este evento foi gerado automaticamente e pode ser enriquecido manualmente depois.
ARCHIVE_SLUG: ${archiveSlug}
CONTENT_SLUG: ${slug}
CONTENT_TYPE: ${contentType}
EVENT_TYPE: publication
PRECISION: year
IS_AUTO: true
END_TIMELINE`;

    setPackageText(pkg);
    setLocalStatus("✅ Publicação gerada. Revise o pacote antes de aplicar.");
  }

  function applyGenerated() {
    const parsed = parseQePackage(packageText);
    if (parsed.errors.length) {
      setLocalStatus(`❌ Pacote inválido: ${parsed.errors.join(" ")}`);
      return;
    }
    const result = applyQePackage(content, parsed);
    onApply(result.content, `YouTube Intelligence: ${parsed.blocks.length} bloco(s) aplicado(s) localmente. Revise e clique em Salvar alterações para publicar no Supabase.`);
    setLocalStatus("✅ Publicação aplicada localmente. Falta salvar no Supabase.");
  }

  return <div className="pipelineGrid youtubeIntelligenceGrid">
    <section className="terminalPanel packageImporter">
      <div className="cmsEditorHead"><div><span>QE YouTube Intelligence</span><h2>Nova publicação por URL</h2></div></div>
      <p className="cmsHint">Cole a URL do YouTube para gerar um rascunho editorial estruturado. Esta fundação v7.1 cria vídeo, dossiê e evento inicial de timeline a partir da mesma URL, evitando double-input no acervo.</p>
      <div className="cmsEditorGrid single">
        <div>
          <TextField label="URL do YouTube" value={youtubeUrl} onChange={setYoutubeUrl} />
          <TextField label="Título editorial" value={title} onChange={setTitle} />
          <div className="cmsField"><span>Tipo de conteúdo</span><select value={contentType} onChange={(e) => { setContentType(e.target.value); if (e.target.value === "relato") { setCategory("Relatos"); } }}><option value="transmissao">Transmissão</option><option value="relato">Relato</option><option value="short">Short</option><option value="especial">Especial</option></select></div>
          <div className="cmsField"><span>Categoria</span><select value={category} onChange={(e) => setCategory(e.target.value)}>{CATEGORY_OPTIONS.map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <div className="cmsField"><span>Visibilidade inicial</span><select value={status} onChange={(e) => setStatus(e.target.value)}>{["Privado", "Público"].map((option) => <option key={option} value={option}>{option}</option>)}</select></div>
          <TextField label="Ano" value={year} onChange={setYear} />
          <TextField label="Descrição curta" value={description} textarea onChange={setDescription} />
          <label className="cmsField resetCheckbox"><span>Arquivo automático</span><label><input type="checkbox" checked={createArchive} onChange={(e) => setCreateArchive(e.target.checked)} /> Criar arquivo/dossiê automaticamente a partir desta publicação</label></label>
          <label className="cmsField resetCheckbox"><span>Hero</span><label><input type="checkbox" checked={showInHero} onChange={(e) => setShowInHero(e.target.checked)} /> Sugerir transmissão no carrossel principal</label></label>
        </div>
      </div>
      <div className="packageActions"><button className="btn btnRed" type="button" onClick={buildPackage}>Gerar publicação + dossiê + timeline</button><button className="btn" type="button" onClick={applyGenerated} disabled={!packageText.trim()}>Aplicar localmente</button></div>
      {localStatus && <div className={localStatus.startsWith("❌") ? "packageErrors" : "packageApplied"}><p>{localStatus}</p></div>}
      <textarea className="packageEditor" value={packageText} placeholder="O QE Package v1.3 com vídeo + dossiê + timeline aparecerá aqui..." onChange={(e) => setPackageText(e.target.value)} />
    </section>
    <aside className="terminalPanel packagePreview youtubeIntelligencePreview">
      <span>Source + Dossier Intelligence</span>
      <h3>{safeTitle}</h3>
      <div className="packageCounts"><p>Provider: <b>{videoId ? "YouTube" : "—"}</b></p><p>Video ID: <b>{videoId || "—"}</b></p><p>Source ID: <b>{sourceId || "—"}</b></p><p>Código sugerido: <b>{nextTransmissionCode}</b></p><p>Slug: <b>{slug}</b></p><p>Embed: <b>{embedUrl ? "gerado" : "pendente"}</b></p><p>Thumbnail: <b>{thumbnail ? "detectada" : "pendente"}</b></p></div>
      {thumbnail && <PreviewCard item={{ title: safeTitle, description, image: thumbnail, category: effectiveCategory, status }} type={contentType === "relato" ? "Relato YouTube" : "YouTube"} />}
      {thumbs.length > 0 && <div className="sourceThumbList"><b>Thumbnails públicas</b>{thumbs.map((thumb) => <a key={thumb.label} href={thumb.url} target="_blank" rel="noreferrer">{thumb.label}</a>)}</div>}
      {embedUrl && <div className="embedPreview"><iframe src={embedUrl} title="YouTube preview" allowFullScreen /></div>}
      <div className="packageErrors"><b>Limite da v6.0</b><p>Esta versão não consulta a API oficial do YouTube. O foco da v7.1 é transformar uma única URL em vídeo + arquivo/dossiê + evento de timeline vinculados. Metadados reais entram na próxima etapa com YouTube Data API.</p></div>
    </aside>
  </div>;
}

function ContentPipelinePanel({ content, onApply }: { content: any; onApply: (nextContent: any, message: string) => void }) {
  const [packageText, setPackageText] = useState("");
  const [preview, setPreview] = useState<QePackageResult | null>(null);
  const [appliedSummary, setAppliedSummary] = useState<any | null>(null);
  const parsed = preview ?? parseQePackage(packageText);
  const analysis = useMemo(() => analyzeQePackage(content, parsed), [content, parsed]);
  const counts = parsed.blocks.reduce((acc: any, block) => { acc[block.type] = (acc[block.type] ?? 0) + 1; return acc; }, {});
  function validate() { setPreview(parseQePackage(packageText)); setAppliedSummary(null); }
  function apply() {
    const nextParsed = parseQePackage(packageText);
    setPreview(nextParsed);
    if (nextParsed.errors.length) return;
    const result = applyQePackage(content, nextParsed);
    setAppliedSummary(result.summary);
    onApply(result.content, `Pacote aplicado em modo local: ${nextParsed.blocks.length} bloco(s). Revise o preview e clique em Salvar alterações para publicar.`);
  }
  return <div className="pipelineGrid"><section className="terminalPanel packageImporter"><div className="cmsEditorHead"><div><span>QE Content Pipeline</span><h2>Central de Publicação</h2></div><button className="btn" type="button" onClick={() => { setPackageText(SAMPLE_QE_PACKAGE); setPreview(null); setAppliedSummary(null); }}>Carregar exemplo</button></div><p className="cmsHint">Cole aqui o pacote gerado pelo ChatGPT. O Content Studio interpreta o texto, simula as alterações e só aplica localmente depois da sua confirmação.</p><textarea className="packageEditor" value={packageText} placeholder="Cole o QE Content Package aqui..." onChange={(e) => { setPackageText(e.target.value); setPreview(null); setAppliedSummary(null); }} /><div className="packageActions"><button className="btn" type="button" onClick={validate}>Simular pacote</button><button className="btn btnRed" type="button" onClick={apply} disabled={!packageText.trim() || parsed.errors.length > 0}>Aplicar localmente</button></div></section><aside className="terminalPanel packagePreview"><span>Preview de importação</span><h3>{parsed.errors.length ? "Pacote pendente" : "Simulação pronta"}</h3>{parsed.errors.length ? <div className="packageErrors">{parsed.errors.map((error) => <p key={error}>⚠ {error}</p>)}</div> : <div className="packageCounts"><p>Versão: <b>{parsed.version}</b></p><p>Criações: <b>{analysis.creates}</b></p><p>Atualizações: <b>{analysis.updates}</b></p><p>Transmissões: <b>{counts.TRANSMISSION ?? 0}</b></p><p>Arquivos: <b>{counts.ARCHIVE ?? 0}</b></p><p>Relatos: <b>{counts.REPORT ?? 0}</b></p><p>Categorias: <b>{counts.CATEGORY ?? 0}</b></p><p>Hero: <b>{counts.HERO ?? 0}</b></p><p>Timeline: <b>{counts.TIMELINE ?? 0}</b></p></div>}{analysis.warnings.length > 0 && <div className="packageErrors"><b>Atenção antes de aplicar</b>{analysis.warnings.slice(0, 6).map((warning) => <p key={warning}>⚠ {warning}</p>)}</div>}{analysis.actions.length > 0 && <div className="packageBlockList">{analysis.actions.slice(0, 8).map((action) => <div key={action}><small>DRY RUN</small><b>{action}</b></div>)}</div>}{parsed.blocks.length > 0 && <div className="packageBlockList">{parsed.blocks.map((block, index) => <div key={`${block.type}-${index}`}><small>{block.type}</small><b>{getField(block.data, "title") ?? getField(block.data, "slug") ?? `Bloco ${index + 1}`}</b></div>)}</div>}{appliedSummary && <div className="packageApplied"><b>Pacote aplicado localmente.</b><p>Use “Salvar alterações” no topo para gravar no Supabase. Um backup no banco será criado antes de salvar.</p></div>}</aside></div>;
}


function DatabasePanel() {
  const [status, setStatus] = useState<any | null>(null);
  const [loading, setLoading] = useState(false);
  const [importResult, setImportResult] = useState<any | null>(null);
  const [resetConfirmation, setResetConfirmation] = useState("");
  const [fullReset, setFullReset] = useState(false);
  const [resetResult, setResetResult] = useState<any | null>(null);

  async function checkConnection() {
    setLoading(true);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/supabase/status", { cache: "no-store" });
      setStatus(await res.json());
    } catch {
      setStatus({ ok: false, message: "Erro ao consultar status do Supabase." });
    } finally {
      setLoading(false);
    }
  }

  async function importJson() {
    setLoading(true);
    setImportResult(null);
    setResetResult(null);
    try {
      const res = await fetch("/api/admin/supabase/import", { method: "POST" });
      setImportResult(await res.json());
      await checkConnection();
    } catch {
      setImportResult({ ok: false, message: "Erro ao importar JSON para Supabase." });
    } finally {
      setLoading(false);
    }
  }


  async function resetArchive() {
    setLoading(true);
    setResetResult(null);
    setImportResult(null);
    try {
      const res = await fetch("/api/admin/supabase/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ confirmation: resetConfirmation, fullReset }),
      });
      const data = await res.json().catch(() => ({ ok: false, message: "Resposta inválida do servidor." }));
      setResetResult(data);
      if (data.ok) {
        setResetConfirmation("");
        await checkConnection();
      }
    } catch {
      setResetResult({ ok: false, message: "Erro ao executar reset editorial." });
    } finally {
      setLoading(false);
    }
  }

  return <div className="dashboardGrid">
    <section className="terminalPanel editorialHeroPanel">
      <span>Supabase Foundation</span>
      <h2>Fonte Oficial do Acervo</h2>
      <p>O Supabase agora é a fonte oficial de leitura e escrita do Content Studio. O JSON local permanece apenas como fallback de emergência, exportação e ponto de partida para reimportações legadas.</p>
      <div className="packageActions">
        <button className="btn" type="button" onClick={checkConnection} disabled={loading}>Verificar conexão</button>
        <button className="btn btnRed" type="button" onClick={importJson} disabled={loading}>Reimportar JSON legado</button>
      </div>
    </section>

    <section className="terminalPanel editorialOpsPanel">
      <span>Status da conexão</span>
      <div className="packageCounts">
        <p>Estado: <b>{status ? (status.ok ? "Conectado" : "Atenção") : "Não verificado"}</b></p>
        <p>Modo: <b>{status?.mode ?? "—"}</b></p>
        <p>Categorias no banco: <b>{status?.categories ?? "—"}</b></p>
      </div>
      {status?.message && <div className={status.ok ? "packageApplied" : "packageErrors"}><p>{status.message}</p></div>}
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Reset editorial seguro</span><h2>Limpar acervo oficial</h2></div></div>
      <p className="cmsHint">Use apenas quando quiser reiniciar a base e republicar o acervo pelo fluxo novo. Antes de limpar, o sistema cria um backup em <b>qe_backups</b>.</p>
      <div className="issueList">
        <button type="button"><b>Modo padrão</b><span>Limpa transmissões, arquivos, relatos e timeline. Mantém categorias e configurações.</span></button>
        <button type="button"><b>Modo completo</b><span>Também limpa categorias. Use só para reconstrução total do acervo.</span></button>
      </div>
      <label className="cmsField resetCheckbox"><span>Reset completo</span><label><input type="checkbox" checked={fullReset} onChange={(e) => setFullReset(e.target.checked)} /> Também limpar categorias</label></label>
      <TextField label={fullReset ? "Digite LIMPAR TUDO QUARTO ELEMENTO" : "Digite LIMPAR ACERVO QUARTO ELEMENTO"} value={resetConfirmation} onChange={setResetConfirmation} />
      <div className="packageActions"><button className="btn danger" type="button" onClick={resetArchive} disabled={loading || resetConfirmation !== (fullReset ? "LIMPAR TUDO QUARTO ELEMENTO" : "LIMPAR ACERVO QUARTO ELEMENTO")}>{loading ? "Processando..." : "Executar reset seguro"}</button></div>
      {resetResult && <div className={resetResult.ok ? "packageApplied" : "packageErrors"}><b>{resetResult.ok ? "Reset concluído" : "Reset bloqueado"}</b><p>{resetResult.ok ? `Modo: ${resetResult.mode}. Backup: ${resetResult.backup?.ok ? resetResult.backup.id : "não criado"}.` : resetResult.message}</p></div>}
      {resetResult?.steps && <div className="packageBlockList">{resetResult.steps.map((item: any) => <div key={`${item.table}-${item.action ?? "delete"}`}><small>{item.table}</small><b>{item.count} registro(s)</b></div>)}</div>}
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Plano de migração</span><h2>Supabase Source of Truth</h2></div></div>
      <div className="issueList">
        <button type="button"><b>1. Criar tabelas</b><span>Schema aplicado no Supabase.</span></button>
        <button type="button"><b>2. Configurar variáveis</b><span>Variáveis configuradas em local e produção.</span></button>
        <button type="button"><b>3. Reset seguro</b><span>Limpar base oficial somente após backup em banco.</span></button>
        <button type="button"><b>4. Próxima versão</b><span>Popular acervo via URL do YouTube e QE Package.</span></button>
      </div>
    </section>

    {importResult && <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Resultado da importação</span><h2>{importResult.ok ? "Importação concluída" : "Importação não concluída"}</h2></div></div>
      {importResult.ok ? <div className="packageBlockList">{(importResult.results ?? []).map((item: any) => <div key={item.table}><small>{item.table}</small><b>{item.count} registro(s)</b></div>)}</div> : <div className="packageErrors"><p>{importResult.message}</p></div>}
    </section>}
  </div>;
}


type DiagnosticTable = {
  table: string;
  label: string;
  required: boolean;
  ok: boolean;
  count: number | null;
  message?: string;
};

type DiagnosticResult = {
  ok: boolean;
  version: string;
  schemaVersion: string;
  checkedAt: string;
  environment: string;
  supabase: {
    configured: boolean;
    adminConfigured: boolean;
    mode: string;
    urlConfigured: boolean;
    publishableKeyConfigured: boolean;
    serviceRoleKeyConfigured: boolean;
  };
  tables: DiagnosticTable[];
  migrations: { applied: boolean; count: number; latest?: string; message?: string };
  counts: Record<string, number | null>;
  recommendations: string[];
};

function DiagnosticsPanel() {
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult | null>(null);
  const [loading, setLoading] = useState(false);

  async function runDiagnostics() {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/diagnostics", { cache: "no-store" });
      const data = await res.json();
      setDiagnostics(data);
    } catch {
      setDiagnostics({
        ok: false,
        version: "v6.4",
        schemaVersion: "unknown",
        checkedAt: new Date().toISOString(),
        environment: "unknown",
        supabase: { configured: false, adminConfigured: false, mode: "error", urlConfigured: false, publishableKeyConfigured: false, serviceRoleKeyConfigured: false },
        tables: [],
        migrations: { applied: false, count: 0, message: "Falha ao consultar diagnóstico." },
        counts: {},
        recommendations: ["Verifique a API /api/admin/diagnostics e as variáveis de ambiente."],
      });
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { runDiagnostics(); }, []);

  const requiredTables = diagnostics?.tables.filter((table) => table.required) ?? [];
  const optionalTables = diagnostics?.tables.filter((table) => !table.required) ?? [];
  const healthScore = diagnostics
    ? Math.round(([
        diagnostics.supabase.configured,
        diagnostics.supabase.adminConfigured,
        diagnostics.migrations.applied,
        ...requiredTables.map((table) => table.ok),
      ].filter(Boolean).length / Math.max(1, 3 + requiredTables.length)) * 100)
    : 0;

  return <div className="dashboardGrid diagnosticsPanel">
    <section className="terminalPanel editorialHeroPanel">
      <span>QE Platform Diagnostics</span>
      <h2>Diagnóstico da Plataforma</h2>
      <p>Verifique conexão, variáveis, tabelas obrigatórias, migrações, contagens do acervo e compatibilidade entre o Content Studio e o Supabase.</p>
      <div className="packageActions">
        <button className="btn btnRed" type="button" onClick={runDiagnostics} disabled={loading}>{loading ? "Executando..." : "Executar diagnóstico"}</button>
      </div>
    </section>

    <section className="terminalPanel editorialCommandCenter">
      <div>
        <span>Status geral</span>
        <h2>{diagnostics?.ok ? "Plataforma operacional" : "Atenção necessária"}</h2>
        <p>Versão: <b>{diagnostics?.version ?? "v6.4"}</b> · Schema: <b>{diagnostics?.schemaVersion ?? "—"}</b> · Ambiente: <b>{diagnostics?.environment ?? "—"}</b></p>
        <p>Última verificação: <b>{diagnostics ? formatDateTime(diagnostics.checkedAt) : "—"}</b></p>
      </div>
      <div className="healthGauge"><b>{healthScore}%</b><small>saúde técnica</small></div>
    </section>

    <section className="terminalPanel editorialOpsPanel">
      <span>Supabase</span>
      <div className="packageCounts">
        <p>Configurado: <b>{diagnostics?.supabase.configured ? "Sim" : "Não"}</b></p>
        <p>Modo: <b>{diagnostics?.supabase.mode ?? "—"}</b></p>
        <p>Admin/Service Role: <b>{diagnostics?.supabase.adminConfigured ? "Sim" : "Não"}</b></p>
        <p>URL: <b>{diagnostics?.supabase.urlConfigured ? "OK" : "Ausente"}</b></p>
        <p>Publishable Key: <b>{diagnostics?.supabase.publishableKeyConfigured ? "OK" : "Ausente"}</b></p>
        <p>Service Role Key: <b>{diagnostics?.supabase.serviceRoleKeyConfigured ? "OK" : "Ausente"}</b></p>
      </div>
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Migrações</span><h2>Schema versionado</h2></div></div>
      <div className={diagnostics?.migrations.applied ? "packageApplied" : "packageErrors"}>
        <b>{diagnostics?.migrations.applied ? "Controle de migrações ativo" : "Controle de migrações pendente"}</b>
        <p>{diagnostics?.migrations.message ?? `${diagnostics?.migrations.count ?? 0} migração(ões) registrada(s). Última: ${diagnostics?.migrations.latest ?? "—"}`}</p>
      </div>
      <p className="cmsHint">Se o controle estiver pendente, execute <b>docs/SUPABASE_V6_4_DIAGNOSTICS.sql</b> no SQL Editor do Supabase.</p>
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Tabelas obrigatórias</span><h2>Integridade do banco</h2></div></div>
      <div className="packageBlockList">
        {requiredTables.map((table) => <div key={table.table}>
          <small>{table.ok ? "OK" : "PENDENTE"}</small>
          <b>{table.label}</b>
          <span>{table.ok ? `${table.count ?? 0} registro(s)` : table.message ?? "Tabela indisponível"}</span>
        </div>)}
      </div>
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Tabelas opcionais</span><h2>Recursos avançados</h2></div></div>
      <div className="packageBlockList">
        {optionalTables.map((table) => <div key={table.table}>
          <small>{table.ok ? "OK" : "NÃO ATIVO"}</small>
          <b>{table.label}</b>
          <span>{table.ok ? `${table.count ?? 0} registro(s)` : table.message ?? "Opcional"}</span>
        </div>)}
      </div>
    </section>

    <section className="terminalPanel editorialIssues">
      <div className="cmsEditorHead"><div><span>Recomendações</span><h2>Checklist técnico</h2></div></div>
      <div className="issueList">
        {(diagnostics?.recommendations?.length ? diagnostics.recommendations : ["Nenhuma pendência crítica detectada."]).map((item) => <button type="button" key={item}><b>{item}</b><span>Diagnóstico v6.4</span></button>)}
      </div>
    </section>
  </div>;
}

export default function AdminPage() {
  const [content, setContent] = useState<any | null>(null);
  const [active, setActive] = useState<Section>("dashboard");
  const [status, setStatus] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [saveDebug, setSaveDebug] = useState<any | null>(null);
  const [backups, setBackups] = useState<BackupRecord[]>([]);
  useEffect(() => { fetch("/api/admin/content", { cache: "no-store" }).then((r) => r.json()).then(setContent); }, []);
  useEffect(() => { fetch("/api/admin/backups", { cache: "no-store" }).then((r) => r.json()).then((data) => setBackups(data.backups ?? [])).catch(() => setBackups([])); }, []);
  const stats = useMemo(() => content ? { transmissions: [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean).length, archives: content.archives?.length ?? 0, reports: content.relatos?.length ?? 0, categories: content.categories?.length ?? 0 } : null, [content]);
  if (!content) return <main className="adminPage"><h1>Carregando Content Studio...</h1></main>;
  function update(path: string, value: any) { const clone = structuredClone(content); const parts = path.split("."); let target = clone; parts.slice(0, -1).forEach((p) => { target[p] = target[p] ?? {}; target = target[p]; }); target[parts[parts.length - 1]] = value; setContent(clone); }
  function updateArray(collection: string, index: number, value: any) { const clone = structuredClone(content); clone[collection][index] = value; setContent(clone); }
  function addItem(collection: string, item: any) { const clone = structuredClone(content); clone[collection] = [...(clone[collection] ?? []), item]; setContent(clone); }
  function removeItem(collection: string, index: number) { const clone = structuredClone(content); clone[collection] = clone[collection].filter((_: any, i: number) => i !== index); setContent(clone); }
  async function uploadImage(file: File) { const fd = new FormData(); fd.append("file", file); const res = await fetch("/api/admin/upload", { method: "POST", body: fd }); const data = await res.json(); return data.url; }
  async function saveContent() {
    setIsSaving(true);
    setStatus("Salvando alterações no Supabase (fonte oficial)...");
    setSaveDebug(null);

    const clone = structuredClone(content);
    const heroSelected = [clone.featuredTransmission, ...(clone.videos ?? [])]
      .filter((item: any) => item?.showInHero)
      .sort((a: any, b: any) => Number(a.heroOrder ?? 99) - Number(b.heroOrder ?? 99))
      .slice(0, 5);
    clone.hero = clone.hero ?? {};
    clone.hero.carouselSelectedSlugs = heroSelected.map((item: any) => item.slug);
    clone.hero.carouselItems = heroSelected.map((item: any) => ({
      code: item.code,
      title: item.title,
      description: item.description,
      image: item.image,
      slug: item.slug,
      youtubeUrl: item.youtubeUrl,
      category: item.category,
    }));

    try {
      const res = await fetch("/api/admin/content", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(clone),
      });
      const data = await res.json().catch(() => ({ message: "Resposta inválida do servidor." }));
      setSaveDebug(data);

      if (res.ok) {
        const target = data.primaryTarget === "supabase" ? "Supabase" : "JSON";
        const warning = data.warning ? ` Aviso: ${data.warning}` : "";
        const duration = typeof data.durationMs === "number" ? ` em ${data.durationMs}ms` : "";
        setStatus(`✅ Conteúdo salvo em ${target}${duration} (${new Date().toLocaleTimeString()}).${warning}`);
        setContent({ ...clone, __source: "supabase", __sourceOfTruth: "supabase" });
        fetch("/api/admin/backups", { cache: "no-store" })
          .then((r) => r.json())
          .then((data) => setBackups(data.backups ?? []))
          .catch(() => setBackups([]));
      } else {
        const table = data.table ? ` Tabela: ${data.table}.` : "";
        const step = data.step ? ` Etapa: ${data.step}.` : "";
        const details = data.supabase?.details ? ` Detalhes: ${data.supabase.details}.` : "";
        setStatus(`❌ Falha ao salvar.${step}${table} ${data.message ?? "Erro desconhecido."}${details}`);
        console.error("QE save failed", data);
      }
    } catch (error: any) {
      const message = error?.message ?? "Erro inesperado ao salvar.";
      setStatus(`❌ Falha ao salvar: ${message}`);
      setSaveDebug({ ok: false, message });
      console.error("QE save exception", error);
    } finally {
      setIsSaving(false);
    }
  }
  function downloadJson() { const blob = new Blob([JSON.stringify(content, null, 2)], { type: "application/json" }); const url = URL.createObjectURL(blob); const a = document.createElement("a"); a.href = url; a.download = "content.json"; a.click(); URL.revokeObjectURL(url); }
  async function logout() { await fetch("/api/admin/logout", { method: "POST" }); window.location.href = "/admin/login"; }
  return <main className="adminPage cmsPage"><header className="cmsTop"><div><span>QE Archive System</span><h1>Content Studio</h1><p>Gerencie o acervo sem editar código. A complexidade técnica fica recolhida; o foco fica no conteúdo.</p></div><div className="cmsTopActions"><button className="btn btnRed" onClick={saveContent} disabled={isSaving}>{isSaving ? "Salvando..." : "Salvar alterações"}</button><button className="btn" onClick={downloadJson}>Baixar JSON</button><button className="btn" onClick={() => setActive("youtube")}>Nova publicação</button><button className="btn" onClick={() => setActive("pipeline")}>Importar pacote</button><a className="btn" href="/">Ver site</a><button className="btn danger" onClick={logout}>Logout</button></div></header>{status && <div className={status.startsWith("❌") ? "adminStatus adminStatusError" : "adminStatus"}>{status}</div>}{saveDebug && !saveDebug.ok && <details className="terminalPanel saveDebug"><summary>Detalhes técnicos do último save</summary><pre>{JSON.stringify(saveDebug, null, 2)}</pre></details>}<section className="cmsShell"><aside className="cmsSidebar terminalPanel">{sidebarGroups.map((group) => <div className="cmsNavGroup" key={group.title}><span>{group.title}</span>{group.items.map((s) => <button className={active === s ? "active" : ""} key={s} onClick={() => setActive(s)}>{labels[s]}</button>)}</div>)}</aside><section className="cmsContent">{active === "dashboard" && stats && <AdminDashboard content={content} stats={stats} backups={backups} onNavigate={setActive} />}
    {active === "transmissions" && <CollectionManager title="Transmissões" type="transmission" items={content.videos ?? []} content={content} uploadImage={uploadImage} groups={transmissionGroups} onAdd={() => addItem("videos", emptyTransmission(content.videos?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("videos", i, v)} onRemove={(i: number) => removeItem("videos", i)} />}
  {active === "archives" && <CollectionManager title="Arquivos" type="archive" items={content.archives ?? []} content={content} uploadImage={uploadImage} groups={archiveGroups} onAdd={() => addItem("archives", emptyArchive(content.archives?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("archives", i, v)} onRemove={(i: number) => removeItem("archives", i)} />}
  {active === "youtube" && <YouTubeIntelligencePanel content={content} onApply={(nextContent, message) => { setContent(nextContent); setStatus(message); }} />}
  {active === "pipeline" && <ContentPipelinePanel content={content} onApply={(nextContent, message) => { setContent(nextContent); setStatus(message); }} />}
  {active === "categories" && <CollectionManager title="Categorias" type="category" items={content.categories ?? []} content={content} uploadImage={uploadImage} groups={categoryGroups} onAdd={() => addItem("categories", emptyCategory(content.categories?.length ?? 0))} onUpdate={(i: number, v: any) => updateArray("categories", i, v)} onRemove={(i: number) => removeItem("categories", i)} />}
  {active === "database" && <DatabasePanel />}
  {active === "graph" && <KnowledgeGraphPanel content={content} onNavigate={setActive} />}
  {active === "diagnostics" && <DiagnosticsPanel />}
  {active === "timeline" && <CollectionManager title="Timeline" type="archive" items={content.timeline ?? []} content={content} uploadImage={uploadImage} groups={timelineGroups} onAdd={() => addItem("timeline", { year: "2026", title: "Novo evento", text: "Descrição do evento." })} onUpdate={(i: number, v: any) => updateArray("timeline", i, v)} onRemove={(i: number) => removeItem("timeline", i)} />}
  {active === "hero" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Publicação</span><h2>Hero principal</h2></div></div><div className="cmsEditorGrid"><div>{["eyebrow", "title", "subtitle", "description", "image", "primaryActionLabel", "secondaryActionLabel", "featuredArchiveSlug", "featuredTransmissionSlug", "featuredTransmissionYoutubeUrl"].map((f) => f === "image" ? <UploadField key={f} label={label(f)} value={content.hero?.[f] ?? ""} onChange={(v) => update(`hero.${f}`, v)} onUpload={uploadImage} /> : <TextField key={f} label={label(f)} value={content.hero?.[f] ?? ""} textarea={f === "description"} onChange={(v) => update(`hero.${f}`, v)} />)}<div className="cmsField"><span>Carrossel do Hero</span><p className="cmsHint">Marque “Exibir no Hero” nas transmissões para controlar o carrossel.</p></div></div><PreviewCard item={{ title: content.hero?.title, description: content.hero?.description, image: content.hero?.image, category: "Hero", status: "Ativo" }} type="Hero" /></div></div>}
  {active === "settings" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Sistema</span><h2>Configurações do site</h2></div></div><div className="cmsEditorGrid single"><div><TextField label="Título do site" value={content.site?.title} onChange={(v) => update("site.title", v)} /><TextField label="Tagline" value={content.site?.tagline} onChange={(v) => update("site.tagline", v)} /><TextField label="Descrição" value={content.site?.description} textarea onChange={(v) => update("site.description", v)} /><TextField label="E-mail de relatos" value={content.site?.emailRelatos} onChange={(v) => update("site.emailRelatos", v)} /><TextField label="URL YouTube" value={content.site?.youtubeUrl} onChange={(v) => update("site.youtubeUrl", v)} /><TextField label="URL Instagram" value={content.site?.instagramUrl} onChange={(v) => update("site.instagramUrl", v)} /></div></div></div>}
  {active === "json" && <div className="cmsEditor terminalPanel"><div className="cmsEditorHead"><div><span>Modo desenvolvedor</span><h2>JSON completo</h2></div></div><p className="cmsHint devHint">Use apenas para conferência avançada, exportação ou correções pontuais. O Supabase agora é a fonte oficial do acervo; este JSON é somente exportação/fallback.</p><textarea className="jsonEditor" value={JSON.stringify(content, null, 2)} onChange={(e) => { try { setContent(JSON.parse(e.target.value)); } catch { setStatus("JSON inválido."); } }} /></div>}
  </section></section><footer className="cmsVersionFooter">QE Content Studio · v7.1.0 · Timeline Intelligence · Schema 006</footer></main>;
}
