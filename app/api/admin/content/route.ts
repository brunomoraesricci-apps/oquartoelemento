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

export async function POST(request: Request) {
  try {
    const body = await request.json();

    // Basic validation to avoid saving an empty/wrong file accidentally.
    if (!body?.site || !Array.isArray(body?.categories) || !Array.isArray(body?.videos)) {
      return NextResponse.json({ error: "Invalid content structure" }, { status: 400 });
    }

    const normalized = normalizeContent(body);

    // v5.2: Supabase becomes the first write target. JSON remains as local backup/fallback.
    const supabaseResults = await importContentIntoSupabase(normalized);
    const localWrite = tryWriteLocalJson(normalized);

    return NextResponse.json({
      ok: true,
      savedAt: new Date().toISOString(),
      mode: "hybrid-write",
      primaryTarget: "supabase",
      fallbackTarget: "json",
      supabaseResults,
      backupFile: localWrite.backupFile,
      localJsonSaved: localWrite.ok,
      warning: localWrite.warning,
    });
  } catch (error: any) {
    return NextResponse.json(
      {
        ok: false,
        error: "Unable to save content",
        message: error?.message ?? "Falha ao salvar no Supabase.",
      },
      { status: 500 }
    );
  }
}
