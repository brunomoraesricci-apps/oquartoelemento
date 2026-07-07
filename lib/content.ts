import fs from "fs";
import path from "path";
import { normalizeContent } from "./contentModel";
import { readContentFromSupabase } from "./supabaseContent";

export type ContentSource = "json" | "supabase" | "fallback-json";
export type ContentSourceOfTruth = "supabase" | "json-fallback";

function readJsonContent() {
  const filePath = path.join(process.cwd(), "data", "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return normalizeContent(JSON.parse(raw));
}

export function getContent() {
  // Legacy JSON reader. In v5.4 this is intentionally kept only for imports, exports and emergency fallback.
  return readJsonContent();
}

export async function getContentAsync() {
  const fallback = readJsonContent();

  try {
    const supabaseContent = await readContentFromSupabase();
    if (supabaseContent?.categories?.length || supabaseContent?.archives?.length || supabaseContent?.featuredTransmission) {
      return {
        ...supabaseContent,
        __source: "supabase" as ContentSource,
        __fallbackAvailable: true,
        __sourceOfTruth: "supabase" as ContentSourceOfTruth,
      };
    }

    return {
      ...fallback,
      __source: "fallback-json" as ContentSource,
      __fallbackReason: "Supabase conectado, mas sem acervo importado.",
      __sourceOfTruth: "json-fallback" as ContentSourceOfTruth,
    };
  } catch (error: any) {
    return {
      ...fallback,
      __source: "fallback-json" as ContentSource,
      __fallbackReason: error?.message ?? "Falha ao ler Supabase.",
      __sourceOfTruth: "json-fallback" as ContentSourceOfTruth,
    };
  }
}

export function isPublicStatus(status?: string) {
  const normalized = String(status ?? "").trim().toLowerCase();
  return ["público", "publico", "public", "published", "publicado", "ativo", "active"].includes(normalized);
}

export function toPublicContent(content: any) {
  const clone = structuredClone(content ?? {});
  const publicVideos = (clone.videos ?? []).filter((item: any) => isPublicStatus(item.status));
  const featured = isPublicStatus(clone.featuredTransmission?.status) ? clone.featuredTransmission : null;
  clone.categories = (clone.categories ?? []).filter((item: any) => item.active !== false && isPublicStatus(item.status));
  clone.archives = (clone.archives ?? []).filter((item: any) => isPublicStatus(item.status));
  clone.featuredTransmission = featured ?? publicVideos.find((item: any) => item.showInHero) ?? publicVideos[0] ?? null;
  clone.videos = publicVideos.filter((item: any) => item.slug !== clone.featuredTransmission?.slug);
  clone.relatos = [clone.featuredTransmission, ...(clone.videos ?? [])]
    .filter(Boolean)
    .filter((video: any) => isPublicStatus(video.status))
    .filter((video: any) => video.contentType === "relato" || String(video.category ?? "").toLowerCase().includes("relato"));
  return clone;
}

export async function getPublicContentAsync() {
  return toPublicContent(await getContentAsync());
}
