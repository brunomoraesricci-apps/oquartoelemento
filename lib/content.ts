import fs from "fs";
import path from "path";
import { normalizeContent } from "./contentModel";
import { readContentFromSupabase } from "./supabaseContent";

export type ContentSource = "json" | "supabase" | "fallback-json";

function readJsonContent() {
  const filePath = path.join(process.cwd(), "data", "content.json");
  const raw = fs.readFileSync(filePath, "utf-8");
  return normalizeContent(JSON.parse(raw));
}

export function getContent() {
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
      };
    }

    return {
      ...fallback,
      __source: "fallback-json" as ContentSource,
      __fallbackReason: "Supabase conectado, mas sem acervo importado.",
    };
  } catch (error: any) {
    return {
      ...fallback,
      __source: "fallback-json" as ContentSource,
      __fallbackReason: error?.message ?? "Falha ao ler Supabase.",
    };
  }
}
