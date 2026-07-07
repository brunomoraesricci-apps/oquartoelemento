import { NextResponse } from "next/server";

export const dynamic = "force-dynamic";
import fs from "fs";
import path from "path";
import { normalizeContent } from "@/lib/contentModel";
import { getContentAsync } from "@/lib/content";
import { importContentIntoSupabase } from "@/lib/supabaseContent";

const contentPath = path.join(process.cwd(), "data", "content.json");
const backupsDir = path.join(process.cwd(), "data", "backups");

type LocalWriteResult = {
  ok: boolean;
  backupFile: string | null;
  warning?: string;
};

function ensureBackupsDir() {
  if (!fs.existsSync(backupsDir)) fs.mkdirSync(backupsDir, { recursive: true });
}

function createBackup(reason = "manual-save") {
  if (!fs.existsSync(contentPath)) return null;
  ensureBackupsDir();
  const timestamp = new Date().toISOString().replace(/[:.]/g, "-");
  const backupPath = path.join(backupsDir, `content-${timestamp}-${reason}.json`);
  fs.copyFileSync(contentPath, backupPath);
  return path.basename(backupPath);
}

function tryWriteLocalJson(content: any): LocalWriteResult {
  try {
    const backupFile = createBackup("before-hybrid-write");
    fs.writeFileSync(contentPath, JSON.stringify(content, null, 2), "utf-8");
    return { ok: true, backupFile };
  } catch (error: any) {
    return {
      ok: false,
      backupFile: null,
      warning: error?.message ?? "Não foi possível salvar content.json localmente.",
    };
  }
}

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
    });

    // Basic validation to avoid saving an empty/wrong file accidentally.
    if (!body?.site || !Array.isArray(body?.categories) || !Array.isArray(body?.videos)) {
      return NextResponse.json({
        ok: false,
        error: "Invalid content structure",
        message: "Estrutura inválida: site, categories e videos são obrigatórios.",
      }, { status: 400 });
    }

    const normalized = normalizeContent(body);

    // v5.2.1: Supabase remains primary, but now returns detailed diagnostics.
    const supabaseResults = await importContentIntoSupabase(normalized);
    const localWrite = tryWriteLocalJson(normalized);

    return NextResponse.json({
      ok: true,
      savedAt: new Date().toISOString(),
      durationMs: Date.now() - startedAt,
      mode: "hybrid-write-debug",
      primaryTarget: "supabase",
      fallbackTarget: "json",
      supabaseResults,
      backupFile: localWrite.backupFile,
      localJsonSaved: localWrite.ok,
      warning: localWrite.warning,
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
