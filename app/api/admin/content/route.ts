import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";

import { normalizeContent } from "@/lib/contentModel";
import { getContentAsync } from "@/lib/content";
import { createSupabaseBackup, importContentIntoSupabase } from "@/lib/supabaseContent";

export async function GET() {
  try {
    return NextResponse.json(await getContentAsync());
  } catch (error) {
    return NextResponse.json({ error: "Unable to read content" }, { status: 500 });
  }
}

function serializeSaveError(error: any) {
  return {
    ok: false,
    error: "Unable to save content",
    message: error?.message ?? "Falha ao salvar no Supabase.",
    step: error?.table ? `Saving ${error.table}` : "Unknown save step",
    table: error?.table ?? null,
    onConflict: error?.onConflict ?? null,
    supabase: error?.supabase ?? null,
    completedSteps: error?.completedSteps ?? [],
    stack: process.env.NODE_ENV !== "production" ? error?.stack ?? null : null,
  };
}

export async function POST(request: Request) {
  const startedAt = Date.now();
  try {
    const body = await request.json();

    console.log("[QE SAVE] POST /api/admin/content", {
      hasSite: Boolean(body?.site),
      categories: body?.categories?.length ?? 0,
      videos: body?.videos?.length ?? 0,
      archives: body?.archives?.length ?? 0,
      reports: body?.relatos?.length ?? 0,
      timeline: body?.timeline?.length ?? 0,
    });

    if (!body?.site || !Array.isArray(body?.categories) || !Array.isArray(body?.videos)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid content structure",
        message: "Estrutura inválida: site, categories e videos são obrigatórios.",
      }, { status: 400 });
    }

    const normalized = normalizeContent(body);

    // v5.4: Supabase is the editorial source of truth. JSON remains read-only fallback/export.
    const databaseBackup = await createSupabaseBackup(normalized, "before-supabase-first-save");
    const supabaseResults = await importContentIntoSupabase(normalized);

    return NextResponse.json({
      ok: true,
      savedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      mode: "supabase-source-of-truth",
      primaryTarget: "supabase",
      fallbackTarget: "json-emergency-fallback",
      supabaseResults,
      backup: databaseBackup,
      backupFile: databaseBackup?.ok ? databaseBackup.id : null,
      localJsonSaved: false,
      warning: databaseBackup?.ok
        ? undefined
        : `Backup em banco não criado: ${databaseBackup?.error ?? databaseBackup?.reason ?? "motivo desconhecido"}`,
    });
  } catch (error: any) {
    const payload = serializeSaveError(error);
    console.error("[QE SAVE] FAILED", payload);
    return NextResponse.json(
      { ...payload, durationMs: Date.now() - startedAt },
      { status: 500 }
    );
  }
}
