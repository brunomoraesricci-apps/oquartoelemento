import { createSupabaseAdminClient, createSupabasePublicClient, getSupabaseConfig } from "./supabase";
import { normalizeContent } from "./contentModel";

function slugify(value: string) {
  return String(value ?? "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

function arr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}

function tableRowBase(item: any) {
  return {
    title: item.title ?? "",
    slug: item.slug ?? slugify(item.title ?? "item"),
    description: item.description ?? item.summary ?? "",
    image: item.image ?? item.thumbnail ?? "",
    status: item.status ?? "Publicado",
    seo_title: item.seoTitle ?? item.title ?? "",
    seo_description: item.seoDescription ?? item.summary ?? item.description ?? "",
    og_image: item.ogImage ?? item.image ?? "",
    ai_notes: item.aiNotes ?? "",
    raw: item,
    updated_at: new Date().toISOString(),
  };
}

export function mapContentToSupabaseRows(content: any) {
  const categories = (content.categories ?? []).map((category: any, index: number) => ({
    ...tableRowBase(category),
    symbol: category.symbol ?? "◇",
    sort_order: Number(category.order ?? index + 1),
    active: category.active !== false,
  }));

  const transmissions = [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean).map((video: any, index: number) => ({
    ...tableRowBase(video),
    code: video.code ?? `QE-TX-${String(index + 1).padStart(3, "0")}`,
    youtube_url: video.youtubeUrl ?? "",
    category_slug: slugify(video.category ?? ""),
    published_at: video.publishedAt ?? video.year ?? "",
    year: String(video.year ?? video.publishedAt ?? ""),
    location: video.location ?? "",
    duration: video.duration ?? "",
    views: video.views ?? "",
    show_in_hero: Boolean(video.showInHero),
    hero_order: Number(video.heroOrder ?? index + 1),
    tags: arr(video.tags),
    related_archives: arr(video.relatedArchives),
    related_report_codes: arr(video.relatedReportCodes),
    ai_generated: Boolean(video.aiGenerated),
    ai_reviewed: Boolean(video.aiReviewed),
    ai_source_url: video.aiSourceUrl ?? "",
  }));

  const archives = (content.archives ?? []).map((archive: any, index: number) => ({
    ...tableRowBase(archive),
    code: archive.code ?? `QE-${String(index + 1).padStart(3, "0")}`,
    summary: archive.summary ?? archive.description ?? "",
    long_description: archive.longDescription ?? "",
    category_slug: slugify(archive.category ?? ""),
    location: archive.location ?? "",
    year: String(archive.year ?? ""),
    classification: archive.classification ?? archive.status ?? "Confidencial",
    access_level: archive.accessLevel ?? "",
    related_transmission_slug: archive.relatedTransmissionSlug ?? "",
    related_archives: arr(archive.relatedArchives),
    related_report_codes: arr(archive.relatedReportCodes),
    tags: arr(archive.tags),
    ai_generated: Boolean(archive.aiGenerated),
    ai_reviewed: Boolean(archive.aiReviewed),
    ai_source_url: archive.aiSourceUrl ?? "",
  }));

  const reports = (content.relatos ?? []).map((report: any, index: number) => ({
    ...tableRowBase(report),
    code: report.code ?? `RP-${String(index + 1).padStart(3, "0")}`,
    subtitle: report.subtitle ?? "",
    youtube_url: report.youtubeUrl ?? "",
    category_slug: slugify(report.category ?? "relatos"),
    location: report.location ?? "",
    year: String(report.year ?? ""),
    related_archive_slug: report.relatedArchiveSlug ?? "",
    related_transmission_slug: report.relatedTransmissionSlug ?? "",
    tags: arr(report.tags),
    ai_generated: Boolean(report.aiGenerated),
    ai_reviewed: Boolean(report.aiReviewed),
    ai_source_url: report.aiSourceUrl ?? "",
  }));

  const timeline = (content.timeline ?? []).map((event: any, index: number) => ({
    year: String(event.year ?? ""),
    title: event.title ?? "",
    description: event.text ?? event.description ?? "",
    archive_slug: event.archiveSlug ?? "",
    sort_order: Number(event.order ?? index + 1),
    raw: event,
    updated_at: new Date().toISOString(),
  }));

  const settings = [
    { key: "site", value: content.site ?? {}, updated_at: new Date().toISOString() },
    { key: "hero", value: content.hero ?? {}, updated_at: new Date().toISOString() },
    { key: "sections", value: content.sections ?? {}, updated_at: new Date().toISOString() },
    { key: "automation", value: content.automation ?? {}, updated_at: new Date().toISOString() },
    { key: "featuredCase", value: content.featuredCase ?? {}, updated_at: new Date().toISOString() },
    { key: "featuredArchive", value: content.featuredArchive ?? {}, updated_at: new Date().toISOString() },
    { key: "discovery", value: content.discovery ?? {}, updated_at: new Date().toISOString() },
    { key: "terminalLines", value: content.terminalLines ?? [], updated_at: new Date().toISOString() },
  ];

  return { categories, transmissions, archives, reports, timeline, settings };
}

async function upsertOrThrow(client: any, table: string, rows: any[], onConflict: string) {
  if (!rows.length) return { table, count: 0 };
  const { error } = await client.from(table).upsert(rows, { onConflict });
  if (error) throw new Error(`${table}: ${error.message}`);
  return { table, count: rows.length };
}

export async function getSupabaseStatus() {
  const config = getSupabaseConfig();
  if (!config.configured) return { configured: false, mode: "disabled", ok: false, message: "Supabase não configurado." };

  const client = createSupabasePublicClient();
  if (!client) return { configured: false, mode: "disabled", ok: false, message: "Client não criado." };

  const { count, error } = await client.from("qe_categories").select("id", { count: "exact", head: true });
  if (error) {
    return {
      configured: true,
      mode: config.mode,
      ok: false,
      message: `Conexão criada, mas as tabelas ainda não responderam: ${error.message}`,
    };
  }

  return {
    configured: true,
    mode: config.mode,
    ok: true,
    message: "Supabase conectado.",
    categories: count ?? 0,
  };
}

export async function importContentIntoSupabase(content: any) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada. Importação exige chave server-side.");

  const rows = mapContentToSupabaseRows(content);
  const results = [];
  results.push(await upsertOrThrow(client, "qe_categories", rows.categories, "slug"));
  results.push(await upsertOrThrow(client, "qe_transmissions", rows.transmissions, "slug"));
  results.push(await upsertOrThrow(client, "qe_archives", rows.archives, "slug"));
  results.push(await upsertOrThrow(client, "qe_reports", rows.reports, "code"));
  results.push(await upsertOrThrow(client, "qe_timeline_events", rows.timeline, "title,year"));
  results.push(await upsertOrThrow(client, "qe_site_settings", rows.settings, "key"));
  return results;
}

function camelBase(row: any) {
  const raw = row.raw && typeof row.raw === "object" ? row.raw : {};
  return {
    ...raw,
    title: row.title ?? raw.title ?? "",
    slug: row.slug ?? raw.slug ?? slugify(row.title ?? "item"),
    description: row.description ?? raw.description ?? "",
    image: row.image ?? raw.image ?? "",
    status: row.status ?? raw.status ?? "Publicado",
    seoTitle: row.seo_title ?? raw.seoTitle ?? row.title ?? "",
    seoDescription: row.seo_description ?? raw.seoDescription ?? row.description ?? "",
    ogImage: row.og_image ?? raw.ogImage ?? row.image ?? "",
    aiNotes: row.ai_notes ?? raw.aiNotes ?? "",
    aiGenerated: row.ai_generated ?? raw.aiGenerated ?? false,
    aiReviewed: row.ai_reviewed ?? raw.aiReviewed ?? false,
    aiSourceUrl: row.ai_source_url ?? raw.aiSourceUrl ?? "",
  };
}

function categoryFromRow(row: any) {
  return {
    ...camelBase(row),
    symbol: row.symbol ?? row.raw?.symbol ?? "◇",
    order: row.sort_order ?? row.raw?.order ?? 0,
    active: row.active !== false,
  };
}

function categoryTitleBySlug(categories: any[], slug?: string) {
  if (!slug) return "";
  const category = categories.find((item) => item.slug === slug || slugify(item.title ?? "") === slug);
  return category?.title ?? slug;
}

function transmissionFromRow(row: any, categories: any[]) {
  return {
    ...camelBase(row),
    code: row.code ?? row.raw?.code ?? "",
    youtubeUrl: row.youtube_url ?? row.raw?.youtubeUrl ?? "",
    category: row.raw?.category ?? categoryTitleBySlug(categories, row.category_slug),
    publishedAt: row.published_at ?? row.raw?.publishedAt ?? "",
    year: row.year ?? row.raw?.year ?? "",
    location: row.location ?? row.raw?.location ?? "",
    duration: row.duration ?? row.raw?.duration ?? "",
    views: row.views ?? row.raw?.views ?? "",
    showInHero: Boolean(row.show_in_hero),
    heroOrder: row.hero_order ?? row.raw?.heroOrder ?? 0,
    tags: row.tags ?? row.raw?.tags ?? [],
    relatedArchives: row.related_archives ?? row.raw?.relatedArchives ?? [],
    relatedReportCodes: row.related_report_codes ?? row.raw?.relatedReportCodes ?? [],
  };
}

function archiveFromRow(row: any, categories: any[]) {
  return {
    ...camelBase(row),
    code: row.code ?? row.raw?.code ?? "",
    summary: row.summary ?? row.raw?.summary ?? row.description ?? "",
    longDescription: row.long_description ?? row.raw?.longDescription ?? "",
    category: row.raw?.category ?? categoryTitleBySlug(categories, row.category_slug),
    location: row.location ?? row.raw?.location ?? "",
    year: row.year ?? row.raw?.year ?? "",
    classification: row.classification ?? row.raw?.classification ?? "Confidencial",
    accessLevel: row.access_level ?? row.raw?.accessLevel ?? "",
    relatedTransmissionSlug: row.related_transmission_slug ?? row.raw?.relatedTransmissionSlug ?? "",
    relatedArchives: row.related_archives ?? row.raw?.relatedArchives ?? [],
    relatedReportCodes: row.related_report_codes ?? row.raw?.relatedReportCodes ?? [],
    tags: row.tags ?? row.raw?.tags ?? [],
  };
}

function reportFromRow(row: any, categories: any[]) {
  return {
    ...camelBase(row),
    code: row.code ?? row.raw?.code ?? "",
    subtitle: row.subtitle ?? row.raw?.subtitle ?? "",
    youtubeUrl: row.youtube_url ?? row.raw?.youtubeUrl ?? "",
    category: row.raw?.category ?? categoryTitleBySlug(categories, row.category_slug),
    location: row.location ?? row.raw?.location ?? "",
    year: row.year ?? row.raw?.year ?? "",
    relatedArchiveSlug: row.related_archive_slug ?? row.raw?.relatedArchiveSlug ?? "",
    relatedTransmissionSlug: row.related_transmission_slug ?? row.raw?.relatedTransmissionSlug ?? "",
    tags: row.tags ?? row.raw?.tags ?? [],
  };
}

function timelineFromRow(row: any, index: number) {
  return {
    ...(row.raw ?? {}),
    year: row.year ?? "",
    title: row.title ?? "",
    text: row.description ?? row.raw?.text ?? row.raw?.description ?? "",
    description: row.description ?? row.raw?.description ?? "",
    archiveSlug: row.archive_slug ?? row.raw?.archiveSlug ?? "",
    order: row.sort_order ?? row.raw?.order ?? index + 1,
  };
}

function settingValue(settings: any[], key: string, fallback: any) {
  const row = settings.find((item) => item.key === key);
  return row?.value ?? fallback;
}

export async function readContentFromSupabase() {
  const config = getSupabaseConfig();
  if (!config.configured) return null;

  const client = createSupabasePublicClient();
  if (!client) return null;

  const [categoriesResult, transmissionsResult, archivesResult, reportsResult, timelineResult, settingsResult] = await Promise.all([
    client.from("qe_categories").select("*").order("sort_order", { ascending: true }),
    client.from("qe_transmissions").select("*").order("hero_order", { ascending: true }),
    client.from("qe_archives").select("*").order("year", { ascending: false }),
    client.from("qe_reports").select("*").order("created_at", { ascending: false }),
    client.from("qe_timeline_events").select("*").order("sort_order", { ascending: true }),
    client.from("qe_site_settings").select("*"),
  ]);

  const firstError = [categoriesResult, transmissionsResult, archivesResult, reportsResult, timelineResult, settingsResult].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const categories = (categoriesResult.data ?? []).map(categoryFromRow);
  const transmissions = (transmissionsResult.data ?? []).map((row: any) => transmissionFromRow(row, categories));
  const heroCandidate = transmissions.find((item: any) => item.showInHero) ?? transmissions[0] ?? null;
  const videos = transmissions.filter((item: any) => item.slug !== heroCandidate?.slug);
  const archives = (archivesResult.data ?? []).map((row: any) => archiveFromRow(row, categories));
  const relatos = (reportsResult.data ?? []).map((row: any) => reportFromRow(row, categories));
  const timeline = (timelineResult.data ?? []).map(timelineFromRow);
  const settings = settingsResult.data ?? [];
  const featuredArchive = settingValue(settings, "featuredArchive", null) ?? archives[0] ?? {};

  const content = {
    schemaVersion: "5.1.0",
    site: settingValue(settings, "site", {}),
    hero: settingValue(settings, "hero", {}),
    sections: settingValue(settings, "sections", {}),
    automation: settingValue(settings, "automation", {}),
    featuredCase: settingValue(settings, "featuredCase", {}),
    featuredArchive,
    discovery: settingValue(settings, "discovery", {}),
    terminalLines: settingValue(settings, "terminalLines", []),
    categories,
    featuredTransmission: heroCandidate,
    videos,
    archives,
    relatos,
    timeline,
    __source: "supabase",
    __sourceCheckedAt: new Date().toISOString(),
  };

  return normalizeContent(content);
}
