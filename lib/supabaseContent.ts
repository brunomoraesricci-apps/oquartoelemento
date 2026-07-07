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

function extractYouTubeId(url: string) {
  const value = String(url ?? "").trim();
  const patterns = [
    /youtu\.be\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/watch\?v=([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/embed\/([A-Za-z0-9_-]{6,})/,
    /youtube\.com\/shorts\/([A-Za-z0-9_-]{6,})/,
  ];
  for (const pattern of patterns) {
    const match = value.match(pattern);
    if (match?.[1]) return match[1].split(/[?&]/)[0];
  }
  try {
    const parsed = new URL(value);
    return parsed.searchParams.get("v") ?? "";
  } catch {
    return "";
  }
}

function youtubeEmbed(videoId: string) {
  return videoId ? `https://www.youtube.com/embed/${videoId}` : "";
}

function arr(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value.map(String).map((item) => item.trim()).filter(Boolean);
}
function normalizeVisibilityStatus(status: any): "Público" | "Privado" {
  const normalized = String(status ?? "").trim().toLowerCase();
  if (["público", "publico", "public", "published", "publicado", "ativo", "active"].includes(normalized)) return "Público";
  return "Privado";
}

function isPublicItem(item: any) {
  return normalizeVisibilityStatus(item?.status) === "Público";
}


function tableRowBase(item: any) {
  return {
    title: item.title ?? "",
    slug: item.slug ?? slugify(item.title ?? "item"),
    description: item.description ?? item.summary ?? "",
    image: item.image ?? item.thumbnail ?? "",
    status: normalizeVisibilityStatus(item.status),
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

  const allTransmissions = [content.featuredTransmission, ...(content.videos ?? [])].filter(Boolean);
  const heroAllowedSlugs = new Set(allTransmissions
    .filter((video: any) => video?.showInHero)
    .sort((a: any, b: any) => Number(a.heroOrder ?? 99) - Number(b.heroOrder ?? 99))
    .slice(0, 5)
    .map((video: any) => video.slug));

  const sources = allTransmissions
    .map((video: any) => {
      const videoId = video.videoId ?? extractYouTubeId(video.youtubeUrl ?? video.sourceUrl ?? "");
      if (!videoId) return null;
      return {
        provider: video.sourceProvider ?? "youtube",
        provider_id: videoId,
        original_url: video.sourceUrl ?? video.youtubeUrl ?? `https://www.youtube.com/watch?v=${videoId}`,
        embed_url: video.embedUrl ?? youtubeEmbed(videoId),
        thumbnail_url: video.image ?? video.thumbnail ?? `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`,
        raw: {
          videoId,
          title: video.title ?? "",
          sourceProvider: video.sourceProvider ?? "youtube",
          sourceUrl: video.sourceUrl ?? video.youtubeUrl ?? "",
        },
        updated_at: new Date().toISOString(),
      };
    })
    .filter(Boolean);

  const transmissions = allTransmissions.map((video: any, index: number) => {
    const videoId = video.videoId ?? extractYouTubeId(video.youtubeUrl ?? video.sourceUrl ?? "");
    return ({
    ...tableRowBase(video),
    code: video.code ?? `QE-TX-${String(index + 1).padStart(3, "0")}`,
    youtube_url: video.youtubeUrl ?? video.sourceUrl ?? "",
    video_id: videoId,
    embed_url: video.embedUrl ?? youtubeEmbed(videoId),
    source_provider: video.sourceProvider ?? (videoId ? "youtube" : ""),
    source_url: video.sourceUrl ?? video.youtubeUrl ?? "",
    category_slug: slugify(video.category ?? ""),
    published_at: video.publishedAt ?? video.year ?? "",
    year: String(video.year ?? video.publishedAt ?? ""),
    location: video.location ?? "",
    duration: video.duration ?? "",
    views: video.views ?? "",
    content_type: video.contentType ?? (String(video.category ?? "").toLowerCase().includes("relato") ? "relato" : "transmissao"),
    show_in_hero: Boolean(video.showInHero) && heroAllowedSlugs.has(video.slug),
    hero_order: Number(video.heroOrder ?? index + 1),
    tags: arr(video.tags),
    related_archives: arr(video.relatedArchives),
    related_report_codes: arr(video.relatedReportCodes),
    ai_generated: Boolean(video.aiGenerated),
    ai_reviewed: Boolean(video.aiReviewed),
    ai_source_url: video.aiSourceUrl ?? "",
  });
  });

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

  // v6.1: relatos são vídeos em qe_transmissions (content_type = "relato").
  // qe_reports permanece apenas como legado e não recebe novas escritas.
  const reports: any[] = [];

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

  return { categories, transmissions, sources, archives, reports, timeline, settings };
}

function conflictValue(row: any, onConflict: string) {
  return onConflict.split(",").map((key) => String(row?.[key.trim()] ?? "")).join("::");
}

function dedupeRows(rows: any[], onConflict: string) {
  const seen = new Set<string>();
  const output: any[] = [];
  for (const row of rows) {
    const key = conflictValue(row, onConflict);
    if (!key || seen.has(key)) continue;
    seen.add(key);
    output.push(row);
  }
  return output;
}

async function upsertOrThrow(client: any, table: string, rows: any[], onConflict: string) {
  const startedAt = Date.now();
  const cleanRows = dedupeRows(rows, onConflict);
  if (!cleanRows.length) return { table, count: 0, durationMs: 0, skippedDuplicates: rows.length };

  console.log(`[QE SAVE] Upserting ${table}`, { rows: cleanRows.length, onConflict, skippedDuplicates: rows.length - cleanRows.length });
  const { error } = await client.from(table).upsert(cleanRows, { onConflict });
  const durationMs = Date.now() - startedAt;

  if (error) {
    const debugError: any = new Error(`${table}: ${error.message}`);
    debugError.table = table;
    debugError.onConflict = onConflict;
    debugError.supabase = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    debugError.durationMs = durationMs;
    throw debugError;
  }

  return { table, count: cleanRows.length, durationMs, skippedDuplicates: rows.length - cleanRows.length };
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
  const steps: Array<[string, any[], string]> = [
    ["qe_categories", rows.categories, "slug"],
    ["qe_sources", rows.sources, "provider,provider_id"],
    ["qe_transmissions", rows.transmissions, "slug"],
    ["qe_archives", rows.archives, "slug"],
    ["qe_timeline_events", rows.timeline, "title,year"],
    ["qe_site_settings", rows.settings, "key"],
  ];

  const results = [];
  console.log("══════════════════════════════════════");
  console.log("QE Content Save / Supabase Import");
  console.log("══════════════════════════════════════");

  for (const [table, tableRows, onConflict] of steps) {
    try {
      const result = await upsertOrThrow(client, table, tableRows, onConflict);
      results.push(result);
      console.log(`[QE SAVE] OK ${table}`, result);
    } catch (error: any) {
      error.completedSteps = results;
      console.error(`[QE SAVE] ERROR ${table}`, error?.supabase ?? error);
      throw error;
    }
  }

  console.log("[QE SAVE] Completed", results);
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
    status: normalizeVisibilityStatus(row.status ?? raw.status),
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
    videoId: row.video_id ?? row.raw?.videoId ?? extractYouTubeId(row.youtube_url ?? row.raw?.youtubeUrl ?? ""),
    embedUrl: row.embed_url ?? row.raw?.embedUrl ?? youtubeEmbed(row.video_id ?? extractYouTubeId(row.youtube_url ?? row.raw?.youtubeUrl ?? "")),
    sourceProvider: row.source_provider ?? row.raw?.sourceProvider ?? (row.youtube_url ? "youtube" : ""),
    sourceUrl: row.source_url ?? row.raw?.sourceUrl ?? row.youtube_url ?? row.raw?.youtubeUrl ?? "",
    contentType: row.content_type ?? row.raw?.contentType ?? (String(row.category_slug ?? "").includes("relato") ? "relato" : "transmissao"),
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
    videoId: row.video_id ?? row.raw?.videoId ?? extractYouTubeId(row.youtube_url ?? row.raw?.youtubeUrl ?? ""),
    embedUrl: row.embed_url ?? row.raw?.embedUrl ?? youtubeEmbed(row.video_id ?? extractYouTubeId(row.youtube_url ?? row.raw?.youtubeUrl ?? "")),
    sourceProvider: row.source_provider ?? row.raw?.sourceProvider ?? (row.youtube_url ? "youtube" : ""),
    sourceUrl: row.source_url ?? row.raw?.sourceUrl ?? row.youtube_url ?? row.raw?.youtubeUrl ?? "",
    contentType: row.content_type ?? row.raw?.contentType ?? (String(row.category_slug ?? "").includes("relato") ? "relato" : "transmissao"),
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

  const [categoriesResult, transmissionsResult, archivesResult, timelineResult, settingsResult] = await Promise.all([
    client.from("qe_categories").select("*").order("sort_order", { ascending: true }),
    client.from("qe_transmissions").select("*").order("hero_order", { ascending: true }),
    client.from("qe_archives").select("*").order("year", { ascending: false }),
    client.from("qe_timeline_events").select("*").order("sort_order", { ascending: true }),
    client.from("qe_site_settings").select("*"),
  ]);

  const firstError = [categoriesResult, transmissionsResult, archivesResult, timelineResult, settingsResult].find((result) => result.error)?.error;
  if (firstError) throw new Error(firstError.message);

  const categories = (categoriesResult.data ?? []).map(categoryFromRow);
  const transmissions = (transmissionsResult.data ?? []).map((row: any) => transmissionFromRow(row, categories));
  const heroCandidates = transmissions
    .filter((item: any) => item.showInHero)
    .sort((a: any, b: any) => Number(a.heroOrder ?? 99) - Number(b.heroOrder ?? 99))
    .slice(0, 5);
  const publicTransmissions = transmissions.filter(isPublicItem);
  const heroCandidate = heroCandidates.find(isPublicItem) ?? publicTransmissions[0] ?? null;
  const videos = transmissions.filter((item: any) => item.slug !== heroCandidate?.slug);
  const archives = (archivesResult.data ?? []).map((row: any) => archiveFromRow(row, categories));
  const relatos = transmissions.filter((item: any) => item.contentType === "relato" || String(item.category ?? "").toLowerCase().includes("relato"));
  const timeline = (timelineResult.data ?? []).map(timelineFromRow);
  const settings = settingsResult.data ?? [];
  const featuredArchive = settingValue(settings, "featuredArchive", null) ?? archives[0] ?? {};

  const content = {
    schemaVersion: "6.3.0",
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
    __sourceOfTruth: "supabase",
    __sourceCheckedAt: new Date().toISOString(),
  };

  return normalizeContent(content);
}

export async function createSupabaseBackup(content: any, reason = "manual-save") {
  const client = createSupabaseAdminClient();
  if (!client) return { ok: false, skipped: true, reason: "SUPABASE_SERVICE_ROLE_KEY não configurada." };

  const normalized = normalizeContent(content);
  const summary = {
    transmissions: [normalized.featuredTransmission, ...(normalized.videos ?? [])].filter(Boolean).length,
    archives: normalized.archives?.length ?? 0,
    reports: normalized.relatos?.length ?? 0,
    categories: normalized.categories?.length ?? 0,
    timeline: normalized.timeline?.length ?? 0,
  };

  const { data, error } = await client
    .from("qe_backups")
    .insert({ reason, snapshot: normalized, summary, created_by: "content-studio" })
    .select("id, created_at, reason, summary")
    .single();

  if (error) {
    return { ok: false, skipped: false, error: error.message, details: error.details, hint: error.hint };
  }

  return { ok: true, id: data?.id, createdAt: data?.created_at, reason: data?.reason, summary: data?.summary };
}

export async function listSupabaseBackups(limit = 10) {
  const client = createSupabaseAdminClient() ?? createSupabasePublicClient();
  if (!client) return [];

  const { data, error } = await client
    .from("qe_backups")
    .select("id, created_at, reason, summary, created_by")
    .order("created_at", { ascending: false })
    .limit(limit);

  if (error) return [];

  return (data ?? []).map((item: any) => ({
    file: `supabase-backup-${String(item.created_at ?? "").replace(/[:.]/g, "-")}`,
    createdAt: item.created_at,
    size: JSON.stringify(item.summary ?? {}).length,
    source: "supabase",
    reason: item.reason,
    summary: item.summary,
  }));
}


async function deleteAllRows(client: any, table: string, idColumn = "id") {
  const startedAt = Date.now();
  const { data, error } = await client.from(table).delete().not(idColumn, "is", null).select(idColumn);
  const durationMs = Date.now() - startedAt;
  if (error) {
    const debugError: any = new Error(`${table}: ${error.message}`);
    debugError.table = table;
    debugError.supabase = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    debugError.durationMs = durationMs;
    throw debugError;
  }
  return { table, count: Array.isArray(data) ? data.length : 0, durationMs };
}

async function upsertSetting(client: any, key: string, value: any) {
  const { error } = await client
    .from("qe_site_settings")
    .upsert({ key, value, updated_at: new Date().toISOString() }, { onConflict: "key" });

  if (error) {
    const debugError: any = new Error(`qe_site_settings/${key}: ${error.message}`);
    debugError.table = "qe_site_settings";
    debugError.supabase = {
      message: error.message,
      code: error.code,
      details: error.details,
      hint: error.hint,
    };
    throw debugError;
  }
}

export async function resetSupabaseEditorialArchive(options: { fullReset?: boolean; keepSettings?: boolean; reason?: string } = {}) {
  const client = createSupabaseAdminClient();
  if (!client) throw new Error("SUPABASE_SERVICE_ROLE_KEY não configurada. Reset exige chave server-side.");

  const fullReset = Boolean(options.fullReset);
  const keepSettings = options.keepSettings !== false;
  const currentContent = await readContentFromSupabase();
  const backup = currentContent
    ? await createSupabaseBackup(currentContent, options.reason ?? (fullReset ? "before-full-editorial-reset" : "before-editorial-reset"))
    : { ok: false, skipped: true, reason: "Conteúdo atual não pôde ser lido antes do reset." };

  const steps: any[] = [];
  console.log("══════════════════════════════════════");
  console.log("QE Editorial Reset", { fullReset, keepSettings });
  console.log("══════════════════════════════════════");

  for (const table of ["qe_reports", "qe_timeline_events", "qe_archives", "qe_transmissions", "qe_sources"]) {
    const result = await deleteAllRows(client, table);
    steps.push(result);
    console.log(`[QE RESET] OK ${table}`, result);
  }

  if (fullReset) {
    const result = await deleteAllRows(client, "qe_categories");
    steps.push(result);
    console.log("[QE RESET] OK qe_categories", result);
  }

  if (keepSettings) {
    await upsertSetting(client, "hero", {
      eyebrow: "ARQUIVO EM RECONSTRUÇÃO",
      title: "O Quarto Elemento",
      subtitle: "Acervo editorial reiniciado",
      description: "A base oficial foi limpa com segurança. Novas transmissões serão publicadas pelo Content Studio.",
      image: "",
      carouselSelectedSlugs: [],
      carouselItems: [],
    });
    await upsertSetting(client, "featuredArchive", {});
    await upsertSetting(client, "featuredTransmission", {});
    steps.push({ table: "qe_site_settings", count: 3, durationMs: 0, action: "reset hero/featured settings" });
  }

  return {
    ok: true,
    resetAt: new Date().toISOString(),
    mode: fullReset ? "full-editorial-reset" : "editorial-content-reset",
    backup,
    steps,
  };
}
